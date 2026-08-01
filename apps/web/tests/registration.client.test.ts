import { describe, expect, it, vi } from "vitest";
import {
  HttpRegistrationClient,
  RegistrationClientError,
} from "../features/booking/registrationClient";

const input = {
  eventId: "8bb9d314-fefd-42eb-87f0-f14a38a96118",
  contactName: "Aisha Rahman",
  contactEmail: "aisha@example.com",
  contactPhone: "+971501234567",
  numberOfHikers: 2,
  customerNotes: "First hike",
  waiverAccepted: true,
  idempotencyKey: "963476ca-f3fa-4dd6-82de-55a6875cc405",
};

describe("HttpRegistrationClient", () => {
  it("posts the registration contract and returns the receipt", async () => {
    const registration = {
      id: "79a85ded-8803-4d95-a6ef-8f32a0ff2470",
      referenceNumber: "DH-ABC123",
      eventId: input.eventId,
      numberOfHikers: 2,
      status: "confirmed" as const,
      unitPrice: 125,
      totalAmount: 250,
      currency: "AED",
      createdAt: "2026-08-01T12:00:00.000Z",
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ registration }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    await expect(new HttpRegistrationClient().create(input)).resolves.toEqual(registration);
    expect(fetchMock).toHaveBeenCalledWith("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  });

  it("maps API validation errors for the form", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      JSON.stringify({
        error: {
          message: "Check the highlighted details.",
          fields: { contactEmail: "Enter a valid email address." },
        },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )));

    await expect(new HttpRegistrationClient().create(input)).rejects.toMatchObject({
      name: RegistrationClientError.name,
      message: "Check the highlighted details.",
      fieldErrors: { contactEmail: "Enter a valid email address." },
    });
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RegistrationReceipt } from "@dubaihikers/registrations";
import { EventModal } from "../components/EventModal";
import { Navigation } from "../components/Navigation";
import type { TrailEvent } from "../domain/events/types";
import { BookingExperience } from "../features/booking/BookingExperience";
import {
  RegistrationClientError,
  type RegistrationClient,
} from "../features/booking/registrationClient";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

const event: TrailEvent = {
  id: "8bb9d314-fefd-42eb-87f0-f14a38a96118",
  slug: "smart-trail",
  name: "Smart Trail",
  location: "Ras Al Khaimah",
  date: "2026-12-12",
  displayDate: "2026-12-12",
  time: "6:00 AM",
  price: 125,
  difficulty: "Beginner",
  duration: "3 hours",
  distance: "7 km",
  elevation: "420 m",
  spots: 3,
  availabilityLabel: "3 spots available",
  actionLabel: "Join",
  canRegister: true,
  image: "https://images.unsplash.com/photo-1551632811-561732d1e306",
  description: "A guided mountain hike.",
  highlights: ["Mountain views"],
  included: ["Certified guide"],
  meetingPoint: "Shared after confirmation",
  tags: ["guided"],
};

const receipt: RegistrationReceipt = {
  id: "79a85ded-8803-4d95-a6ef-8f32a0ff2470",
  referenceNumber: "DH-ABC123",
  eventId: event.id,
  numberOfHikers: 3,
  status: "confirmed",
  unitPrice: 125,
  totalAmount: 375,
  currency: "AED",
  createdAt: "2026-08-01T12:00:00.000Z",
};

async function completeForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("FULL NAME"), "Aisha Rahman");
  await user.type(screen.getByLabelText("WHATSAPP NUMBER"), "+971501234567");
  await user.type(screen.getByLabelText("EMAIL"), "aisha@example.com");
  await user.selectOptions(screen.getByLabelText("NUMBER OF HIKERS"), "3");
  await user.click(screen.getByLabelText(/accept the participation waiver/i));
}

describe("mobile navigation", () => {
  it("opens, closes after navigation, and links the logo to the page top", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const menu = screen.getByRole("button", { name: "Menu" });
    expect(menu).toHaveAttribute("aria-expanded", "false");

    await user.click(menu);
    expect(screen.getByRole("button", { name: "Close" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toHaveClass("open");

    await user.click(screen.getByRole("link", { name: "Services" }));
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("link", { name: "Dubai Hikers home" })).toHaveAttribute("href", "#home");
  });
});

describe("booking interactions", () => {
  beforeEach(() => vi.stubGlobal("crypto", { randomUUID: () => "963476ca-f3fa-4dd6-82de-55a6875cc405" }));

  it("submits a registration, shows confirmation, and marks the event fully booked", async () => {
    const user = userEvent.setup();
    const create = vi.fn<RegistrationClient["create"]>().mockResolvedValue(receipt);
    render(<BookingExperience events={[event]} registrationClient={{ create }} />);

    await user.click(screen.getByRole("button", { name: "View Smart Trail details" }));
    await user.click(screen.getByRole("button", { name: "Join" }));
    await completeForm(user);
    await user.click(screen.getByRole("button", { name: "Book now" }));

    expect(await screen.findByText("Your place is reserved.")).toBeVisible();
    expect(screen.getByText("DH-ABC123")).toBeVisible();
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      eventId: event.id,
      contactEmail: "aisha@example.com",
      numberOfHikers: 3,
      waiverAccepted: true,
    }));

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Fully booked")).toBeVisible();
    expect(screen.getByRole("button", { name: "Full Smart Trail" })).toBeDisabled();
  });

  it("renders API field and form errors without showing confirmation", async () => {
    const user = userEvent.setup();
    const client: RegistrationClient = {
      create: vi.fn().mockRejectedValue(new RegistrationClientError(
        "Check the highlighted details.",
        { contactEmail: "Enter a valid email address." },
      )),
    };
    render(<EventModal event={event} onClose={vi.fn()} registrationClient={client} />);

    await user.click(screen.getByRole("button", { name: "Join" }));
    await completeForm(user);
    await user.click(screen.getByRole("button", { name: "Book now" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Check the highlighted details.");
    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(screen.getByRole("textbox", { name: /EMAIL/ })).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText("Your place is reserved.")).not.toBeInTheDocument();
  });

  it("moves focus into the modal, closes on Escape, and restores focus", async () => {
    const onClose = vi.fn();
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();

    const view = render(<EventModal event={event} onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    await waitFor(() => expect(dialog).toHaveFocus());

    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();

    view.unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});

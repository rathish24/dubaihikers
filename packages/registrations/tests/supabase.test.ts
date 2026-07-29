import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  RegistrationRepositoryError,
  SupabaseRegistrationRepository,
  type CreateRegistrationInput,
  type SupabaseRegistrationReceiptRow,
} from "../src/index";

const input: CreateRegistrationInput = {
  eventId: "8bb9d314-fefd-42eb-87f0-f14a38a96118",
  contactName: "Aisha Rahman",
  contactEmail: "aisha@example.com",
  contactPhone: "+971501234567",
  numberOfHikers: 2,
  customerNotes: "Vegetarian meal, if provided.",
  waiverAccepted: true,
  idempotencyKey: "963476ca-f3fa-4dd6-82de-55a6875cc405",
};

const row: SupabaseRegistrationReceiptRow = {
  id: "bb8d6220-d8b6-4f44-96bf-dc62357ea386",
  reference_number: "DH-2F3B54E823",
  event_id: input.eventId,
  number_of_hikers: 2,
  status: "confirmed",
  unit_price: "125.00",
  total_amount: "250.00",
  currency: "AED",
  created_at: "2026-07-29T12:00:00.000Z",
};

function mockClient(result: { data: unknown; error: null | { message: string } }) {
  let rpcName = "";
  let rpcArguments: Record<string, unknown> = {};
  const client = {
    rpc(name: string, arguments_: Record<string, unknown>) {
      rpcName = name;
      rpcArguments = arguments_;
      return Promise.resolve(result);
    },
  } as unknown as SupabaseClient;

  return {
    client,
    request: () => ({ rpcName, rpcArguments }),
  };
}

test("creates a registration through the database function and maps its receipt", async () => {
  const { client, request } = mockClient({ data: [row], error: null });
  const receipt = await new SupabaseRegistrationRepository(client).create(input);

  assert.equal(request().rpcName, "create_event_registration");
  assert.deepEqual(request().rpcArguments, {
    p_event_id: input.eventId,
    p_contact_name: input.contactName,
    p_contact_email: input.contactEmail,
    p_contact_phone: input.contactPhone,
    p_number_of_hikers: 2,
    p_customer_notes: input.customerNotes,
    p_waiver_accepted: true,
    p_idempotency_key: input.idempotencyKey,
  });
  assert.equal(receipt.referenceNumber, "DH-2F3B54E823");
  assert.equal(receipt.totalAmount, 250);
  assert.equal(receipt.status, "confirmed");
});

test("maps an availability conflict to a customer-safe sold-out error", async () => {
  const { client } = mockClient({
    data: null,
    error: { message: "This event does not have enough available places." },
  });

  await assert.rejects(
    () => new SupabaseRegistrationRepository(client).create(input),
    (error: unknown) => {
      assert.equal(error instanceof RegistrationRepositoryError, true);
      assert.equal((error as RegistrationRepositoryError).code, "EVENT_SOLD_OUT");
      assert.equal(
        (error as Error).message,
        "This hike no longer has enough available places.",
      );
      return true;
    },
  );
});

test("rejects an empty database receipt", async () => {
  const { client } = mockClient({ data: [], error: null });
  await assert.rejects(
    () => new SupabaseRegistrationRepository(client).create(input),
    /did not return a receipt/,
  );
});

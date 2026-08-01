import type { SupabaseClient } from "@supabase/supabase-js";
import {
  RegistrationRepositoryError,
  type RegistrationRepository,
} from "./repository";
import type {
  CreateRegistrationInput,
  RegistrationReceipt,
  RegistrationStatus,
} from "./types";

export type SupabaseRegistrationReceiptRow = {
  id: string;
  reference_number: string;
  event_id: string;
  number_of_hikers: number;
  status: RegistrationStatus;
  unit_price: number | string;
  total_amount: number | string;
  currency: string;
  created_at: string;
};

function mapReceipt(row: SupabaseRegistrationReceiptRow): RegistrationReceipt {
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    eventId: row.event_id,
    numberOfHikers: row.number_of_hikers,
    status: row.status,
    unitPrice: Number(row.unit_price),
    totalAmount: Number(row.total_amount),
    currency: row.currency,
    createdAt: row.created_at,
  };
}

export class SupabaseRegistrationRepository implements RegistrationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async create(input: CreateRegistrationInput): Promise<RegistrationReceipt> {
    const { data, error } = await this.client.rpc("create_event_registration", {
      p_event_id: input.eventId,
      p_contact_name: input.contactName,
      p_contact_email: input.contactEmail,
      p_contact_phone: input.contactPhone,
      p_number_of_hikers: input.numberOfHikers,
      p_customer_notes: input.customerNotes ?? null,
      p_waiver_accepted: input.waiverAccepted,
      p_idempotency_key: input.idempotencyKey,
    });

    if (error) {
      const code = error.message.includes("enough available places")
        ? "EVENT_SOLD_OUT"
        : error.message.includes("not open for booking")
          || error.message.includes("has closed")
          ? "EVENT_CLOSED"
          : "REGISTRATION_FAILED";
      throw new RegistrationRepositoryError(
        code === "EVENT_SOLD_OUT"
          ? "This hike no longer has enough available places."
          : code === "EVENT_CLOSED"
            ? "Registration for this hike is closed."
            : "We could not complete your registration.",
        code,
        { cause: error },
      );
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      throw new RegistrationRepositoryError("The registration did not return a receipt.");
    }

    return mapReceipt(row as SupabaseRegistrationReceiptRow);
  }
}

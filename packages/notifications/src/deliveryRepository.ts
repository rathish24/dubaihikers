import type { SupabaseClient } from "@supabase/supabase-js";

export interface EmailDeliveryRepository {
  recordDelivered(input: {
    registrationId: string;
    recipient: string;
    providerMessageId: string;
  }): Promise<void>;
  recordUndelivered(input: {
    registrationId: string;
    recipient: string;
    error: string;
  }): Promise<void>;
}

export class SupabaseEmailDeliveryRepository
implements EmailDeliveryRepository {
  constructor(private readonly client: SupabaseClient) {}

  async recordDelivered(input: {
    registrationId: string;
    recipient: string;
    providerMessageId: string;
  }): Promise<void> {
    await this.insert({
      registration_id: input.registrationId,
      recipient: input.recipient,
      status: "delivered",
      provider_message_id: input.providerMessageId,
      delivered_at: new Date().toISOString(),
    });
  }

  async recordUndelivered(input: {
    registrationId: string;
    recipient: string;
    error: string;
  }): Promise<void> {
    await this.insert({
      registration_id: input.registrationId,
      recipient: input.recipient,
      status: "undelivered",
      last_error: input.error.slice(0, 500),
    });
  }

  private async insert(
    values: Record<string, unknown>,
  ): Promise<void> {
    const { error } = await this.client
      .from("registration_email_deliveries")
      .insert({
        message_type: "booking_reference",
        provider: "resend",
        ...values,
      });

    if (error) throw new Error("Unable to record email delivery status.");
  }
}

import type { SupabaseClient } from "@supabase/supabase-js";

export type QueuedEmailDelivery = {
  id: string;
  shouldSend: boolean;
};

export interface EmailDeliveryRepository {
  queue(input: {
    registrationId: string;
    recipient: string;
  }): Promise<QueuedEmailDelivery>;
  markSending(id: string): Promise<void>;
  markSent(id: string, providerMessageId: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}

type EmailDeliveryRow = {
  id: string;
  status: "queued" | "sending" | "sent" | "failed";
};

export class SupabaseEmailDeliveryRepository
implements EmailDeliveryRepository {
  constructor(private readonly client: SupabaseClient) {}

  async queue(input: {
    registrationId: string;
    recipient: string;
  }): Promise<QueuedEmailDelivery> {
    const { data, error } = await this.client
      .from("registration_email_deliveries")
      .select("id,status")
      .eq("registration_id", input.registrationId)
      .eq("message_type", "booking_reference")
      .maybeSingle();

    if (error) throw new Error("Unable to inspect registration email status.");
    if (data) {
      const existing = data as EmailDeliveryRow;
      return {
        id: existing.id,
        shouldSend: existing.status === "failed",
      };
    }

    const insertResult = await this.client
      .from("registration_email_deliveries")
      .insert({
        registration_id: input.registrationId,
        message_type: "booking_reference",
        recipient: input.recipient,
        provider: "resend",
        status: "queued",
      })
      .select("id,status")
      .single();

    if (insertResult.error || !insertResult.data) {
      throw new Error("Unable to queue the registration email.");
    }

    return {
      id: (insertResult.data as EmailDeliveryRow).id,
      shouldSend: true,
    };
  }

  async markSending(id: string): Promise<void> {
    await this.update(id, {
      status: "sending",
      attempt_count: 1,
      last_attempted_at: new Date().toISOString(),
      last_error: null,
    });
  }

  async markSent(id: string, providerMessageId: string): Promise<void> {
    await this.update(id, {
      status: "sent",
      provider_message_id: providerMessageId,
      sent_at: new Date().toISOString(),
      last_error: null,
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.update(id, {
      status: "failed",
      last_error: error.slice(0, 500),
    });
  }

  private async update(
    id: string,
    values: Record<string, unknown>,
  ): Promise<void> {
    const { error } = await this.client
      .from("registration_email_deliveries")
      .update(values)
      .eq("id", id);

    if (error) throw new Error("Unable to update email delivery status.");
  }
}

import assert from "node:assert/strict";
import test from "node:test";
import type { EmailDeliveryRepository } from "../services/email/deliveryRepository";
import type {
  EmailSendResult,
  RegistrationEmailService,
} from "../services/email/registrationEmail";
import { sendRegistrationEmail } from "../services/email/sendRegistrationEmail";

function createDeliveryRepository() {
  const calls: Array<[string, ...unknown[]]> = [];
  const repository: EmailDeliveryRepository = {
    async queue() {
      return { id: "delivery-id", shouldSend: true };
    },
    async markSending(id) {
      calls.push(["markSending", id]);
    },
    async markSent(id, providerMessageId) {
      calls.push(["markSent", id, providerMessageId]);
    },
    async markFailed(id, error) {
      calls.push(["markFailed", id, error]);
    },
  };

  return { calls, repository };
}

const input = {
  deliveryId: "delivery-id",
  contactName: "Aisha Rahman",
  referenceNumber: "DH-2F3B54E823",
};

test("tracks a background email from sending to sent", async () => {
  const { calls, repository } = createDeliveryRepository();
  const emailService: RegistrationEmailService = {
    async sendBookingReference(): Promise<EmailSendResult> {
      return { providerMessageId: "resend-message-id" };
    },
  };

  await sendRegistrationEmail(input, emailService, repository);

  assert.deepEqual(calls, [
    ["markSending", "delivery-id"],
    ["markSent", "delivery-id", "resend-message-id"],
  ]);
});

test("records a failed background email without throwing", async () => {
  const { calls, repository } = createDeliveryRepository();
  const emailService: RegistrationEmailService = {
    async sendBookingReference(): Promise<EmailSendResult> {
      throw new Error("Provider unavailable");
    },
  };

  await sendRegistrationEmail(input, emailService, repository);

  assert.deepEqual(calls, [
    ["markSending", "delivery-id"],
    ["markFailed", "delivery-id", "Provider unavailable"],
  ]);
});

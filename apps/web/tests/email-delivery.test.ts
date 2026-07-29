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
    async recordDelivered(delivery) {
      calls.push(["recordDelivered", delivery]);
    },
    async recordUndelivered(delivery) {
      calls.push(["recordUndelivered", delivery]);
    },
  };

  return { calls, repository };
}

const input = {
  registrationId: "registration-id",
  recipient: "organiser@example.com",
  contactName: "Aisha Rahman",
  referenceNumber: "DH-2F3B54E823",
};

test("records a successful one-time email as delivered", async () => {
  const { calls, repository } = createDeliveryRepository();
  const emailService: RegistrationEmailService = {
    async sendBookingReference(): Promise<EmailSendResult> {
      return { providerMessageId: "resend-message-id" };
    },
  };

  await sendRegistrationEmail(input, emailService, repository);

  assert.deepEqual(calls, [
    ["recordDelivered", {
      registrationId: "registration-id",
      recipient: "organiser@example.com",
      providerMessageId: "resend-message-id",
    }],
  ]);
});

test("records a failed one-time email as undelivered without retrying", async () => {
  const { calls, repository } = createDeliveryRepository();
  const emailService: RegistrationEmailService = {
    async sendBookingReference(): Promise<EmailSendResult> {
      throw new Error("Provider unavailable");
    },
  };

  await sendRegistrationEmail(input, emailService, repository);

  assert.deepEqual(calls, [
    ["recordUndelivered", {
      registrationId: "registration-id",
      recipient: "organiser@example.com",
      error: "Provider unavailable",
    }],
  ]);
});

import {
  ResendRegistrationEmailService,
  type RegistrationEmailService,
} from "@dubaihikers/notifications";

export function getRegistrationEmailRecipient(): string | null {
  return process.env.REGISTRATION_NOTIFICATION_EMAIL ?? null;
}

export function createRegistrationEmailService():
  | RegistrationEmailService
  | null {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = getRegistrationEmailRecipient();
  if (!apiKey || !recipient) return null;

  return new ResendRegistrationEmailService({
    apiKey,
    recipient,
    from: process.env.RESEND_EMAIL_FROM
      ?? "Dubai Hikers <onboarding@resend.dev>",
  });
}

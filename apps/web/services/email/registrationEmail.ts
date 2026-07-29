import registrationHtml from "./templates/registration-received.html?raw";
import registrationText from "./templates/registration-received.txt?raw";
import registrationTemplate from "./templates/registration-received.json";

export type BookingReferenceEmail = {
  contactName: string;
  referenceNumber: string;
};

export type EmailSendResult = {
  providerMessageId: string;
};

export interface RegistrationEmailService {
  sendBookingReference(
    message: BookingReferenceEmail,
  ): Promise<EmailSendResult>;
}

type ResendEmailConfig = {
  apiKey: string;
  from: string;
  recipient: string;
};

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[character] ?? character,
  );
}

function render(template: string, values: Record<string, string>): string {
  return template.replace(
    /\{\{([a-z_]+)\}\}/g,
    (_, name: string) => values[name] ?? "",
  );
}

export class ResendRegistrationEmailService implements RegistrationEmailService {
  constructor(
    private readonly config: ResendEmailConfig,
    private readonly request: typeof fetch = fetch,
  ) {}

  async sendBookingReference(
    message: BookingReferenceEmail,
  ): Promise<EmailSendResult> {
    const html = render(registrationHtml, {
      contact_name: escapeHtml(message.contactName),
      reference_number: escapeHtml(message.referenceNumber),
    });
    const text = render(registrationText, {
      contact_name: message.contactName,
      reference_number: message.referenceNumber,
    });

    const response = await this.request("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `registration-${message.referenceNumber}`,
        "User-Agent": "dubaihikers-web/1.0",
      },
      body: JSON.stringify({
        from: this.config.from,
        to: [this.config.recipient],
        subject: registrationTemplate.subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend rejected the email with status ${response.status}.`);
    }

    const result = await response.json() as { id?: string };
    if (!result.id) {
      throw new Error("Resend did not return an email identifier.");
    }

    return { providerMessageId: result.id };
  }
}

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

import type { CreateRegistrationInput } from "./types";

export type RegistrationValidationIssue = {
  field: keyof CreateRegistrationInput;
  message: string;
};

export class RegistrationValidationError extends Error {
  constructor(readonly issues: RegistrationValidationIssue[]) {
    super("Please check the registration details.");
    this.name = "RegistrationValidationError";
  }
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+[1-9]\d{7,14}$/;

function optionalTrimmed(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseRegistrationInput(value: unknown): CreateRegistrationInput {
  const source = value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};

  const eventId = optionalTrimmed(source.eventId) ?? "";
  const contactName = optionalTrimmed(source.contactName) ?? "";
  const contactEmail = (optionalTrimmed(source.contactEmail) ?? "").toLowerCase();
  const contactPhone = (optionalTrimmed(source.contactPhone) ?? "").replace(/[\s()-]/g, "");
  const customerNotes = optionalTrimmed(source.customerNotes);
  const idempotencyKey = optionalTrimmed(source.idempotencyKey) ?? "";
  const numberOfHikers = Number(source.numberOfHikers);
  const waiverAccepted = source.waiverAccepted === true;
  const issues: RegistrationValidationIssue[] = [];

  if (!uuidPattern.test(eventId)) {
    issues.push({ field: "eventId", message: "Select a valid hiking event." });
  }
  if (contactName.length < 2 || contactName.length > 120) {
    issues.push({ field: "contactName", message: "Enter a name between 2 and 120 characters." });
  }
  if (contactEmail.length > 254 || !emailPattern.test(contactEmail)) {
    issues.push({ field: "contactEmail", message: "Enter a valid email address." });
  }
  if (!phonePattern.test(contactPhone)) {
    issues.push({
      field: "contactPhone",
      message: "Enter a mobile number with country code, such as +971500000000.",
    });
  }
  if (!Number.isInteger(numberOfHikers) || numberOfHikers < 1 || numberOfHikers > 20) {
    issues.push({ field: "numberOfHikers", message: "Choose between 1 and 20 hikers." });
  }
  if (customerNotes && customerNotes.length > 1000) {
    issues.push({ field: "customerNotes", message: "Keep your note under 1,000 characters." });
  }
  if (!waiverAccepted) {
    issues.push({ field: "waiverAccepted", message: "Accept the participation waiver to continue." });
  }
  if (!uuidPattern.test(idempotencyKey)) {
    issues.push({ field: "idempotencyKey", message: "The booking request is invalid. Please retry." });
  }

  if (issues.length > 0) throw new RegistrationValidationError(issues);

  return {
    eventId,
    contactName,
    contactEmail,
    contactPhone,
    numberOfHikers,
    customerNotes,
    waiverAccepted,
    idempotencyKey,
  };
}

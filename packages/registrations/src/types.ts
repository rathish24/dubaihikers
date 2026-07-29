export const registrationStatuses = [
  "pending",
  "confirmed",
  "waitlisted",
  "cancelled",
  "refunded",
] as const;

export type RegistrationStatus = (typeof registrationStatuses)[number];

export type CreateRegistrationInput = {
  eventId: string;
  contactName: string;
  contactEmail?: string;
  contactPhone: string;
  numberOfHikers: number;
  customerNotes?: string;
  waiverAccepted: boolean;
  idempotencyKey: string;
};

export type RegistrationReceipt = {
  id: string;
  referenceNumber: string;
  eventId: string;
  numberOfHikers: number;
  status: RegistrationStatus;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
};

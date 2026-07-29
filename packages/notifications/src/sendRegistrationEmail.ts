import type { EmailDeliveryRepository } from "./deliveryRepository";
import type { RegistrationEmailService } from "./registrationEmail";

type SendRegistrationEmailInput = {
  registrationId: string;
  recipient: string;
  contactName: string;
  referenceNumber: string;
};

export async function sendRegistrationEmail(
  input: SendRegistrationEmailInput,
  emailService: RegistrationEmailService,
  deliveries: EmailDeliveryRepository,
): Promise<void> {
  try {
    const result = await emailService.sendBookingReference({
      contactName: input.contactName,
      referenceNumber: input.referenceNumber,
    });
    await deliveries.recordDelivered({
      registrationId: input.registrationId,
      recipient: input.recipient,
      providerMessageId: result.providerMessageId,
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "Unknown email delivery failure.";

    try {
      await deliveries.recordUndelivered({
        registrationId: input.registrationId,
        recipient: input.recipient,
        error: message,
      });
    } catch (statusError) {
      console.error(
        `[registrations] Email status update failed for booking ${input.referenceNumber}.`,
        statusError,
      );
    }

    console.error(
      `[registrations] Booking ${input.referenceNumber} was saved, but its notification email failed.`,
      error,
    );
  }
}

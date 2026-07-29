import {
  RegistrationRepositoryError,
  RegistrationValidationError,
  SupabaseRegistrationRepository,
  parseRegistrationInput,
} from "@dubaihikers/registrations";
import { after, NextResponse } from "next/server";
import { SupabaseEmailDeliveryRepository } from "../../../services/email/deliveryRepository";
import {
  createRegistrationEmailService,
  getRegistrationEmailRecipient,
} from "../../../services/email/registrationEmail";
import { sendRegistrationEmail } from "../../../services/email/sendRegistrationEmail";
import { createAdminClient } from "../../../utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = parseRegistrationInput(await request.json());
    const adminClient = createAdminClient();
    const repository = new SupabaseRegistrationRepository(adminClient);
    const registration = await repository.create(input);
    const emailService = createRegistrationEmailService();
    const recipient = getRegistrationEmailRecipient();

    if (emailService && recipient) {
      const deliveries = new SupabaseEmailDeliveryRepository(adminClient);
      after(() =>
        sendRegistrationEmail(
          {
            registrationId: registration.id,
            recipient,
            contactName: input.contactName,
            referenceNumber: registration.referenceNumber,
          },
          emailService,
          deliveries,
        ),
      );
    } else {
      console.warn(
        `[registrations] Booking ${registration.referenceNumber} was saved without an email because Resend is not configured.`,
      );
    }

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    if (error instanceof RegistrationValidationError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
            fields: Object.fromEntries(
              error.issues.map((issue) => [issue.field, issue.message]),
            ),
          },
        },
        { status: 400 },
      );
    }

    if (error instanceof RegistrationRepositoryError) {
      const status = error.code === "EVENT_SOLD_OUT" || error.code === "EVENT_CLOSED"
        ? 409
        : 503;
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status },
      );
    }

    console.error("[registrations] Unexpected registration failure.", error);
    return NextResponse.json(
      {
        error: {
          code: "REGISTRATION_FAILED",
          message: "We could not complete your registration. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}

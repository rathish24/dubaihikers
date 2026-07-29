import {
  RegistrationRepositoryError,
  RegistrationValidationError,
  SupabaseRegistrationRepository,
  parseRegistrationInput,
} from "@dubaihikers/registrations";
import { NextResponse } from "next/server";
import { createAdminClient } from "../../../utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = parseRegistrationInput(await request.json());
    const repository = new SupabaseRegistrationRepository(createAdminClient());
    const registration = await repository.create(input);

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

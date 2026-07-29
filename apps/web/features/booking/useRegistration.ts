"use client";

import { useRef, useState } from "react";
import type {
  CreateRegistrationInput,
  RegistrationReceipt,
} from "@dubaihikers/registrations";
import {
  HttpRegistrationClient,
  RegistrationClientError,
  type RegistrationClient,
  type RegistrationFieldErrors,
} from "./registrationClient";

export type RegistrationFormValues = Omit<
  CreateRegistrationInput,
  "eventId" | "idempotencyKey"
>;

const defaultRegistrationClient = new HttpRegistrationClient();

export function useRegistration(
  registrationClient: RegistrationClient = defaultRegistrationClient,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const idempotencyKey = useRef<string | null>(null);

  async function submit(
    eventId: string,
    values: RegistrationFormValues,
  ): Promise<RegistrationReceipt | null> {
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    idempotencyKey.current ??= crypto.randomUUID();

    try {
      return await registrationClient.create({
        eventId,
        idempotencyKey: idempotencyKey.current,
        ...values,
      });
    } catch (error) {
      if (error instanceof RegistrationClientError) {
        setFormError(error.message);
        setFieldErrors(error.fieldErrors);
      } else {
        setFormError("We could not complete your registration. Please try again.");
      }
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    fieldErrors,
    formError,
    isSubmitting,
    submit,
  };
}

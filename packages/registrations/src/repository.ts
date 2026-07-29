import type { CreateRegistrationInput, RegistrationReceipt } from "./types";

export interface RegistrationRepository {
  create(input: CreateRegistrationInput): Promise<RegistrationReceipt>;
}

export class RegistrationRepositoryError extends Error {
  constructor(
    message: string,
    readonly code = "REGISTRATION_FAILED",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "RegistrationRepositoryError";
  }
}

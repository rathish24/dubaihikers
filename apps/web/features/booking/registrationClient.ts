import type {
  CreateRegistrationInput,
  RegistrationReceipt,
} from "@dubaihikers/registrations";

export type RegistrationFieldErrors = Partial<
  Record<keyof CreateRegistrationInput, string>
>;

export class RegistrationClientError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: RegistrationFieldErrors = {},
  ) {
    super(message);
    this.name = "RegistrationClientError";
  }
}

export interface RegistrationClient {
  create(input: CreateRegistrationInput): Promise<RegistrationReceipt>;
}

type RegistrationResponse = {
  registration?: RegistrationReceipt;
  error?: {
    message?: string;
    fields?: RegistrationFieldErrors;
  };
};

export class HttpRegistrationClient implements RegistrationClient {
  async create(input: CreateRegistrationInput): Promise<RegistrationReceipt> {
    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const result = await response.json() as RegistrationResponse;

    if (!response.ok || !result.registration) {
      throw new RegistrationClientError(
        result.error?.message ?? "We could not complete your registration.",
        result.error?.fields,
      );
    }

    return result.registration;
  }
}

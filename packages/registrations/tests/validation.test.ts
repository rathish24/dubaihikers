import assert from "node:assert/strict";
import test from "node:test";
import {
  RegistrationValidationError,
  parseRegistrationInput,
} from "../src/index";

const validInput = {
  eventId: "8bb9d314-fefd-42eb-87f0-f14a38a96118",
  contactName: "  Aisha Rahman  ",
  contactEmail: " AISHA@EXAMPLE.COM ",
  contactPhone: "+971 50 123 4567",
  numberOfHikers: 3,
  customerNotes: "  We will arrive together.  ",
  waiverAccepted: true,
  idempotencyKey: "963476ca-f3fa-4dd6-82de-55a6875cc405",
};

test("normalizes a valid registration request", () => {
  assert.deepEqual(parseRegistrationInput(validInput), {
    eventId: validInput.eventId,
    contactName: "Aisha Rahman",
    contactEmail: "aisha@example.com",
    contactPhone: "+971501234567",
    numberOfHikers: 3,
    customerNotes: "We will arrive together.",
    waiverAccepted: true,
    idempotencyKey: validInput.idempotencyKey,
  });
});

test("accepts optional email and customer notes", () => {
  const parsed = parseRegistrationInput({
    ...validInput,
    contactEmail: " ",
    customerNotes: "",
  });

  assert.equal(parsed.contactEmail, undefined);
  assert.equal(parsed.customerNotes, undefined);
});

test("reports all invalid customer fields together", () => {
  assert.throws(
    () => parseRegistrationInput({
      ...validInput,
      contactName: "A",
      contactEmail: "wrong",
      contactPhone: "050123",
      numberOfHikers: 0,
      customerNotes: "x".repeat(1001),
      waiverAccepted: false,
    }),
    (error: unknown) => {
      assert.equal(error instanceof RegistrationValidationError, true);
      const fields = (error as RegistrationValidationError).issues.map(({ field }) => field);
      assert.deepEqual(fields, [
        "contactName",
        "contactEmail",
        "contactPhone",
        "numberOfHikers",
        "customerNotes",
        "waiverAccepted",
      ]);
      return true;
    },
  );
});

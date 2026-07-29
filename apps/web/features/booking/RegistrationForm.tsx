"use client";

import type { FormEvent } from "react";
import { formatMoney } from "../../domain/events/formatters";
import type { TrailEvent } from "../../domain/events/types";
import type { RegistrationFieldErrors } from "./registrationClient";
import type { RegistrationFormValues } from "./useRegistration";

type RegistrationFormProps = {
  event: TrailEvent;
  fieldErrors: RegistrationFieldErrors;
  formError: string | null;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (values: RegistrationFormValues) => Promise<void>;
};

export function RegistrationForm({
  event,
  fieldErrors,
  formError,
  isSubmitting,
  onBack,
  onSubmit,
}: RegistrationFormProps) {
  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const formData = new FormData(formEvent.currentTarget);

    await onSubmit({
      contactName: String(formData.get("contactName") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
      contactPhone: String(formData.get("contactPhone") ?? ""),
      numberOfHikers: Number(formData.get("numberOfHikers")),
      customerNotes: String(formData.get("customerNotes") ?? ""),
      waiverAccepted: formData.get("waiverAccepted") === "on",
    });
  }

  return (
    <form className="join-form" onSubmit={handleSubmit} noValidate>
      <div className="join-form-heading">
        <p className="status-label">BOOK YOUR HIKE</p>
        <h3>{event.name}</h3>
        <p>{formatMoney(event.price)} per hiker. No online payment is required.</p>
      </div>
      <label>
        FULL NAME
        <input
          required
          name="contactName"
          autoComplete="name"
          placeholder="Your name"
          maxLength={120}
          aria-invalid={Boolean(fieldErrors.contactName)}
          aria-describedby={fieldErrors.contactName ? "contact-name-error" : undefined}
        />
        {fieldErrors.contactName && <span className="field-error" id="contact-name-error">{fieldErrors.contactName}</span>}
      </label>
      <label>
        WHATSAPP NUMBER
        <input
          required
          name="contactPhone"
          autoComplete="tel"
          type="tel"
          inputMode="tel"
          placeholder="+971 50 000 0000"
          aria-invalid={Boolean(fieldErrors.contactPhone)}
          aria-describedby={fieldErrors.contactPhone ? "contact-phone-error" : undefined}
        />
        {fieldErrors.contactPhone && <span className="field-error" id="contact-phone-error">{fieldErrors.contactPhone}</span>}
      </label>
      <label>
        EMAIL <span>OPTIONAL</span>
        <input
          name="contactEmail"
          autoComplete="email"
          type="email"
          placeholder="you@example.com"
          maxLength={254}
          aria-invalid={Boolean(fieldErrors.contactEmail)}
          aria-describedby={fieldErrors.contactEmail ? "contact-email-error" : undefined}
        />
        {fieldErrors.contactEmail && <span className="field-error" id="contact-email-error">{fieldErrors.contactEmail}</span>}
      </label>
      <label>
        NUMBER OF HIKERS
        <select
          required
          name="numberOfHikers"
          defaultValue="1"
          aria-invalid={Boolean(fieldErrors.numberOfHikers)}
          aria-describedby={fieldErrors.numberOfHikers ? "hiker-count-error" : undefined}
        >
          {[1, 2, 3, 4, 5, 6]
            .filter((number) => number <= event.spots)
            .map((number) => <option key={number} value={number}>{number}</option>)}
        </select>
        {fieldErrors.numberOfHikers && <span className="field-error" id="hiker-count-error">{fieldErrors.numberOfHikers}</span>}
      </label>
      <label>
        ANYTHING YOU&apos;D LIKE US TO KNOW? <span>OPTIONAL</span>
        <textarea
          name="customerNotes"
          maxLength={1000}
          rows={4}
          placeholder="Questions, transport requests, dietary needs, or other information"
          aria-invalid={Boolean(fieldErrors.customerNotes)}
          aria-describedby={fieldErrors.customerNotes ? "customer-notes-error notes-help" : "notes-help"}
        />
        <span className="field-help" id="notes-help">Please do not include sensitive medical information.</span>
        {fieldErrors.customerNotes && <span className="field-error" id="customer-notes-error">{fieldErrors.customerNotes}</span>}
      </label>
      <label className="consent">
        <input required type="checkbox" name="waiverAccepted" aria-invalid={Boolean(fieldErrors.waiverAccepted)} />
        <span>I accept the participation waiver and agree to be contacted about this hike.</span>
      </label>
      {fieldErrors.waiverAccepted && <span className="field-error consent-error">{fieldErrors.waiverAccepted}</span>}
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <div className="join-form-actions">
        <button type="button" className="secondary-button" onClick={onBack} disabled={isSubmitting}>Back</button>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Reserving..." : "Book now"}
        </button>
      </div>
    </form>
  );
}

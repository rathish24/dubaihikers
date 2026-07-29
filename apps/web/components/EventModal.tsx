"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import type { RegistrationReceipt } from "@dubaihikers/registrations";
import { formatEventDate, formatMoney } from "../domain/events/formatters";
import type { TrailEvent } from "../domain/events/types";
import {
  HttpRegistrationClient,
  RegistrationClientError,
  type RegistrationClient,
  type RegistrationFieldErrors,
} from "../features/booking/registrationClient";
import { useDialogAccessibility } from "./ui/useDialogAccessibility";

type EventModalProps = {
  event: TrailEvent | null;
  onClose: () => void;
  onRegistrationComplete?: (receipt: RegistrationReceipt) => void;
  registrationClient?: RegistrationClient;
};

type JoinStep = "details" | "form" | "complete";

const defaultRegistrationClient = new HttpRegistrationClient();

export function EventModal({
  event,
  onClose,
  onRegistrationComplete,
  registrationClient = defaultRegistrationClient,
}: EventModalProps) {
  const [step, setStep] = useState<JoinStep>("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [receipt, setReceipt] = useState<RegistrationReceipt | null>(null);
  const idempotencyKey = useRef<string | null>(null);
  const dialogRef = useDialogAccessibility(Boolean(event), onClose);

  if (!event) return null;

  async function submitRegistration(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(formEvent.currentTarget);
    idempotencyKey.current ??= crypto.randomUUID();

    try {
      const registration = await registrationClient.create({
        eventId: event.id,
        contactName: String(formData.get("contactName") ?? ""),
        contactEmail: String(formData.get("contactEmail") ?? ""),
        contactPhone: String(formData.get("contactPhone") ?? ""),
        numberOfHikers: Number(formData.get("numberOfHikers")),
        customerNotes: String(formData.get("customerNotes") ?? ""),
        waiverAccepted: formData.get("waiverAccepted") === "on",
        idempotencyKey: idempotencyKey.current,
      });
      setReceipt(registration);
      onRegistrationComplete?.(registration);
      setStep("complete");
    } catch (error) {
      if (error instanceof RegistrationClientError) {
        setFormError(error.message);
        setFieldErrors(error.fieldErrors);
      } else {
        setFormError("We could not complete your registration. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section ref={dialogRef} tabIndex={-1} className="event-modal" role="dialog" aria-modal="true" aria-labelledby="event-title">
        <button className="modal-close" onClick={onClose} aria-label="Close event details">Close ×</button>
        <div className="modal-visual">
          <Image src={event.image} alt={`${event.name} trail landscape`} fill sizes="(max-width: 767px) 100vw, 42vw" priority />
          <div><small>NEXT HIKE</small><strong>{formatEventDate(event.date)}</strong></div>
        </div>
        <div className="modal-content">
          <p className="event-modal-status">
            <span className={`difficulty ${event.difficulty.toLowerCase()}`}>{event.difficulty}</span>
            <span>{event.spots > 0 ? `${event.spots} spots available` : event.availabilityLabel}</span>
          </p>
          <h2 id="event-title">{event.name}</h2>
          <p className="modal-lead">{event.description}</p>
          <div className="trail-stats">
            <div><small>DISTANCE</small><strong>{event.distance}</strong></div>
            <div><small>DURATION</small><strong>{event.duration}</strong></div>
            <div><small>ELEVATION</small><strong>{event.elevation}</strong></div>
            <div><small>START</small><strong>{event.time}</strong></div>
          </div>

          {step === "details" && (
            <>
              <div className="detail-columns">
                <div><h3>Trail highlights</h3><ul>{event.highlights.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><h3>What to expect</h3><ul>{event.included.map((item) => <li key={item}>{item}</li>)}</ul></div>
              </div>
              <p className="meeting"><span>Meeting point</span>{event.meetingPoint}</p>
              <div className="join-action">
                <div>
                  <small>PRICE PER HIKER</small>
                  <strong>{formatMoney(event.price)}</strong>
                  <p>Choose your group size and reserve your hike.</p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setStep("form")}
                  disabled={!event.canRegister}
                >
                  {event.actionLabel}
                </button>
              </div>
            </>
          )}

          {step === "form" && (
            <form className="join-form" onSubmit={submitRegistration} noValidate>
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
                <button type="button" className="secondary-button" onClick={() => setStep("details")} disabled={isSubmitting}>Back</button>
                <button className="primary-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Reserving..." : "Book now"}
                </button>
              </div>
            </form>
          )}

          {step === "complete" && receipt && (
            <div className="interest-success" role="status">
              <p className="status-label">BOOKING CONFIRMED</p>
              <h3>Your place is reserved.</h3>
              <p>
                Reference <strong>{receipt.referenceNumber}</strong>. We&apos;ll contact you using the details provided with preparation information and next steps.
              </p>
              <button className="primary-button" onClick={onClose}>Done</button>
            </div>
          )}

          {step !== "complete" && <p className="event-disclaimer">Route conditions, timing, and meeting instructions are confirmed by the organiser before each event.</p>}
        </div>
      </section>
    </div>
  );
}

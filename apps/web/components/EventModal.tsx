"use client";

import { useState } from "react";
import Image from "next/image";
import type { RegistrationReceipt } from "@dubaihikers/registrations";
import { formatEventDate, formatMoney } from "../domain/events/formatters";
import type { TrailEvent } from "../domain/events/types";
import {
  type RegistrationClient,
} from "../features/booking/registrationClient";
import { RegistrationConfirmation } from "../features/booking/RegistrationConfirmation";
import { RegistrationForm } from "../features/booking/RegistrationForm";
import {
  useRegistration,
  type RegistrationFormValues,
} from "../features/booking/useRegistration";
import { useDialogAccessibility } from "./ui/useDialogAccessibility";

type EventModalProps = {
  event: TrailEvent | null;
  onClose: () => void;
  onRegistrationComplete?: (receipt: RegistrationReceipt) => void;
  registrationClient?: RegistrationClient;
};

type JoinStep = "details" | "form" | "complete";

export function EventModal({
  event,
  onClose,
  onRegistrationComplete,
  registrationClient,
}: EventModalProps) {
  const [step, setStep] = useState<JoinStep>("details");
  const [receipt, setReceipt] = useState<RegistrationReceipt | null>(null);
  const registration = useRegistration(registrationClient);
  const dialogRef = useDialogAccessibility(Boolean(event), onClose);

  if (!event) return null;

  async function submitRegistration(values: RegistrationFormValues) {
    const result = await registration.submit(event.id, values);
    if (!result) return;

    setReceipt(result);
    onRegistrationComplete?.(result);
    setStep("complete");
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
            <RegistrationForm
              event={event}
              fieldErrors={registration.fieldErrors}
              formError={registration.formError}
              isSubmitting={registration.isSubmitting}
              onBack={() => setStep("details")}
              onSubmit={submitRegistration}
            />
          )}

          {step === "complete" && receipt && (
            <RegistrationConfirmation receipt={receipt} onDone={onClose} />
          )}

          {step !== "complete" && <p className="event-disclaimer">Route conditions, timing, and meeting instructions are confirmed by the organiser before each event.</p>}
        </div>
      </section>
    </div>
  );
}

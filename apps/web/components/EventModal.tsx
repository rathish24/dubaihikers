"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { formatEventDate, formatMoney } from "../domain/events/formatters";
import type { TrailEvent } from "../domain/events/types";
import { useDialogAccessibility } from "./ui/useDialogAccessibility";

type EventModalProps = {
  event: TrailEvent | null;
  onClose: () => void;
};

type JoinStep = "details" | "form" | "complete";

export function EventModal({ event, onClose }: EventModalProps) {
  const [step, setStep] = useState<JoinStep>("details");
  const dialogRef = useDialogAccessibility(Boolean(event), onClose);

  if (!event) return null;

  function submitInterest(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
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
                  <p>Share your details and we&apos;ll contact you with the next steps.</p>
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
            <form className="join-form" onSubmit={submitInterest}>
              <div className="join-form-heading">
                <p className="status-label">REGISTER YOUR INTEREST</p>
                <h3>{event.actionLabel === "Waitlist" ? "Join the waitlist" : "Join"} {event.name}</h3>
                <p>{formatMoney(event.price)} per hiker. No payment is required now; we&apos;ll contact you to confirm availability and next steps.</p>
              </div>
              <label>
                FULL NAME
                <input required name="name" autoComplete="name" placeholder="Your name" />
              </label>
              <label>
                WHATSAPP NUMBER
                <input required name="tel" autoComplete="tel" type="tel" inputMode="tel" placeholder="+971 50 000 0000" />
              </label>
              <label>
                EMAIL <span>OPTIONAL</span>
                <input name="email" autoComplete="email" type="email" placeholder="you@example.com" />
              </label>
              <label>
                NUMBER OF HIKERS
                <select required name="groupSize" defaultValue="1">
                  {[1, 2, 3, 4, 5, 6].map((number) => <option key={number} value={number}>{number}</option>)}
                </select>
              </label>
              <label className="consent">
                <input required type="checkbox" />
                <span>I agree to be contacted about this hike and understand that submitting interest does not confirm a place.</span>
              </label>
              <div className="join-form-actions">
                <button type="button" className="secondary-button" onClick={() => setStep("details")}>Back</button>
                <button className="primary-button" type="submit">Submit interest</button>
              </div>
              <p className="prototype-note">Prototype only. These details are not sent or saved anywhere.</p>
            </form>
          )}

          {step === "complete" && (
            <div className="interest-success" role="status">
              <p className="status-label">INTEREST RECEIVED</p>
              <h3>Thanks for joining.</h3>
              <p>This preview did not save your information. Once the backend is connected, we&apos;ll check your WhatsApp number to prevent duplicate registrations.</p>
              <button className="primary-button" onClick={onClose}>Done</button>
            </div>
          )}

          {step !== "complete" && <p className="event-disclaimer">Route conditions, timing, and meeting instructions are confirmed by the organiser before each event.</p>}
        </div>
      </section>
    </div>
  );
}

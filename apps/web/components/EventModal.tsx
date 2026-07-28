"use client";

import { useState } from "react";
import Image from "next/image";
import { formatEventDate, formatMoney } from "../domain/events/formatters";
import type { TrailEvent } from "../domain/events/types";
import { useDialogAccessibility } from "./ui/useDialogAccessibility";

type EventModalProps = {
  event: TrailEvent | null;
  onClose: () => void;
  onAdd: (event: TrailEvent, quantity: number) => void;
};

export function EventModal({ event, onClose, onAdd }: EventModalProps) {
  const [quantity, setQuantity] = useState(1);
  const dialogRef = useDialogAccessibility(Boolean(event), onClose);

  if (!event) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section ref={dialogRef} tabIndex={-1} className="event-modal" role="dialog" aria-modal="true" aria-labelledby="event-title">
        <button className="modal-close" onClick={onClose} aria-label="Close event details">Close ×</button>
        <div className="modal-visual">
          <Image src={event.image} alt={`${event.name} trail landscape`} fill sizes="(max-width: 767px) 100vw, 42vw" priority />
          <div><small>NEXT HIKE</small><strong>{formatEventDate(event.date)}</strong></div>
        </div>
        <div className="modal-content">
          <p className="event-modal-status"><span className={`difficulty ${event.difficulty.toLowerCase()}`}>{event.difficulty}</span><span>{event.spots} spots available</span></p>
          <h2 id="event-title">{event.name}</h2>
          <p className="modal-lead">{event.description}</p>
          <div className="trail-stats">
            <div><small>DISTANCE</small><strong>{event.distance}</strong></div>
            <div><small>DURATION</small><strong>{event.duration}</strong></div>
            <div><small>ELEVATION</small><strong>{event.elevation}</strong></div>
            <div><small>START</small><strong>{event.time}</strong></div>
          </div>
          <div className="detail-columns">
            <div><h3>Trail highlights</h3><ul>{event.highlights.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><h3>Your ticket includes</h3><ul>{event.included.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>
          <p className="meeting"><span>Meeting point</span>{event.meetingPoint}</p>
          <div className="ticket-action">
            <div><small>PRICE PER HIKER</small><strong>{formatMoney(event.price)}</strong></div>
            <div className="quantity" aria-label="Ticket quantity">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Remove ticket">−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(event.spots, quantity + 1))} aria-label="Add ticket">+</button>
            </div>
            <button className="primary-button" onClick={() => onAdd(event, quantity)}>
              Add {quantity} ticket{quantity > 1 ? "s" : ""} · {formatMoney(event.price * quantity)}
            </button>
          </div>
          <p className="event-disclaimer">Route conditions, timing, and meeting instructions are confirmed by the organiser before each event.</p>
        </div>
      </section>
    </div>
  );
}

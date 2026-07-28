"use client";

import { useState } from "react";
import Image from "next/image";
import { formatEventDate, formatMoney } from "../domain/events/formatters";
import type { BookingItem } from "../domain/events/types";
import { useDialogAccessibility } from "./ui/useDialogAccessibility";

type CheckoutDrawerProps = {
  open: boolean;
  item: BookingItem | null;
  onClose: () => void;
  onClear: () => void;
};

export function CheckoutDrawer({ open, item, onClose, onClear }: CheckoutDrawerProps) {
  const [complete, setComplete] = useState(false);
  const dialogRef = useDialogAccessibility(open, onClose);

  if (!open) return null;
  const total = item ? item.event.price * item.quantity : 0;

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside ref={dialogRef} tabIndex={-1} className="checkout-drawer" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <div className="drawer-head">
          <div><p className="kicker">YOUR ADVENTURE</p><h2 id="checkout-title">Tickets</h2></div>
          <button onClick={onClose}>Close ×</button>
        </div>
        {!item ? (
          <div className="empty-cart"><p className="status-label">NO SELECTION</p><h3>No hike selected yet</h3><p>Choose an upcoming event and reserve your place.</p><button className="primary-button" onClick={onClose}>Browse hikes</button></div>
        ) : complete ? (
          <div className="booking-success">
            <p className="status-label">PLACE HELD</p>
            <h3>Your place is held.</h3>
            <p>A booking summary for {item.event.name} is ready. Connect your payment provider before launch to accept live payments.</p>
            <button className="primary-button" onClick={() => { setComplete(false); onClear(); onClose(); }}>Done</button>
          </div>
        ) : (
          <>
            <div className="cart-event">
              <Image src={item.event.image} alt="" width={105} height={105} />
              <div><small>{formatEventDate(item.event.date)} · {item.event.time}</small><h3>{item.event.name}</h3><p>{item.quantity} × {formatMoney(item.event.price)}</p></div>
            </div>
            <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); setComplete(true); }}>
              <label>FULL NAME<input required name="name" autoComplete="name" placeholder="Your name" /></label>
              <label>EMAIL<input required name="email" autoComplete="email" type="email" placeholder="you@example.com" /></label>
              <label>MOBILE NUMBER<input required name="tel" autoComplete="tel" type="tel" placeholder="+971 50 000 0000" /></label>
              <label className="waiver"><input required type="checkbox" /> I understand this is an outdoor activity and agree to follow the hike leader&apos;s safety instructions.</label>
              <div className="total"><span>Total</span><strong>{formatMoney(total)}</strong></div>
              <button className="primary-button" type="submit">Continue to payment</button>
              <p className="payment-note">Prototype checkout. No payment will be charged.</p>
            </form>
          </>
        )}
      </aside>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { CheckoutDrawer } from "../../components/CheckoutDrawer";
import { EventCard } from "../../components/EventCard";
import { EventModal } from "../../components/EventModal";
import { Navigation } from "../../components/Navigation";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { difficulties, type BookingItem, type Difficulty, type TrailEvent } from "../../domain/events/types";

type BookingExperienceProps = {
  events: TrailEvent[];
};

export function BookingExperience({ events: allEvents }: BookingExperienceProps) {
  const [difficulty, setDifficulty] = useState<"All" | Difficulty>("All");
  const [selectedEvent, setSelectedEvent] = useState<TrailEvent | null>(null);
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const events = useMemo(
    () => difficulty === "All" ? allEvents : allEvents.filter((event) => event.difficulty === difficulty),
    [allEvents, difficulty],
  );

  function addTickets(event: TrailEvent, quantity: number) {
    setBooking({ event, quantity });
    setSelectedEvent(null);
    setCheckoutOpen(true);
  }

  return (
    <>
      <section className="hike-hero" id="home">
        <Navigation cartCount={booking?.quantity ?? 0} onCartOpen={() => setCheckoutOpen(true)} />
        <div className="hero-content">
          <p className="eyebrow">CERTIFIED GUIDED HIKES · RAS AL KHAIMAH</p>
          <h1>FIND HIGHER<br /><i>GROUND.</i></h1>
          <div className="hero-foot">
            <p>Local trails. Small groups. The mountains, done right.</p>
            <a href="#events">Explore upcoming hikes</a>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Why hike with Dubai Hikers">
        <div><strong>Certified</strong><span>Hike leader</span></div>
        <div><strong>10</strong><span>Mountain trails</span></div>
        <div><strong>12 max</strong><span>Small groups</span></div>
        <div><strong>Solo</strong><span>Friendly</span></div>
      </section>

      <section className="events" id="events">
        <SectionHeading eyebrow="UPCOMING GUIDED EVENTS">
          CHOOSE YOUR<br /><i>NEXT ASCENT.</i>
        </SectionHeading>
        <div className="event-tools">
          <p aria-live="polite">{events.length} scheduled hikes</p>
          <div role="group" aria-label="Filter by difficulty">
            {(["All", ...difficulties] as const).map((level) => (
              <button
                key={level}
                className={difficulty === level ? "active" : ""}
                aria-pressed={difficulty === level}
                onClick={() => setDifficulty(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        {events.length > 0 ? (
          <div className="event-grid">
            {events.map((event) => <EventCard key={event.id} event={event} onSelect={setSelectedEvent} />)}
          </div>
        ) : (
          <p className="empty-events">No hikes match this filter yet.</p>
        )}
      </section>

      <EventModal
        key={selectedEvent?.id ?? "no-event"}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onAdd={addTickets}
      />
      <CheckoutDrawer
        open={checkoutOpen}
        item={booking}
        onClose={() => setCheckoutOpen(false)}
        onClear={() => setBooking(null)}
      />
    </>
  );
}

import Image from "next/image";
import { formatMoney, splitEventDate } from "../domain/events/formatters";
import type { TrailEvent } from "../domain/events/types";

type EventCardProps = {
  event: TrailEvent;
  onSelect: (event: TrailEvent) => void;
};

export function EventCard({ event, onSelect }: EventCardProps) {
  const { weekday, dayMonth } = splitEventDate(event.date);

  return (
    <article className="event-card">
      <button className="event-image" onClick={() => onSelect(event)} aria-label={`View ${event.name} details`}>
        <Image
          src={event.image}
          alt={`${event.name} mountain trail`}
          fill
          sizes="(max-width: 520px) 92vw, (max-width: 1100px) 46vw, 31vw"
        />
        <span className={`difficulty ${event.difficulty.toLowerCase()}`}>{event.difficulty}</span>
        <span className="spots">{event.spots} spots</span>
      </button>
      <div className="event-card-body">
        <div className="event-date">
          <span>{weekday}</span>
          <strong>{dayMonth}</strong>
        </div>
        <div>
          <p className="event-location">{event.location}</p>
          <h3>{event.name}</h3>
          <p className="event-meta">{event.time} · {event.duration} · {event.distance}</p>
        </div>
        <div className="event-price">
          <small>FROM</small>
          <strong>{formatMoney(event.price)}</strong>
          <button onClick={() => onSelect(event)} aria-label={`Book ${event.name}`}>↗</button>
        </div>
      </div>
    </article>
  );
}

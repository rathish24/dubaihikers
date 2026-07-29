import {
  EventRepositoryError,
  SupabaseEventRepository,
  type Event,
  type EventAvailability,
} from "@dubaihikers/events";
import type { Difficulty, TrailEvent } from "../domain/events/types";
import { createClient } from "../utils/supabase/server";

export type EventsResult = {
  events: TrailEvent[];
  error: string | null;
};

const difficultyLabels: Record<Event["difficulty"], Difficulty> = {
  beginner: "Beginner",
  moderate: "Moderate",
  advanced: "Advanced",
  expert: "Expert",
};

const availabilityLabels: Record<EventAvailability, string> = {
  open: "Available",
  few_spots: "Few spots left",
  full: "Fully booked",
  waitlist: "Waitlist available",
  closed: "Registration closed",
};

const actionLabels: Record<EventAvailability, TrailEvent["actionLabel"]> = {
  open: "Join",
  few_spots: "Join",
  full: "Full",
  waitlist: "Waitlist",
  closed: "Closed",
};

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Dubai",
});

const timeFormatter = new Intl.DateTimeFormat("en-AE", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Dubai",
});

function dateInDubai(isoDate: string): string {
  const parts = dateFormatter.formatToParts(new Date(isoDate));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes} minutes`;
  if (remainingMinutes === 0) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${hours}.${remainingMinutes === 30 ? "5" : remainingMinutes} hours`;
}

function toTrailEvent(event: Event): TrailEvent {
  const date = dateInDubai(event.startsAt);
  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    location: event.locationName,
    date,
    displayDate: date,
    time: timeFormatter.format(new Date(event.startsAt)),
    price: event.price,
    difficulty: difficultyLabels[event.difficulty],
    duration: durationLabel(event.durationMinutes),
    distance: `${event.distanceKm} km`,
    elevation: `${event.elevationGainM.toLocaleString("en-AE")} m`,
    spots: event.availableSlots,
    availabilityLabel: availabilityLabels[event.availability],
    actionLabel: actionLabels[event.availability],
    canRegister: event.availability === "open"
      || event.availability === "few_spots"
      || event.availability === "waitlist",
    image: event.imageUrl,
    description: event.description,
    highlights: event.highlights,
    included: event.includedItems,
    meetingPoint: event.meetingPointLabel ?? "Shared after confirmation",
    tags: event.tags,
  };
}

export async function getEvents(): Promise<EventsResult> {
  try {
    const repository = new SupabaseEventRepository(await createClient());
    const events = await repository.listPublished();
    return { events: events.map(toTrailEvent), error: null };
  } catch (error) {
    const message = error instanceof EventRepositoryError
      ? error.message
      : "Unable to load events.";
    console.error(`[events] ${message}`);
    return {
      events: [],
      error: "Upcoming hikes are temporarily unavailable.",
    };
  }
}

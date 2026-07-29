import type { Event, ListEventsOptions } from "./types";

export interface EventRepository {
  listPublished(options?: ListEventsOptions): Promise<Event[]>;
}

export class EventRepositoryError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "EventRepositoryError";
  }
}

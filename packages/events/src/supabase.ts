import type { SupabaseClient } from "@supabase/supabase-js";
import { EventRepositoryError, type EventRepository } from "./repository";
import type {
  Event,
  EventAvailability,
  EventDifficulty,
  EventStatus,
  ListEventsOptions,
  MinorPolicy,
} from "./types";

export type SupabaseEventRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  location_name: string;
  meeting_point_label: string | null;
  starts_at: string;
  registration_closes_at: string | null;
  duration_minutes: number;
  difficulty: EventDifficulty;
  distance_km: number | string;
  elevation_gain_m: number;
  minimum_age: number;
  maximum_age: number | null;
  minor_policy: MinorPolicy;
  price: number | string;
  currency: string;
  capacity: number;
  available_slots: number;
  availability: EventAvailability;
  waitlist_enabled: boolean;
  image_url: string;
  highlights: string[];
  included_items: string[];
  tags: string[];
  sharing_enabled: boolean;
  share_title: string | null;
  share_description: string | null;
  share_image_url: string | null;
  status: EventStatus;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: SupabaseEventRow): Event {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    locationName: row.location_name,
    meetingPointLabel: row.meeting_point_label,
    startsAt: row.starts_at,
    registrationClosesAt: row.registration_closes_at,
    durationMinutes: row.duration_minutes,
    difficulty: row.difficulty,
    distanceKm: Number(row.distance_km),
    elevationGainM: row.elevation_gain_m,
    minimumAge: row.minimum_age,
    maximumAge: row.maximum_age,
    minorPolicy: row.minor_policy,
    price: Number(row.price),
    currency: row.currency,
    capacity: row.capacity,
    availableSlots: row.available_slots,
    availability: row.availability,
    waitlistEnabled: row.waitlist_enabled,
    imageUrl: row.image_url,
    highlights: row.highlights ?? [],
    includedItems: row.included_items ?? [],
    tags: row.tags ?? [],
    sharingEnabled: row.sharing_enabled,
    shareTitle: row.share_title,
    shareDescription: row.share_description,
    shareImageUrl: row.share_image_url,
    status: row.status,
    isFeatured: row.is_featured,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseEventRepository implements EventRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listPublished(options: ListEventsOptions = {}): Promise<Event[]> {
    let query = this.client
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("starts_at", { ascending: true });

    if (!options.includePast) query = query.gte("starts_at", new Date().toISOString());
    if (options.difficulty) query = query.eq("difficulty", options.difficulty);
    if (options.featuredOnly) query = query.eq("is_featured", true);

    const { data, error } = await query;
    if (error) {
      throw new EventRepositoryError("Unable to load the event catalogue.", { cause: error });
    }

    return ((data ?? []) as SupabaseEventRow[]).map(mapRow);
  }
}

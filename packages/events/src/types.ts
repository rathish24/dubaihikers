export const eventDifficulties = ["beginner", "moderate", "advanced", "expert"] as const;
export const eventAvailabilities = ["open", "few_spots", "full", "waitlist", "closed"] as const;
export const eventStatuses = ["draft", "published", "cancelled", "completed"] as const;
export const minorPolicies = ["not_allowed", "guardian_required", "guardian_consent_required"] as const;

export type EventDifficulty = (typeof eventDifficulties)[number];
export type EventAvailability = (typeof eventAvailabilities)[number];
export type EventStatus = (typeof eventStatuses)[number];
export type MinorPolicy = (typeof minorPolicies)[number];

export type Event = {
  id: string;
  slug: string;
  name: string;
  description: string;
  locationName: string;
  meetingPointLabel: string | null;
  startsAt: string;
  registrationClosesAt: string | null;
  durationMinutes: number;
  difficulty: EventDifficulty;
  distanceKm: number;
  elevationGainM: number;
  minimumAge: number;
  maximumAge: number | null;
  minorPolicy: MinorPolicy;
  price: number;
  currency: string;
  capacity: number;
  availableSlots: number;
  availability: EventAvailability;
  waitlistEnabled: boolean;
  imageUrl: string;
  highlights: string[];
  includedItems: string[];
  tags: string[];
  sharingEnabled: boolean;
  shareTitle: string | null;
  shareDescription: string | null;
  shareImageUrl: string | null;
  status: EventStatus;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListEventsOptions = {
  difficulty?: EventDifficulty;
  featuredOnly?: boolean;
  includePast?: boolean;
};

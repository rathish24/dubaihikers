export const difficulties = ["Beginner", "Moderate", "Advanced", "Expert"] as const;

export type Difficulty = (typeof difficulties)[number];

export type TrailEvent = {
  id: string;
  slug: string;
  name: string;
  location: string;
  date: string;
  displayDate: string;
  time: string;
  price: number;
  difficulty: Difficulty;
  duration: string;
  distance: string;
  elevation: string;
  spots: number;
  availabilityLabel: string;
  actionLabel: "Join" | "Waitlist" | "Full" | "Closed";
  canRegister: boolean;
  image: string;
  description: string;
  highlights: string[];
  included: string[];
  meetingPoint: string;
  tags: string[];
};

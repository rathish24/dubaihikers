export const difficulties = ["Beginner", "Moderate", "Advanced", "Expert"] as const;

export type Difficulty = (typeof difficulties)[number];

export type TrailEvent = {
  id: string;
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
  image: string;
  description: string;
  highlights: string[];
  included: string[];
  meetingPoint: string;
};

export type BookingItem = {
  event: TrailEvent;
  quantity: number;
};

// Types for baby care events
export type EventType =
  | "feeding"
  | "bath"
  | "poop"
  | "pee"
  | "diaperChange"
  | "sleep"
  | "medication"
  | "note";

export type FeedingSide = "left" | "right" | "bottle";

export interface BabyEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  duration?: number; // in minutes
  notes?: string;
  feedingSide?: FeedingSide;
  amount?: number; // ml for bottle feeding
  createdAt: Date;
}

export interface DayEvents {
  date: string; // YYYY-MM-DD
  events: BabyEvent[];
}

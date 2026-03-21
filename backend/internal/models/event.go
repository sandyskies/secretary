package models

import "time"

// EventType represents the type of baby care event
type EventType string

const (
	Feeding       EventType = "feeding"
	Bath          EventType = "bath"
	Poop          EventType = "poop"
	Pee           EventType = "pee"
	DiaperChange  EventType = "diaperChange"
	Sleep         EventType = "sleep"
	Medication    EventType = "medication"
	Note          EventType = "note"
)

// FeedingSide represents which side was used for feeding
type FeedingSide string

const (
	FeedingSideLeft  FeedingSide = "left"
	FeedingSideRight FeedingSide = "right"
	FeedingSideBottle FeedingSide = "bottle"
)

// BabyEvent represents a baby care event
type BabyEvent struct {
	ID          string      `json:"id"`
	Type        EventType   `json:"type"`
	Timestamp   time.Time   `json:"timestamp"`
	Duration    *int        `json:"duration,omitempty"`     // in minutes
	Notes       *string     `json:"notes,omitempty"`
	FeedingSide *FeedingSide `json:"feedingSide,omitempty"`
	Amount      *int        `json:"amount,omitempty"`       // ml for bottle feeding
	CreatedAt   time.Time   `json:"createdAt"`
}

// CreateEventRequest is the request body for creating an event
type CreateEventRequest struct {
	Type        EventType   `json:"type"`
	Timestamp   time.Time   `json:"timestamp"`
	Duration    *int        `json:"duration,omitempty"`
	Notes       *string     `json:"notes,omitempty"`
	FeedingSide *FeedingSide `json:"feedingSide,omitempty"`
	Amount      *int        `json:"amount,omitempty"`
}

// UpdateEventRequest is the request body for updating an event
type UpdateEventRequest struct {
	Type        *EventType  `json:"type,omitempty"`
	Timestamp   *time.Time  `json:"timestamp,omitempty"`
	Duration    *int        `json:"duration,omitempty"`
	Notes       *string     `json:"notes,omitempty"`
	FeedingSide *FeedingSide `json:"feedingSide,omitempty"`
	Amount      *int        `json:"amount,omitempty"`
}

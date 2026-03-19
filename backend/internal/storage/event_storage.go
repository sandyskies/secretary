package storage

import (
	"encoding/json"
	"errors"
	"os"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/sandyskies/secretary/backend/internal/models"
)

const defaultStorageFile = "events.json"

// EventStorage handles persistence of baby events
type EventStorage struct {
	mu     sync.RWMutex
	events map[string]*models.BabyEvent
	file   string
}

// NewEventStorage creates a new event storage instance
func NewEventStorage(filepath string) *EventStorage {
	if filepath == "" {
		filepath = defaultStorageFile
	}
	s := &EventStorage{
		events: make(map[string]*models.BabyEvent),
		file:   filepath,
	}
	s.loadFromFile()
	return s
}

// loadFromFile loads events from JSON file
func (s *EventStorage) loadFromFile() {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := os.ReadFile(s.file)
	if err != nil {
		if !errors.Is(err, os.ErrNotExist) {
			// Log error but continue with empty storage
			// In production, use proper logging
		}
		return
	}

	var events []*models.BabyEvent
	if err := json.Unmarshal(data, &events); err != nil {
		// Log error but continue with empty storage
		return
	}

	for _, e := range events {
		s.events[e.ID] = e
	}
}

// saveToFile saves events to JSON file
func (s *EventStorage) saveToFile() error {
	s.mu.RLock()
	defer s.mu.RUnlock()

	events := make([]*models.BabyEvent, 0, len(s.events))
	for _, e := range s.events {
		events = append(events, e)
	}

	data, err := json.MarshalIndent(events, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.file, data, 0644)
}

// Create adds a new event
func (s *EventStorage) Create(req *models.CreateEventRequest) (*models.BabyEvent, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	id := uuid.New().String()
	now := time.Now()

	event := &models.BabyEvent{
		ID:          id,
		Type:        req.Type,
		Timestamp:   req.Timestamp,
		Duration:    req.Duration,
		Notes:       req.Notes,
		FeedingSide: req.FeedingSide,
		Amount:      req.Amount,
		CreatedAt:   now,
	}

	s.events[id] = event

	// Save to file in background
	go s.saveToFile()

	return event, nil
}

// GetByID retrieves an event by ID
func (s *EventStorage) GetByID(id string) (*models.BabyEvent, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	event, exists := s.events[id]
	if !exists {
		return nil, errors.New("event not found")
	}

	return event, nil
}

// GetAll retrieves all events, optionally filtered by date range
func (s *EventStorage) GetAll(start, end *time.Time) ([]*models.BabyEvent, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	events := make([]*models.BabyEvent, 0, len(s.events))
	for _, e := range s.events {
		if start != nil && e.Timestamp.Before(*start) {
			continue
		}
		if end != nil && e.Timestamp.After(*end) {
			continue
		}
		events = append(events, e)
	}

	return events, nil
}

// Update updates an existing event
func (s *EventStorage) Update(id string, req *models.UpdateEventRequest) (*models.BabyEvent, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	event, exists := s.events[id]
	if !exists {
		return nil, errors.New("event not found")
	}

	if req.Type != nil {
		event.Type = *req.Type
	}
	if req.Timestamp != nil {
		event.Timestamp = *req.Timestamp
	}
	if req.Duration != nil {
		event.Duration = req.Duration
	}
	if req.Notes != nil {
		event.Notes = req.Notes
	}
	if req.FeedingSide != nil {
		event.FeedingSide = req.FeedingSide
	}
	if req.Amount != nil {
		event.Amount = req.Amount
	}

	// Save to file in background
	go s.saveToFile()

	return event, nil
}

// Delete removes an event
func (s *EventStorage) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.events[id]; !exists {
		return errors.New("event not found")
	}

	delete(s.events, id)

	// Save to file in background
	go s.saveToFile()

	return nil
}

// Clear removes all events
func (s *EventStorage) Clear() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.events = make(map[string]*models.BabyEvent)

	return os.Remove(s.file)
}

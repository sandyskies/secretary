package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/sandyskies/secretary/backend/internal/models"
	"github.com/sandyskies/secretary/backend/internal/storage"
)

// EventHandler handles event-related HTTP requests
type EventHandler struct {
	storage *storage.EventStorage
}

// NewEventHandler creates a new event handler
func NewEventHandler(s *storage.EventStorage) *EventHandler {
	return &EventHandler{storage: s}
}

// CreateEvent handles POST /api/events
func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate event type
	validTypes := map[models.EventType]bool{
		models.Feeding:      true,
		models.Bath:         true,
		models.Poop:         true,
		models.Pee:          true,
		models.DiaperChange: true,
		models.Sleep:        true,
		models.Medication:   true,
		models.Note:         true,
	}

	if !validTypes[req.Type] {
		http.Error(w, "Invalid event type", http.StatusBadRequest)
		return
	}

	event, err := h.storage.Create(&req)
	if err != nil {
		http.Error(w, "Failed to create event", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(event)
}

// GetEvents handles GET /api/events
func (h *EventHandler) GetEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse optional date range query parameters
	var start, end *time.Time
	if startStr := r.URL.Query().Get("start"); startStr != "" {
		if t, err := time.Parse(time.RFC3339, startStr); err == nil {
			start = &t
		}
	}
	if endStr := r.URL.Query().Get("end"); endStr != "" {
		if t, err := time.Parse(time.RFC3339, endStr); err == nil {
			end = &t
		}
	}

	events, err := h.storage.GetAll(start, end)
	if err != nil {
		http.Error(w, "Failed to get events", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// GetEventByID handles GET /api/events/:id
func (h *EventHandler) GetEventByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Path[len("/api/events/"):]
	if id == "" {
		http.Error(w, "Event ID is required", http.StatusBadRequest)
		return
	}

	event, err := h.storage.GetByID(id)
	if err != nil {
		if err.Error() == "event not found" {
			http.Error(w, "Event not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to get event", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

// UpdateEvent handles PUT /api/events/:id
func (h *EventHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodPut && r.Method != http.MethodPatch {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Path[len("/api/events/"):]
	if id == "" {
		http.Error(w, "Event ID is required", http.StatusBadRequest)
		return
	}

	var req models.UpdateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	event, err := h.storage.Update(id, &req)
	if err != nil {
		if err.Error() == "event not found" {
			http.Error(w, "Event not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to update event", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

// DeleteEvent handles DELETE /api/events/:id
func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Path[len("/api/events/"):]
	if id == "" {
		http.Error(w, "Event ID is required", http.StatusBadRequest)
		return
	}

	if err := h.storage.Delete(id); err != nil {
		if err.Error() == "event not found" {
			http.Error(w, "Event not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to delete event", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ClearAllEvents handles DELETE /api/events
func (h *EventHandler) ClearAllEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if err := h.storage.Clear(); err != nil {
		http.Error(w, "Failed to clear events", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/sandyskies/secretary/backend/internal/handlers"
	"github.com/sandyskies/secretary/backend/internal/middleware"
	"github.com/sandyskies/secretary/backend/internal/storage"
)

const defaultPort = "8080"
const defaultStoragePath = "events.json"

func main() {
	// Get configuration from environment variables
	port := getEnv("PORT", defaultPort)
	storagePath := getEnv("STORAGE_PATH", defaultStoragePath)

	// Initialize storage
	eventStorage := storage.NewEventStorage(storagePath)

	// Initialize handlers
	eventHandler := handlers.NewEventHandler(eventStorage)

	// Setup routes
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Event routes
	mux.HandleFunc("/api/events", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			eventHandler.GetEvents(w, r)
		case http.MethodPost:
			eventHandler.CreateEvent(w, r)
		case http.MethodDelete:
			eventHandler.ClearAllEvents(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Event by ID routes
	mux.HandleFunc("/api/events/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			eventHandler.GetEventByID(w, r)
		case http.MethodPost, http.MethodPut, http.MethodPatch:
			eventHandler.UpdateEvent(w, r)
		case http.MethodDelete:
			eventHandler.DeleteEvent(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Apply middleware
	handler := middleware.CORS(middleware.Logging(mux))

	// Start server
	addr := fmt.Sprintf(":%s", port)
	log.Printf("Starting server on %s", addr)
	log.Printf("Storage file: %s", storagePath)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

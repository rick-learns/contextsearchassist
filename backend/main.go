package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"

	"contextsearch-assist/handlers"
	"contextsearch-assist/middleware"
)

func main() {
	// Get the port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	// Initialize the router
	r := mux.NewRouter()

	// Apply global middleware
	r.Use(middleware.Logging)
	r.Use(middleware.CORS)

	// API Routes
	api := r.PathPrefix("/api").Subrouter()

	// Auth routes
	authRouter := api.PathPrefix("/auth").Subrouter()
	authRouter.HandleFunc("/login", handlers.Login).Methods("GET")
	authRouter.HandleFunc("/callback", handlers.OAuthCallback).Methods("GET")
	authRouter.HandleFunc("/status", handlers.CheckAuthStatus).Methods("GET")
	authRouter.HandleFunc("/logout", handlers.Logout).Methods("POST")

	// Search routes - protected by auth middleware
	searchRouter := api.PathPrefix("/search").Subrouter()
	searchRouter.Use(middleware.RequireAuth)
	searchRouter.HandleFunc("", handlers.SearchJira).Methods("POST")
	searchRouter.HandleFunc("/projects", handlers.GetProjects).Methods("GET")

	// Health check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	// Configure the server
	server := &http.Server{
		Addr:         "0.0.0.0:" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start the server in a goroutine
	go func() {
		log.Printf("Server starting on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Set up graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Block until a signal is received
	<-quit
	log.Println("Server is shutting down...")

	// Create a context with timeout for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Attempt to gracefully shut down the server
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited properly")
}

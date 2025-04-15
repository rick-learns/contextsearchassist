package middleware

import (
	"net/http"
	"os"
	"strings"
)

// CORS adds Cross-Origin Resource Sharing headers to responses
func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get allowed origins from environment variable or use default
		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			// Default to the extension origin and localhost for development
			allowedOrigins = "chrome-extension://*/,http://localhost:5000"
		}

		// Get the origin from the request
		origin := r.Header.Get("Origin")
		
		// Check if the origin is allowed
		allowed := false
		for _, allowedOrigin := range strings.Split(allowedOrigins, ",") {
			// Check for exact match
			if origin == allowedOrigin {
				allowed = true
				break
			}
			
			// Check for wildcard match (chrome-extension://*)
			if strings.HasSuffix(allowedOrigin, "/*") {
				prefix := strings.TrimSuffix(allowedOrigin, "*")
				if strings.HasPrefix(origin, prefix) {
					allowed = true
					break
				}
			}
		}
		
		// If origin is allowed, set CORS headers
		if allowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Max-Age", "86400") // 24 hours
		}
		
		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		// Call the next handler
		next.ServeHTTP(w, r)
	})
}

// Logging middleware logs HTTP requests
func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Log the request
		if os.Getenv("ENV") != "production" {
			// More detailed logging for non-production environments
			if r.URL.Path != "/health" { // Skip logging health checks
				// Log method, remote address, and requested path
				method := r.Method
				path := r.URL.Path
				remoteAddr := r.RemoteAddr
				
				// Log the request details
				println("[INFO]", method, path, "from", remoteAddr)
			}
		}
		
		// Call the next handler
		next.ServeHTTP(w, r)
	})
}

package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
	"golang.org/x/oauth2"

	"contextsearch-assist/utils"
)

// JiraUser represents basic user info from Jira API
type JiraUser struct {
	ID          string `json:"accountId"`
	Email       string `json:"emailAddress"`
	DisplayName string `json:"displayName"`
}

// Session stores user session information
type Session struct {
	ID        string
	Token     *oauth2.Token
	ExpiresAt time.Time
	UserInfo  *JiraUser
}

// In-memory session store (replace with Redis or DB in production)
var sessions = make(map[string]*Session)

// Login initiates the OAuth flow with Jira
func Login(w http.ResponseWriter, r *http.Request) {
	// Get OAuth configuration
	oauth2Config := utils.GetOAuthConfig()
	
	// Generate a state token to prevent CSRF
	state := uuid.New().String()
	
	// Store state in a cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   r.TLS != nil, // Set secure flag if using HTTPS
		MaxAge:   int(time.Hour.Seconds()),
		SameSite: http.SameSiteLaxMode,
	})
	
	// Redirect to Jira authorization page
	url := oauth2Config.AuthCodeURL(state)
	http.Redirect(w, r, url, http.StatusFound)
}

// OAuthCallback handles the callback from Jira OAuth
func OAuthCallback(w http.ResponseWriter, r *http.Request) {
	// Get OAuth configuration
	oauth2Config := utils.GetOAuthConfig()
	
	// Verify state to prevent CSRF
	stateCookie, err := r.Cookie("oauth_state")
	if err != nil {
		http.Error(w, "Invalid OAuth state", http.StatusBadRequest)
		return
	}
	
	if r.URL.Query().Get("state") != stateCookie.Value {
		http.Error(w, "OAuth state mismatch", http.StatusBadRequest)
		return
	}
	
	// Clear state cookie
	http.SetCookie(w, &http.Cookie{
		Name:   "oauth_state",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})
	
	// Exchange authorization code for token
	code := r.URL.Query().Get("code")
	token, err := oauth2Config.Exchange(context.Background(), code)
	if err != nil {
		log.Printf("OAuth token exchange error: %v", err)
		http.Error(w, "Failed to exchange OAuth token", http.StatusInternalServerError)
		return
	}
	
	// Create Jira client using token
	jiraClient := utils.NewJiraClient(token)
	
	// Get user info
	userInfo, err := jiraClient.GetCurrentUser()
	if err != nil {
		log.Printf("Error getting user info: %v", err)
		http.Error(w, "Failed to get user information", http.StatusInternalServerError)
		return
	}
	
	// Create new session
	sessionID := uuid.New().String()
	session := &Session{
		ID:        sessionID,
		Token:     token,
		ExpiresAt: time.Now().Add(24 * time.Hour), // Session expires after 24 hours
		UserInfo:  userInfo,
	}
	
	// Store session
	sessions[sessionID] = session
	
	// Set session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		Secure:   r.TLS != nil,
		MaxAge:   int(24 * time.Hour.Seconds()),
		SameSite: http.SameSiteLaxMode,
	})
	
	// Get frontend URL from environment with fallback
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "chrome-extension://<extension-id>/popup.html"
	}
	
	// Redirect to frontend
	http.Redirect(w, r, frontendURL, http.StatusFound)
}

// CheckAuthStatus checks if the user is authenticated
func CheckAuthStatus(w http.ResponseWriter, r *http.Request) {
	// Get session cookie
	cookie, err := r.Cookie("session_id")
	if err != nil {
		// No session found, return unauthenticated status
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"authenticated": false,
		})
		return
	}
	
	// Get session from store
	session, exists := sessions[cookie.Value]
	if !exists || time.Now().After(session.ExpiresAt) {
		// Session expired or invalid, return unauthenticated status
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"authenticated": false,
		})
		return
	}
	
	// Session is valid, return authenticated status with user info
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"authenticated": true,
		"user": map[string]interface{}{
			"id":          session.UserInfo.ID,
			"email":       session.UserInfo.Email,
			"displayName": session.UserInfo.DisplayName,
		},
	})
}

// Logout ends the user's session
func Logout(w http.ResponseWriter, r *http.Request) {
	// Get session cookie
	cookie, err := r.Cookie("session_id")
	if err == nil {
		// Remove session from store
		delete(sessions, cookie.Value)
	}
	
	// Clear session cookie
	http.SetCookie(w, &http.Cookie{
		Name:   "session_id",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Logged out successfully",
	})
}

// GetSessionFromRequest retrieves the session from the request
func GetSessionFromRequest(r *http.Request) (*Session, error) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		return nil, fmt.Errorf("no session cookie: %v", err)
	}
	
	session, exists := sessions[cookie.Value]
	if !exists {
		return nil, fmt.Errorf("invalid session ID")
	}
	
	if time.Now().After(session.ExpiresAt) {
		delete(sessions, cookie.Value)
		return nil, fmt.Errorf("session expired")
	}
	
	return session, nil
}

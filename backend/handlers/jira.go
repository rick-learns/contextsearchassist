package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"contextsearch-assist/models"
	"contextsearch-assist/utils"
)

// SearchRequest represents the expected JSON payload for search requests
type SearchRequest struct {
	SearchText string `json:"searchText"`
	ProjectKey string `json:"projectKey"`
	MaxResults int    `json:"maxResults,omitempty"`
}

// SearchResponse is the response format for search results
type SearchResponse struct {
	Results []models.Ticket `json:"results"`
	Total   int            `json:"total"`
}

// SearchJira handles searching for text in Jira tickets
func SearchJira(w http.ResponseWriter, r *http.Request) {
	// Get the authenticated user's token from context
	jiraClient, ok := r.Context().Value("jiraClient").(*utils.JiraClient)
	if !ok || jiraClient == nil {
		http.Error(w, "Unauthorized: Invalid or missing Jira client", http.StatusUnauthorized)
		return
	}

	// Parse the request body
	var req SearchRequest
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&req); err != nil {
		http.Error(w, "Invalid request format: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate request
	if req.SearchText == "" {
		http.Error(w, "Search text is required", http.StatusBadRequest)
		return
	}

	// Set default maxResults if not provided
	if req.MaxResults <= 0 {
		req.MaxResults = 20 // Default limit
	}

	// Call Jira API to search for tickets
	tickets, total, err := jiraClient.SearchText(req.SearchText, req.ProjectKey, req.MaxResults)
	if err != nil {
		log.Printf("Jira search error: %v", err)
		http.Error(w, "Error searching Jira: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the search results
	response := SearchResponse{
		Results: tickets,
		Total:   total,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetProjects retrieves the list of projects the user has access to
func GetProjects(w http.ResponseWriter, r *http.Request) {
	// Get the authenticated user's Jira client from context
	jiraClient, ok := r.Context().Value("jiraClient").(*utils.JiraClient)
	if !ok || jiraClient == nil {
		http.Error(w, "Unauthorized: Invalid or missing Jira client", http.StatusUnauthorized)
		return
	}

	// Parse query parameters
	query := r.URL.Query()
	limitStr := query.Get("limit")
	
	limit := 50 // Default limit
	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	// Get projects from Jira
	projects, err := jiraClient.GetProjects(limit)
	if err != nil {
		log.Printf("Error getting projects: %v", err)
		http.Error(w, "Error fetching projects from Jira: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the projects
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"projects": projects,
	})
}

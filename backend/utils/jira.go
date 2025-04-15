package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"golang.org/x/oauth2"

	"contextsearch-assist/models"
)

// JiraClient handles API calls to Jira
type JiraClient struct {
	client    *http.Client
	baseURL   string
	apiPrefix string
}

// GetOAuthConfig returns the OAuth2 configuration for Jira
func GetOAuthConfig() *oauth2.Config {
	// Get Jira OAuth credentials from environment variables
	clientID := os.Getenv("JIRA_CLIENT_ID")
	clientSecret := os.Getenv("JIRA_CLIENT_SECRET")
	
	// Use default values for development if not set
	if clientID == "" {
		clientID = "jira-client-id"
	}
	if clientSecret == "" {
		clientSecret = "jira-client-secret"
	}
	
	// Get redirect URL from environment or use default
	redirectURL := os.Getenv("JIRA_REDIRECT_URL")
	if redirectURL == "" {
		redirectURL = "http://localhost:8000/api/auth/callback"
	}

	// Create OAuth2 config for Jira
	return &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint: oauth2.Endpoint{
			AuthURL:   "https://auth.atlassian.com/authorize",
			TokenURL:  "https://auth.atlassian.com/oauth/token",
		},
		RedirectURL: redirectURL,
		Scopes:      []string{"read:jira-user", "read:jira-work", "offline_access"},
	}
}

// NewJiraClient creates a new Jira client using the provided OAuth token
func NewJiraClient(token *oauth2.Token) *JiraClient {
	// Create HTTP client with the token
	client := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(token))
	
	// Get Jira cloud URL from environment or use a default
	baseURL := os.Getenv("JIRA_BASE_URL")
	if baseURL == "" {
		// This is a placeholder. In production, we'd get this from the token claims
		// or have users specify their Jira instance
		baseURL = "https://your-domain.atlassian.net"
	}
	
	return &JiraClient{
		client:    client,
		baseURL:   baseURL,
		apiPrefix: "/rest/api/3",
	}
}

// GetCurrentUser retrieves the current user's information
func (j *JiraClient) GetCurrentUser() (*models.JiraUser, error) {
	// Build the API URL
	endpoint := fmt.Sprintf("%s%s/myself", j.baseURL, j.apiPrefix)
	
	// Make the request
	resp, err := j.client.Get(endpoint)
	if err != nil {
		return nil, fmt.Errorf("API request failed: %v", err)
	}
	defer resp.Body.Close()
	
	// Check response status
	if resp.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(resp.Body)
		return nil, fmt.Errorf("API returned error: %s - %s", resp.Status, body)
	}
	
	// Parse the response
	var user models.JiraUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, fmt.Errorf("failed to parse user data: %v", err)
	}
	
	return &user, nil
}

// SearchText searches for tickets containing the specified text
func (j *JiraClient) SearchText(searchText, projectKey string, maxResults int) ([]models.Ticket, int, error) {
	// Build JQL query
	jql := fmt.Sprintf("text ~ \"%s\"", escapeJQL(searchText))
	
	// Add project filter if provided
	if projectKey != "" {
		jql = fmt.Sprintf("%s AND project = %s", jql, projectKey)
	}
	
	// Build the API URL
	endpoint := fmt.Sprintf("%s%s/search", j.baseURL, j.apiPrefix)
	
	// Build request body
	requestBody := map[string]interface{}{
		"jql":        jql,
		"maxResults": maxResults,
		"fields": []string{
			"summary",
			"status",
			"issuetype",
			"priority",
			"assignee",
			"reporter",
			"created",
			"updated",
			"project",
		},
		"expand": []string{"renderedFields"},
	}
	
	// Convert request body to JSON
	requestJSON, err := json.Marshal(requestBody)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create request: %v", err)
	}
	
	// Create request
	req, err := http.NewRequest("POST", endpoint, strings.NewReader(string(requestJSON)))
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create request: %v", err)
	}
	
	// Set headers
	req.Header.Set("Content-Type", "application/json")
	
	// Make the request
	resp, err := j.client.Do(req)
	if err != nil {
		return nil, 0, fmt.Errorf("API request failed: %v", err)
	}
	defer resp.Body.Close()
	
	// Check response status
	if resp.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(resp.Body)
		return nil, 0, fmt.Errorf("API returned error: %s - %s", resp.Status, body)
	}
	
	// Parse the response
	var result struct {
		Issues []struct {
			ID     string `json:"id"`
			Key    string `json:"key"`
			Self   string `json:"self"`
			Fields struct {
				Summary  string `json:"summary"`
				Created  string `json:"created"`
				Updated  string `json:"updated"`
				Status   struct {
					Name string `json:"name"`
				} `json:"status"`
				IssueType struct {
					Name string `json:"name"`
				} `json:"issuetype"`
				Priority *struct {
					Name string `json:"name"`
				} `json:"priority"`
				Assignee *struct {
					AccountID   string `json:"accountId"`
					DisplayName string `json:"displayName"`
					EmailAddress string `json:"emailAddress"`
					AvatarUrls  map[string]string `json:"avatarUrls"`
				} `json:"assignee"`
				Reporter *struct {
					AccountID   string `json:"accountId"`
					DisplayName string `json:"displayName"`
					EmailAddress string `json:"emailAddress"`
					AvatarUrls  map[string]string `json:"avatarUrls"`
				} `json:"reporter"`
				Project struct {
					ID  string `json:"id"`
					Key string `json:"key"`
				} `json:"project"`
			} `json:"fields"`
			RenderedFields struct {
				Description string `json:"description"`
				Comment     struct {
					Comments []struct {
						Body string `json:"body"`
					} `json:"comments"`
				} `json:"comment"`
			} `json:"renderedFields"`
		} `json:"issues"`
		Total int `json:"total"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, 0, fmt.Errorf("failed to parse search results: %v", err)
	}
	
	// Convert API response to our ticket model
	tickets := make([]models.Ticket, 0, len(result.Issues))
	for _, issue := range result.Issues {
		// Parse dates
		created, _ := time.Parse("2006-01-02T15:04:05.000-0700", issue.Fields.Created)
		updated, _ := time.Parse("2006-01-02T15:04:05.000-0700", issue.Fields.Updated)
		
		// Build ticket URL
		ticketURL := fmt.Sprintf("%s/browse/%s", j.baseURL, issue.Key)
		
		// Extract assignee if present
		var assignee *models.User
		if issue.Fields.Assignee != nil {
			avatarURL := ""
			if len(issue.Fields.Assignee.AvatarUrls) > 0 {
				avatarURL = issue.Fields.Assignee.AvatarUrls["48x48"]
			}
			
			assignee = &models.User{
				ID:          issue.Fields.Assignee.AccountID,
				DisplayName: issue.Fields.Assignee.DisplayName,
				Email:       issue.Fields.Assignee.EmailAddress,
				AvatarURL:   avatarURL,
			}
		}
		
		// Extract reporter if present
		var reporter *models.User
		if issue.Fields.Reporter != nil {
			avatarURL := ""
			if len(issue.Fields.Reporter.AvatarUrls) > 0 {
				avatarURL = issue.Fields.Reporter.AvatarUrls["48x48"]
			}
			
			reporter = &models.User{
				ID:          issue.Fields.Reporter.AccountID,
				DisplayName: issue.Fields.Reporter.DisplayName,
				Email:       issue.Fields.Reporter.EmailAddress,
				AvatarURL:   avatarURL,
			}
		}
		
		// Extract priority if present
		priority := ""
		if issue.Fields.Priority != nil {
			priority = issue.Fields.Priority.Name
		}
		
		// Extract snippet containing the search text
		snippet := extractSnippet(issue.RenderedFields.Description, searchText)
		if snippet == "" {
			// If not found in description, look in comments
			for _, comment := range issue.RenderedFields.Comment.Comments {
				snippet = extractSnippet(comment.Body, searchText)
				if snippet != "" {
					break
				}
			}
		}
		
		tickets = append(tickets, models.Ticket{
			ID:        issue.ID,
			Key:       issue.Key,
			URL:       ticketURL,
			Title:     issue.Fields.Summary,
			Status:    issue.Fields.Status.Name,
			Type:      issue.Fields.IssueType.Name,
			Priority:  priority,
			Assignee:  assignee,
			Reporter:  reporter,
			Created:   created,
			Updated:   updated,
			Snippet:   snippet,
			ProjectID: issue.Fields.Project.ID,
		})
	}
	
	return tickets, result.Total, nil
}

// GetProjects retrieves the list of Jira projects the user has access to
func (j *JiraClient) GetProjects(limit int) ([]models.Project, error) {
	// Build the API URL
	endpoint := fmt.Sprintf("%s%s/project/search?maxResults=%d", j.baseURL, j.apiPrefix, limit)
	
	// Make the request
	resp, err := j.client.Get(endpoint)
	if err != nil {
		return nil, fmt.Errorf("API request failed: %v", err)
	}
	defer resp.Body.Close()
	
	// Check response status
	if resp.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(resp.Body)
		return nil, fmt.Errorf("API returned error: %s - %s", resp.Status, body)
	}
	
	// Parse the response
	var result struct {
		Values []struct {
			ID   string `json:"id"`
			Key  string `json:"key"`
			Name string `json:"name"`
		} `json:"values"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to parse projects: %v", err)
	}
	
	// Convert API response to our project model
	projects := make([]models.Project, 0, len(result.Values))
	for _, project := range result.Values {
		projects = append(projects, models.Project{
			ID:   project.ID,
			Key:  project.Key,
			Name: project.Name,
		})
	}
	
	return projects, nil
}

// Helper function to escape JQL special characters
func escapeJQL(s string) string {
	// Escape JQL special characters: + - & | ! ( ) { } [ ] ^ ~ * ? \ : "
	special := []string{"+", "-", "&", "|", "!", "(", ")", "{", "}", "[", "]", "^", "~", "*", "?", "\\", ":", "\""}
	
	for _, char := range special {
		s = strings.ReplaceAll(s, char, "\\"+char)
	}
	
	return s
}

// Helper function to extract a snippet containing the search text
func extractSnippet(text, searchText string) string {
	if text == "" || searchText == "" {
		return ""
	}
	
	// Remove HTML tags to get plain text
	plainText := stripHTML(text)
	
	// Find the index of the search text (case insensitive)
	index := strings.Index(strings.ToLower(plainText), strings.ToLower(searchText))
	if index == -1 {
		return ""
	}
	
	// Determine the snippet range (before and after the search text)
	snippetLength := 200
	start := index - snippetLength/2
	if start < 0 {
		start = 0
	}
	
	end := index + len(searchText) + snippetLength/2
	if end > len(plainText) {
		end = len(plainText)
	}
	
	// Extract the snippet
	snippet := plainText[start:end]
	
	// Add ellipsis if needed
	if start > 0 {
		snippet = "..." + snippet
	}
	if end < len(plainText) {
		snippet = snippet + "..."
	}
	
	return snippet
}

// Helper function to strip HTML tags
func stripHTML(html string) string {
	// Very simple implementation - in production use a proper HTML parser
	result := html
	
	// Remove script and style elements
	scriptRegex := `(?s)<script.*?</script>`
	result = replaceAllString(result, scriptRegex, "")
	
	styleRegex := `(?s)<style.*?</style>`
	result = replaceAllString(result, styleRegex, "")
	
	// Remove HTML tags
	tagRegex := `<[^>]*>`
	result = replaceAllString(result, tagRegex, "")
	
	// Decode HTML entities
	result = decodeHTMLEntities(result)
	
	// Normalize whitespace
	whitespaceRegex := `\s+`
	result = replaceAllString(result, whitespaceRegex, " ")
	
	return strings.TrimSpace(result)
}

// Helper function to replace all occurrences of a pattern
func replaceAllString(s, pattern, replacement string) string {
	// In production, use proper regex import
	// This is a simplified version
	parts := strings.Split(s, pattern)
	return strings.Join(parts, replacement)
}

// Helper function to decode HTML entities
func decodeHTMLEntities(html string) string {
	// In production, use proper HTML entity decoder
	// This is a very simplified version with just a few common entities
	entities := map[string]string{
		"&amp;":  "&",
		"&lt;":   "<",
		"&gt;":   ">",
		"&quot;": "\"",
		"&#39;":  "'",
		"&nbsp;": " ",
	}
	
	result := html
	for entity, char := range entities {
		result = strings.ReplaceAll(result, entity, char)
	}
	
	return result
}

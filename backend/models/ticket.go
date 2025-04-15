package models

import "time"

// Ticket represents a Jira issue/ticket with fields needed for display
type Ticket struct {
	ID        string    `json:"id"`
	Key       string    `json:"key"`
	URL       string    `json:"url"`
	Title     string    `json:"title"`
	Status    string    `json:"status"`
	Type      string    `json:"type,omitempty"`
	Priority  string    `json:"priority,omitempty"`
	Assignee  *User     `json:"assignee,omitempty"`
	Reporter  *User     `json:"reporter,omitempty"`
	Created   time.Time `json:"created"`
	Updated   time.Time `json:"updated"`
	Snippet   string    `json:"snippet"`
	ProjectID string    `json:"projectId,omitempty"`
}

// User represents basic user info in a Jira ticket
type User struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	Email       string `json:"email,omitempty"`
	AvatarURL   string `json:"avatarUrl,omitempty"`
}

// Project represents a Jira project
type Project struct {
	ID   string `json:"id"`
	Key  string `json:"key"`
	Name string `json:"name"`
}

// Field is a helper struct for parsing Jira API responses
type Field struct {
	ID     string      `json:"id"`
	Name   string      `json:"name"`
	Values interface{} `json:"values"`
}

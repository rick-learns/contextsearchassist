package middleware

import (
	"context"
	"net/http"

	"contextsearch-assist/handlers"
	"contextsearch-assist/utils"
)

// RequireAuth middleware checks if the user is authenticated
// and adds the Jira client to the request context
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get the session from the request
		session, err := handlers.GetSessionFromRequest(r)
		if err != nil {
			http.Error(w, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
			return
		}
		
		// Create a Jira client using the session token
		jiraClient := utils.NewJiraClient(session.Token)
		
		// Add the Jira client to the request context
		ctx := context.WithValue(r.Context(), "jiraClient", jiraClient)
		
		// Add user info to the context
		ctx = context.WithValue(ctx, "userInfo", session.UserInfo)
		
		// Call the next handler with the updated context
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}


# ContextSearchAssist - Product Requirements (MVP)

## Core Value Proposition
Enable users to quickly find related Jira tickets by selecting text within Jira Cloud descriptions/comments.

## MVP Scope

### In Scope
- Jira Cloud integration only
- Secure Authentication via Jira Cloud OAuth 2.0
- Search initiation via right-click context menu on selected text
- Search execution via Jira REST API (JQL `text ~ "..."`)
- Automatically scoped to current project where possible
- Search limited to Description and Comment fields
- Basic results display in sidebar showing Ticket ID, Title, Status, Snippet
- Clear loading/searching indicators and error states
- Snippet includes highlighting of matched search terms
- Display limited to ~10-15 results
- Basic "Log Out" function
- Manual installation via "Load Unpacked" extension

### Out of Scope (for MVP)
- Azure DevOps support
- Jira Server / Data Center support
- Marketplace distribution
- Backend user accounts, billing, or license management
- Freemium usage limits
- Advanced search features
- User configuration settings UI
- Advanced UI polish or themes
- Automated analytics/tracking
- Public landing page

## Key User Stories

1. **Authentication**: Users can securely connect to Jira Cloud via OAuth 2.0
2. **Search Initiation**: Users can select text, right-click, and initiate a search
3. **Search Execution**: System constructs proper JQL queries with project context
4. **Results Display**: Users see relevant results with highlighted search terms
5. **Error Handling**: System displays user-friendly error messages
6. **Extension Management**: Users can log out to clear tokens

## Non-Functional Requirements

- **Performance**: Search results displayed within 1.5-2 seconds
- **Security**: OAuth 2.0, secure token storage, HTTPS, XSS prevention
- **Usability**: Intuitive UI with clear states (loading, no results, errors)
- **Reliability**: Graceful error handling and consistent functionality
- **Browser Compatibility**: Chrome, Firefox, Edge, Brave (latest versions)

## Technology Stack

- **Frontend**: TypeScript (v5.3+), React, WebExtensions API
- **Backend**: Go (v1.21+) on AWS Lambda/API Gateway
- **Security**: DOMPurify for sanitization, AWS Secrets Manager for credentials

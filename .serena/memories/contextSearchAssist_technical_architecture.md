
# ContextSearchAssist - Technical Architecture

## Overview

The architecture prioritizes:
- **Client-Side Logic**: Core search functionality within the browser extension
- **Security**: Secure handling of authentication tokens and user data
- **Minimal Backend**: Serverless backend only for OAuth 2.0 handling
- **Standard Technologies**: TypeScript/React for frontend, Go for backend, AWS for infrastructure

## Component Architecture

### Browser Extension (Client)
- **Technology**: TypeScript (v5.3+), React, WebExtensions API
- **Key Responsibilities**:
  - UI Management (results sidebar, browser action popup)
  - User Interaction (text selection, context menu)
  - Authentication Triggering (OAuth 2.0 flow)
  - Token Storage (browser.storage.local)
  - Context Detection (current Jira Project Key)
  - JQL Construction (proper escaping and formatting)
  - API Interaction (authenticated requests to Jira API)
  - Result Processing (highlighting of search terms)
  - Sanitization (preventing XSS)
  - State Management (loading, error, results states)
  - Logout (clearing stored tokens)

### Backend API (OAuth Handler)
- **Technology**: Go (v1.21+) on AWS Lambda/API Gateway
- **Key Responsibilities**:
  - OAuth Callback Endpoint
  - State Parameter Validation (CSRF prevention)
  - Token Exchange (when necessary)
  - Redirecting User back to extension
- **Not Responsible For**:
  - Handling search requests
  - Storing user data or tokens long-term
  - Business logic beyond OAuth flow

### External Components
- **Jira Cloud API**: Provides search endpoints and OAuth services
- **AWS Services**: Lambda, API Gateway, IAM, CloudWatch, Secrets Manager

## Key Flows

### Authentication Flow
1. User initiates login
2. Extension generates state parameter, constructs authorization URL
3. User is redirected to Jira authorization page
4. Upon approval, callback to backend with authorization code
5. Backend validates state, exchanges code for tokens
6. User redirected to extension with tokens
7. Extension securely stores tokens

### Search Flow
1. User selects text, chooses context menu option
2. Extension retrieves access token, detects project context
3. Extension constructs JQL query with proper escaping
4. Extension displays loading state and makes API request
5. Extension processes results, highlights search terms
6. Extension displays formatted results or error messages

### Logout Flow
1. User clicks logout in browser action popup
2. Extension removes stored tokens
3. Extension updates UI to logged-out state

## Security Considerations

- All communication uses HTTPS
- OAuth tokens stored securely in browser.storage.local
- State parameter validation prevents CSRF attacks
- Input validation and output sanitization prevent XSS
- Minimal OAuth scopes requested (read:jira-work)
- Client secrets stored in AWS Secrets Manager
- No permanent storage of user data on backend

## Data Storage

- Tokens stored client-side only in browser.storage.local
- No persistent user data stored by backend
- No storage of Jira issue content

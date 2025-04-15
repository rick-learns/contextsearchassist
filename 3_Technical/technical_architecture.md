# Technical Architecture - MVP: ContextSearch Assist

**Version:** 1.0
**Date:** [Insert Date]
**Status:** Draft

## 1. Overview

This document outlines the technical architecture for the Minimum Viable Product (MVP) of the ContextSearch Assist browser extension. The primary goal is to validate the core value proposition: providing quick, contextual search within Jira Cloud based on selected text.

The architecture prioritizes:
*   **Client-Side Logic:** Performing the core search functionality directly within the browser extension to minimize backend complexity and cost for the MVP.
*   **Security:** Secure handling of authentication tokens and user data.
*   **Minimal Backend:** Utilizing a serverless backend *only* for essential tasks that cannot be securely performed client-side (specifically, handling the OAuth 2.0 callback).
*   **Standard Technologies:** Leveraging established technologies like TypeScript/React for the frontend and Go for the minimal backend, deployed on standard serverless infrastructure (AWS).

This architecture directly supports the requirements outlined in the `product_requirements_document_prd_mvp.md` (Version 1.1).

## 2. Architecture Diagram

*(This document should be accompanied by a visual diagram: `technical_architecture_diagram.png` illustrating the components and flows described below.)*


**Diagram Components:** User Browser, Browser Extension (TS/React), Backend API (Go/Lambda/API Gateway), Jira Cloud API, Jira Cloud OAuth Service, AWS Services (Lambda, API Gateway, etc.).

**Diagram Flows:** Authentication Flow, Search Flow, Logout Flow.

## 3. Components

### 3.1 Browser Extension (Client)
*   **Technology:** TypeScript (v5.3+), React (latest stable), WebExtensions API.
*   **Runtime:** Runs within the user's supported browser (Chrome, Firefox, Edge, Brave).
*   **Key Responsibilities:**
    *   **UI Management:** Rendering the results sidebar, browser action popup (logout), loading/error/no-results states.
    *   **User Interaction:** Detecting text selection, registering and handling the right-click context menu action.
    *   **Authentication Triggering:** Initiating the Jira Cloud OAuth 2.0 flow by redirecting the user to Jira's authorization endpoint.
    *   **Token Storage:** Securely storing retrieved Jira API access tokens (and potentially refresh tokens) using `browser.storage.local`.
    *   **Context Detection:** Attempting to parse the current Jira Project Key from the page URL.
    *   **JQL Construction:** Escaping user-selected text, formatting for exact phrase matching, appending detected project key scope.
    *   **API Interaction (Search):** Making authenticated HTTPS requests directly to the Jira Cloud REST API (`/search` endpoint).
    *   **Result Processing:** Handling API responses, extracting relevant data, performing client-side highlighting of search terms within snippets.
    *   **Sanitization:** Securely sanitizing all dynamic data from Jira before rendering in the UI.
    *   **State Management:** Managing UI state (loading, error, results, logged-in status).
    *   **Logout:** Clearing stored tokens upon user request.

### 3.2 Backend API (OAuth Handler)
*   **Technology:** Go (v1.21+).
*   **Runtime:** Deployed as a serverless function on AWS Lambda, exposed via AWS API Gateway.
*   **Key Responsibilities:**
    *   **OAuth Callback Endpoint:** Provides the secure HTTPS endpoint registered as the `redirect_uri` in the Jira OAuth 2.0 application configuration.
    *   **State Parameter Validation:** Receiving the callback from Jira, verifying the `state` parameter matches the one originally sent by the extension to prevent CSRF attacks.
    *   **(Potentially) Token Exchange:** Receiving the authorization `code` from Jira and securely exchanging it for an access token (and refresh token) by making a server-to-server call to Jira's token endpoint (requires securely storing the OAuth App's client secret). *Note: If using an Implicit flow variant suitable for extensions, this step might be different or handled client-side, but server-side handling of code exchange is generally more secure if client secrets are involved.*
    *   **Redirecting User:** Redirecting the user's browser back to a predefined page (e.g., a static success/failure page hosted with the extension, or potentially using custom URI schemes if supported) potentially passing the token information securely (e.g., via URL fragment handled by the extension).
*   **Explicitly NOT Responsible For (MVP):**
    *   Handling search requests.
    *   Storing user data or tokens long-term (stateless beyond the immediate request cycle of the OAuth flow).
    *   Any business logic beyond the OAuth callback process.

### 3.3 Jira Cloud API
*   **Technology:** External REST API provided by Atlassian.
*   **Key Responsibilities:**
    *   Source of truth for Jira issue data.
    *   Provides the `/search` endpoint used by the extension.
    *   Provides endpoints for the OAuth 2.0 flow (authorization, token exchange).

### 3.4 AWS Services
*   **Technology:** Cloud infrastructure provider.
*   **Key Responsibilities:**
    *   **AWS Lambda:** Executes the Go backend function code.
    *   **AWS API Gateway:** Provides the secure HTTPS endpoint for the Lambda function, handles request routing, potentially authorizers (though likely just a public endpoint for OAuth callback).
    *   **(Implicitly) IAM:** Manages permissions for Lambda execution.
    *   **(Implicitly) CloudWatch:** Collects logs and metrics for the Lambda function.

## 4. Detailed Flows

### 4.1 Authentication Flow (Example using Authorization Code Grant)
1.  **User Action:** User clicks "Login" within the extension UI (e.g., browser action popup).
2.  **Extension:** Generates a secure random `state` parameter, stores it temporarily (e.g., `browser.storage.local`). Constructs the Jira Authorization URL including `client_id`, `redirect_uri` (pointing to the Go backend endpoint), requested `scope` (`read:jira-work`), `response_type=code`, and the generated `state`.
3.  **Extension:** Redirects the user's browser to the Jira Authorization URL.
4.  **Jira:** User logs into Jira (if not already), reviews requested permissions, and clicks "Allow".
5.  **Jira:** Redirects the user's browser to the `redirect_uri` (our Go backend) appending the authorization `code` and the original `state` parameter.
6.  **Backend API (Go/Lambda):** Receives the request.
    *   Retrieves the `code` and `state` from the query parameters.
    *   Compares the received `state` with the value expected/stored (requires a mechanism to pass/retrieve this state securely, potentially involving temporary server-side storage or encoding it in the redirect back to the extension). **[Security Critical Step]**
    *   If `state` matches: Makes a secure server-to-server HTTPS request to Jira's token endpoint, sending `client_id`, `client_secret`, `code`, `grant_type=authorization_code`, and `redirect_uri`. **[Security Critical Step - Secret Handling]**
    *   Jira responds with `access_token`, `refresh_token` (optional), `expires_in`, etc.
    *   If `state` does *not* match: Returns an error/aborts.
7.  **Backend API (Go/Lambda):** Redirects the user's browser back to a specific page bundled with the extension (e.g., `oauth_callback.html`). It securely passes the retrieved tokens (e.g., via URL fragment `#access_token=...&state=...`).
8.  **Extension (Callback Page):** JavaScript on the callback page parses the tokens from the URL fragment, validates the `state` one last time against the value stored in step 2, securely stores the tokens using `browser.storage.local`, clears the temporary state, and updates the extension's logged-in status. Closes the callback tab/window.

### 4.2 Search Flow
1.  **User Action:** User selects text in Jira, right-clicks, and selects "ContextSearch: Find mentions...".
2.  **Extension (Content Script/Background Script):** Captures the selected text.
3.  **Extension:** Retrieves the stored `access_token` from `browser.storage.local`. If no token exists or it's expired (basic check), prompt user to log in.
4.  **Extension:** Attempts to parse the current Project Key from the URL.
5.  **Extension:** Escapes special JQL characters in the selected text. Enforces phrase search if needed (adds quotes). Constructs the final JQL string, potentially appending ` AND project = "[projKey]"`.
6.  **Extension:** Displays the "Loading..." state in the results sidebar.
7.  **Extension:** Makes an HTTPS `GET` (or `POST` if JQL is long) request to the Jira Cloud `/rest/api/3/search` endpoint. Includes the `Authorization: Bearer [access_token]` header and the constructed JQL query. Requests specific fields (`summary`, `status`, potentially others needed for display, ensures snippets are included if possible via Jira API).
8.  **Jira Cloud API:** Processes the search and returns results (list of issues) or an error.
9.  **Extension:** Receives the response.
    *   **On Success (200 OK):**
        *   If results list is empty, display "No results found..." message.
        *   If results exist: Process each result - find the original search term within the snippet (case-insensitive), wrap it in highlighting markup (e.g., `<strong>`). Limit to ~10-15 results. Sanitize ALL data (Title, Snippet with highlighting, Status) before rendering. Display the formatted results list in the sidebar.
    *   **On Error:** Map common errors (401, 403, 429, 5xx) to user-friendly messages and display in the sidebar.
10. **Extension:** Hides the "Loading..." state.

### 4.3 Logout Flow
1.  **User Action:** User clicks the extension's toolbar icon, then clicks the "Log Out" button in the popup.
2.  **Extension:** Removes the stored Jira tokens (`access_token`, `refresh_token`) from `browser.storage.local`.
3.  **Extension:** Updates its internal state to logged-out. Updates the popup UI accordingly.

## 5. Data Storage

*   **Jira API Tokens (Access Token, Refresh Token):** Stored **client-side only** within the browser's secure extension storage (`browser.storage.local`). **Never** sent to or stored by the Go backend after the initial OAuth callback exchange.
*   **Temporary OAuth State:** A short-lived `state` parameter generated during the OAuth flow might be temporarily stored client-side (`browser.storage.local`) or handled via secure server-side mechanisms if required for validation during the callback.
*   **User Configuration/Preferences:** None for MVP. Future settings would be stored via `browser.storage.sync` or `local`.
*   **Backend Storage:** **No persistent user data** stored by the Go backend service for MVP. It operates statelessly regarding user information.
*   **Jira Issue Content:** **Never** stored by the extension or backend components. Data is retrieved from Jira API, processed in memory for display, and discarded.

## 6. Scalability & Reliability

*   **Backend API (Go/Lambda):** Inherits the high scalability and availability of AWS Lambda and API Gateway, automatically scaling based on request volume (which is expected to be low for OAuth callbacks).
*   **Browser Extension (Client):** Search performance is primarily dependent on the Jira Cloud API's response time and client-side processing power. Load scales naturally with the number of users.
*   **Rate Limiting:** The extension must be mindful of Jira API rate limits. Basic client-side awareness (e.g., preventing rapid-fire searches) is included. More sophisticated handling (e.g., exponential backoff based on 429 responses) may be needed post-MVP.
*   **Error Handling:** Basic error handling for API calls and displaying user-friendly messages is included in the MVP scope (see PRD).

## 7. Security Considerations

*   Security is paramount, especially regarding authentication tokens.
*   HTTPS is enforced for all external communication (Jira API, Backend API via API Gateway).
*   The backend API has a minimal attack surface, focused solely on the OAuth callback. Secure configuration of API Gateway (e.g., request validation) is important.
*   Secure handling of OAuth `state` parameter is critical to prevent CSRF.
*   Secure storage of OAuth `client_secret` (if applicable for the chosen flow) within the backend function's environment is critical (use AWS Secrets Manager or similar).
*   Client-side security relies heavily on correct token storage (`browser.storage`) and robust output sanitization for all data rendered in the UI to prevent XSS.
*   Refer to `security_design_document.md` for detailed security controls and threat modeling.
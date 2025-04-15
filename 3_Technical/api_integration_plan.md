# API Integration Plan - MVP: ContextSearch Assist

**Version:** 1.3
**Date:** [Insert Date]
**Status:** Finalized MVP Plan

## 1. Overview

This document details the integration points between the ContextSearch Assist components (specifically the Browser Extension's Background Script/Service Worker and the AWS Lambda Go backend) and the external Jira Cloud REST APIs for the MVP. It covers authentication, search execution, backend-proxied token refresh, and error handling specifics relevant to API interactions.

This plan assumes the architecture defined in `technical_architecture.md` (v1.1) and supports requirements in `product_requirements_document_prd_mvp.md` (v1.1).

### 1.1 Prerequisites
*   The browser extension's `manifest.json` MUST declare appropriate host permissions (e.g., `*://*.atlassian.net/*`, `*://auth.atlassian.com/*`) to interact with Jira Cloud pages, initiate redirects, and handle callbacks. User consent for these permissions will be requested by the browser upon installation or first use.

## 2. General Principles

*   All API communication MUST use HTTPS.
*   All authenticated requests MUST include the `Authorization: Bearer [access_token]` header, where the token is retrieved securely from `Token Storage` by the Background Script.
*   The Background Script will reactively handle 401 Unauthorized errors by attempting a token refresh **via the backend API** before prompting for re-login.
*   Requests should include an appropriate `Accept: application/json` header. `POST` requests should use `Content-Type: application/json`.
*   Error handling should gracefully manage common HTTP status codes (4xx, 5xx) and provide user-friendly feedback via the Extension UI.
*   Be mindful of Jira Cloud API Rate Limits. Log 429 errors for monitoring. Implement basic client-side request throttling/debouncing if necessary.

## 3. Jira Cloud OAuth 2.0 Integration (Authorization Code Grant with PKCE)

*   **Reference:** Atlassian OAuth 2.0 (3LO) Documentation ([Provided Link])
*   **Flow Owner:** Orchestrated by the `Background Script/Service Worker`, involving `Extension UI`, `User's Browser`, and the `AWS Backend (Go Lambda)`.
*   **OAuth App Configuration (Atlassian Developer Console):**
    *   **App Name:** ContextSearch Assist (or similar)
    *   **Permissions/Scopes:** `read:jira-work`, `offline_access` (to obtain refresh tokens).
    *   **Callback URL:** The HTTPS URL of the AWS API Gateway endpoint for the `/auth/callback` route pointing to the Go Lambda function.
*   **Security Components:**
    *   **Backend Cache (DynamoDB):**
        *   Purpose: Temporarily store expected `state` and `code_verifier`.
        *   Implementation: AWS DynamoDB table (e.g., `ContextSearchOAuthStateCache`) with TTL enabled.
        *   Schema: Primary Key `session_id (String)`; Attributes `expected_state (String)`, `code_verifier (String)`, `ttl_timestamp (Number)`.
        *   TTL: Set on `ttl_timestamp` attribute, calculated as `currentTime + 600` seconds (10 min expiry) by the `/auth/initiate` function.
    *   **Session Identifier (Cookie):**
        *   Purpose: Securely link `initiate` and `callback` requests via the browser.
        *   Implementation: Secure cookie set by the `/auth/initiate` backend response.
        *   Attributes: `HttpOnly; Secure; SameSite=Lax; Path=/auth; Max-Age=600`. (Cookie Name e.g., `context-search-auth-session`)

*   **Phase 1: Initiation (Extension -> Backend -> Browser Navigation)**
    1.  **User Action:** User clicks "Login" in `Extension UI`. UI sends "Request Login Flow" to `Background Script`.
    2.  **Background Script:**
        *   Generates `code_verifier` (secure random string).
        *   Generates `code_challenge` (Base64Url(SHA256(verifier))).
        *   Generates `state` (secure random string).
    3.  **Background Script:** Makes a secure HTTPS `POST` request to the `AWS Backend` endpoint `/auth/initiate`. Sends `{ "state": generated_state, "code_verifier": generated_verifier }`.
    4.  **Backend API (Go/Lambda - `/auth/initiate`):**
        *   Generates a unique `session_id`.
        *   Calculates `ttl_timestamp` (current time + 600s).
        *   Stores `{ session_id, expected_state: received_state, code_verifier: received_verifier, ttl_timestamp }` in the DynamoDB Cache table.
        *   Sets the session cookie in the response header: `Set-Cookie: context-search-auth-session=[session_id]; HttpOnly; Secure; SameSite=Lax; Path=/auth; Max-Age=600`.
        *   Returns success (200 OK).
    5.  **Background Script:** Receives success confirmation.
    6.  **Background Script:** Constructs the Jira Authorization URL: (Including `client_id`, `scope`, `redirect_uri`, original `state` from Step 2, `response_type=code`, `code_challenge`, `code_challenge_method=S256`).
    7.  **Background Script:** Initiates the redirect (navigates user's browser).

*   **Phase 2: Jira Authorization & Redirect to Backend**
    8.  **Jira OAuth Service:** User authenticates, grants consent.
    9.  **Jira OAuth Service:** Redirects `User's Browser` to the application's `redirect_uri` (`/auth/callback` on AWS Backend) with `code` and original `state`.

*   **Phase 3: Backend Callback Handling & Token Exchange**
    10. **User's Browser:** Makes `GET` request to `/auth/callback` on `AWS Backend`, automatically including the session cookie.
    11. **Backend API (Go/Lambda - `/auth/callback`):**
        *   Extracts `session_id` from cookie. Abort with redirect `#error=backend_error&state=[received_state]` if cookie missing/invalid.
        *   Retrieves item from DynamoDB Cache using `session_id`. Abort with redirect `#error=invalid_state&state=[received_state]` if item not found (expired/invalid session). Deletes item from cache immediately after retrieval.
        *   Receives `code` and `state` query parameters.
        *   Validates received `state` against `expected_state` from cache. Abort with redirect `#error=invalid_state&state=[received_state]` if mismatch (CSRF). **[Security Critical Step]**
        *   Prepares Token Request to `https://auth.atlassian.com/oauth/token`: (Method: `POST`, Headers: `Content-Type: application/json`)
            ```json
            {
              "grant_type": "authorization_code",
              "client_id": "[Your_App_Client_ID]",
              "client_secret": "[Secret_Value]", // Load securely! (MUST use AWS Secrets Manager/Parameter Store)
              "code": "[Received_Authorization_Code]",
              "redirect_uri": "[Your_Callback_URL]",
              "code_verifier": "[Retrieved_code_verifier_From_Cache]" // PKCE
            }
            ```
        *   Executes Token Request.
        *   **On Success:** Parses `access_token`, `refresh_token`, `expires_in`. Prepares redirect URL for the extension's callback page using the URL fragment format: `#access_token=...&refresh_token=...&expires_in=...&state=[original_state]`
        *   **On Failure:** (e.g., communicating with Atlassian). Prepares redirect URL appending a defined error code and state: `#error=token_exchange_error&state=[original_state]`
        *   Handle any unexpected internal Lambda errors by redirecting: `#error=backend_error&state=[original_state]`
    12. **Backend API (Go/Lambda):** Issues HTTP 302 Redirect to the extension callback URL with the appropriate fragment.

*   **Phase 4: Extension Handles Final Callback**
    13. **User's Browser:** Redirected to the extension's internal `oauth_callback.html` page.
    14. **Extension (Callback Page Script):** Parses the URL fragment (`window.location.hash`) using `URLSearchParams`. Extracts tokens/expiry/state or error code/state.
    15. **Extension (Callback Page Script):** Sends parsed info to `Background Script`.
    16. **Background Script:** Receives info. Validates `state` against the value originally generated for this flow (stored briefly client-side or associated with the session during initiation). Abort if mismatch.
    17. **Background Script:** If error code (`invalid_state`, `token_exchange_error`, `backend_error`) received, update UI state to show appropriate user-friendly error message.
    18. **Background Script:** If successful token info received: calculates absolute expiry timestamp (`Date.now() + expires_in * 1000`); securely stores `access_token`, `refresh_token`, `expiryTimestamp` via `Token Storage` (`browser.storage.local` - **Crucial:** API is asynchronous, use `async/await` or Promises correctly). Updates internal state to logged-in. Notifies UI.
    19. **Background Script:** Clears any temporary client-side state.
    20. **Extension (Callback Page Script):** `window.close()`.

## 4. Jira Cloud Search API Integration

*   **Endpoint:** `/rest/api/3/search`
*   **Caller:** Browser Extension (`Background Script/Service Worker`)
*   **Method:** `POST`
*   **Authentication:** `Authorization: Bearer [access_token]` header.
*   **Request Body (POST):**
    ```json
    {
      "jql": "[Constructed_JQL_String]", // Includes escaping, phrase search, project scoping
      "startAt": 0,
      "maxResults": 15,
      "fields": [
        "summary", "status", "issuetype",
        // Assume snippets need client-side generation - Request source fields
        "description", "comment"
        // **VERIFY VIA TESTING** if Jira offers better snippet fields/options (e.g., renderedFields?)
      ],
      "expand": []
    }
    ```
*   **JQL Construction Notes:** (As previously defined).
*   **Successful Response (200 OK):**
    *   JSON object (`startAt`, `maxResults`, `total`, `issues` array).
    *   **Action:** Background Script processes `issues`: **attempts to generate snippets** from `description`/`comment` around the search term (unless testing proves Jira returns usable snippets), performs highlighting, limits count, sanitizes results.
*   **Error Handling:**
    *   `400 Bad Request`: Invalid JQL. Display "Search failed". Log details.
    *   `401 Unauthorized`: **Trigger Backend Refresh Token Flow (See Section 5).** If refresh fails, prompt user re-login.
    *   `403 Forbidden`: Insufficient permissions. Display results if any, potentially add warning. Log details.
    *   `429 Too Many Requests`: Rate limited. Display "Search temporarily unavailable". Log details.
    *   `5xx Server Error`: Jira issue. Display "Search failed". Log details.

## 5. Refresh Token Usage via Backend Proxy (Handling 401 Errors)

*   **Trigger:** `Background Script` receives a 401 Unauthorized response during a standard API call (e.g., Search API).
*   **Action:**
    1.  Check if a `refresh_token` exists in `Token Storage`. If not, clear tokens, trigger re-login (Section 3).
    2.  If `refresh_token` exists:
        *   `Background Script` makes secure HTTPS `POST` to `AWS Backend` endpoint `/auth/refresh`. Sends `{ "refresh_token": "[Stored_Refresh_Token]" }`.
    3.  **Backend API (Go/Lambda - `/auth/refresh`):**
        *   Receives request with `refresh_token`.
        *   Prepares Token Refresh Request to `https://auth.atlassian.com/oauth/token`:
            ```json
            {
              "grant_type": "refresh_token",
              "client_id": "[Your_App_Client_ID]",
              "client_secret": "[Secret_Value]", // Load securely! (MUST use AWS Secrets Manager/Parameter Store)
              "refresh_token": "[Received_Refresh_Token]"
            }
            ```
        *   Executes request to Atlassian.
        *   **On Success:** Parses new `access_token`, `refresh_token`, `expires_in`. Returns these in the JSON response body (e.g., `{"access_token": "...", "refresh_token": "...", "expires_in": 3600}`).
        *   **On Failure:** (e.g., invalid refresh token response from Atlassian). Returns appropriate error status/message (e.g., 400 Bad Request with JSON body `{"error": "refresh_failed"}`).
    4.  **Background Script:** Receives response from `/auth/refresh`.
        *   **On Success (2xx status):** Parses new tokens/expiry from response body. Calculates new absolute expiry timestamp. Securely updates `Token Storage` (using `async/await`). **Retries the original failed API call** using the new `access_token`.
        *   **On Failure (4xx/5xx status):** Clears *all* stored tokens (`access_token`, `refresh_token`, `expiryTimestamp`) from `Token Storage` (using `async/await`). Triggers the full user re-login flow (Section 3).
*   **Concurrency:** Implement locking/queueing mechanism (e.g., using a simple flag or a more robust async mutex pattern) in the Background Script to ensure only one `/auth/refresh` request is in flight at a time if multiple API calls trigger a 401 simultaneously.

## 6. Open Questions / Decisions Needed

*   **VERIFICATION REQUIRED VIA TESTING:** How are text snippets returned by `/rest/api/3/search`? Are `description`/`comment` fields sufficient, or are there better options (e.g., `renderedFields`)? **(Plan assumes client-side generation from full fields is needed as fallback).**
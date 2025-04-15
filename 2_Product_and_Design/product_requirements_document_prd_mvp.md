# Product Requirements Document (PRD) - MVP: ContextSearch Assist

**Version:** 1.1
**Date:** [Insert Date]
**Status:** Agreed MVP Scope

## 1. Introduction

### 1.1 Goals
*   Validate the core value proposition: enable users to quickly find related Jira tickets by selecting text within Jira Cloud descriptions/comments.
*   Gather initial feedback from 5-10 internal/friendly beta testers on usability, functionality, and core value.
*   Establish a secure, usable, and functional baseline for future development.
*   Enhance result clarity through intelligent snippet highlighting.
*   Provide clear feedback to the user during search operations and error states.

### 1.2 Scope
**In Scope (MVP):**
*   Jira Cloud integration only.
*   Secure Authentication via Jira Cloud OAuth 2.0.
*   Search initiation via right-click context menu on selected text.
*   Search execution via Jira REST API (JQL `text ~ "..."`), automatically scoped to current project where possible.
*   Search limited to Description and Comment fields.
*   Search logic: Exact phrase match (case-insensitive preferred), JQL escaping.
*   Basic results display (Sidebar UI preferred) showing linked Ticket ID, Title, Status, Snippet.
*   Clear Loading/Searching indicator within the sidebar.
*   Clear "No Results Found" message within the sidebar.
*   User-friendly display of common error states within the sidebar.
*   Snippet includes highlighting of the matched search term.
*   Display limited to ~10-15 results.
*   Basic "Log Out" function via browser action popup.
*   Manual installation via "Load Unpacked" extension.

**Out of Scope (MVP):**
*   Azure DevOps support.
*   Jira Server / Data Center support.
*   Marketplace distribution.
*   Backend user accounts, billing, or license management (beyond OAuth handling).
*   Freemium usage limits.
*   Advanced search features (fuzzy search, custom fields, regex, searching outside current project explicitly).
*   User configuration settings UI.
*   Advanced UI polish or themes.
*   Automated analytics/tracking.
*   Public landing page.
*   Highlighting multiple instances within a single snippet.
*   Detailed error code mapping beyond common cases.

### 1.3 MVP Priorities (Internal/Friendly Beta)
*(Focusing on Secure Auth, Trigger, Robust Search Execution, Clear Results Display [incl. Loading/NoResults/Highlighting], Basic Error Handling & Logout, Packaging)*

## 2. User Stories / Functional Requirements

### 2.1 Authentication (Jira Cloud)
*   **As a user**, I want to securely connect the extension to my Jira Cloud account using OAuth 2.0, so that the extension can search my Jira data.
*   **As a user**, I want the authentication process to be clear and follow standard Jira authorization flows.
*   **As a user**, I want my connection to remain active across browser sessions until I explicitly log out or revoke access.

### 2.2 Search Initiation
*   **As a user**, when I select (highlight) text within a Jira ticket's description or comment field, I want to see a "ContextSearch: Find mentions..." option upon right-clicking.
*   **As a user**, when I click the "ContextSearch" context menu option, I want the extension to initiate a search using the selected text and show a loading indicator.

### 2.3 Search Execution
*   **As the system**, upon search initiation, I need to display a loading state in the results sidebar.
*   **As the system**, I need to securely retrieve the user's Jira API access token.
*   **As the system**, I need to **attempt to detect the current Jira Project Key** from the browser's current URL or page context.
*   **As the system**, I need to **properly escape special JQL characters** (e.g., quotes, backslashes) within the `selected_text`.
*   **As the system**, if the escaped `selected_text` contains spaces, I need to wrap it in double quotes (`"`) to enforce **exact phrase matching**.
*   **As the system**, I need to construct a JQL query targeting Description and Comment fields using the processed text (e.g., `text ~ "[processed_selected_text]"`, potentially like `text ~ "\"escaped phrase\""`).
*   **As the system**, **if a Project Key was successfully detected**, I need to append ` AND project = "[detected_project_key]"` to the JQL query to scope results to the current project. (Ensure project key is handled safely in the query string).
*   **As the system**, I need to call the Jira Cloud `/rest/api/3/search` endpoint with the constructed JQL query, requesting necessary fields including snippets (`fields=summary,status,issuetype,...`).
*   **As the system**, I need to handle potential API errors (e.g., 400 Bad Request, 401 Unauthorized, 403 Forbidden, 429 Rate Limited, 5xx Server Errors) by displaying a **user-friendly error message** in the results sidebar instead of raw results/loading state.

### 2.4 Results Display
*   **As a user**, after initiating a search and the API call completes successfully:
    *   If results are found, I want to see them presented in a clear, non-intrusive UI element (e.g., a sidebar), replacing the loading indicator.
    *   If **no results** are found, I want to see a clear message indicating this (e.g., "No results found in project [Project Key] for '[search term]'"), replacing the loading indicator.
*   **As a user**, for each search result found, I want to see the Ticket ID (linked to the Jira ticket), Ticket Title, current Status, and a small text snippet showing the context of the match.
*   **As a user**, within the displayed snippet, I want the **searched text to be visually highlighted** (e.g., bold or background color) so I can quickly identify the match context.
*   **As a user**, I want the results list to be capped at a reasonable number (~10-15) for the MVP.
*   **As the system**, I must process the snippets received from Jira to **insert highlighting markup** around the matched search term (first occurrence, case-insensitive).
*   **As the system**, I must **sanitize all data**, including the processed snippet with highlighting markup, before rendering it in the UI to prevent XSS vulnerabilities (ensure sanitizer allows the specific highlighting tags/styles).

### 2.5 Installation
*   **As a beta tester**, I need clear instructions on how to manually install the extension build (`.zip` file) using my browser's developer mode ("Load Unpacked").

### 2.6 Basic Extension Management
*   **As a user**, I want to be able to log out of the Jira connection (clear stored tokens) via an option in the browser extension's toolbar icon popup, so I can re-authenticate or troubleshoot connection issues.

## 3. Non-Functional Requirements

### 3.1 Performance
*   Search results (or 'No Results' message) should ideally be displayed within **1.5 - 2 seconds** after clicking the context menu option (network latency dependent). Loading indicator should appear almost instantly.
*   The extension should have minimal impact on browser performance during normal Jira usage when not actively searching.

### 3.2 Security
*   Authentication MUST use Jira Cloud's standard OAuth 2.0 flow.
*   API tokens MUST be stored securely using appropriate browser storage mechanisms (e.g., `browser.storage.local`) and cleared upon logout.
*   All communication with Jira APIs and any backend components MUST use HTTPS.
*   All dynamic content displayed from Jira APIs, **including snippets processed for highlighting**, MUST be properly sanitized to prevent XSS.
*   The extension MUST request only the minimum necessary OAuth scopes (e.g., `read:jira-work`).

### 3.3 Usability
*   The core search function should be discoverable via the standard right-click context menu.
*   The results display should be easy to understand at a glance, enhanced by highlighted keywords in snippets.
*   Loading states, no-results states, and basic error states should provide clear feedback to the user.
*   Search results should be automatically scoped to the current project when possible, improving relevance with no user configuration required for MVP.
*   Minimal configuration required from the user for MVP functionality.
*   A basic logout mechanism should be accessible.

### 3.4 Reliability
*   The extension should handle common API errors gracefully and provide **basic, user-friendly feedback** (rather than raw errors or silent failures).
*   The core search functionality and highlighting should work reliably across typical Jira Cloud issue view pages.
*   Highlighting should handle edge cases gracefully.
*   Logout function should reliably clear authentication tokens.

### 3.5 Browser Compatibility
*   MVP will target the latest stable versions of:
    *   Google Chrome
    *   Mozilla Firefox
    *   Microsoft Edge (Chromium-based)
    *   Brave Browser

### 3.6 Technology Stack (MVP)
*   **Browser Extension Frontend:**
    *   Language: **TypeScript (Targeting v5.3+)**
    *   Framework/Library: **React (latest stable)**
    *   Build Tooling: Webpack / Parcel (latest stable)
    *   Runtime Environment: **Node.js (v20.x LTS)** for build/dev tooling
    *   Sanitization Library: **DOMPurify (or similar)** configured to allow highlighting tags/styles.
*   **Minimal Backend API (OAuth Handler):**
    *   Language: **Go (Targeting v1.21+)**
    *   Deployment: AWS Lambda / API Gateway (or similar serverless platform)
    *   Infrastructure as Code (Optional but recommended): Terraform / AWS CDK / Serverless Framework

## 4. Design Considerations

*   Reference basic Wireframes/Mockups for the results sidebar UI, including visual treatment for highlighted text, **loading state, no-results state, and error message display**. [Link to `/design_assets/wireframes/`]
*   Reference basic Wireframe/Mockup for the **browser action popup containing the Log Out button.**
*   UI should be clean and aim for functional clarity over aesthetic polish for MVP.
*   Aim for subtle integration with the Jira Cloud look and feel. Define the highlighting style (e.g., bold, yellow background).

## 5. Release Criteria (for Beta)

*   All defined User Stories implemented and pass testing, including result snippet highlighting, loading/no-results states, basic error display, and logout function.
*   Secure OAuth 2.0 flow correctly implemented and validated.
*   XSS vulnerabilities addressed through output sanitization, including tests with highlighting.
*   Extension installs and runs without critical errors on target browsers.
*   Core search and results display functionality is operational.
*   Basic installation instructions are available.
*   Known critical or blocker bugs fixed.

## 6. Open Issues / Questions
*   Confirm precise method/configuration for sanitization library to allow highlighting tags/styles safely.
*   Decide on exact visual style for highlighting, loading indicator, error messages.
*   Finalize exact wording for error messages and no-results state.
*   [List any other specific implementation questions or decisions pending]
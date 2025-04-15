
# ContextSearchAssist - MVP Build Task Breakdown

## Project Structure
- **Core Setup & Infrastructure**
- **Authentication Flow (OAuth 2.0)**
- **Search Functionality**
- **Extension UI & Base**
- **Testing & Quality**
- **Deployment & Beta Prep**

## Phase 1: Setup & Backend Foundation

### Setup Tasks
- **SETUP-1**: Initialize Git Repository & Project Structure
  - Create Git repo, set up frontend/ and backend/ folders, add initial .gitignore, README
  - Dependencies: None

- **SETUP-2**: Configure Linters & Formatters (Frontend & Backend)
  - Add config files (.eslintrc.js, .prettierrc.js, .golangci.yml), integrate into package.json / pre-commit hooks
  - Dependencies: SETUP-1
  - References: coding_standards_and_best_practices.md

- **SETUP-3**: Configure Atlassian Developer Console App
  - Create OAuth 2.0 (3LO) app, define scopes (read:jira-work, offline_access), note Client ID, generate/store Client Secret, set placeholder Callback URL
  - Dependencies: None

- **SETUP-4**: Provision Basic AWS Infrastructure
  - Define/create DynamoDB table (ContextSearchOAuthStateCache w/ TTL), AWS Secrets Manager secret, basic IAM role for Lambda
  - Dependencies: SETUP-3 (Needs Client Secret)
  - References: api_integration_plan.md, technical_architecture.md

### Backend Tasks
- **BACKEND-1**: Setup Go Lambda Project (/auth/initiate)
  - Initialize Go module, create basic handler structure, setup deployment config
  - Dependencies: SETUP-1, SETUP-4 (IAM Role)

- **BACKEND-2**: Implement /auth/initiate Logic
  - Generate session_id, receive state/verifier from request, store in DynamoDB cache, set secure HttpOnly cookie
  - Dependencies: BACKEND-1, SETUP-4 (DynamoDB Table)
  - References: api_integration_plan.md (Phase 1), security_design_document.md

- **BACKEND-3**: Implement /auth/callback Logic
  - Handle GET request, extract session_id from cookie, retrieve/validate state/verifier, exchange code for tokens, redirect to extension
  - Dependencies: BACKEND-1, SETUP-4 (DynamoDB, Secrets Mgr)
  - References: api_integration_plan.md (Phase 3), security_design_document.md

- **BACKEND-4**: Implement /auth/refresh Logic
  - Handle POST request, receive refresh_token, exchange for new tokens, return tokens/error
  - Dependencies: BACKEND-1, SETUP-4 (Secrets Mgr)
  - References: api_integration_plan.md (Section 5), security_design_document.md

- **BACKEND-5**: Deploy Initial Backend Endpoints to AWS Dev/Staging
  - Execute deployment plan, update Atlassian Dev Console with final Callback URL
  - Dependencies: BACKEND-2, BACKEND-3, BACKEND-4
  - References: deployment_ci_cd_plan.md (MVP version)

## Phase 2: Frontend Foundation & Authentication

- **FRONTEND-1**: Setup React Frontend Project
  - Initialize React app, install core dependencies, configure CSS Modules
  - Dependencies: SETUP-1

- **FRONTEND-2**: Configure Browser Extension Manifest
  - Define manifest version, name, description, icons, permissions, content script config, background service worker
  - Dependencies: FRONTEND-1
  - References: api_integration_plan.md (Prereqs), Browser extension docs

- **FRONTEND-3**: Setup Extension Build Process
  - Configure build tool to produce extension-compatible output
  - Dependencies: FRONTEND-1, FRONTEND-2

- **FRONTEND-4**: Implement Basic Browser Action Popup UI
  - Create React component with Logged In/Out states
  - Dependencies: FRONTEND-1, Designs

- **FRONTEND-5**: Implement Background Script OAuth Initiation
  - Handle "Request Login Flow" message, generate state/verifier/challenge, call backend, redirect to Jira Auth URL
  - Dependencies: FRONTEND-11 (Messaging), BACKEND-5
  - References: api_integration_plan.md (Phase 1)

- **FRONTEND-6**: Create Extension OAuth Callback Page
  - Simple HTML page with script to parse URL fragment and send data to Background Script
  - Dependencies: FRONTEND-1
  - References: api_integration_plan.md (Phase 4)

- **FRONTEND-7**: Implement Background Script OAuth Callback Handling & Token Storage
  - Receive message from callback page, validate state, store tokens, update auth state
  - Dependencies: FRONTEND-11 (Messaging), FRONTEND-6
  - References: api_integration_plan.md (Phase 4), security_design_document.md

- **FRONTEND-8**: Implement Logout Logic
  - Handle "Request Logout" message, remove tokens, update auth state, notify UI
  - Dependencies: FRONTEND-11 (Messaging), FRONTEND-7

- **FRONTEND-9**: Connect Popup UI to Auth State & Actions
  - Fetch auth state, implement login/logout button actions
  - Dependencies: FRONTEND-4, FRONTEND-5, FRONTEND-8, FRONTEND-11

## Phase 3: Search Functionality

- **FRONTEND-10**: Implement Content Script & Context Menu
  - Inject script into Jira pages, detect text selection, create context menu, send selected text to Background Script
  - Dependencies: FRONTEND-2, FRONTEND-11 (Messaging)
  - References: PRD (Story 2.2)

- **FRONTEND-11**: Setup Background Script Message Handling
  - Establish core message listeners to handle communication
  - Dependencies: FRONTEND-2

- **FRONTEND-12**: Implement Background Script Search Request Logic
  - Handle search message, check auth, construct JQL, make fetch call to Jira API
  - Dependencies: FRONTEND-7, FRONTEND-10, FRONTEND-11
  - References: api_integration_plan.md (Section 4), PRD (Story 2.3)

- **FRONTEND-13**: Implement Background Script Token Refresh Triggering
  - Detect 401 errors, refresh token if available, retry request or trigger logout
  - Dependencies: FRONTEND-12, BACKEND-4, FRONTEND-8
  - References: api_integration_plan.md (Section 5)

- **FRONTEND-14**: Implement Background Script Result Processing
  - Process API response, generate snippets, add highlighting, limit results, sanitize data
  - Dependencies: FRONTEND-12
  - References: PRD (Story 2.4), security_design_document.md

- **FRONTEND-15**: Implement Basic Sidebar UI Component
  - Create main React component for results display
  - Dependencies: FRONTEND-1, Designs

- **FRONTEND-16**: Implement Sidebar States
  - Add UI for loading, no results, and error states
  - Dependencies: FRONTEND-15, Designs
  - References: PRD (Stories 2.3, 2.4)

- **FRONTEND-17**: Implement Sidebar Results List Display
  - Render processed/sanitized/highlighted results
  - Dependencies: FRONTEND-14, FRONTEND-15, Designs
  - References: PRD (Story 2.4)

- **FRONTEND-18**: Connect Sidebar UI to Background State/Results
  - Request data from Background Script, render appropriate state
  - Dependencies: FRONTEND-11, FRONTEND-16, FRONTEND-17

## Phase 4: Testing, Docs & Beta Prep

- **TEST-1**: Write Unit Tests for Backend Logic
  - Test Go functions, mock external dependencies
  - Dependencies: BACKEND-2, BACKEND-3, BACKEND-4
  - References: coding_standards_and_best_practices.md

- **TEST-2**: Write Unit Tests for Frontend Logic
  - Test Background Script functions and UI components
  - Dependencies: Relevant Frontend tasks
  - References: coding_standards_and_best_practices.md

- **DOCS-1**: Create Basic Installation Instructions
  - Explain how to load the unpacked extension in developer mode
  - Dependencies: FRONTEND-3

- **DOCS-2**: Draft Initial Privacy Policy
  - Create privacy_policy.md based on MVP data handling
  - Dependencies: Core functionality defined

- **DEPLOY-1**: Prepare Beta Build Package
  - Create distribution .zip file
  - Dependencies: All Frontend tasks, FRONTEND-3

- **TEST-3**: Perform Internal End-to-End Testing
  - Manually test core flows on target browsers
  - Dependencies: DEPLOY-1, BACKEND-5

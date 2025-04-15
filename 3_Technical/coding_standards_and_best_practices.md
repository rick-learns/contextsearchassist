# Coding Standards and Best Practices - MVP: ContextSearch Assist

**Version:** 1.1
**Date:** [Insert Date]
**Status:** Finalized MVP Standards

## 1. Introduction & Philosophy

This document outlines the coding standards and best practices for the ContextSearch Assist project. The primary goal is to ensure the codebase is **readable, maintainable, testable, and consistent**, adhering closely to the principles of **Clean Code**.

Code is read far more often than it is written. Therefore, **clarity and expressiveness are paramount**. These standards apply to both the Frontend (JavaScript/React Browser Extension & Website) and the Backend (Go) components. While adhering to these standards, always use good judgment and prioritize clear communication within the team.

## 2. General Principles (Apply to All Code)

*   **Readability First:** Write code that is easy for other developers (and your future self) to understand. Optimize for clarity before premature optimization for performance (unless performance is a proven bottleneck).
*   **Meaningful Names:**
    *   Use intention-revealing names for variables, functions, classes, structs, interfaces, components, packages, and files. Avoid cryptic abbreviations or single-letter variable names (except for idiomatic usage like loop counters `i` or common Go receivers).
    *   Be consistent with naming conventions (see language-specific sections).
*   **Small, Focused Functions/Methods/Components:**
    *   Components and functions should **Do One Thing** well (Single Responsibility Principle - SRP).
    *   Keep functions short (ideally < 20-30 lines). If a function/component is getting long, consider extracting helper functions or sub-components.
    *   Limit the number of parameters (ideally <= 3). Consider passing objects/structs/props objects for complex parameters.
*   **Simplicity (KISS - Keep It Simple, Stupid):**
    *   Prefer straightforward, simple solutions over overly complex or "clever" code.
    *   Avoid unnecessary abstractions or design patterns if a simpler approach suffices for the current requirements.
*   **Don't Repeat Yourself (DRY):**
    *   Avoid duplicating code logic. Extract reusable logic into functions, helpers, custom hooks (React), or constants.
*   **Formatting Consistency:**
    *   **Mandatory:** Use automated formatters (`Prettier` for JS/React/CSS, `gofmt`/`goimports` for Go). Configure linters to enforce formatting rules. Code MUST be formatted before committing.
*   **Error Handling:**
    *   Handle errors explicitly and gracefully. Do not ignore errors silently.
    *   Provide meaningful error messages or propagate errors appropriately. Avoid generic `catch` blocks that hide specific error types (see language specifics).
*   **Comments:**
    *   Write code that is as self-explanatory as possible. Use comments primarily to explain *why* something is done, not *what* it does (unless the "what" involves complex algorithms or non-obvious logic).
    *   Avoid commented-out code. Remove it or use version control history.
    *   Use standard `TODO:` or `FIXME:` markers with context for planned work or known issues.

## 3. JavaScript / React Frontend (Browser Extension & Website)

*   **Language Version:** Use modern JavaScript syntax (ES6+). *(Note: While JS is specified, using **TypeScript** is strongly recommended for larger applications and improved maintainability due to static typing).*
*   **Runtime Environment:** Requires **Node.js v16+** for development tooling.
*   **Framework:** **React v18+**.
*   **React Specifics:**
    *   Use **JSX** for component authoring.
    *   Prefer **Functional Components** with **React Hooks** (`useState`, `useEffect`, `useContext`, custom hooks).
    *   **Component Naming:** Use PascalCase (e.g., `ResultsSidebar.jsx`). Keep components focused (SRP).
    *   **Props:** Use clear, descriptive prop names. Consider using PropTypes (or TypeScript interfaces if adopting TS) for documentation and validation.
    *   **State Management:** Start with `useState` and `useContext`. Avoid complex state libraries for MVP unless clearly needed.
    *   **Routing (Website):** Use `react-router-dom` v6+ where applicable.
*   **Styling:**
    *   **Mandatory:** Use **CSS Modules** (`*.module.css`) for component-scoped styling. This prevents conflicts with host page styles (Jira) and other components.
    *   Utilize **CSS Custom Variables** (defined in e.g., `frontend/src/styles/variables.css`) for design system consistency (colors, fonts, spacing).
    *   Employ **Flexbox and CSS Grid** for layout.
    *   Implement **Media Queries** for responsive design.
*   **Linting:**
    *   **Mandatory:** Use **ESLint** configured with recommended rulesets for JavaScript (`eslint:recommended`) and React (`eslint-plugin-react`, `eslint-plugin-react-hooks`). Specific rule configurations will be provided in `.eslintrc.js`.
*   **Formatting:**
    *   **Mandatory:** Use **Prettier**. Configuration will be provided in `.prettierrc.js`. Ensure integration with ESLint to avoid conflicts.
*   **Asynchronous Operations:** Use `async/await` for handling Promises (e.g., `fetch` calls, `browser.storage` access). Handle potential errors with `try...catch`.

## 4. Go Backend (API Service)

*   **Language Version:** Target **Go v1.21+** (or latest stable release).
*   **Responsibilities (Planned):** API integration (Jira/AzDO), Authentication/Authorization handling (OAuth callback, refresh proxy), User management (future), Search processing/serving (future).
*   **Idiomatic Go:** Follow standard Go conventions described in Effective Go and common community practices.
*   **Error Handling:**
    *   Use the standard `(result, error)` return pattern. Check errors immediately (`if err != nil { ... }`).
    *   Use `errors.Is`, `errors.As`, `fmt.Errorf("... %w", err)` for checking and propagating errors.
    *   **Avoid `panic`** for recoverable errors.
*   **Packages:** Keep packages focused and well-named. Use `internal/` packages appropriately.
*   **Naming:** `camelCase` for internal, `PascalCase` for exported. Keep names short but descriptive. Uppercase acronyms (e.g., `userID`, `handleHTTPRequest`).
*   **Structs vs Interfaces:** Use interfaces for behavior/contracts; structs for data. Accept interfaces, return structs.
*   **Concurrency:** Use goroutines/channels carefully if needed (likely minimal for MVP backend). Use race detector (`go test -race`).
*   **Linting:**
    *   **Recommended:** Use `golangci-lint` with a defined configuration (`.golangci.yml`).
*   **Formatting:**
    *   **Mandatory:** Use `gofmt` and `goimports`.

## 5. Project Structure

*   Adhere to the defined project structure:
    ```
    frontend/
      public/       # Static assets, manifest.json, extension scripts (bg, content)
      src/
        components/   # Reusable UI components
          common/     # Common across website/extension (Button, Logo)
          website/    # Website-specific components
          extension/  # Extension-specific components (Sidebar, Popup)
        hooks/        # Custom React Hooks
        services/     # API interaction logic (Jira API, Backend API)
        styles/       # Global styles, CSS variables
        utils/        # Utility functions
        App.js        # Main application component (Website router)
        index.js      # Entry point
    backend/ (planned)
      cmd/          # Main application(s) entry points
      internal/     # Private application code
        api/        # HTTP handlers / API endpoint logic
        auth/       # Authentication/OAuth specific logic
        cache/      # Interface/implementation for backend cache
        config/     # Configuration loading
        models/     # Data models / Structs
        services/   # Business logic
      pkg/          # Library code okay to share
      go.mod
      go.sum
    ```

## 6. Testing Strategy (MVP Focus)

*   **Importance:** Essential for confidence, regression prevention, documentation.
*   **Unit Tests:**
    *   **Required:** For core logic, helpers, complex conditionals (JQL construction, auth logic, utils).
    *   **Frameworks:** Jest + React Testing Library (RTL) for React; standard `testing` package for Go.
    *   **Focus:** Test units in isolation, mock dependencies.
*   **Integration Tests:**
    *   **Recommended:** Basic tests for critical interactions (e.g., Background Script talking to mocked storage/API; Go Lambda auth flow steps with mocked cache/Jira calls).
*   **E2E Tests:** Out of scope for MVP.
*   **Coverage:** Aim for meaningful coverage (~70-80% initially), prioritizing quality over quantity.

## 7. Version Control (Git)

*   **Branching Model:** **GitHub Flow**.
    *   `main`: Always represents the latest stable or production-ready (deployable) state.
    *   Feature Branches: Branch off `main` for all new features, bug fixes, etc. (e.g., `feature/sidebar-highlighting`, `fix/oauth-state-validation`).
    *   Pull Requests (PRs): Submit PRs targeting `main` for review and merging.
    *   **Branch Cleanup: Feature branches SHOULD BE DELETED after successful merge into `main`** to keep the repository clean. History is preserved in `main` and via the PR record.
*   **Commit Messages:**
    *   **Mandatory:** Follow the **Conventional Commits** specification (e.g., `feat: add snippet highlighting`, `fix: resolve token refresh failure`, `refactor: improve JQL escaping`, `test: unit tests for backend auth handler`, `chore: configure ESLint`).

## 8. Code Reviews (Pull Requests)

*   **Requirement:** All code merged into `main` MUST go through a PR and be reviewed/approved by at least one other team member.
*   **PR Content:** Clear description, motivation, link to issue/story. Detail testing steps.
*   **Review Focus:** Correctness, architecture adherence, readability, tests, security, standards.
*   **Process:** Constructive feedback, author response, CI checks pass, approval -> Merge (typically squash or standard merge - *[Decision Needed on Merge Strategy]*).

## 9. Dependency Management

*   **Minimize:** Use external libraries judiciously.
*   **Vetting:** Choose well-maintained, reputable libraries. Check licenses.
*   **Versioning:** Use lock files (`package-lock.json` or `yarn.lock`, `go.mod`/`go.sum`) managed by `npm install`/`yarn install` and `go mod download`/`tidy`. Commit lock files.
*   **Security & Updates:** Regularly scan (`npm audit`, `govulncheck`, Snyk). Plan for updates.

## 10. Security

*   **Primary Reference:** Adhere strictly to `security_design_document.md`.
*   **Secure Coding Practices:** No hardcoded secrets (use env vars loaded via secure means like AWS Secrets Manager for backend), validate/sanitize ALL external input/output (DOMPurify crucial for frontend UI), use least privilege.

## 11. Documentation

*   **Code Comments:** Prioritize self-documenting code. Use comments for *why*, complex logic. Standard `TODO:`.
*   **External Docs:** Keep PRD, Architecture, API Plan, etc., updated.
*   **Go:** Use standard `godoc` comments.

## 12. Evolution

These standards will evolve. Proposals for changes should be discussed within the team.
# Security Design Document - MVP: ContextSearch Assist

**Version:** 1.0
**Date:** [Insert Date]
**Status:** Draft

## 1. Introduction

### 1.1 Purpose
This document outlines the security design, threat model, and mitigation strategies for the Minimum Viable Product (MVP) of the ContextSearch Assist browser extension. Its purpose is to ensure security is considered by design and implemented effectively throughout the development lifecycle.

### 1.2 Scope
The scope is limited to the MVP features and architecture defined in:
*   `product_requirements_document_prd_mvp.md` (v1.1)
*   `technical_architecture.md` (v1.1)
*   `api_integration_plan.md` (v1.3)

### 1.3 Guiding Principles
*   **Security by Design:** Integrate security considerations into every phase.
*   **Least Privilege:** Components and users should only have the minimum permissions necessary.
*   **Minimize Data Footprint:** Avoid storing sensitive data unnecessarily, especially Jira issue content and long-term user credentials.
*   **Defense in Depth:** Employ multiple layers of security controls.
*   **Validate & Sanitize:** Treat all external input and data as potentially untrusted.

## 2. Threat Model (MVP Focus - STRIDE)

Based on the MVP architecture (Browser Extension Client, Minimal Go Backend for OAuth/Refresh), here are the key threats considered:

*   **Spoofing:**
    *   **Threat:** Malicious user attempts to initiate OAuth flow pretending to be another user (less likely with standard OAuth). Malicious extension pretending to be ContextSearch Assist.
    *   **Mitigation:** Standard OAuth flow handles user identity. Browser extension signing (via Chrome Web Store etc. post-MVP) verifies extension identity. Use of `state` parameter helps prevent login CSRF.
*   **Tampering:**
    *   **Threat:** Modification of data in transit (API calls, OAuth redirects). Modification of stored tokens on the client.
    *   **Mitigation:** **HTTPS mandated** for all communications. Use of secure `browser.storage.local` makes direct token tampering harder than `localStorage`. **OAuth `state` parameter** validation prevents tampering with the authorization response. **PKCE** prevents authorization code injection/theft.
*   **Repudiation:**
    *   **Threat:** User denies initiating a search or granting consent.
    *   **Mitigation:** (Low risk for MVP's read-only nature). Jira OAuth consent screen logs user approval. Application logs (CloudWatch for backend, potential limited client-side logging) can provide activity trails.
*   **Information Disclosure:**
    *   **Threat:** **Leakage of OAuth tokens** (access/refresh) from client storage or during transit. Leakage of `client_secret` from backend. Accidental exposure of sensitive Jira data via XSS vulnerabilities in the extension UI. Disclosure of `state` or `code_verifier` during OAuth flow. Leakage via logs.
    *   **Mitigation:** **HTTPS mandatory.** **Secure `browser.storage.local`** for tokens. **Backend loading `client_secret` ONLY from AWS Secrets Manager**. **Robust output sanitization (DOMPurify)** for ALL data rendered in UI. **Secure handling of `state`/`verifier`** via backend cache and secure cookie mechanism. Careful logging practices (avoid logging tokens or secrets).
*   **Denial of Service:**
    *   **Threat:** Extension making excessive calls to Jira API (rate limits). Backend endpoints (`/auth/initiate`, `/auth/callback`, `/auth/refresh`) targeted by DoS/DDoS attacks.
    *   **Mitigation:** Client-side awareness of rate limits (log 429s, potential basic throttling). **AWS infrastructure (API Gateway, Lambda) provides inherent scaling and DDoS mitigation.** API Gateway usage plans/throttling can be configured if needed post-MVP.
*   **Elevation of Privilege:**
    *   **Threat:** **Cross-Site Scripting (XSS)** in the results sidebar allowing malicious scripts to execute with extension permissions (potentially stealing tokens or making API calls). Extension requesting excessive OAuth scopes.
    *   **Mitigation:** **CRITICAL: Robust output sanitization (DOMPurify)** configured correctly. Requesting **minimal OAuth scopes** (`read:jira-work`, `offline_access`). Validating OAuth `state` parameter.

## 3. Security Controls (MVP Implementation)

### 3.1 Authentication (OAuth 2.0)
*   **Control:** Implement Jira Cloud OAuth 2.0 (3LO) Authorization Code Grant with PKCE as detailed in `api_integration_plan.md`.
*   **Mechanism:**
    *   Use `code_challenge_method=S256`.
    *   Utilize a secure, unguessable `state` parameter generated client-side.
    *   Employ the backend (`/auth/initiate`, `/auth/callback`) with a secure session cookie and backend cache (DynamoDB w/ TTL) to securely transfer and validate `state` and `code_verifier`, preventing CSRF and ensuring PKCE integrity.
*   **Threats Mitigated:** Spoofing (partially), Tampering, Information Disclosure (of code), Elevation of Privilege (related to session hijacking).

### 3.2 Authorization (OAuth Scopes)
*   **Control:** Request minimum necessary permissions.
*   **Mechanism:** Specify only `read:jira-work` (for search) and `offline_access` (for refresh tokens) in the OAuth scope parameter.
*   **Threats Mitigated:** Elevation of Privilege.

### 3.3 Token Handling & Storage
*   **Control:** Secure storage and handling of access and refresh tokens.
*   **Mechanism:**
    *   Store tokens (`access_token`, `refresh_token`, `expiryTimestamp`) exclusively in **`browser.storage.local`**. Do *not* use `localStorage`.
    *   The `Background Script/Service Worker` is solely responsible for accessing/managing tokens in storage. UI/Content Scripts communicate requests via messaging.
    *   Tokens are cleared from storage upon explicit user logout via the browser action popup.
    *   The backend (`Go Lambda`) handles tokens ephemerally during the OAuth callback/refresh proxy but does **not** store them persistently.
    *   Refresh token usage is proxied via the secure backend `/auth/refresh` endpoint as the `client_secret` is required.
*   **Threats Mitigated:** Information Disclosure, Tampering.

### 3.4 Data Transport Security
*   **Control:** Encrypt all data in transit.
*   **Mechanism:** Enforce **HTTPS** for all communication:
    *   Extension <-> Jira Cloud API
    *   Extension <-> AWS Backend API (via API Gateway)
    *   User Browser <-> Jira OAuth Service
    *   User Browser <-> AWS Backend API
    *   AWS Backend Lambda <-> Jira Token Endpoint
    *   AWS Backend Lambda <-> AWS Secrets Manager/DynamoDB Cache
*   **Threats Mitigated:** Tampering, Information Disclosure (via eavesdropping).

### 3.5 Input Validation & Sanitization
*   **Control:** Validate/sanitize input before processing or displaying.
*   **Mechanism:**
    *   **JQL Construction:** Background Script MUST properly escape special characters (`"`, `\`) in user-selected text before embedding in JQL strings to prevent JQL injection/errors.
    *   **Backend API Inputs:** Go Lambda function MUST validate inputs received (e.g., `state`, `code`, `refresh_token` structure/presence) before processing.
*   **Threats Mitigated:** Tampering, Potential DoS (via malformed input).

### 3.6 Output Encoding & Sanitization (UI - Critical Control)
*   **Control:** Prevent Cross-Site Scripting (XSS) vulnerabilities in the extension UI.
*   **Mechanism:**
    *   The `Background Script/Service Worker` MUST sanitize **ALL** dynamic data received from the Jira API (Ticket Summary/Title, Status Name, Snippets generated from Description/Comment) **BEFORE** sending it to the `Extension UI` for rendering.
    *   This includes sanitizing the snippets **AFTER** the highlighting markup (e.g., `<strong>`) has been added.
    *   Use a well-vetted sanitization library like **DOMPurify**.
    *   Configure the sanitizer strictly, allowing only known-safe HTML tags and attributes necessary for display (e.g., `<a>` for links, `<strong>` or `<span>` for highlighting) and disallowing all event handlers (`onerror`, `onclick`, etc.) and `style` attributes by default. Explicitly configure allowed tags/attributes for highlighting.
*   **Threats Mitigated:** **Elevation of Privilege (XSS), Information Disclosure (XSS)**.

### 3.7 Backend Security (AWS Lambda / API Gateway / Go)
*   **Control:** Secure configuration and operation of backend components.
*   **Mechanism:**
    *   **Secret Management:** Jira OAuth `client_secret` MUST be stored securely in **AWS Secrets Manager** (or Parameter Store SecureString) and retrieved by the Lambda function at runtime via IAM permissions. **NEVER** hardcode or store in environment variables directly.
    *   **IAM Roles:** Lambda execution role MUST follow the principle of least privilege (only permissions needed for Secrets Manager, DynamoDB cache access, CloudWatch Logs, and outbound HTTPS calls to Atlassian).
    *   **API Gateway:** Configure endpoints with HTTPS required. Consider request validation if feasible. Implement basic throttling if needed post-MVP. Minimize exposed endpoints (`/auth/initiate`, `/auth/callback`, `/auth/refresh`).
    *   **Go Application:** Use standard Go security practices. Validate inputs. Avoid vulnerabilities like SQL injection (N/A here), command injection (N/A here). Handle errors gracefully without leaking sensitive information. Use up-to-date Go version and dependencies.
    *   **Logging:** Configure CloudWatch Logs for Lambda. Ensure sensitive data (tokens, secrets, detailed PII) is NOT logged. Log relevant events for debugging and security monitoring (e.g., successful/failed auth attempts, refresh attempts).
*   **Threats Mitigated:** Information Disclosure, Tampering, DoS (partially), Elevation of Privilege (related to backend compromise).

### 3.8 Dependency Management
*   **Control:** Manage security risks from third-party libraries.
*   **Mechanism:**
    *   Use reputable libraries.
    *   Regularly scan dependencies (e.g., `npm audit`, `snyk`, Go vulnerability scanner) as part of the CI/CD pipeline.
    *   Establish a process for promptly updating vulnerable dependencies.
*   **Threats Mitigated:** Various threats introduced by compromised dependencies.

## 4. Data Handling & Privacy

*   **API Tokens:** Stored client-side (`browser.storage.local`), cleared on logout. Not stored backend.
*   **Jira Issue Content:** Retrieved from Jira API, processed **in-memory only** by Background Script for search, snippet generation, and highlighting. **Never stored persistently** by the extension or backend.
*   **Backend Cache Data:** Stores temporary (`<10min TTL`) `session_id`, `state`, `code_verifier` mappings in DynamoDB. No long-term user PII stored.
*   **Logs:** CloudWatch logs for backend functions, configured to avoid logging sensitive data. Client-side logging should also avoid sensitive data.
*   **Compliance:** Aim for compliance with relevant regulations (e.g., GDPR, CCPA) regarding any potential future user data collection. Reference `privacy_policy.md` (to be created).

## 5. Infrastructure Security (AWS)

*   Utilize standard AWS security best practices for IAM, VPC (if applicable, less so for pure Lambda/API Gateway), Secrets Manager, DynamoDB, and CloudWatch.
*   Rely on AWS infrastructure for base-level DDoS protection and availability.

## 6. Incident Response (MVP Plan)

*   **Identification:** Monitor CloudWatch logs/alarms for backend errors/anomalies. Monitor user feedback channels (beta testing) for reported security issues.
*   **Communication (Internal):** Establish channel (e.g., dedicated Slack) for reporting/discussing security concerns within the dev team.
*   **Containment:** If a critical vulnerability is found (e.g., token leakage risk), prioritize disabling affected functionality or taking the service offline temporarily.
*   **Eradication & Recovery:** Identify root cause, develop patch, test thoroughly, deploy fix.
*   **Post-Mortem:** Document the incident, lessons learned, and update security plans/controls accordingly. (More formal process post-MVP).

## 7. Future Considerations (Post-MVP)

*   Formal third-party penetration testing.
*   More sophisticated rate limiting and WAF rules on API Gateway.
*   Security reviews for new features (e.g., saving searches, admin controls).
*   Enhanced monitoring and alerting.
*   Regular security training for developers.
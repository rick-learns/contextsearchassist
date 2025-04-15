
# ContextSearchAssist - Business Plan and Project Overview

## Project Purpose and Description

ContextSearchAssist is a browser extension that enhances search capabilities in ticketing and project management systems. The MVP focuses on Jira Cloud integration, enabling users to quickly find related Jira tickets by selecting text within descriptions or comments, with plans to expand to Azure DevOps in future phases.

## Key Features (MVP)

- **Contextual Search**: Right-click on selected text to find mentions in other tickets
- **Jira Cloud Integration**: OAuth 2.0 authentication for secure access
- **Intelligent Result Display**: Sidebar with highlighted search terms in snippets
- **Project Scope Awareness**: Automatically scopes searches to current project
- **Secure Token Handling**: Proper storage and management of authentication tokens

## Technical Architecture

- **Frontend**: Browser extension built with TypeScript and React
- **Backend**: Minimal Go serverless backend (AWS Lambda/API Gateway) for OAuth handling
- **Security**: Follows OAuth 2.0 best practices with HTTPS, proper token storage, and XSS prevention

## Project Phases

1. **MVP**: Jira Cloud integration with core search functionality
2. **Phase 1**: Azure DevOps support, freemium model, configuration options 
3. **Future Phases**: Advanced search features, additional integrations

## Business Model

- **Freemium Model**: Basic functionality free, premium features for paid users
- **Target Market**: Software developers, QA teams, support agents, and project managers using Jira or Azure DevOps
- **Distribution**: Atlassian Marketplace and Microsoft Edge/Chrome extension stores

## Documentation Structure

The business plan documentation is organized in six main categories:
1. Strategy and Business Planning
2. Product and Design
3. Technical
4. Security and Compliance
5. Go To Market and Operations
6. Legal

Each category contains detailed documents covering specific aspects of the business and product development.

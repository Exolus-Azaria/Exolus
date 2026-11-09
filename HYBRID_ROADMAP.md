# Exolus Hybrid Roadmap

## Target architecture
- GitHub repository: version control and source-code collaboration.
- GitHub Pages: optional hosting for the static frontend only.
- Backend: keep running on Termux during development and testing.
- AI services: Hermes Agent and 9Router remain on the current Termux setup for now.
- Future migration: move the Node.js backend and AI services to a VPS only after the authentication and deployment flow has been tested.

## Important platform boundary
GitHub Pages does not run Node.js, Hermes Agent, or 9Router. It can host HTML/CSS/JavaScript, but the frontend still needs a separately hosted backend API. Do not commit `.hermes-ui-token`, Google OAuth client secrets, session secrets, `.env`, or other credentials to GitHub.

## Google sign-in plan (not enabled yet)
1. Create a Google OAuth web application and configure exact authorized origins/redirect URLs.
2. Add server-side OpenID Connect verification and secure, HttpOnly, SameSite cookies.
3. Maintain an explicit server-side allowlist of developer Google account IDs/emails.
4. Keep authorization decisions on the backend; never trust a role supplied by frontend JavaScript.
5. Add CSRF protection, session expiry/revocation, login rate limits, and audit logging.
6. Keep the existing local token login until Google sign-in is implemented and tested. Do not remove the fallback prematurely.

## Phase 1 changes
- Static file serving now refuses hidden files and dotfiles, including `.hermes-ui-token`.
- Startup logs no longer print the UI token.
- Existing backend endpoints and token authentication remain otherwise unchanged.

## Validation still required on the target Android/Termux device
- Start the server and verify `/` loads.
- Verify `/.hermes-ui-token` returns 404.
- Verify `/api/chat` still rejects missing/invalid bearer tokens and accepts the existing valid token.
- Verify Hermes and 9Router status from the Exolus UI.

This package is a first hardening step, not a completed Google OAuth deployment and not a production security certification.

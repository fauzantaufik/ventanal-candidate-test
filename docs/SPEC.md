# SPEC.md — Consumer Review System for Directorio Local

## Functional Requirements

- **FR-01:** The system shall allow authenticated users to submit exactly one review per business.
- **FR-02:** A review shall include a required rating from 1 to 5 and an optional comment up to 500 characters.
- **FR-03:** Anonymous users shall be able to read reviews but shall not be able to submit them.
- **FR-04:** The system shall provide sign-up and login pages so consumers can authenticate with Supabase.
- **FR-05:** The system shall send the authenticated user's JWT to the worker API in the `Authorization: Bearer <token>` header when submitting a review.
- **FR-06:** The system shall reject duplicate review attempts for the same user and business with HTTP `409` and a human-readable Spanish error message.
- **FR-07:** The system shall validate the JWT on the server before accepting a review.
- **FR-08:** The system shall show the newly created review in the review list after a successful submission.
- **FR-09:** The system shall keep the user signed in after a page refresh until the session expires or the user logs out.

## Non-Functional Requirements

- **NFR-01:** JWT validation must happen on the server for every protected review submission request.
- **NFR-02:** Review endpoints must return clear HTTP status codes for success and failure (`200`, `201`, `400`, `401`, `404`, `409`, `500`).
- **NFR-03:** Error and validation messages shown to the user should be human-readable in Spanish.
- **NFR-04:** Review-related UI should handle loading, success, error, and empty states clearly.
- **NFR-05:** The solution should preserve review integrity by enforcing the one-review-per-user-per-business rule at the backend/database layer.

## User Stories

Detailed story breakdowns are available in [`/docs/stories`](./stories):
- [`US-01-anonymous-visitor-views-reviews.md`](./stories/US-01-anonymous-visitor-views-reviews.md)
- [`US-02-anonymous-visitor-discovers-login.md`](./stories/US-02-anonymous-visitor-discovers-login.md)
- [`US-03-consumer-creates-account.md`](./stories/US-03-consumer-creates-account.md)
- [`US-04-consumer-logs-in.md`](./stories/US-04-consumer-logs-in.md)
- [`US-05-authenticated-consumer-submits-review.md`](./stories/US-05-authenticated-consumer-submits-review.md)
- [`US-06-system-maintains-review-integrity.md`](./stories/US-06-system-maintains-review-integrity.md)

### US-01 — Anonymous visitor reads reviews

As an **anonymous visitor**, I want to read reviews on a business page so that I can decide whether I trust that business.

**Acceptance Criteria**

- Given a business page with reviews, when an anonymous visitor opens it, then the review list is visible without logging in.
- Given a business page with no reviews, when an anonymous visitor opens it, then they see a clear empty state.
- Given the review section is visible, when the visitor is not logged in, then they do not see an active review submission form.

### US-02 — Anonymous visitor is guided to log in

As an **anonymous visitor**, I want a clear prompt to log in or sign up so that I know how to leave a review.

**Acceptance Criteria**

- Given an anonymous visitor reaches the review section, when they are not authenticated, then the UI shows a login/sign-up CTA instead of the review form.
- Given the CTA is shown, when the visitor clicks it, then they are taken to the appropriate auth page.

### US-03 — Consumer signs up or logs in

As a **consumer**, I want to create an account and log in so that I can submit a review.

**Acceptance Criteria**

- Given a new visitor, when they complete the sign-up form with valid details, then their account is created successfully.
- Given an existing user, when they submit valid login credentials, then they are authenticated successfully.
- Given a successful login, when the user refreshes the page, then the session persists.

### US-04 — Authenticated consumer submits one review

As a **logged-in consumer**, I want to submit one review for a business so that I can share my experience.

**Acceptance Criteria**

- Given an authenticated user on a business page, when they submit a valid rating and optional comment, then the review is created successfully.
- Given the review is created, when the response returns, then the review appears in the review list.
- Given the same authenticated user tries to submit another review for the same business, when the request reaches the API, then the system returns HTTP `409` with a clear Spanish message.
- Given the JWT is missing, invalid, or expired, when the user submits a review, then the system returns HTTP `401` and the UI prompts the user to log in again.

## Edge Cases

- **No rating selected:** the form shall block submission and show a validation error.
- **Rating outside 1–5:** the API shall return HTTP `400`.
- **Comment longer than 500 characters:** the form/API shall reject the submission and explain the limit.
- **Business slug does not exist:** the API shall return HTTP `404` with a human-readable message.
- **Expired JWT during submission:** the API shall return HTTP `401`, and the UI shall ask the user to log in again.
- **Duplicate review attempt:** the API shall return HTTP `409` and preserve the existing review.
- **Empty comment with valid rating:** the system shall accept the review because the comment is optional.

## Design Decisions

- **One review per user per business:** enforced in the backend/database to guarantee integrity even if the client is bypassed.
- **Public read, authenticated write:** reviews stay visible to everyone, but review creation requires login to improve trust and reduce abuse.
- **Spanish-first feedback:** auth, validation, and review messages are written in Spanish to match the product context.
- **Optional written comment:** users can leave a star rating without writing text to reduce friction and improve completion rate.
- **Review appears immediately after success:** the UI refreshes the review list after submission so the result is visible right away.
- **Custom SVG icon system over emoji:** inline SVG components (`icons.tsx`) replace all emoji usage (⭐, ✓, 📍, ★) to eliminate the prototype "AI slop" aesthetic and ensure consistent cross-platform rendering.
- **CSS custom-property state tokens:** error, success, warning, and focus colors are defined as CSS variables in `globals.css` so the entire palette can be updated from one place.
- **Global focus-visible accessibility rule:** a single CSS rule on `a:focus-visible, button:focus-visible` provides consistent keyboard focus indicators site-wide.
- **Warm-tinted skeleton loading states:** skeleton placeholders use `bg-orange-50/100` instead of neutral grey to maintain brand warmth during loading.
- **Badge tooltips for Premium/Verified:** hover tooltips explain what each badge means, helping first-time visitors understand trust signals.

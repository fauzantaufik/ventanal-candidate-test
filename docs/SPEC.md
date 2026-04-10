# SPEC.md - Consumer Review System for Directorio Local

## 1. Feature Overview

Directorio Local requires a consumer review system to allow authenticated users to leave reviews on business profiles and enable all visitors to read existing reviews. This feature will enable trust-building through user-generated content while maintaining data integrity through authentication requirements and business rules. The implementation will integrate with the existing Cloudflare Worker + D1 database backend and Next.js + Supabase Auth frontend architecture.

## 2. Actors

- **Authenticated Consumer** — Logged-in users who can submit reviews and read all reviews
- **Anonymous Visitor** — Unauthenticated users who can read reviews but cannot submit them
- **Business Owner** — Receives reviews on their business profile (passive actor, no direct interactions in this scope)
- **Cloudflare Worker API** — Validates JWTs, processes review submissions, and serves review data
- **Supabase Auth Service** — Provides user authentication and JWT tokens
- **D1 Database** — Stores review data and maintains business rating aggregations

## 3. Functional Requirements

- **FR-01**: The system shall allow authenticated users to submit exactly one review per business consisting of a 1-5 star rating and optional comment (max 500 characters).
- **FR-02**: The system shall prevent duplicate review submissions by the same user for the same business, returning HTTP 409 when attempted.
- **FR-03**: The system shall validate Supabase JWT tokens server-side before accepting any review submission.
- **FR-04**: The system shall automatically recalculate and update business avg_rating and review_count fields immediately after review submission.
- **FR-05**: The system shall display all reviews for a business in descending chronological order (newest first).
- **FR-06**: The system shall allow anonymous users to view all reviews without authentication requirements.
- **FR-07**: The system shall display human-readable review timestamps using relative dates in Spanish (e.g., "hace 3 días").
- **FR-08**: The system shall show a login CTA to anonymous users when they attempt to interact with review submission form.
- **FR-09**: The system shall validate review rating values between 1-5 (inclusive) and comment length under 500 characters.
- **FR-10**: The system shall display star ratings using Unicode star symbols (★ filled, ☆ empty).

## 4. Non-Functional Requirements

- **NFR-01**: JWT token validation must complete within 200ms to maintain responsive user experience.
- **NFR-02**: Review submission API must return response within 500ms including database writes and rating recalculation.
- **NFR-03**: The review list API must support pagination with a default limit of 10 reviews per page.
- **NFR-04**: All API endpoints must return appropriate HTTP status codes (200, 201, 400, 401, 409, 500) with Spanish error messages.
- **NFR-05**: UI components must implement the State Triad pattern (loading, error, data/empty states) for robust user experience.
- **NFR-06**: Review form must provide real-time character count feedback for the comment field.
- **NFR-07**: All UI text must be in Spanish to match the target Venezuelan market.
- **NFR-08**: Components must use shadcn/ui library for consistent design system integration.

## 5. User Stories Overview

The review system is defined through 6 user stories that follow the INVEST framework. Each story is documented in detail in separate files to reduce context drift and improve maintainability.

### Story List

- **[US-01: Anonymous Visitor Views Reviews](./stories/US-01-anonymous-visitor-views-reviews.md)** — Reading reviews without authentication
- **[US-02: Anonymous Visitor Discovers Login Requirement](./stories/US-02-anonymous-visitor-discovers-login.md)** — Clear guidance for unauthenticated users
- **[US-03: Consumer Creates Account](./stories/US-03-consumer-creates-account.md)** — Account registration flow
- **[US-04: Consumer Logs In](./stories/US-04-consumer-logs-in.md)** — Authentication for returning users
- **[US-05: Authenticated Consumer Submits Review](./stories/US-05-authenticated-consumer-submits-review.md)** — Core review submission feature
- **[US-06: System Maintains Review Integrity](./stories/US-06-system-maintains-review-integrity.md)** — Duplicate prevention and validation

### INVEST Validation Summary

All 6 user stories have been validated against INVEST criteria:
- ✅ **Independent**: Each story can be developed separately
- ✅ **Negotiable**: Implementation details remain flexible 
- ✅ **Valuable**: Clear user or business value for each story
- ✅ **Estimable**: Well-defined scope for development planning
- ✅ **Small**: Each story fits within a sprint
- ✅ **Testable**: Specific acceptance criteria provided

## 6. Implementation Priority

**Recommended Development Order:**

1. **US-01** (Anonymous Visitor Views Reviews) — Provides immediate value with read-only operations
2. **US-02** (Anonymous Visitor Discovers Login Requirement) — Simple UI change that improves UX
3. **US-03** (Consumer Creates Account) / **US-04** (Consumer Logs In) — Authentication foundation (can be parallel)
4. **US-06** (System Maintains Review Integrity) — Backend validation for duplicate prevention
5. **US-05** (Authenticated Consumer Submits Review) — Core submission feature (requires prior stories)

## 7. Edge Cases

| Edge Case | Trigger Condition | Expected Behavior |
|-----------|------------------|-------------------|
| Expired JWT token during submission | User session expires between page load and form submission | Return HTTP 401, redirect to login with return URL |
| Business slug doesn't exist | User submits review for non-existent business | Return HTTP 404 with "Negocio no encontrado" message |
| Comment exceeds 500 characters | User pastes or types text longer than limit | Client-side validation prevents submission, shows character count in red |
| Rating value outside 1-5 range | Malicious client sends invalid rating | Return HTTP 400 with "Calificación debe estar entre 1 y 5" |
| Network failure during submission | API request times out or fails | Show retry button and error message, preserve form data |
| Concurrent duplicate submissions | User clicks submit multiple times rapidly | Idempotency ensures only first request processes, others return 409 |
| Empty comment submission | User submits with only rating, no comment | Accept submission (comment is optional) |
| Business with deleted/inactive status | User reviews business that's been marked inactive | Allow review submission (business data integrity separate concern) |
| Special characters in comment | User includes emojis, accents, or symbols | Accept and store all valid Unicode characters |
| User deletes account after reviewing | Supabase user deleted but reviews remain | Display "Usuario eliminado" for reviewer name |

## 8. Design Decisions

**Decision:** Use optimistic UI updates for review list after successful submission.
**Reasoning:** Improves perceived performance and user satisfaction. Review data is append-only, so conflicts are unlikely. Rollback mechanism simple if submission fails.

**Decision:** Store user display name and email in reviews table rather than referencing Supabase.
**Reasoning:** Denormalizes data but provides resilience if user account is deleted, maintains review display integrity, and improves query performance.

**Decision:** Implement pagination on review list with 10 reviews per page default.
**Reasoning:** Prevents performance issues for businesses with hundreds of reviews. Initial implementation shows first 10 with "Load more" button for simplicity.

**Decision:** Use relative date formatting in Spanish ("hace X días") instead of absolute dates.
**Reasoning:** More user-friendly for recent reviews, matches local expectations, reduces cognitive load for quick scanning.

**Decision:** Display star ratings using Unicode symbols (★☆) instead of custom SVG icons.
**Reasoning:** Faster rendering, works without JavaScript, smaller bundle size, adequate visual clarity for rating display.

**Decision:** Implement review form as controlled component with local state management.
**Reasoning:** Provides real-time validation feedback, better user experience during typing, easier testing and debugging.

**Decision:** Place review form above review list in business detail page.
**Reasoning:** Encourages review submission by authenticated users, follows common UX pattern from similar platforms, maintains review reading flow below.

## 9. Out of Scope

- Review moderation or admin approval workflow
- Photo uploads with reviews
- Helpful votes ("¿Te fue útil esta reseña?") functionality
- Business owner responses to reviews
- Review editing after submission
- Review reporting/flagging system
- Advanced filtering (by rating, date range, etc.)
- Review analytics or business dashboard
- Email notifications for new reviews
- Social media integration or sharing

## 10. Open Questions

- **Q1:** Should we implement soft-delete for reviews or hard-delete if needed for moderation?
- **Q2:** What is the maximum character limit for reviewer display names from Supabase?
- **Q3:** Should the business avg_rating display one decimal place (4.3) or round to nearest half-star (4.5)?
- **Q4:** Do we need rate limiting on review submission API to prevent spam?
- **Q5:** Should reviews be immediately visible or require any form of content filtering?
- **Q6:** What happens to reviews if a business is deleted or marked inactive?
- **Q7:** Should we track review submission IP addresses for abuse detection?

## 11. API Specifications

### POST /businesses/:slug/reviews

**Purpose:** Submit a new review for a business

**Authentication:** Required (Supabase JWT in Authorization header)

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Excelente servicio, muy recomendado. El personal fue muy amable."
}
```

**Validation:**
- `rating`: integer, required, 1-5 range
- `comment`: string, optional, max 500 characters

**Response Codes:**
- `201`: Review created successfully
- `400`: Validation error (invalid rating, comment too long)
- `401`: Unauthorized (invalid/missing JWT)
- `404`: Business not found
- `409`: User already reviewed this business
- `500`: Server error

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "rev_abc123",
    "business_id": "biz-01",
    "user_id": "user_def456",
    "user_name": "María González",
    "rating": 4,
    "comment": "Excelente servicio, muy recomendado. El personal fue muy amable.",
    "created_at": "2026-04-10T14:30:00Z"
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "error": "Ya has dejado una reseña para este negocio"
}
```

### GET /businesses/:slug/reviews

**Purpose:** Fetch reviews for a business

**Authentication:** None required (public endpoint)

**Query Parameters:**
- `page`: integer, optional, default 1
- `limit`: integer, optional, default 10, max 50

**Response Code:**
- `200`: Success
- `404`: Business not found
- `500`: Server error

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev_abc123",
        "user_name": "María González",
        "rating": 4,
        "comment": "Excelente servicio, muy recomendado.",
        "created_at": "2026-04-10T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    },
    "businessRating": {
      "avgRating": 4.0,
      "reviewCount": 1
    }
  }
}
```

## 12. Database Schema Updates

The reviews table already exists per `migrations/0002_reviews.sql`. No schema changes required.

**Key Constraints:**
- `UNIQUE(business_id, user_id)` enforces one review per user per business
- `business_id` references `businesses(id)` for data integrity
- Indexes on `business_id` and `created_at DESC` for query performance

**Business Table Integration:**
- `avg_rating` field recalculated after each review submission
- `review_count` field incremented after each review submission
- Calculation formula: `avg_rating = SUM(rating) / COUNT(reviews)` for business

## 13. Authentication & Authorization

**JWT Token Validation:**
- Validate Supabase JWT signature using project's public key
- Extract `sub` (user ID), `email`, and user metadata from token
- Verify token expiration (`exp` claim)
- Return 401 for invalid/expired tokens

**Authorization Rules:**
- Review submission: Requires valid authenticated user
- Review reading: No authentication required (public access)
- User can only review each business once (enforced by database constraint)

**User Data Sources:**
- `user_id`: JWT `sub` claim (Supabase user ID)
- `user_name`: JWT `user_metadata.name` or `email` prefix as fallback
- `user_email`: JWT `email` claim

## 14. Implementation Phases

### Phase 1: Backend API (Week 1)
- Implement JWT validation middleware
- Create POST /businesses/:slug/reviews endpoint
- Create GET /businesses/:slug/reviews endpoint
- Add business rating recalculation logic
- Write API tests for all endpoints

### Phase 2: Authentication UI (Week 2)
- Initialize Supabase client configuration
- Implement signup form at /auth/signup
- Implement login form at /auth/login
- Add auth state management
- Test complete auth flow

### Phase 3: Review Components (Week 3)
- Implement ReviewList component with State Triad
- Implement ReviewForm component with validation
- Integrate components in business detail page
- Add loading states and error handling
- Test complete review submission flow

### Phase 4: Polish & Testing (Week 4)
- Add character count and validation feedback
- Implement optimistic UI updates
- Add comprehensive error handling
- Perform user acceptance testing
- Deploy to production environment

## 15. Success Metrics

**Technical Metrics:**
- API response time < 500ms for review submission
- Review list load time < 200ms
- Zero data loss during concurrent submissions
- JWT validation success rate > 99.9%

**User Experience Metrics:**
- Review submission completion rate > 80%
- Time from login to review submission < 2 minutes
- Error recovery rate (users who retry after errors) > 60%
- Review form abandonment rate < 30%

**Business Metrics:**
- Number of reviews submitted per week
- Percentage of businesses with at least one review
- Average rating distribution across platform
- User signup conversion rate from review CTA
# US-05: Authenticated Consumer Submits Review

**As an** authenticated consumer, **I want to** submit a star rating and optional comment for a business **so that** I can share my experience with other users.

## Flow Diagram

```
[Authenticated Consumer]
        |
        v
  Access Business Page
        |
        v
   Review Form Visible
        |
        v
Select Stars (1-5) &
  Write Comment
        |
        v
   Submit Review
        |
   +----+----+
   |         |
 Already   First Review
 Reviewed     |
   |         v
HTTP 409   Save to DB &
Error     Update Business
   |      Ratings
   v         |
Show Error   v
         Success Message
           & Form Reset
```

## INVEST Validation

- **I**ndependent: ✅ Requires auth but not other review features
- **N**egotiable: ✅ Form design and submission flow flexible
- **V**aluable: ✅ Core value proposition for authenticated users
- **E**stimable: ✅ Form component with API integration
- **S**mall: ✅ Single form submission with validation
- **T**estable: ✅ Clear success/error scenarios

## Acceptance Criteria

- [ ] Review form shows 5-star rating picker with click/hover interactions
- [ ] Comment textarea has 500 character limit with live counter
- [ ] Submit button disabled until rating selected
- [ ] Form shows loading state during submission
- [ ] Success message appears and form resets after submission
- [ ] Business avg_rating and review_count update immediately
- [ ] Form disappears after submission (user already reviewed)

## Related Functional Requirements

- FR-01: The system shall allow authenticated users to submit exactly one review per business consisting of a 1-5 star rating and optional comment (max 500 characters)
- FR-03: The system shall validate Supabase JWT tokens server-side before accepting any review submission
- FR-04: The system shall automatically recalculate and update business avg_rating and review_count fields immediately after review submission
- FR-09: The system shall validate review rating values between 1-5 (inclusive) and comment length under 500 characters

## Related Non-Functional Requirements

- NFR-01: JWT token validation must complete within 200ms to maintain responsive user experience
- NFR-02: Review submission API must return response within 500ms including database writes and rating recalculation
- NFR-06: Review form must provide real-time character count feedback for the comment field
- NFR-07: All UI text must be in Spanish to match the target Venezuelan market
- NFR-08: Components must use shadcn/ui library for consistent design system integration

## Implementation Design

- See [US-05 Design](../design/US-05.md) for the submission flow, API contract, UI states, and verification plan.

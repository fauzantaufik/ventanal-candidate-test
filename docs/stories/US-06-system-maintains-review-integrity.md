# US-06: System Maintains Review Integrity

**As the** system, **I want to** enforce one review per user per business **so that** rating authenticity is maintained and gaming is prevented.

## Flow Diagram

```
[System Validation]
        |
        v
  Review Submission
        |
        v
Check Database for
Existing Review
(business_id, user_id)
        |
   +----+----+
   |         |
 Found    Not Found
   |         |
   v         v
Return    Process &
HTTP 409   Save Review
```

## INVEST Validation
- **I**ndependent: ✅ Database constraint handles enforcement
- **N**egotiable: ✅ Error message format flexible
- **V**aluable: ✅ Critical for platform trust and integrity
- **E**stimable: ✅ Database uniqueness constraint
- **S**mall: ✅ Server-side validation logic
- **T**estable: ✅ Duplicate submission scenarios

## Acceptance Criteria
- [ ] Duplicate review attempts return HTTP 409 with Spanish error message
- [ ] Database UNIQUE constraint prevents duplicate storage
- [ ] Error handling gracefully informs user they've already reviewed
- [ ] System validates JWT token before processing any review
- [ ] Invalid/expired tokens return HTTP 401

## Related Functional Requirements
- FR-02: The system shall prevent duplicate review submissions by the same user for the same business, returning HTTP 409 when attempted
- FR-03: The system shall validate Supabase JWT tokens server-side before accepting any review submission

## Related Non-Functional Requirements
- NFR-04: All API endpoints must return appropriate HTTP status codes (200, 201, 400, 401, 409, 500) with Spanish error messages
- NFR-07: All UI text must be in Spanish to match the target Venezuelan market
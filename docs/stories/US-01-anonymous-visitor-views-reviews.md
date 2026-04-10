# US-01: Anonymous Visitor Views Reviews

**As an** anonymous visitor, **I want to** read reviews for a business **so that** I can make informed decisions about services before contacting them.

## Flow Diagram

```
[Anonymous Visitor]
        |
        v
  Access Business Page
        |
        v
   Review List Loads
        |
   +----+----+
   |         |
 No Reviews Reviews
   |        Exist
   |         |
   v         v
Empty State  Display List
           (rating, comment,
            user, date)
```

## INVEST Validation

- **I**ndependent: ✅ Can be built without auth or submission features
- **N**egotiable: ✅ Layout and display format can be adjusted
- **V**aluable: ✅ Provides essential information for decision-making
- **E**stimable: ✅ Clear scope with read-only operations
- **S**mall: ✅ Single component with API integration
- **T**estable: ✅ Clear visual output and data display criteria

## Acceptance Criteria

- [x] Anonymous users can view all reviews for any business without authentication
- [x] Reviews display star rating, comment text, reviewer name, and relative date
- [x] Reviews are ordered newest first
- [x] Empty state message appears when no reviews exist
- [x] Loading skeleton shows while fetching review data
- [x] Error state with retry button appears on API failure
- [x] Star ratings display using ★ (filled) and ☆ (empty) symbols

## Related Functional Requirements

- FR-05: The system shall display all reviews for a business in descending chronological order
- FR-06: The system shall allow anonymous users to view all reviews without authentication requirements
- FR-07: The system shall display human-readable review timestamps using relative dates in Spanish
- FR-10: The system shall display star ratings using Unicode star symbols

## Related Non-Functional Requirements

- NFR-03: The review list API must support pagination with a default limit of 10 reviews per page
- NFR-05: UI components must implement the State Triad pattern (loading, error, data/empty states)

## Design

- [US-01 Design](../design/US-01.md) — Implementation-ready low-level design for this story

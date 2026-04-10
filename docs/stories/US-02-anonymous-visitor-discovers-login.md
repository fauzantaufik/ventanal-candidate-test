# US-02: Anonymous Visitor Discovers Login Requirement

**As an** anonymous visitor, **I want to** see a clear call-to-action to log in when I try to leave a review **so that** I understand how to participate in the review system.

## Flow Diagram

```
[Anonymous Visitor]
        |
        v
   Sees Review Form Area
        |
        v
 "Inicia sesión para 
  dejar tu reseña" CTA
        |
        v
   Clicks Login Link
        |
        v
 Redirected to /auth/login
```

## INVEST Validation
- **I**ndependent: ✅ Can be built without review submission logic
- **N**egotiable: ✅ CTA text and styling can be refined
- **V**aluable: ✅ Clear user guidance improves conversion
- **E**stimable: ✅ Simple conditional rendering
- **S**mall: ✅ UI changes only
- **T**estable: ✅ Element visibility based on auth state

## Acceptance Criteria
- [ ] Anonymous users see "Inicia sesión para dejar tu reseña" instead of review form
- [ ] CTA links to /auth/login with return URL parameter
- [ ] Message styling matches overall design system
- [ ] CTA is prominent but not intrusive to review reading experience

## Related Functional Requirements
- FR-08: The system shall show a login CTA to anonymous users when they attempt to interact with review submission form

## Related Non-Functional Requirements
- NFR-07: All UI text must be in Spanish to match the target Venezuelan market
- NFR-08: Components must use shadcn/ui library for consistent design system integration
# US-04: Consumer Logs In

**As a** returning consumer, **I want to** log in with my email and password **so that** I can access the review submission feature.

## Flow Diagram

```
[Returning Consumer]
        |
        v
   Access /auth/login
        |
        v
  Enter Credentials
        |
   +----+----+
   |         |
Invalid   Valid
Credentials Credentials
   |         |
   v         v
Show Error  Get JWT &
          Redirect Back
```

## INVEST Validation
- **I**ndependent: ✅ Uses existing Supabase Auth service
- **N**egotiable: ✅ Login flow and redirect logic flexible
- **V**aluable: ✅ Enables authenticated features access
- **E**stimable: ✅ Standard login form implementation
- **S**mall: ✅ Single component with auth integration
- **T**estable: ✅ Login success/failure scenarios

## Acceptance Criteria
- [ ] Login form accepts email and password
- [ ] Valid credentials redirect user to original page or business detail
- [ ] Invalid credentials show error message in Spanish
- [ ] JWT token is stored and attached to subsequent API requests
- [ ] Form uses shadcn/ui components for consistency
- [ ] Password field obscures input characters

## Related Functional Requirements
- FR-03: The system shall validate Supabase JWT tokens server-side before accepting any review submission

## Related Non-Functional Requirements
- NFR-01: JWT token validation must complete within 200ms to maintain responsive user experience
- NFR-04: All API endpoints must return appropriate HTTP status codes with Spanish error messages
- NFR-07: All UI text must be in Spanish to match the target Venezuelan market
- NFR-08: Components must use shadcn/ui library for consistent design system integration
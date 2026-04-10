# US-03: Consumer Creates Account

**As an** anonymous visitor, **I want to** create an account with name, email, and password **so that** I can submit reviews for businesses I've used.

## Flow Diagram

```
[Anonymous Visitor]
        |
        v
   Access /auth/signup
        |
        v
 Fill Registration Form
 (name, email, password)
        |
   +----+----+
   |         |
Validation Success
  Error      |
   |         v
   v    Supabase Account
Show Error   Created
             |
             v
        Auto-login &
        Redirect Back
```

## INVEST Validation
- **I**ndependent: ✅ Uses existing Supabase Auth service
- **N**egotiable: ✅ Form fields and validation rules flexible
- **V**aluable: ✅ Enables user participation in reviews
- **E**stimable: ✅ Standard auth form with known patterns
- **S**mall: ✅ Single form component with validation
- **T**estable: ✅ Account creation success/failure scenarios

## Acceptance Criteria
- [ ] Signup form accepts name, email, and password fields
- [ ] Form validates email format and password strength
- [ ] Successful registration auto-logs in user and redirects to original page
- [ ] Error messages appear in Spanish for validation failures
- [ ] User account is created in Supabase Auth system
- [ ] Form uses shadcn/ui components for consistency

## Related Functional Requirements
- No direct functional requirements (handled by Supabase Auth)

## Related Non-Functional Requirements
- NFR-04: All API endpoints must return appropriate HTTP status codes with Spanish error messages
- NFR-07: All UI text must be in Spanish to match the target Venezuelan market
- NFR-08: Components must use shadcn/ui library for consistent design system integration
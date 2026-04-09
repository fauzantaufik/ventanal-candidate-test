# Feature Request: Consumer Reviews

## The ask

Our users want to share their experience with businesses they've hired. Add a way for consumers to leave reviews on business profiles. Reviews should be visible to other consumers visiting the profile.

Only authenticated users should be able to submit a review. Users who aren't logged in should still be able to read reviews.

## What we have

- The `reviews` table already exists in the database. See `worker/migrations/0002_reviews.sql` for the schema.
- The business detail page (`web/src/app/[slug]/page.tsx`) has a placeholder section where reviews should appear.
- There are two stub components ready for you: `ReviewForm` and `ReviewList`.
- Supabase Auth is already in the stack — see `web/src/lib/supabase.ts`.
- The auth pages (`/auth/login` and `/auth/signup`) exist as stubs.

## What we need

A complete, production-ready review feature. It should feel like a real feature in a real app — not a demo or prototype.

## What we don't need

- Review moderation / admin queue (out of scope for now)
- Photo uploads
- Helpful votes
- Business owner responses

## How to proceed

Read the codebase. Form your own opinions about what the edge cases are, what validation makes sense, and what the UI should feel like. Document your decisions.

We'll evaluate not just whether it works, but how you think through it.

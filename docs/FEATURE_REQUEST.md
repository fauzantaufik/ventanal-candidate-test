# Feature Request: Consumer Reviews

## About the project

**Directorio Local** is a business directory for Latin America — think Yelp, but built for Venezuela. Consumers discover local businesses (restaurants, service providers, health professionals, tradespeople), read reviews from real users, and contact them via WhatsApp or phone. Businesses claim their profile and build reputation over time.

The app is in Spanish. Our users are Venezuelan consumers who want to find and evaluate local services they can trust.

This is the codebase for the consumer-facing web app and mobile app. The backend is a Cloudflare Worker. There is also an admin panel (not in this repo).

---

## The ask

Our users want to share their experience with businesses they've hired. Add a way for consumers to leave reviews on business profiles. Reviews should be visible to other consumers visiting the profile.

Only authenticated users should be able to submit a review. Users who aren't logged in should still be able to read reviews — and should see a clear invitation to sign up and leave their own.

---

## What we have

- The `reviews` table already exists in the database. See `worker/migrations/0002_reviews.sql` for the schema.
- The business detail page (`web/src/app/[slug]/page.tsx`) has a placeholder section where reviews should appear.
- Two stub components are ready for you: `ReviewForm` and `ReviewList` in `web/src/components/`.
- Supabase Auth is already in the stack — see `web/src/lib/supabase.ts` (needs initialization).
- The auth pages (`/auth/login` and `/auth/signup`) exist as stubs.

---

## What we need

A complete, production-ready review feature. It should feel like a real feature in a real product — not a demo or prototype.

### Screens to implement

**Auth screens** (currently stubs):
- `/auth/signup` — name, email, password. On success: confirmation message or auto-login + redirect
- `/auth/login` — email, password. On success: redirect to where they came from

**Business detail page** — the `reviews` section currently shows a placeholder. Replace it with:
- `ReviewList` — list of reviews (star rating, comment, reviewer name, date). Must have State Triad: loading skeleton / empty state / error state with retry
- `ReviewForm` — shown to logged-in users. Hidden to guests (show "Inicia sesión para dejar tu reseña" CTA instead)

### Design expectations

Use **shadcn/ui** for all UI components. The library is already installed. Use it for buttons, form inputs, cards, badges, skeleton loaders, alerts, and toasts.

Before writing any UI code, get design inspiration from one of:
- [Figma Community](https://figma.com/community) — search "review system" or "business directory"
- [Dribbble](https://dribbble.com) or [Behance](https://behance.net)
- [variant.com](https://variant.com) — AI-generated UI variants
- Any other design reference you find useful

**Bonus**: Use an AI design tool (v0.dev, Figma AI, Stitch, or similar) to generate a UI mockup before coding. Include a screenshot of the generated design in your PR or `.screenshots/`.

The UI should feel Spanish and local — not a generic English SaaS template. Think warm colors, readable typography, and clear information hierarchy.

---

## What we don't need

- Review moderation / admin queue (out of scope for now)
- Photo uploads
- Helpful votes ("fue útil")
- Business owner responses

---

## How to proceed

Read the codebase. Read the `PRODUCT_BRIEF.md`. Form your own opinions about what the edge cases are, what validation makes sense, and what the UI should feel like. **Document all your decisions in `SPEC.md` before writing code.**

We'll evaluate not just whether it works, but how you think through it.

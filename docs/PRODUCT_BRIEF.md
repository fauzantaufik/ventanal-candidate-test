# Product Brief: Directorio Local

## What is this?

Directorio Local is a business directory for Latin America. Consumers use it to discover local businesses — restaurants, service providers, health professionals, and more — across Venezuelan cities.

## Who uses it?

**Consumers** — people looking for trusted local businesses to hire. They search, browse profiles, read reviews, and contact businesses via WhatsApp or phone.

**Businesses** — local service providers and establishments who want to be discoverable. They claim their profile, keep information updated, and respond to customer reviews.

## How trust is built

A business can be verified through our internal process (shown with a "Verificado" badge). Premium businesses have additional features. Unverified businesses still appear in the directory but with less prominence.

Our platform does NOT aggregate reviews from Google or other platforms. The only reviews shown are reviews written directly by our users on this platform.

## Tech stack

- **Backend**: Cloudflare Worker (Hono) + D1 SQLite database
- **Frontend**: Next.js 15, Tailwind CSS, shadcn/ui components
- **Mobile**: Expo (React Native) — iOS and Android
- **Auth**: Supabase Auth (email/password)
- **Deployment**: Vercel (web), Cloudflare (worker)

## Current state of this codebase

The base functionality is working:
- Businesses can be listed and searched
- Individual business profiles can be viewed
- Category filtering is available

**What's missing**: The review system. See `FEATURE_REQUEST.md`.

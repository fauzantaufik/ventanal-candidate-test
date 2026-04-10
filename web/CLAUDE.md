# web/CLAUDE.md

Next.js 15 App Router + Supabase Auth.

## Commands

```bash
pnpm dev:web          # Start dev server on http://localhost:3000
pnpm --filter web lint  # ESLint via next lint
```

## Structure

- Pages: `src/app/page.tsx` (listing), `[slug]/page.tsx` (detail), `auth/login`, `auth/signup`
- Components: `src/components/business-card.tsx`, `review-form.tsx` (stub), `review-list.tsx` (stub)
- API client: `src/lib/api.ts` — `getBusinesses`, `getBusiness`, `getCategories`
- Auth client: `src/lib/supabase.ts` (stub) — Supabase Auth; JWT sent as `Authorization: Bearer <token>`
- Env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.local.example`)

## Key constraints

- `ReviewList` must implement all four states: loading, error (with retry), empty, and data

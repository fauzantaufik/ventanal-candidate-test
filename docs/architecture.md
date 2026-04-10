# Architecture — Directorio Local

## System overview

```
┌──────────────┐     Hono RPC (typed)     ┌──────────────────┐      D1 SQL      ┌──────────┐
│  Next.js 15  │ ──────────────────────── │  Cloudflare      │ ───────────────── │  D1      │
│  (Vercel)    │    HTTP + Bearer JWT     │  Worker (Hono)   │                   │  SQLite  │
└──────────────┘                          └──────────────────┘                   └──────────┘
       │                                          │
       │ Supabase JS                              │ JWT verify
       ▼                                          ▼
┌──────────────┐                          ┌──────────────────┐
│  Supabase    │                          │  Supabase JWKS   │
│  Auth        │                          │  (public keys)   │
└──────────────┘                          └──────────────────┘

┌──────────────┐
│  Expo RN     │ ── same Worker API ──► (bonus/stretch)
│  (mobile)    │
└──────────────┘
```

## Workspaces

| Workspace | Stack | Deployed to | Purpose |
|-----------|-------|-------------|---------|
| `worker/` | Hono + D1 SQLite | Cloudflare Workers | API and persistence |
| `web/` | Next.js 15, Tailwind, shadcn/ui | Vercel | Consumer web UI |
| `mobile/` | Expo React Native | — (bonus) | Mobile experience |

Managed as a **pnpm monorepo** (`pnpm-workspace.yaml`).

## Data flow

### Read path (anonymous)

1. Next.js page or Expo screen calls the Worker via Hono RPC client (`hc<AppType>`)
2. Worker queries D1 (businesses, categories, reviews)
3. JSON response flows back; frontend renders with state-triad pattern (loading → error/empty/data)

### Write path (authenticated)

1. User signs up / logs in via Supabase Auth (client-side SDK in `web/`)
2. Frontend attaches `Authorization: Bearer <JWT>` to the request
3. Worker validates the Supabase JWT against public JWKS
4. On success: inserts review into D1, recalculates `avg_rating`/`review_count`, returns 201
5. Duplicate → 409; invalid token → 401; bad input → 400

## API contract sharing

The Worker exports `AppType` from `worker/src/index.ts`. The frontend imports it at build time:

```
worker/src/index.ts  →  export type AppType = typeof routes
web/src/lib/api.ts   →  import type { AppType } from '../../../worker/src/index'
                         const client = hc<AppType>(API_URL)
```

This gives the frontend fully typed request/response inference with zero manual duplication. See [ADR-003](adr/003-hono-rpc-shared-api-types.md).

## Database

D1 SQLite, bound as `DB` in `wrangler.toml`.

| Table | Purpose |
|-------|---------|
| `categories` | Business categories with slugs and icons |
| `businesses` | Business profiles with computed `avg_rating` and `review_count` |
| `reviews` | User reviews; `UNIQUE(business_id, user_id)` enforces one-per-user |

Migrations live in `worker/migrations/` and run via `pnpm --filter worker db:migrate`.

## Authentication

- **Provider**: Supabase Auth (email/password)
- **Client**: `@supabase/supabase-js` in `web/src/lib/supabase.ts`
- **Server validation**: Worker verifies Supabase JWT before write operations
- **Scope**: Only `POST /businesses/:slug/reviews` requires auth; all reads are public

## Key constraints

- One review per user per business (DB unique constraint + 409 response)
- Review comment is optional, max 500 characters; rating 1–5
- Business `avg_rating`/`review_count` recalculated on each review insert
- UI text in Spanish for the Venezuelan market
- Frontend uses state-triad pattern: loading, error (with retry), empty, data

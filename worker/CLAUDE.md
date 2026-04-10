# worker/CLAUDE.md

Hono API on Cloudflare Workers + D1 SQLite.

## Commands

```bash
pnpm dev:worker           # Start dev server on http://localhost:8787
pnpm --filter worker test                          # All tests (Vitest + @cloudflare/vitest-pool-workers)
pnpm --filter worker test -- --reporter=verbose    # Verbose output
pnpm --filter worker test -- path/to/test.ts       # Single test file
pnpm --filter worker db:migrate                    # Apply D1 migrations (local)
pnpm --filter worker db:seed                       # Seed sample data
```

## Structure

- Entry: `src/index.ts` — Hono app with CORS and logger middleware
- Routes: `src/routes/businesses.ts`, `categories.ts`, `reviews.ts`
- Types: `src/db/schema.ts` — `Category`, `Business`, `Review`, `Env` interfaces
- DB binding: `DB` (D1 SQLite), configured in `wrangler.toml`
- Migrations: `migrations/0001_businesses.sql` (schema + seed), `0002_reviews.sql` (reviews table)

## Local D1 notes

- In local dev, the Worker's D1 database is stored as a SQLite file under `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite`
- Run `pnpm --filter worker db:migrate` before trying to inspect the DB so the file exists locally
- MCP inspection examples are provided through the repo-level `.vscode/mcp.example.json` and `.mcp.example.json` files using `@bytebase/dbhub`; real local MCP files are gitignored because their paths are machine-specific
- The exact SQLite filename/hash can change when the DB is recreated, so update the MCP path if a stale path stops working

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/categories` | List all categories |
| GET | `/businesses` | List businesses (`?city=`, `?category=`, `?page=`) |
| GET | `/businesses/:slug` | Get a single business |
| POST | `/businesses/:slug/reviews` | Submit a review (auth required) |
| GET | `/businesses/:slug/reviews` | List reviews for a business |

## Key constraints

- One review per user per business — enforced by `UNIQUE(business_id, user_id)`; return 409 on duplicate
- `POST /businesses/:slug/reviews` requires a valid Supabase JWT via `Authorization: Bearer <token>`
- After inserting a review, recalculate and update `avg_rating` and `review_count` on the business row

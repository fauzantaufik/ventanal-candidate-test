# Directorio Local — Candidate Test Repo

This is the test repository for the agentic full-stack developer position at our company.

**Before you do anything else, read `TEST_GUIDE.md`.**

---

## Prerequisites

- Node.js 20+
- pnpm 9+
- Wrangler CLI: `npm install -g wrangler`

---

## Setup

```bash
# Install all dependencies
pnpm install

# Set up the local database
pnpm --filter worker db:migrate
pnpm --filter worker db:seed   # optional — seed data is in migration 0001

# Copy environment files
cp web/.env.local.example web/.env.local
# Edit web/.env.local and fill in your Supabase credentials

cp mobile/.env.example mobile/.env
# Edit mobile/.env if needed
```

---

## Development

```bash
# Start the Cloudflare Worker (API) — runs on http://localhost:8787
pnpm dev:worker

# Start the Next.js web app — runs on http://localhost:3000
pnpm dev:web

# Run worker tests
pnpm test
```

---

## Project structure

```
├── worker/          # Cloudflare Worker (Hono + D1) — the API
├── web/             # Next.js 15 web app — consumer frontend
├── mobile/          # Expo 54 mobile app — bonus/stretch
├── PRODUCT_BRIEF.md # Product context
├── FEATURE_REQUEST.md # Your task
└── TEST_GUIDE.md    # Requirements, deliverables, video checklist
```

---

## API endpoints (already working)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/categories` | List all categories |
| GET | `/businesses` | List businesses (supports `?city=`, `?category=`, `?page=`) |
| GET | `/businesses/:slug` | Get a single business by slug |
| POST | `/businesses/:slug/reviews` | **TO IMPLEMENT** |
| GET | `/businesses/:slug/reviews` | **TO IMPLEMENT** |

---

## Database

The D1 database has two migrations:

- `0001_businesses.sql` — `businesses` and `categories` tables, pre-seeded with 10 businesses
- `0002_reviews.sql` — `reviews` table schema (exists, no endpoints yet)

Run locally with: `pnpm --filter worker db:migrate`

---

## Deployment

The web app is configured for Vercel. Connect your fork to Vercel and set these environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:8787  # or your deployed worker URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Branch setup for candidates

```bash
# We create your branch before giving you access
git checkout candidate/<your-name>-<date>
# Open your PR against main when you're done
```

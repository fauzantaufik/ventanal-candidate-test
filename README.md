# Directorio Local — Candidate Test Repo

This is the test repository for the agentic full-stack developer position at our company.

**Before you do anything else, read `TEST_GUIDE.md`.**

---

## Heads-up, Fauzan — branch was refreshed

After we created your branch we pushed a few late updates to `main` that refined the briefing documents (clearer requirements, expanded video checklist, more detail on the feature scope and PR template). We've now merged those into your branch so you're working from the most up-to-date version.

**What changed (docs only — no code):**

- `TEST_GUIDE.md` — expanded requirements, clearer hard vs bonus items, updated video checklist
- `FEATURE_REQUEST.md` — added app summary and design guidance
- `.github/pull_request_template.md` — added sections for MCP, AI review, cloud env, design inspiration
- `.claude/continuation-prompt-template.md` — added official doc links and practical tips

**What you need to do:** Just pull the latest changes on your branch before starting (`git pull origin candidate/fauzan-20260409`). Your 24-hour clock still starts from the moment you received the test email — the refresh doesn't cost you time. If anything looks inconsistent after the update, ping us and we'll clarify immediately.

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

| Method | Path                        | Description                                                 |
| ------ | --------------------------- | ----------------------------------------------------------- |
| GET    | `/health`                   | Health check                                                |
| GET    | `/categories`               | List all categories                                         |
| GET    | `/businesses`               | List businesses (supports `?city=`, `?category=`, `?page=`) |
| GET    | `/businesses/:slug`         | Get a single business by slug                               |
| POST   | `/businesses/:slug/reviews` | **TO IMPLEMENT**                                            |
| GET    | `/businesses/:slug/reviews` | **TO IMPLEMENT**                                            |

---

## Database

The D1 database has two migrations:

- `0001_businesses.sql` — `businesses` and `categories` tables, pre-seeded with 10 businesses
- `0002_reviews.sql` — `reviews` table schema (exists, no endpoints yet)

Run locally with: `pnpm --filter worker db:migrate`

### Local D1 + MCP inspector

For local development, Cloudflare D1 is backed by a local SQLite file created by Wrangler under:

- `worker/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite`

This means you can inspect the database locally without needing a remote Cloudflare D1 instance.

This repo provides example MCP client configs for a SQLite/D1 inspector using `@bytebase/dbhub`:

- `.vscode/mcp.example.json` — example for VS Code / Copilot Chat
- `.mcp.example.json` — example for Claude Code CLI

Local machine-specific files such as `.vscode/mcp.json` and `.mcp.json` are intentionally gitignored because the command and SQLite path vary by OS and local environment.

To set it up locally:

1. copy the example file to the real MCP config path you use
2. update the command/path for your OS
3. point the DSN at the actual Wrangler-created `.sqlite` file (not `metadata.sqlite`)

Typical MCP uses during the candidate workflow:

- list the existing tables (`categories`, `businesses`, `reviews`)
- inspect schema/columns and indexes
- run simple read-only queries such as `SELECT COUNT(*) FROM businesses`

#### Cross-platform notes

- **Windows:** use `npx.cmd` and a DSN like `sqlite:///D:/path/to/db.sqlite`
- **macOS/Linux:** use `npx` and a Unix-style DSN like `sqlite:////absolute/path/to/db.sqlite`
- the SQLite filename/hash under `.wrangler/state/...` may change when the local DB is recreated; update the MCP config path if needed

#### Troubleshooting

- run `pnpm --filter worker db:migrate` before starting the MCP server so the local SQLite file exists
- if the MCP server fails on first launch because of `better-sqlite3` native bindings, rerun it once from the terminal and then reload the editor
- if the error says the database path does not exist, verify the DSN points to the actual `.sqlite` file and not `metadata.sqlite`

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

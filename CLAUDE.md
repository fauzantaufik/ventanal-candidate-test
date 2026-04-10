# CLAUDE.md

pnpm monorepo with three workspaces.

## Workspaces

- [worker/](worker/CLAUDE.md) — Hono API on Cloudflare Workers + D1
- [web/](web/CLAUDE.md) — Next.js 15 App Router + Supabase Auth
- [mobile/](mobile/CLAUDE.md) — Expo React Native (bonus/stretch)

## Docs

- [README.md](README.md) — setup, prerequisites, deployment, branch workflow
- [TEST_GUIDE.md](TEST_GUIDE.md) — candidate requirements and deliverables
- [docs/architecture.md](docs/architecture.md) — system architecture overview

## Brain project

`docs/` is the single source of agent context. All product decisions, specs, and stories live there so agents always know where to look — no context drift, no scattered references. See [docs/CLAUDE.md](docs/CLAUDE.md).

## Build workflow

When building or updating a feature:

1. **Pick the relevant specialized agent first**
   - `backend` for `worker/**`
   - `frontend` for `web/**`
   - `mobile` for `mobile/**`
2. **Then use the `builder-workflow` skill** so the work is anchored on the relevant story/design docs, stays inside the correct workspace boundary, and is verified with real checks.
3. **Commit at meaningful milestones per subtask** (API, UI, tests, docs), rather than waiting for one large end-of-story commit.

For cross-workspace changes, keep the owning agent explicit and hand off through the shared Hono RPC contract instead of blurring boundaries.

## Conventions

When writing CLAUDE.md files:

- Explain _why_ a folder or structure exists, not just what's in it
- Folders with a specific purpose (e.g. brain project, workspace) get their own CLAUDE.md
- Prefer folder-level references over exhaustive file listings
- Keep stable docs non-overlapping: `PRODUCT_BRIEF.md` for product context, `architecture.md` for system design, and ADRs for durable architectural decisions
- Temporary implementation notes belong under `docs/design/`, not source of truth, and should be archived for later human cleanup after stories implementation finish. The source of truth is the living code implemented.

## Top-level commands

```bash
pnpm dev:worker   # Worker dev server on http://localhost:8787
pnpm dev:web      # Web dev server on http://localhost:3000
pnpm test         # All worker tests
```

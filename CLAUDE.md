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
4. **For new cross-app UI features** (like i18n, auth UX, or shared state), verify both the server/client component boundary and the React version typing constraints before broad refactors.

For cross-workspace changes, keep the owning agent explicit and hand off through the shared Hono RPC contract instead of blurring boundaries.

## Conventions

- For PR review or AI review tasks, always treat the active PR / merge change set as the source of truth; do not default to `git diff main` unless the user explicitly asks for a local diff-based review.
- When working in Next.js App Router, do not introduce hooks, browser APIs, or context into a server component. First decide whether the feature belongs in a client wrapper or a server component, then implement from that boundary.
- When a change materially affects architecture, service behavior, or app logic in `web/`, `worker/`, or `mobile/`, update the closest owning doc in the same task. Keep docs non-duplicative to reduce token cost and avoid multiple sources of truth; for implementation details, the code is the source of truth.
- For browser-fetched worker APIs in local dev, always verify CORS against the actual web origin and port in use (for example `localhost:3000`, `localhost:3001`) before assuming the frontend review flow is broken.
- When Supabase Auth is used in `web/` and the worker validates JWTs, prefer verifying real access tokens against Supabase JWKS (with a local test fallback) rather than relying only on a shared dev secret.
- When an endpoint exposes aggregate fields like `review_count` or `avg_rating`, verify they are derived from the same source of truth as the detailed list data to avoid header/list mismatches.

When writing CLAUDE.md files:

- Folders with a specific purpose (e.g. brain project, workspace) get their own CLAUDE.md
- Prefer folder-level references over exhaustive file listings
- Keep stable docs non-overlapping: `PRODUCT_BRIEF.md` for product context, `architecture.md` for system design, and ADRs for durable architectural decisions, etc
- Temporary implementation notes belong under `docs/design/`, not source of truth, and should be archived for later human cleanup after stories implementation finish. The source of truth is the living code implemented.

## Top-level commands

```bash
pnpm dev:worker   # Worker dev server on http://localhost:8787
pnpm dev:web      # Web dev server on http://localhost:3000
pnpm test         # All worker tests
```

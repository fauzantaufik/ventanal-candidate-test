# CLAUDE.md

pnpm monorepo with three workspaces.

## Workspaces

- [worker/](worker/CLAUDE.md) — Hono API on Cloudflare Workers + D1
- [web/](web/CLAUDE.md) — Next.js 15 App Router + Supabase Auth
- [mobile/](mobile/CLAUDE.md) — Expo React Native (bonus/stretch)

## Docs

- [README.md](README.md) — setup, prerequisites, deployment, branch workflow
- [TEST_GUIDE.md](TEST_GUIDE.md) — candidate requirements and deliverables

## Brain project

`docs/` is the single source of agent context. All product decisions, specs, and stories live there so agents always know where to look — no context drift, no scattered references. See [docs/CLAUDE.md](docs/CLAUDE.md).

## Conventions

When writing CLAUDE.md files:
- Explain *why* a folder or structure exists, not just what's in it
- Folders with a specific purpose (e.g. brain project, workspace) get their own CLAUDE.md
- Prefer folder-level references over exhaustive file listings

## Top-level commands

```bash
pnpm dev:worker   # Worker dev server on http://localhost:8787
pnpm dev:web      # Web dev server on http://localhost:3000
pnpm test         # All worker tests
```

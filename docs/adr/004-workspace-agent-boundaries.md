# ADR 004 — Specialized Workspace Agents for Web, Worker, and Mobile

- **Status:** Accepted
- **Date:** 2026-04-10

## Context

This candidate project is intentionally built to be worked on with multiple agents. The repo is split into three main workspaces with different responsibilities:

- `web/` — Next.js App Router frontend
- `worker/` — Hono API on Cloudflare Workers + D1
- `mobile/` — Expo React Native bonus app

Without explicit ownership, agents can overlap, duplicate work, or make changes on the wrong side of the frontend/backend boundary. That risk is higher in this repo because the frontend consumes the backend contract through Hono RPC, so silent contract drift or cross-boundary edits are especially costly.

## Decision

Adopt three specialized workspace agents and keep their concrete Claude definitions under `.claude/agents/`:

- `frontend.md` — owns `web/`
- `backend.md` — owns `worker/`
- `mobile.md` — owns `mobile/`

The boundary rules are:

- **Frontend agent** owns UI, App Router flows, auth UX, and Hono RPC client integration in `web/`
- **Backend agent** owns Hono routes, D1 queries, JWT validation, and API contract behavior in `worker/`
- **Mobile agent** owns the Expo bonus/stretch experience in `mobile/`

Cross-workspace changes must be called out explicitly when they affect the shared contract or require handoff between agents.

## Why

- Keeps each agent focused on one workspace and one kind of responsibility
- Reduces accidental boundary violations between UI work and API/data work
- Makes parallel agent sessions safer and easier to review
- Supports the candidate-test requirement to show deliberate agent orchestration
- Fits the monorepo structure already established in `AGENTS.md` and the workspace CLAUDE files

## Consequences

### Positive

- Cleaner ownership of `web/`, `worker/`, and `mobile/`
- Better parallelization with less merge conflict risk
- More explicit handoffs when API contract changes affect consumers
- Easier review because each agent has a narrow area of responsibility

### Trade-offs

- Agent boundaries must be kept up to date as the repo evolves
- Some tasks naturally span multiple workspaces and require coordination instead of one-agent execution
- The mobile agent covers bonus/stretch scope, so it should avoid overbuilding beyond the demo needs

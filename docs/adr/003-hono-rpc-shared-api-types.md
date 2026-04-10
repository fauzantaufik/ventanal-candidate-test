# ADR 003 — Hono RPC for Shared API Types

- **Status:** Accepted
- **Date:** 2026-04-10

## Context

The repo is a pnpm monorepo with:

- `worker/` as the Hono API
- `web/` as the Next.js frontend

The frontend was manually duplicating API response types that already existed in the backend contract. That creates drift risk: when routes or payloads change in `worker/`, the `web/` types can silently become stale.

Because both apps live in the same repo, we can use the Hono app itself as the source of truth for the API contract, Hono RPC helps with development-time type sharing.

## Decision

Use **Hono RPC** for the `web` → `worker` integration.

Specifically:

- Export `AppType` from `worker/src/index.ts`
- Keep Hono routes chainable so type inference is preserved
- Create the frontend client with `hc<AppType>(API_URL)`
- Derive request and response types in `web/src/lib/api.ts` using `InferRequestType` and `InferResponseType`
- Prefer the Hono RPC client over manually duplicated REST interfaces for internal app-to-app calls in this monorepo

## Why

- Makes the backend route contract the single source of truth
- Reduces duplicated TypeScript interfaces across `web/` and `worker/`
- Improves refactor safety when routes, params, or payloads change
- Fits this repo well because both apps are developed and versioned together

## Consequences

### Positive

- End-to-end type safety between frontend and backend
- Fewer manual sync mistakes between API code and UI code
- Faster iteration when evolving the API

### Trade-offs

- `web/` is intentionally coupled to `worker/` at build time through shared types
- Hono route definitions must preserve type inference patterns
- Request typing is strongest when query/body inputs use Hono validator middleware
- If an external client is added later, it may still need its own documented API contract

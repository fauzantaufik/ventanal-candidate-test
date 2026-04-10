# AGENTS.md

This repo uses specialized agents to keep the `web/` and `worker/` boundaries clear and to make Hono RPC contract ownership explicit.

Claude-specific agent files live under `.claude/agents/` (for example `backend.md` and `frontend.md`).

## 1. Frontend Agent — Next.js + Hono RPC

**Role**

- Owns the user-facing work in `web/`: pages, components, auth UX, review form/list behavior, and frontend integration details.

**Does**

- Builds and refines the Next.js App Router UI
- Consumes the API via Hono RPC using `hc<AppType>()`
- Keeps loading, error, empty, and success states polished and consistent
- Verifies frontend changes with `pnpm --filter web build`

**Does NOT do**

- Own D1 queries, worker route implementation, or JWT validation rules
- Manually duplicate backend types when they can be inferred from the Hono app
- Change API contracts without calling out the dependency clearly

**Key constraints / context**

- `web/` is deployed to Vercel for the candidate flow
- The frontend should respect the backend contract exported from `worker/src/index.ts`
- Internal navigation should use Next.js primitives such as `Link`

## 2. Backend Agent — Hono Worker + D1

**Role**

- Owns the API and persistence layer in `worker/`: Hono routes, D1 access, auth enforcement, and review integrity.

**Does**

- Implements or updates route handlers under `worker/src/routes/`
- Maintains DB behavior and business rules like one review per user per business
- Exports and preserves the API contract used by the frontend Hono RPC client
- Verifies backend changes with tests or focused worker checks

**Does NOT do**

- Own UI styling, layout, or frontend-only state logic
- Make silent breaking changes to API params or responses
- Skip verification when changing auth, review logic, or database behavior

**Key constraints / context**

- `POST /businesses/:slug/reviews` requires authenticated requests with a valid Supabase JWT
- D1 is the source of truth for categories, businesses, and reviews
- Route definitions should preserve Hono RPC inference where possible

## 3. Mobile Agent — Expo React Native

**Role**

- Owns bonus/stretch work in `mobile/`: Expo screens, navigation, mobile business detail behavior, and mobile review-list presentation.

**Does**

- Builds and refines the React Native UX in `mobile/`
- Handles loading, error, empty, and data states for mobile screens
- Consumes the existing backend contract without redefining server rules
- Verifies mobile changes with the most relevant available mobile check

**Does NOT do**

- Own Hono route logic, D1 queries, or auth enforcement rules
- Make silent backend contract changes from the mobile side
- Overbuild bonus mobile scope beyond what helps the candidate demo

**Key constraints / context**

- `mobile/` is bonus/stretch, not a hard requirement
- Main mobile work currently centers on `mobile/app/business/[slug].tsx`
- Mobile should stay aligned with the same backend contract used by `web/`

## Boundary rule

- **Frontend agent owns `web/**`** and the user experience.
- **Backend agent owns `worker/**`** and the API contract.
- **Mobile agent owns `mobile/**`** and the Expo bonus experience.
- Changes that affect both sides must be coordinated through the shared Hono RPC contract and called out explicitly in the handoff.

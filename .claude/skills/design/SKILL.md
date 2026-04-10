---
name: design
description: "Create or update a simple, implementation-ready design doc for this repo. Use when a feature needs a practical plan based on `docs/`, the current monorepo stack, and the existing app structure."
argument-hint: The user input is the feature context, scope, and any relevant docs or story files.
# tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo']
---

## User Input

$ARGUMENTS

If empty: ask for the feature name, story, or relevant doc path.

---

## Purpose

Produce a **small, concrete low-level design** that fits **Directorio Local as it exists today**.

Design for the repo we have:

- `worker/` → Hono on Cloudflare Workers + D1
- `web/` → Next.js 15 App Router + Tailwind + shadcn/ui
- `mobile/` → Expo (only if explicitly in scope)
- `docs/` → single source of truth for product context

Prefer **boring, shippable changes** over clever architecture.
Do not rewrite product requirements.

---

## Repo Philosophy

1. **Start from `docs/`** — especially `docs/FEATURE_REQUEST.md`, `docs/SPEC.md`, and the relevant story files.
2. **Keep it incremental** — extend existing pages, routes, and components before inventing new layers.
3. **Keep it simple** — no patterns, services, queues, or extra documents unless the feature truly needs them.
4. **Be story-driven** — explain the design in terms of user flows and affected workspaces.
5. **Respect product tone** — Spanish-first UX and local business-directory context when relevant.

---

## Workflow

### 1. Read the right context

Review only what matters:

- `docs/FEATURE_REQUEST.md`
- `docs/SPEC.md`
- relevant file(s) in `docs/stories/`
- repo/workspace `CLAUDE.md` files when implementation constraints matter

Avoid broad repo summaries if the feature scope is narrow.

### 2. Define the smallest viable change

Capture:

- goal and user value
- what is in scope vs out of scope
- which workspace(s) change: `web`, `worker`, optional `mobile`
- any auth, API, or DB implications
- test impact

### 3. Write one practical design

Prefer **one concise Markdown doc** unless the user explicitly asks for more structure.

Recommended sections:

- **Overview**
- **Goals / Non-Goals**
- **Affected Areas**
- **Proposed Changes by Workspace**
- **Data / API Contract**
- **UI States / UX Notes**
- **Testing Plan**
- **Risks / Open Questions**

### 4. Keep it concrete

Use real repo paths and flows, for example:

- `web/src/app/[slug]/page.tsx`
- `web/src/components/review-list.tsx`
- `worker/src/routes/reviews.ts`
- `worker/src/db/schema.ts`

Show how data moves through the current app, e.g.:

```text
Next.js page → API client → Hono route → D1 → response → UI state
```

Use small JSON or TypeScript-shaped examples for request/response payloads.

### 5. Avoid over-design

Do **not** add generic architecture ceremony unless clearly justified:

- no design-pattern comparison tables by default
- no separate rollout/contracts/test docs for small features
- no new abstractions just to look “enterprise”

If the feature is truly large, you may split the output — but explain why.

---

## Quality Bar

Before finishing, verify that the design:

- matches the stories and `SPEC.md`
- fits the existing monorepo structure
- is easy to implement without guessing
- includes explicit state handling and validation rules where relevant
- names the tests or commands most likely to verify the work

---

## Output

Return:

1. **Design title**
2. **Doc path(s)** and purpose
3. **Final design content**
4. **Open questions** only if they block implementation
5. **Status**: `Ready for implementation` or `Needs clarification`

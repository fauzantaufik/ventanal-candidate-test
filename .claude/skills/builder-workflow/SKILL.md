---
name: builder-workflow
description: "Use when implementing a feature in `web/`, `worker/`, or `mobile/` from repo stories and an optional temporary design doc. Guides backend, frontend, and mobile builder agents through the flow: check relevant `docs/stories/*` and workspace-specific design first, build and verify, then delete the temporary design doc to keep code as the single living source of truth."
argument-hint: The user input should include the feature, target workspace (`web`, `worker`, or `mobile`), relevant story path(s), and optional design doc path(s).
# tools: ['read', 'edit', 'search', 'execute', 'todo', 'agent']
---

## User Input

$ARGUMENTS

If the request is missing key context, ask for:

- target workspace: `web`, `worker`, or `mobile`
- relevant story file(s)
- optional temporary design doc path(s)
- whether the work is single-workspace or cross-workspace

---

## Purpose

Run a **story-first build workflow** for builder agents.

Use transient design only to implement faster and more consistently. Once the feature is complete and verified, remove the temporary design artifact so the shipped code remains the primary living source of truth.

---

## Core Rule

Follow this sequence strictly:

1. **Read the relevant story docs**
2. **Read the relevant temporary design doc(s)**, if any
3. **Implement in the correct workspace boundary**
4. **Verify with real workspace checks**
5. **Delete the temporary design doc(s)** after successful completion

> Never delete permanent product docs such as `docs/SPEC.md`, `docs/FEATURE_REQUEST.md`, `docs/stories/*`, or ADRs. Only delete feature-specific temporary design artifacts created to support implementation.

---

## Agent Routing

Pick the agent that owns the impacted workspace:

- `worker/**` → `backend`
- `web/**` → `frontendC`
- `mobile/**` → mobile-focused builder flow

If a feature crosses boundaries, keep ownership explicit and coordinate through the shared contract.

---

## Workflow

### 1. Anchor on the story

Read only the docs needed to implement correctly:

- relevant file(s) in `docs/stories/`
- `docs/SPEC.md` if acceptance criteria or scope need confirmation
- workspace `CLAUDE.md` / `AGENTS.md` files when boundaries or ownership matter

Capture:

- the user flow
- acceptance criteria
- constraints and non-goals
- affected workspace(s)

### 2. Check the relevant design

If temporary design exists, read only the design relevant to the active workspace:

- frontend design for `web/`
- backend design for `worker/`
- mobile design for `mobile/`

Ignore unrelated design docs to avoid context drift and wasted context.

If no design exists, implement directly from the story and existing code patterns, or create a very small temporary design only when the feature is still ambiguous.

### 3. Build in the owning workspace

Implement the smallest shippable change that matches the current repo patterns.

Rules:

- extend existing pages, components, routes, and queries before adding new layers
- respect workspace ownership and boundaries
- do not make silent API contract changes
- keep backend/frontend/mobile handoffs explicit when the feature spans more than one workspace

Suggested sequencing for cross-workspace work:

1. backend API or data change
2. frontend/mobile consumption change
3. shared verification across impacted workspaces

### 4. Verify before claiming completion

Use real verification evidence. Do not claim success based on guesswork.

Run the checks that match the affected workspace, for example:

- `pnpm --filter worker test`
- `pnpm --filter web build`
- relevant mobile Expo or type-check command when `mobile/` is in scope

Also verify the actual story behavior end-to-end where feasible.

### 5. Delete transient design artifacts

After implementation is complete and verification passes:

- delete the temporary feature design doc(s) used during execution
- keep the permanent product/story docs intact
- note in the final summary that code and tests now represent the delivered behavior

If verification is still failing or the work is blocked, do **not** delete the temporary design yet.

---

## Decision Rules

- **Story vs design conflict** → prefer the story/spec or ask for clarification; do not blindly follow stale design
- **Multiple designs exist** → use the one matching the active workspace and feature scope
- **Implementation differs from design** → ship the correct code, mention the divergence, and remove stale temporary design after verification
- **Cross-workspace dependency** → call out the handoff explicitly, especially for Hono RPC contracts and auth-sensitive changes

---

## Output Format

Return a short implementation summary with:

1. story file(s) reviewed
2. temporary design file(s) reviewed
3. workspace(s) changed
4. verification evidence
5. deleted temporary design path(s), if any
6. blockers or follow-ups, if any

---

## Quality Bar

Before finishing, confirm that:

- the change traces back to a specific story
- only relevant designs were used
- the owning builder agent stayed within its workspace boundary
- verification was actually run and cited
- any temporary design doc used for implementation has been removed after successful completion

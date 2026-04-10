---
name: builder-workflow
description: "Use when implementing a feature in `web/`, `worker/`, or `mobile/` from repo stories and optional temporary design docs. First route the work to the relevant specialized agent (`backend`, `frontend`, or `mobile`), then follow the story-first build flow: read the doc/design, implement within the owning boundary, verify with real checks, commit meaningful milestones, and archive transient design docs for human cleanup once the code is the living source of truth."
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

Run a **story-first build workflow** for the owning specialized agent.

Use transient design only to implement faster and more consistently. Once the feature is complete and verified, archive the temporary design artifact for human cleanup so the shipped code remains the primary living source of truth.

---

## Core Rule

Follow this sequence strictly:

1. **Pick the owning specialized agent first**
2. **Read the relevant story docs**
3. **Read the relevant temporary design doc(s)**, if any
4. **Implement in the correct workspace boundary**
5. **Verify with real workspace checks**
6. **Commit meaningful milestones per subtask**
7. **Archive the temporary design doc(s)** after successful completion for human cleanup

> Prefer small, reviewable milestone commits for API, UI, tests, or docs. Do not wait until the full story is done for the first meaningful commit.
>
> Never delete permanent product docs such as `docs/SPEC.md`, `docs/FEATURE_REQUEST.md`, `docs/stories/*`, or ADRs. Only archive feature-specific temporary design artifacts created to support implementation, and let a human decide when to delete them.

---

## Agent Routing

Pick the available agent that owns the impacted workspace:

- `worker/**` → `backend-architect`
- `web/**` → `frontend-hono-rpc`
- `mobile/**` → `mobile-expo`

If a feature crosses boundaries, keep ownership explicit and coordinate through the shared contract. Start with the primary owning agent, then hand off follow-up work to other relevant agents as needed.

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

Implement the smallest shippable change that matches the current repo patterns, using the routed owning agent for that workspace.

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

### 5. Commit meaningful milestones

Once a real subtask is verified, commit it as a small, reviewable milestone. Good checkpoints include backend endpoints, frontend UI slices, tests, docs, or mobile screens.

Do not wait until the entire story is finished for the first commit, but also avoid noisy micro-commits that do not represent a meaningful checkpoint.

### 6. Archive transient design artifacts

After implementation is complete and verification passes:

- archive the temporary feature design doc(s) used during execution for later human cleanup
- keep the permanent product/story docs intact
- note in the final summary that code and tests now represent the delivered behavior

If verification is still failing or the work is blocked, do **not** archive the temporary design yet or create a misleading completion commit.

---

## Decision Rules

- **Story vs design conflict** → prefer the story/spec or ask for clarification; do not blindly follow stale design
- **Multiple designs exist** → use the one matching the active workspace and feature scope
- **Implementation differs from design** → ship the correct code, mention the divergence, and archive stale temporary design after verification for human review
- **Cross-workspace dependency** → call out the handoff explicitly, especially for Hono RPC contracts and auth-sensitive changes

---

## Output Format

Return a short implementation summary with:

1. story file(s) reviewed
2. temporary design file(s) reviewed
3. workspace(s) changed
4. verification evidence
5. milestone commit(s) or checkpoint status
6. archived temporary design path(s), if any
7. blockers or follow-ups, if any

---

## Quality Bar

Before finishing, confirm that:

- the change traces back to a specific story
- only relevant designs were used
- the owning builder agent stayed within its workspace boundary
- verification was actually run and cited
- any temporary design doc used for implementation has been archived after successful completion for later human cleanup

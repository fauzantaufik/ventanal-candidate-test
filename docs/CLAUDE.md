# docs/CLAUDE.md — Brain Project

`docs/` is the single folder for agent context. The goal is to avoid context drift: agents always refer here, never hunt across the repo.

## Why

- One place to look — no scattered context across root-level files
- Stories are split so agents work independently per story (INVEST principle)
- Parallel agent execution is safe because stories don't depend on each other

## Contents

- `PRODUCT_BRIEF.md` — product background and goals
- `FEATURE_REQUEST.md` — the specific task to implement
- `SPEC.md` — full product spec
- `architecture.md` — system architecture: data flow, workspaces, API contract, DB, and auth
- `adr/` — architecture decision records
- `stories/` — one file per user story; always pick the relevant story before starting work

## Documentation philosophy

- Keep stable docs focused and non-duplicative.
- `PRODUCT_BRIEF.md` owns product context and goals.
- `architecture.md` owns the technical system view, data flow, auth, and deployment shape.
- ADRs capture durable architectural decisions and their rationale.

## Temporary design notes

- `docs/design/` is for temporary working design notes while implementing a story.
- These notes may be committed so agents and collaborators can use them during implementation.
- Once a feature ships and is verified, delete or archive the temporary design note so the long-term source of truth stays in the shipped code/tests plus the stable product docs in `docs/`.

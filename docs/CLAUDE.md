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
- `adr/` — architecture decision records
- `stories/` — one file per user story; always pick the relevant story before starting work

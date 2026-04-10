# ADR 002 — Agent Skills: context-management and reflection

- **Status:** Accepted
- **Date:** 2026-04-10

## Context

Working on an agentic project requires two things to stay consistent across sessions:

1. **Agents must know where to look** — context must be structured and referenced the same way every time, not scattered or rebuilt from scratch per session.
2. **Agents must improve over time** — when an approach fails or a user corrects behavior, that knowledge must be captured and not lost when the conversation ends.

Without a standard for both, agents drift: they miss context, repeat mistakes, and each new session starts from zero.

## Decision

Adopt two skills as part of the initial project setup:

### `context-management`
Standardizes how knowledge is structured and referenced across the project. It governs:
- How `CLAUDE.md` files are written (what goes in them, what does not)
- How the `docs/` brain folder is organized and kept current
- How agents are pointed to the right context before starting work

This skill ensures every agent starts a session with the same, reliable reference point.

### `reflection`
Captures improvements continuously. It is triggered by:
- Tool call failures or errors
- User corrections to the agent's approach
- Recurring patterns in conversation history

When triggered, it proposes **one focused change at a time** — a targeted update to a skill definition, `CLAUDE.md`, or agent configuration — and applies it only after explicit user approval.

Source: [skills.sh/davidkiss/smart-ai-skills/reflection](https://skills.sh/davidkiss/smart-ai-skills/reflection)

## Why

- **context-management** prevents agents from hunting across the repo or reconstructing context they should already have. It makes the `docs/` brain folder the single source of truth.
- **reflection** closes the feedback loop. Without it, corrections stay in the conversation and vanish. With it, every meaningful correction becomes a durable improvement to how agents behave.

Together they answer two questions every agentic project must answer: *where does context live?* and *how does the agent get better over time?*

## Consequences

### Positive

- Context is structured once, reused consistently — no drift between sessions
- Agent behavior improves incrementally without bulk, hard-to-review changes
- Each proposed improvement is explicit and reviewed before being applied
- New team members (or new agents) ramp up faster with a well-maintained brain folder

### Trade-offs

- context-management requires discipline to keep `CLAUDE.md` files and `docs/` up to date
- reflection is reactive — it only captures what surfaces in a session; gaps that never appear in conversation remain uncaptured
- One-change-per-invocation is deliberate but slower than bulk updates

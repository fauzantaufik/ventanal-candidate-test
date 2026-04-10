# ADR 001 — Brain Project Folder for Agent Context

- **Status:** Accepted
- **Date:** 2026-04-10

## Context

I want agents to work on specific stories instead of a single large spec.
A single spec creates too much context and increases dependency between tasks.

I also want a simple place to store the context each story needs so agents can work faster and with less confusion.

## Decision

I created a **brain project folder** to hold the context required for agents to work on the project.

I also split the product spec into multiple stories, because agents will work **per story** rather than against one large document.

To support this, I created a **PM Spec Writer** that applies the **INVEST** framework so stories are:

- **Independent**
- **Negotiable**
- **Valuable**
- **Estimable**
- **Small**
- **Testable**

The main goal is to produce stories that do **not depend on each other**, so multiple agents can work in parallel safely.

## Why

- Keeps agent context focused
- Reduces cross-story dependency
- Makes parallel agent execution easier
- Improves reviewability of each story
- Preserves a clear history of decisions

## Consequences

### Positive

- Faster parallel execution
- Less context overload for agents
- Easier story-level tracking and review

### Trade-offs

- More files to maintain
- Story boundaries need discipline to stay independent

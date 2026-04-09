# Test Guide — Directorio Local Candidate Test

Welcome. This document explains exactly what we expect from you during this test.

**Read this entire file before writing a single line of code.**

---

## What you're building

A consumer review system on a business directory app. See `FEATURE_REQUEST.md` for the feature details and `PRODUCT_BRIEF.md` for product context.

The feature intentionally leaves some decisions up to you. That's on purpose — we want to see how you think, not just whether you can implement a spec.

---

## Deliverables

When you're done, open a PR from your branch (`candidate/<your-name>-<date>`) against `main`.

**Your PR must include:**

1. A live Vercel URL (web app deployed and working)
2. A link to your video (Loom, YouTube unlisted, or Google Drive)
3. A filled PR description (see `.github/pull_request_template.md`)

---

## Hard Requirements

These are blocking. Missing any of them is an automatic fail.

### 1. SPEC.md — before writing any code

Before you write a single line of implementation, create `SPEC.md` in the repo root. It must contain:

- Your acceptance criteria (what "done" means for each piece of this feature)
- Edge cases you identified
- Decisions you made that weren't specified in the brief (e.g., what happens when a logged-out user tries to submit?)
- Any assumptions you made

This is the most important signal for us. We can tell immediately if you thought through the problem or just started coding.

### 2. Cloud agent environment setup

Before starting implementation, set up a cloud agent session in one of these tools:
- **Codex web** (beta.openai.com)
- **Claude Code web** (claude.ai/code)
- **Cursor web** (if you have access)

Connect the repo to your cloud agent environment. Configure all required environment variables inside the tool.

Then take a screenshot showing:
- The repo connected
- Environment variables configured (NEXT_PUBLIC_API_URL, Supabase vars)

Include this screenshot in your PR description, OR commit it to `.screenshots/env-setup.png`.

**If you don't have access to any of these tools**, message us before starting. We'll discuss alternatives.

### 3. CLAUDE.md + AGENTS.md

Create both files in the repo root:

**CLAUDE.md** (or equivalent for your tool — `.cursorrules`, `CODEX.md`, etc.) — a context file that gives agents an accurate map of this codebase:
- Tech stack
- Key conventions
- What's already implemented
- What needs to be implemented
- Structural constraints (things agents must NOT do)

**AGENTS.md** — define at least 2 specialized agent roles. For example:
- An "Implementer" agent focused on writing code
- A "Reviewer" agent focused on adversarial code review

Each agent definition should include: its role, what it does, what it does NOT do, and any constraints.

### 4. Evidence of parallel agent sessions

Show us that you ran at least 2 agent sessions concurrently. Acceptable evidence:
- Screenshots of two terminal windows running agents simultaneously
- A git log where commits from two agents appear within minutes of each other
- Git worktree usage (show the worktree commands)

Include the evidence in your PR description or in `.screenshots/`.

### 5. skills.sh — find and use a relevant skill

Visit [skills.sh](https://skills.sh) and find at least one skill that's useful for this project.

In your PR description:
- Name the skill you chose
- Explain what it does
- Explain why you chose it for this project
- Show how you used it (command, output, or screenshot)

### 6. Supabase Auth

Create a free Supabase project (supabase.com — no credit card required).

Implement:
- Sign-up page (`/auth/signup`) with email + password + name
- Login page (`/auth/login`)
- Review form only shown to authenticated users
- JWT passed to the worker API in the `Authorization: Bearer <token>` header
- Basic session persistence (user stays logged in on refresh)

### 7. Vercel deployment

Deploy the web app to Vercel (free tier). The live URL must work end-to-end:
sign up → log in → submit a review → see it in the list.

The worker can run locally during the test — you don't need to deploy it to Cloudflare.

### 8. Task tracking board

Use any task management system you prefer. Options:
- **Vibe Kanban** (cloud.vibe-kanban.com) — the one we use
- **Linear**
- **Notion**, **GitHub Projects**, **Trello** — anything works

You must show at least 6 tasks you created (decomposed from the feature request), and the board must show some tasks in different states (todo, in progress, done).

Include a screenshot in your PR description.

### 9. CI must pass

All GitHub Actions checks must be green on your PR.

### 10. Video — 10 minutes max

Record a screen-share video covering the checklist below. No slides. No talking-head intro. Just your screen.

---

## Video Checklist

10 minutes maximum. Cover everything marked (required).

**[0:00–1:30] Your harness (required)**
- Show CLAUDE.md (or equivalent). Walk through the key sections.
- Show AGENTS.md. Explain your 2+ agent definitions.
- What constraints did you set? What did you learn while writing them?

**[1:30–3:00] Cloud agent environment (required)**
- Show your Codex / Claude Code / Cursor web session connected to this repo.
- Show the environment variables configured correctly.
- Walk through one task you assigned to this agent.

**[3:00–4:00] Task tracking board (required)**
- Show your board with at least 6 tasks.
- At least 3 tasks in different states.
- Walk through how you decomposed the feature request into tasks.

**[4:00–5:30] Parallel agents (required)**
- Show your evidence of ≥2 concurrent agent sessions.
- Explain how you scoped the tasks so agents didn't conflict with each other.
- What would have gone wrong if you'd run them sequentially instead?

**[5:30–6:30] skills.sh (required)**
- Navigate to skills.sh on screen.
- Show the skill you chose and explain your reasoning.
- Show it working in your workflow.

**[6:30–7:30] Live app (required)**
- Open your Vercel URL.
- Show the complete happy path: sign up → submit a review → review appears in list.

**[7:30–8:30] PR walkthrough (required)**
- Open your PR on GitHub.
- Walk through the diff — highlight one technical decision you made that wasn't in the spec.
- Show your AI-assisted code review (how did you run it? what did it flag?).

**[8:30–9:30] CI (required)**
- Show all checks passing on your PR.

**[9:30–10:00] What you'd improve (required)**
- One specific thing you'd do differently or add with more time. Be concrete.

**Bonus (if time allows)**
- Show git worktree usage for agent isolation
- Show the Expo mobile reviews screen working
- Show a PostHog event firing on review submission

---

## Bonus Points

These are not required but earn extra points:

- **Expo mobile screen**: Implement the `ReviewList` component in `mobile/app/business/[slug].tsx`
- **Git worktrees**: Use `git worktree` to run agents in parallel in isolated environments
- **Pre-commit hooks**: Set up at least one pre-commit check (lint, type check, or test)
- **PostHog event**: Fire a `review_submitted` event when a review is created
- **Continuation prompt**: Fill in `.claude/continuation-prompt-template.md` — shows you understand context management in long agent sessions

---

## What we're evaluating

We're not just evaluating whether the feature works. We're evaluating:

- **How you think** — does your SPEC.md show that you understood the problem deeply?
- **How you work** — does your process show maturity with agentic workflows?
- **How you communicate** — can another developer (or agent) pick up where you left off?

The best submissions will have a SPEC.md that reveals real engineering judgment, a CLAUDE.md that genuinely helps an agent understand the codebase, and a PR description that tells the full story of what was built and why.

---

## Harness improvement log

We specifically want to see this in your PR description:

> If an agent produced incorrect output during your session, document:
> 1. What went wrong
> 2. What harness fix you made to prevent it in the future (updated CLAUDE.md rule, added a constraint, improved a test)

This is the "every agent mistake becomes a permanent harness fix" principle. It's one of the most important habits we're hiring for.

---

## Questions?

If you have blockers or questions about the requirements — ask. We prefer you ask before spending time going in the wrong direction.

Message us via Upwork before starting if:
- You don't have access to Codex web, Claude Code web, or Cursor web
- You have questions about the expected behavior of the feature

Good luck.

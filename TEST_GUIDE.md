# Test Guide — Directorio Local Candidate Test

Welcome. This document explains exactly what we expect from you during this test.

**Read this entire file before writing a single line of code.**

---

## What this test is about

You're joining a small team that builds SaaS products with multi-agent systems. Every sprint, we decompose features into scoped tasks, assign them to agents, review the output critically, and ship.

This test simulates exactly that. You have a real codebase, a real feature request, and a real tech stack. We're not evaluating whether you can follow instructions — we're evaluating whether you can **think, decide, orchestrate, and deliver** the way a founding engineer on our team does.

**You have 24 hours from the moment you receive access to this repo.**

There is no extension. If you run out of time, submit what you have with an honest description of what's missing and why.

---

## What you're building

A consumer review system on a business directory app. See `FEATURE_REQUEST.md` for the full brief and `PRODUCT_BRIEF.md` for product context.

The feature intentionally leaves decisions up to you. That's on purpose — we want to see how you think, not just whether you can implement a predetermined spec.

---

## Deliverables

When you're done, open a PR from your branch (`candidate/<your-name>-<date>`) against `main`.

**Your PR must include:**

1. A live Vercel URL (web app deployed and working end-to-end)
2. A link to your video (Loom, YouTube unlisted, or Google Drive)
3. A filled PR description (see `.github/pull_request_template.md`)

---

## Hard Requirements

These are blocking. Missing any of them is an automatic fail.

---

### 1. SPEC.md — before writing any code

Before you write a single line of implementation, create `SPEC.md` in the repo root.

This document is the most important signal for us. We can tell immediately if you thought through the problem or just started coding.

`SPEC.md` must contain all of the following:

**Functional requirements**
List each behavior the feature must have, written as clear requirements:
> "The system shall allow authenticated users to submit exactly one review per business."
> "Anonymous users shall be able to read reviews but not submit them."

**Non-functional requirements**
Performance, security, and reliability constraints:
> "JWT tokens must be validated on the server before accepting review submissions."
> "Duplicate review attempts must return HTTP 409 with a human-readable error message in Spanish."

**User stories**
At least one story per actor. Use the format: *"As a [actor], I want to [action] so that [benefit]."*

Actors in this app: logged-in consumer, anonymous visitor.

**Acceptance criteria**
For each user story, list the specific conditions that make it "done."

**Edge cases**
Document the unusual scenarios you identified and how you handle them. Examples:
- What if the user submits with no rating?
- What if the business slug doesn't exist?
- What if the JWT is expired?

**Design decisions**
Every decision you made that wasn't explicitly specified in the feature request, with your reasoning.

---

### 2. Cloud agent environment setup

You're free to use your preferred local agent tool (Claude Code CLI, Cursor, Copilot, Cline) as your primary development environment. However, **we specifically want to see evidence that you also worked from a cloud agent environment.**

Set up a cloud session in one of these tools:
- **Codex web** (beta.openai.com)
- **Claude Code web** (claude.ai/code)
- **Cursor web** (if you have access)

Connect the repo to your cloud agent environment. Configure the required environment variables inside the tool.

Take a screenshot showing:
- The repo connected in the cloud environment
- Environment variables configured (NEXT_PUBLIC_API_URL, Supabase vars)

Include this screenshot in your PR description OR commit it to `.screenshots/env-setup.png`.

**If you don't have access to any of these tools**, message us on Upwork before starting. We'll find alternatives together.

---

### 3. CLAUDE.md + AGENTS.md

Create both files in the repo root.

**CLAUDE.md** (or equivalent for your tool — `.cursorrules`, `CODEX.md`, `AGENTS.md` for Codex, etc.)

A context file that gives agents an accurate map of this codebase:
- Tech stack and key conventions
- What's already implemented vs. what needs to be built
- Structural constraints — things agents must NOT do
- The "why" behind key architectural decisions

**AGENTS.md**

Define at least 2 specialized agent roles. For example:
- An **Implementer** agent: writes code, follows TDD, stops before merge
- A **Reviewer** agent: adversarial review, checks for edge cases, security, and consistency with spec

Each agent definition must include: its role, what it does, what it explicitly does NOT do, and any constraints or context it needs.

---

### 4. Evidence of parallel agent sessions

Show us that you ran at least 2 agent sessions concurrently.

Acceptable evidence:
- Screenshots of two terminal windows or cloud environments running agents at the same time
- A git log where commits from parallel tasks appear within minutes of each other
- Git worktree usage (show the `git worktree` commands)

**We'd particularly love to see you use Claude's multi-agent team feature** ([claude.ai agent teams docs](https://code.claude.com/docs/en/agent-teams)), or an equivalent in your preferred tool — where a parent agent orchestrates sub-agents on separate scoped tasks. If you use this pattern, explain how you designed the task boundaries.

Include your evidence in the PR description or in `.screenshots/`.

---

### 5. skills.sh — find and use a relevant skill

Visit [skills.sh](https://skills.sh) and find at least one skill that's genuinely useful for this project.

In your PR description:
- Name the skill you chose
- Explain what it does
- Explain why you chose it for this specific project
- Show how you used it (command, output, or screenshot)

---

### 6. MCP server usage

Use at least one MCP server during your workflow.

Options (pick what's useful for you):
- A database inspector MCP to explore the D1 schema
- A browser automation MCP for testing the live app
- A documentation fetcher MCP for Supabase or Cloudflare Workers docs
- Any other MCP server from the ecosystem

In your PR description, explain which MCP server you used, what you used it for, and why it was helpful.

---

### 7. AI-assisted code review

Before opening your PR, run an AI-assisted code review pass.

Options:
- Claude Code's built-in review agents (`/review` or equivalent)
- Greptile
- A custom review agent you configure yourself (using your AGENTS.md reviewer role)
- Any other AI review pipeline

In your PR description:
- Describe how you ran the review
- List at least 2 things the review flagged
- Explain what you changed (or decided not to change) as a result

---

### 8. Supabase Auth

Create a free Supabase project (supabase.com — no credit card required).

Implement:
- Sign-up page (`/auth/signup`) with name + email + password
- Login page (`/auth/login`)
- Review form shown only to authenticated users
- JWT passed to the worker API in the `Authorization: Bearer <token>` header
- Basic session persistence (user stays logged in on refresh)

---

### 9. Vercel deployment

Deploy the web app to Vercel (free tier). The live URL must work end-to-end:
sign up → log in → submit a review → see it in the review list.

The worker can run locally — you don't need to deploy it to Cloudflare for this test.

---

### 10. Task tracking board

Use any task management system you prefer:
- **Vibe Kanban** (cloud.vibe-kanban.com) — what we use internally, earns bonus points
- **Linear**, **Notion**, **GitHub Projects**, **Trello** — any system works

Show at least 6 tasks decomposed from the feature request. The board must show tasks in different states (todo, in progress, done).

Include a screenshot in your PR description.

---

### 11. CI must pass

All GitHub Actions checks must be green on your PR (worker tests + web build + lint).

---

### 12. Video — 10 minutes max

Record a screen-share video. No slides. No talking-head intro. Just your screen.

See the Video Checklist section below.

---

## Video Checklist

10 minutes maximum. Cover everything in this list.

Feel free to include any other information you find valuable — we appreciate candidates who show us things we didn't think to ask for.

**Your harness**
- Show your CLAUDE.md (or equivalent). Walk through the key sections and explain your reasoning.
- Show your AGENTS.md. Walk through your 2+ agent definitions. What constraints did you set? What did you learn writing them?

**Cloud agent environment**
- Show your cloud session (Codex / Claude Code / Cursor web) connected to this repo.
- Show the environment variables configured.
- Walk through one task you assigned to this cloud agent — show the session and the output.

**Task tracking board**
- Show your board with at least 6 tasks in different states.
- Walk through how you decomposed the feature request into discrete agent-friendly tasks.

**Parallel agents**
- Show your evidence of ≥2 concurrent agent sessions.
- Explain how you scoped tasks so agents didn't conflict.
- If you used Claude's multi-agent team or equivalent, walk through how you set it up.

**skills.sh**
- Navigate to skills.sh on screen.
- Show the skill you chose and explain your reasoning.
- Show it working in your workflow.

**MCP server**
- Show the MCP server you configured.
- Demonstrate it doing something useful during your workflow.

**Live app**
- Open your Vercel URL.
- Show the complete happy path: sign up → log in → submit a review → review appears in list.
- Show the design — walk through the UI choices you made and where you got inspiration.

**AI code review**
- Show how you ran the AI code review pass.
- Walk through one specific thing it flagged and what you did about it.

**PR walkthrough**
- Open your PR on GitHub.
- Highlight one technical decision you made that wasn't in the spec, and explain the tradeoff.
- Show CI passing.

**What you'd improve**
- One specific, concrete thing you'd do differently or add with more time.

**Bonus (if time allows)**
- Show git worktree usage for agent isolation
- Show the Expo mobile reviews screen working
- Show a PostHog event firing on review submission

---

## Bonus Points

Not required, but they earn extra points and signal the kind of engineer we're looking for:

- **Expo mobile screen**: Implement `ReviewList` in `mobile/app/business/[slug].tsx`
- **AI-generated UI mockup**: Use v0.dev, Figma AI, Stitch, or similar to pre-design the review UI before coding. Include a screenshot.
- **Git worktrees**: Use `git worktree` to run agents in parallel in isolated environments
- **Pre-commit hooks**: Set up at least one pre-commit check (lint, type check, or test)
- **PostHog event**: Fire a `review_submitted` event when a review is created
- **Vibe Kanban**: Use Vibe Kanban specifically as your task tracker (it's what we use — shows cultural fit)
- **Continuation prompt**: Fill in `.claude/continuation-prompt-template.md` — shows you understand context management in long agent sessions

---

## What we're evaluating

We're not just evaluating whether the feature works. We're evaluating:

- **How you think** — does your SPEC.md show that you understood the problem deeply?
- **How you work** — does your process show maturity with agentic workflows?
- **How you design** — does the UI show craft and intentionality?
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

If you have blockers or questions — ask. We prefer you ask before spending time going in the wrong direction.

Message us via Upwork before starting if:
- You don't have access to Codex web, Claude Code web, or Cursor web
- You have questions about the expected behavior of the feature

**The clock starts when you receive the repo invitation.**

Good luck.

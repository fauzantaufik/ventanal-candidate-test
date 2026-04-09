# Continuation Prompt Template

<!-- BONUS: Fill this in if you used Claude Code or a similar tool with context limits.
     
     WHAT IS A CONTINUATION PROMPT?
     ================================
     When a long agentic session approaches its context limit, the model's quality
     degrades — it starts "forgetting" earlier decisions, hallucinating state, and
     producing inconsistent output. A continuation prompt is a structured document
     you generate at ~50-60% context used, that lets you start a fresh session and
     pick up exactly where you left off — without losing any context.
     
     Think of it as a "save state" for your agent session.
     
     HOW IT WORKS IN PRACTICE:
     ==========================
     1. You monitor your context usage (Claude Code shows this in the status line)
     2. At ~50% used, you generate this filled-in document
     3. You start a fresh session and paste this as the opening prompt
     4. The fresh agent resumes with full context — no hallucinations, no drift
     
     OFFICIAL DOCUMENTATION:
     ========================
     - Claude Code context management:
       https://docs.anthropic.com/en/docs/claude-code/memory
       
     - Codex context and session management:
       https://platform.openai.com/docs/guides/codex
       
     - Multi-agent teams and context firewalls (Claude):
       https://code.claude.com/docs/en/agent-teams
       (Sub-agents run in isolated context — no context bleed between tasks)
     
     - Context rot research (why quality degrades at 40-50% context):
       Related: arXiv:2601.15300 — "Lost in the Middle: How Language Models Use
       Long Contexts" — models attend poorly to middle-of-context content.
       
     PRACTICAL TIPS:
     ===============
     - Watch the context percentage in your status bar
     - Scope sub-agent tasks with context firewalls — don't give every agent
       the full conversation history
     - Commit your work before context gets tight — git history is persistent context
     
     Fill in the sections below, then use this document as your opening message
     in a fresh agent session. -->

---

## Continuation Prompt

**Project:** Directorio Local — candidate test
**Feature:** Consumer review system
**Branch:** `candidate/<your-name>-<date>`
**Repo:** https://github.com/Innovaly-Group/ventanal-candidate-test

---

## What's done

<!-- List completed tasks and components. Be specific — include file paths. -->

- [ ] SPEC.md created
- [ ] CLAUDE.md created
- [ ] AGENTS.md created
- [ ] Supabase Auth initialized (lib/supabase.ts)
- [ ] Auth pages implemented (login + signup)
- [ ] Worker: POST /businesses/:slug/reviews endpoint
- [ ] Worker: GET /businesses/:slug/reviews endpoint
- [ ] ReviewForm component
- [ ] ReviewList component (State Triad: loading/empty/error)
- [ ] Vercel deployment live

---

## What's in progress

<!-- What was being worked on when you generated this prompt? -->

---

## What's left

<!-- Remaining tasks, in priority order -->

---

## Key decisions made

<!-- Summarize decisions so the fresh session doesn't re-derive them.
     This is critical — include decisions from your SPEC.md. -->

1. Auth approach: 
2. Duplicate review handling: 
3. Rating validation: 
4. UI design approach: 
5. Other decisions: 

---

## Files changed so far

<!-- List all modified or created files — the fresh session needs to know where to look -->

```
worker/src/routes/reviews.ts        — 
web/src/lib/supabase.ts             — 
web/src/app/auth/login/page.tsx     — 
web/src/app/auth/signup/page.tsx    — 
web/src/components/review-form.tsx  — 
web/src/components/review-list.tsx  — 
web/src/app/[slug]/page.tsx         — 
```

---

## Known issues / blockers

<!-- Anything the fresh session needs to watch out for -->

---

## Environment

```
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
```

---

## Continue from here

<!-- Write the exact instruction for the fresh session to resume work. Be specific. -->

You are continuing work on the Directorio Local candidate test.
Branch: `candidate/<your-name>-<date>` on https://github.com/Innovaly-Group/ventanal-candidate-test

Read SPEC.md and CLAUDE.md first to understand the context. Then continue with:

[YOUR SPECIFIC NEXT STEP HERE]

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
**Branch:** `candidate/fauzan-20260409`
**Repo:** https://github.com/Innovaly-Group/ventanal-candidate-test

---

## What's done

- [x] `SPEC.md` created and aligned to the candidate brief
- [x] `CLAUDE.md` created with repo structure, boundaries, and workflow guidance
- [x] `AGENTS.md` created with specialized frontend/backend/mobile/reviewer roles
- [x] Supabase client initialized in `web/src/lib/supabase.ts`
- [x] Auth pages implemented in `web/src/app/auth/login/page.tsx` and `web/src/app/auth/signup/page.tsx`
- [x] Worker review endpoints implemented in `worker/src/routes/reviews.ts`
- [x] `ReviewForm` implemented in `web/src/components/review-form.tsx`
- [x] `ReviewList` implemented in `web/src/components/review-list.tsx` with loading/empty/error states
- [ ] Bonus items and final PR polish still pending
- [x] Live Vercel flow still needs final end-to-end confirmation

---

## What's in progress

- Finishing candidate-test polish and bonus evidence

---

## What's left

<!-- 1. Complete optional bonus item (fastest candidates: continuation prompt or mobile review list)
2. Verify the deployed web flow end-to-end: sign up → log in → submit review → see review appear
3. Run final verification checks before submission -->

---

## Key decisions made

1. **Auth approach:** Use Supabase Auth on the web app and send the access token in `Authorization: Bearer <token>` to the worker.
2. **Duplicate review handling:** Enforce one review per user per business at the database level and return HTTP `409` with a user-friendly message.
3. **Rating validation:** Only integer ratings from `1` to `5` are accepted; malformed review payloads return `400`.
4. **UI design approach:** Keep the review UX lightweight, bilingual-friendly, and consistent with the existing directory styles.
5. **Other decisions:** Reviews remain publicly readable, but only authenticated users can submit them.

---

## Files changed so far

```txt
SPEC.md                               — feature specification and acceptance criteria
CLAUDE.md                             — repo conventions and architecture guidance
AGENTS.md                             — specialized agent boundaries and responsibilities
worker/src/routes/reviews.ts          — public GET reviews + auth-gated POST reviews
web/src/lib/supabase.ts               — Supabase browser client setup
web/src/app/auth/login/page.tsx       — login screen
web/src/app/auth/signup/page.tsx      — signup screen
web/src/components/review-form.tsx    — authenticated review submission UI
web/src/components/review-list.tsx    — review list with state triad and pagination
web/src/app/[slug]/page.tsx           — business detail page integration
mobile/app/business/[slug].tsx        — bonus mobile review section stub
```

---

## Known issues / blockers

- Supabase/Vercel environment variables must match the deployed environment exactly for the auth flow to work end-to-end.
- The worker may run locally while the web app is deployed, so CORS and origin configuration should be double-checked during final verification.
- Bonus items are optional; prioritize required acceptance criteria before extra polish.

---

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
```

---

## Continue from here

You are continuing work on the Directorio Local candidate test.
Branch: `candidate/fauzan-20260409` on https://github.com/Innovaly-Group/ventanal-candidate-test

Read `SPEC.md` and `CLAUDE.md` first to re-establish context. Then:

1. Verify the current review flow in the web app.
2. Finish the fastest remaining bonus item.
3. Update the PR description with evidence for cloud agent usage, parallel agents, MCP usage, AI review, and this continuation prompt.
4. Run final checks before submission.

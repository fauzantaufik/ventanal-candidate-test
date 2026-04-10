---
name: context-management
description: "Optimize Claude's understanding of projects through strategic context setup and knowledge accumulation. Use this skill when the user wants to: set up CLAUDE.md files, run /init for project analysis, add persistent memory with # commands, configure file references with @ syntax, diagnose poor AI responses due to context issues, establish coding conventions and architectural patterns, or improve Claude's project-specific knowledge. TRIGGER when: user asks about project setup, memory management, improving AI responses, or managing Claude's understanding of their codebase"
---

# Context Management

Guide Claude to build and maintain rich project context so it stops asking obvious questions and gives project-aware answers.

## Quick Reference

| Tool        | When to use                                       |
| ----------- | ------------------------------------------------- |
| `/init`     | First time on a project, or after major refactors |
| `# <note>`  | Discovered a pattern or convention worth keeping  |
| `@filename` | Ask about or reference a specific file            |

## Setup (do once)

1. Run `/init` — Claude reads the codebase and generates `CLAUDE.md`
2. Review the generated file — check that architecture, conventions, and key files are correct
3. Commit it — this becomes the team's shared knowledge baseline

Re-run `/init` after major refactors or when Claude's answers start feeling generic.

## Growing knowledge over time

Use `#` to add persistent notes mid-conversation:

```
# always use pnpm, not npm
# auth tokens go in Authorization header, not cookies
# migrations must be reversible
```

Claude merges these into the right `CLAUDE.md` section automatically. Do this whenever you catch yourself explaining the same thing twice.

## What belongs in CLAUDE.md

**Keep it:**

- Architecture patterns and data flow
- Auth/error handling conventions
- DB interaction patterns
- Testing approach
- Deploy and env specifics

**Leave it out:**

- Specific bug fixes (put it in a commit message)
- Entire file contents (use `@file` references instead)
- Frequently changing implementation details
- Current WIP state

## Using `@` for file references

In conversation: `@src/lib/auth.ts` — Claude reads that file in context  
In CLAUDE.md: add critical files so Claude always has them loaded

Only reference files that are architecturally important, not every file.

## Diagnosing context quality

**Good signs:**

- Suggestions match your project's patterns without prompting
- Responses reference your actual file structure
- No repeated explanations of the same concept

**Bad signs:**

- Generic advice that ignores your stack
- Conflicting suggestions with existing code
- Slow or inconsistent responses (context overload)
- Claude asks about files it should know

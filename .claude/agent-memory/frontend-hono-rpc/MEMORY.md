# Frontend Agent Memory

## Key Patterns

### Supabase client initialization
`web/src/lib/supabase.ts` was a module-level singleton that threw at import time when env vars were missing, breaking static prerendering. Refactored to a lazy getter with a Proxy so the throw only happens at first actual runtime use. See `supabase.ts` for the pattern.

### useSearchParams requires Suspense boundary
In Next.js 15 App Router, any client component using `useSearchParams()` must be wrapped in `<Suspense>`. Pattern: keep the page default export as a thin shell that wraps the real form component in `<Suspense fallback={...}>`. The inner component carries `'use client'` via the file directive.

### React import for Suspense in this project
Due to dual-version React types in the monorepo, importing `Suspense` from `'react'` requires `import React, { Suspense, ... } from 'react'` (namespace import) to avoid a JSX type error during `next build`.

### No shadcn/ui installed
`web/package.json` has no shadcn/ui dependency. Use plain Tailwind CSS matching the existing component style (white card `bg-white rounded-xl border border-gray-200 p-8`, blue primary button, red error states).

### Build command
`cd web && node_modules/.bin/next build` (pnpm binary may not be on PATH in this worktree; use the local bin directly or install first with `pnpm install`).

## File Paths
- Signup page: `web/src/app/auth/signup/page.tsx`
- Login page: `web/src/app/auth/login/page.tsx`
- Supabase client: `web/src/lib/supabase.ts`
- API client: `web/src/lib/api.ts`
- Business card: `web/src/components/business-card.tsx`

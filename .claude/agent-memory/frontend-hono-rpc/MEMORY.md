# Frontend Agent Memory

## Key Patterns

### Hono RPC type inference
When a worker route file is a stub (no implemented routes/validators), `InferResponseType<typeof client.businesses[':slug'].reviews.$get, 200>` resolves to `unknown`. Use a manual typed fetch with a locally defined interface instead, and cast the response. See `web/src/lib/api.ts` `getReviews` for the pattern.

### No shadcn installed
The web workspace has NO shadcn/ui components. Only Tailwind CSS is available. All UI states (loading, error, empty, data) must use plain Tailwind. Do not attempt to import from `@/components/ui/`.

### Build command
`pnpm --filter web build` fails if node_modules are not installed (next binary not found). Use `cd web && node_modules/.bin/next build` as a fallback after confirming `pnpm install` has run. The installed binaries live at `web/node_modules/.bin/next`.

### ReviewList state triad
The `ReviewList` component implements 4 states: loading (3 skeleton cards with animate-pulse), error (red alert + Reintentar button), empty (friendly Spanish message), data (review cards + load-more pagination). See `web/src/components/review-list.tsx`.

### API_URL for manual fetch
`API_URL` is defined in `web/src/lib/api.ts` but not exported. For manual fetch calls in the same file, reference it directly. Do not re-declare it in components.

## File Map
- `web/src/lib/api.ts` — Hono RPC client + typed fetch helpers
- `web/src/components/review-list.tsx` — ReviewList with full state triad
- `web/src/components/review-form.tsx` — stub, not yet implemented
- `web/src/components/business-card.tsx` — implemented, uses `Business` type from api.ts
- `web/src/app/[slug]/page.tsx` — business detail page (server component)
- `web/src/app/page.tsx` — listing page (server component)

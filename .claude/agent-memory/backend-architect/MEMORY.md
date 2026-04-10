# Backend Architect Memory

## Critical: D1 migrations are NOT auto-applied in Vitest tests

`@cloudflare/vitest-pool-workers` does NOT automatically apply wrangler migrations to the in-memory Miniflare D1. The D1 starts completely empty each test run.

**Fix:** Add a `test/setup.ts` that runs DDL + seed SQL via `env.DB` in a `beforeAll`, and wire it in `vitest.config.ts` as `setupFiles: ['./test/setup.ts']`.

Use `INSERT OR IGNORE` for seed data so the setup is idempotent. Execute statements one at a time (D1 does not support multi-statement batches via `prepare()`).

See: `worker/test/setup.ts`, `worker/vitest.config.ts`

## Running vitest in this pnpm monorepo on Windows

`vitest` is not in PATH because pnpm uses a virtual store with no `.bin` symlinks accessible from bash. Use:

```bash
cd worker/
node "../node_modules/.pnpm/@cloudflare+vitest-pool-wor_a0995b4672ec6a313e74eada5918bf2f/node_modules/vitest/vitest.mjs" run --reporter=verbose
```

The hash in the path may change if dependencies are updated. Find the right path with:
```bash
find node_modules/.pnpm -maxdepth 1 -name "@cloudflare+vitest-pool-wor*"
```

## Route patterns

- No `@hono/zod-validator` installed — use `c.req.query()` with manual `parseInt` and clamping, matching `businesses.ts` pattern.
- Route modules follow thin Hono handler pattern: param extraction, DB queries, return JSON.
- Reviews endpoint: resolve slug to business_id first (404 if not found), then paginated SELECT, then COUNT for meta.
- Never expose `user_email` or `user_id` in GET /reviews response — SELECT only the public fields.

## Test file patterns

- Import `env, createExecutionContext, waitOnExecutionContext` from `cloudflare:test`
- Cast `env` as `{ DB: D1Database }` to access D1 directly for seeding
- `beforeAll` in test file handles per-suite data seeding (DELETE + INSERT with explicit IDs and timestamps)
- Use explicit `created_at` timestamps in seed data to make ORDER BY DESC assertions deterministic

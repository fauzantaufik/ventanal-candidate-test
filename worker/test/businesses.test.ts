import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../src/index.js';

// This is the one example test included in the base repo.
// It verifies that the businesses endpoint works before the candidate starts.
// Add more tests in test/reviews.test.ts as part of your implementation.

describe('GET /businesses', () => {
  it('returns a list of businesses', async () => {
    const request = new Request('http://localhost/businesses');
    const ctx = createExecutionContext();
    const response = await app.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    const body = await response.json() as { data: unknown[]; meta: { total: number } };
    expect(body.data).toBeInstanceOf(Array);
    expect(body.meta.total).toBeGreaterThan(0);
  });

  it('returns a single business by slug', async () => {
    const request = new Request('http://localhost/businesses/la-cocina-de-maria');
    const ctx = createExecutionContext();
    const response = await app.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    const body = await response.json() as { data: { slug: string; name: string } };
    expect(body.data.slug).toBe('la-cocina-de-maria');
    expect(body.data.name).toBe('La Cocina de María');
  });

  it('returns 404 for unknown slug', async () => {
    const request = new Request('http://localhost/businesses/non-existent');
    const ctx = createExecutionContext();
    const response = await app.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(404);
  });
});

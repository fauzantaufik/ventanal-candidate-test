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

  it('derives review_count and avg_rating from the actual reviews table', async () => {
    const request = new Request('http://localhost/businesses/la-cocina-de-maria');
    const ctx = createExecutionContext();
    const response = await app.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    const body = await response.json() as { data: { review_count: number; avg_rating: number } };

    // The default test DB has no seeded review rows; the API should not expose stale
    // aggregate values from the businesses table that would make the detail header and
    // the actual review list disagree.
    expect(body.data.review_count).toBe(0);
    expect(body.data.avg_rating).toBe(0);
  });

  it('returns 404 for unknown slug', async () => {
    const request = new Request('http://localhost/businesses/non-existent');
    const ctx = createExecutionContext();
    const response = await app.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(404);
  });
});

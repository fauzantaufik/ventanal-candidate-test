import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import app from '../src/index.js';

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

  it('filters businesses by search in the business name, case-insensitively', async () => {
    const request = new Request('http://localhost/businesses?search=YOGA');
    const ctx = createExecutionContext();
    const response = await app.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    const body = await response.json() as {
      data: Array<{ slug: string; name: string }>;
      meta: { total: number };
    };

    expect(body.meta.total).toBe(1);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.slug).toBe('bienestar-yoga-studio');
    expect(body.data[0]?.name).toBe('Bienestar Yoga Studio');
  });

  it('filters businesses by search in the description, case-insensitively', async () => {
    const request = new Request('http://localhost/businesses?search=BRASA');
    const ctx = createExecutionContext();
    const response = await app.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    const body = await response.json() as {
      data: Array<{ slug: string; name: string }>;
      meta: { total: number };
    };

    expect(body.meta.total).toBe(1);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.slug).toBe('el-asador-del-llano');
    expect(body.data[0]?.name).toBe('El Asador del Llano');
  });

  it('combines search with category and city filters', async () => {
    const request = new Request(
      'http://localhost/businesses?search=INTEGRAL&category=salud-bienestar&city=Caracas'
    );
    const ctx = createExecutionContext();
    const response = await app.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    const body = await response.json() as {
      data: Array<{ slug: string; city: string; category_slug: string }>;
      meta: { total: number };
    };

    expect(body.meta.total).toBe(1);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.slug).toBe('clinica-dental-sonrisa');
    expect(body.data[0]?.city).toBe('Caracas');
    expect(body.data[0]?.category_slug).toBe('salud-bienestar');
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

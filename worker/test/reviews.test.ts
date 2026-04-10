import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../src/index.js';

// Helpers
async function fetchReviews(slug: string, params: Record<string, string | number> = {}) {
  const url = new URL(`http://localhost/businesses/${slug}/reviews`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const ctx = createExecutionContext();
  const response = await app.fetch(new Request(url.toString()), env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

// Seed reviews into the in-memory D1 before tests run.
// The migration already ran (via wrangler config), so the tables exist and businesses are seeded.
beforeAll(async () => {
  const db = (env as unknown as { DB: D1Database }).DB;

  // Clear any leftover reviews from a previous run
  await db.prepare('DELETE FROM reviews WHERE business_id = ?').bind('biz-01').run();
  await db.prepare('DELETE FROM reviews WHERE business_id = ?').bind('biz-02').run();

  // Insert 3 reviews for biz-01 (la-cocina-de-maria) with explicit timestamps for ordering
  await db
    .prepare(
      `INSERT INTO reviews (id, business_id, user_id, user_name, user_email, rating, comment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind('rev-01', 'biz-01', 'user-a', 'Ana Rodríguez', 'ana@test.com', 5, 'Excelente comida', '2024-03-01 10:00:00')
    .run();

  await db
    .prepare(
      `INSERT INTO reviews (id, business_id, user_id, user_name, user_email, rating, comment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind('rev-02', 'biz-01', 'user-b', 'Pedro Gómez', 'pedro@test.com', 4, 'Muy buen trato', '2024-03-02 12:00:00')
    .run();

  await db
    .prepare(
      `INSERT INTO reviews (id, business_id, user_id, user_name, user_email, rating, comment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind('rev-03', 'biz-01', 'user-c', 'Lucía Torres', 'lucia@test.com', 3, null, '2024-03-03 09:00:00')
    .run();
});

describe('GET /businesses/:slug/reviews', () => {
  it('returns reviews for a valid business slug with correct shape (200)', async () => {
    const response = await fetchReviews('la-cocina-de-maria');

    expect(response.status).toBe(200);

    const body = await response.json() as {
      data: Array<{
        id: string;
        user_name: string;
        rating: number;
        comment: string | null;
        created_at: string;
      }>;
      meta: { total: number; limit: number; offset: number };
    };

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(3);

    // Shape check on a single review
    const first = body.data[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('user_name');
    expect(first).toHaveProperty('rating');
    expect(first).toHaveProperty('comment');
    expect(first).toHaveProperty('created_at');

    // Meta shape
    expect(body.meta.total).toBe(3);
    expect(body.meta.limit).toBe(10);
    expect(body.meta.offset).toBe(0);
  });

  it('returns empty array when business has no reviews (200)', async () => {
    // biz-02 (el-asador-del-llano) has no seeded reviews in this test run
    const response = await fetchReviews('el-asador-del-llano');

    expect(response.status).toBe(200);

    const body = await response.json() as {
      data: unknown[];
      meta: { total: number; limit: number; offset: number };
    };

    expect(body.data).toEqual([]);
    expect(body.meta.total).toBe(0);
    expect(body.meta.limit).toBe(10);
    expect(body.meta.offset).toBe(0);
  });

  it('returns 404 for a non-existent slug', async () => {
    const response = await fetchReviews('negocio-inexistente');

    expect(response.status).toBe(404);

    const body = await response.json() as { error: string };
    expect(body.error).toBe('Negocio no encontrado');
  });

  it('respects limit query param', async () => {
    const response = await fetchReviews('la-cocina-de-maria', { limit: 2 });

    expect(response.status).toBe(200);

    const body = await response.json() as {
      data: unknown[];
      meta: { total: number; limit: number; offset: number };
    };

    expect(body.data.length).toBe(2);
    expect(body.meta.limit).toBe(2);
    expect(body.meta.total).toBe(3); // total stays 3 even when limit restricts page
  });

  it('respects offset query param', async () => {
    const response = await fetchReviews('la-cocina-de-maria', { limit: 2, offset: 2 });

    expect(response.status).toBe(200);

    const body = await response.json() as {
      data: unknown[];
      meta: { total: number; limit: number; offset: number };
    };

    expect(body.data.length).toBe(1); // 3 total - 2 offset = 1 remaining
    expect(body.meta.offset).toBe(2);
    expect(body.meta.total).toBe(3);
  });

  it('orders reviews by created_at DESC (newest first)', async () => {
    const response = await fetchReviews('la-cocina-de-maria');

    expect(response.status).toBe(200);

    const body = await response.json() as {
      data: Array<{ id: string; created_at: string }>;
      meta: unknown;
    };

    // Verify descending order: rev-03 (2024-03-03) > rev-02 (2024-03-02) > rev-01 (2024-03-01)
    expect(body.data[0].id).toBe('rev-03');
    expect(body.data[1].id).toBe('rev-02');
    expect(body.data[2].id).toBe('rev-01');

    // Also verify timestamps are non-increasing
    const timestamps = body.data.map((r) => r.created_at);
    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i] >= timestamps[i + 1]).toBe(true);
    }
  });

  it('does NOT expose user_email or user_id in the response', async () => {
    const response = await fetchReviews('la-cocina-de-maria');

    expect(response.status).toBe(200);

    const body = await response.json() as { data: Array<Record<string, unknown>>; meta: unknown };

    for (const review of body.data) {
      expect(review).not.toHaveProperty('user_email');
      expect(review).not.toHaveProperty('user_id');
    }
  });
});

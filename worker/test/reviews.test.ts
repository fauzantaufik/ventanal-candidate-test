import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../src/index.js';

// ---------------------------------------------------------------------------
// Shared test helpers
// ---------------------------------------------------------------------------

/** Base64url-encode a UTF-8 string (JWT header / payload). */
function base64urlEncodeStr(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** Base64url-encode a raw ArrayBuffer (JWT signature). */
function base64urlEncodeBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Create a minimal HS256 JWT signed with the given secret.
 * Uses the Web Crypto API — works identically inside the Workers runtime.
 */
async function createTestJWT(
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const header = base64urlEncodeStr(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64urlEncodeStr(JSON.stringify(payload));
  const unsigned = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${base64urlEncodeBuffer(sig)}`;
}

/** The test secret must match wrangler.toml [vars] SUPABASE_JWT_SECRET. */
const TEST_JWT_SECRET = 'test-secret-for-dev';

/** Future epoch (year 2099) so tokens never expire during tests. */
const FAR_FUTURE = Math.floor(new Date('2099-01-01').getTime() / 1000);

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

async function postReview(
  slug: string,
  payload: unknown,
  authHeader?: string,
) {
  const url = `http://localhost/businesses/${slug}/reviews`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader !== undefined) headers['Authorization'] = authHeader;

  const ctx = createExecutionContext();
  const response = await app.fetch(
    new Request(url, { method: 'POST', headers, body: JSON.stringify(payload) }),
    env,
    ctx,
  );
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

// ---------------------------------------------------------------------------
// POST /businesses/:slug/reviews
// ---------------------------------------------------------------------------

describe('POST /businesses/:slug/reviews', () => {
  it('201 — valid JWT and valid payload inserts review and updates business aggregates', async () => {
    const token = await createTestJWT(
      {
        sub: 'user-post-01',
        email: 'nuevo@test.com',
        user_metadata: { full_name: 'Usuario Nuevo' },
        exp: FAR_FUTURE,
      },
      TEST_JWT_SECRET,
    );

    // biz-02 (el-asador-del-llano) has 0 reviews after beforeAll cleanup
    const response = await postReview(
      'el-asador-del-llano',
      { rating: 5, comment: 'Excelente parrilla!' },
      `Bearer ${token}`,
    );

    expect(response.status).toBe(201);

    const body = await response.json() as {
      success: boolean;
      data: { id: string; user_name: string; rating: number; comment: string | null; created_at: string };
      business: { avg_rating: number; review_count: number };
    };

    expect(body.success).toBe(true);

    // Review shape
    expect(body.data.id).toMatch(/^rev-/);
    expect(body.data.user_name).toBe('Usuario Nuevo');
    expect(body.data.rating).toBe(5);
    expect(body.data.comment).toBe('Excelente parrilla!');
    expect(typeof body.data.created_at).toBe('string');

    // Business aggregates recalculated — only 1 review with rating 5
    expect(body.business.review_count).toBe(1);
    expect(body.business.avg_rating).toBe(5);
  });

  it('201 — comment is optional (null omitted from payload)', async () => {
    const token = await createTestJWT(
      { sub: 'user-post-02', email: 'solo-rating@test.com', exp: FAR_FUTURE },
      TEST_JWT_SECRET,
    );

    // Use biz-03 (sushi-nikkei-caracas) — no prior reviews in this run
    const response = await postReview(
      'sushi-nikkei-caracas',
      { rating: 4 },
      `Bearer ${token}`,
    );

    expect(response.status).toBe(201);
    const body = await response.json() as { success: boolean; data: { comment: string | null } };
    expect(body.success).toBe(true);
    expect(body.data.comment).toBeNull();
  });

  it('400 — rating below range (0)', async () => {
    const token = await createTestJWT(
      { sub: 'user-val-01', email: 'val@test.com', exp: FAR_FUTURE },
      TEST_JWT_SECRET,
    );
    const response = await postReview('el-asador-del-llano', { rating: 0 }, `Bearer ${token}`);
    expect(response.status).toBe(400);
    const body = await response.json() as { error: string };
    expect(body.error).toMatch(/calificación/);
  });

  it('400 — rating above range (6)', async () => {
    const token = await createTestJWT(
      { sub: 'user-val-02', email: 'val2@test.com', exp: FAR_FUTURE },
      TEST_JWT_SECRET,
    );
    const response = await postReview('el-asador-del-llano', { rating: 6 }, `Bearer ${token}`);
    expect(response.status).toBe(400);
    const body = await response.json() as { error: string };
    expect(body.error).toMatch(/calificación/);
  });

  it('400 — rating is a string, not an integer', async () => {
    const token = await createTestJWT(
      { sub: 'user-val-03', email: 'val3@test.com', exp: FAR_FUTURE },
      TEST_JWT_SECRET,
    );
    const response = await postReview('el-asador-del-llano', { rating: '5' }, `Bearer ${token}`);
    expect(response.status).toBe(400);
  });

  it('400 — comment exceeds 500 characters', async () => {
    const token = await createTestJWT(
      { sub: 'user-val-04', email: 'val4@test.com', exp: FAR_FUTURE },
      TEST_JWT_SECRET,
    );
    const longComment = 'a'.repeat(501);
    const response = await postReview(
      'el-asador-del-llano',
      { rating: 3, comment: longComment },
      `Bearer ${token}`,
    );
    expect(response.status).toBe(400);
    const body = await response.json() as { error: string };
    expect(body.error).toMatch(/500/);
  });

  it('401 — missing Authorization header', async () => {
    const response = await postReview('el-asador-del-llano', { rating: 4 }, undefined);
    expect(response.status).toBe(401);
    const body = await response.json() as { error: string };
    expect(body.error).toMatch(/autenticaci/i);
  });

  it('401 — invalid JWT (signed with wrong secret)', async () => {
    const token = await createTestJWT(
      { sub: 'user-bad', email: 'bad@test.com', exp: FAR_FUTURE },
      'wrong-secret',
    );
    const response = await postReview('el-asador-del-llano', { rating: 4 }, `Bearer ${token}`);
    expect(response.status).toBe(401);
    const body = await response.json() as { error: string };
    expect(body.error).toMatch(/inválido|expirado/);
  });

  it('401 — expired JWT', async () => {
    const pastEpoch = Math.floor(new Date('2000-01-01').getTime() / 1000);
    const token = await createTestJWT(
      { sub: 'user-expired', email: 'expired@test.com', exp: pastEpoch },
      TEST_JWT_SECRET,
    );
    const response = await postReview('el-asador-del-llano', { rating: 4 }, `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it('404 — unknown business slug', async () => {
    const token = await createTestJWT(
      { sub: 'user-404', email: 'no-biz@test.com', exp: FAR_FUTURE },
      TEST_JWT_SECRET,
    );
    const response = await postReview('negocio-inexistente', { rating: 3 }, `Bearer ${token}`);
    expect(response.status).toBe(404);
    const body = await response.json() as { error: string };
    expect(body.error).toBe('Negocio no encontrado');
  });

  it('409 — same user submits a second review for the same business', async () => {
    const token = await createTestJWT(
      { sub: 'user-409', email: 'duplicado@test.com', exp: FAR_FUTURE },
      TEST_JWT_SECRET,
    );

    // biz-04 (techfix-hogar) — pristine for this user
    const first = await postReview('techfix-hogar', { rating: 5 }, `Bearer ${token}`);
    expect(first.status).toBe(201);

    const second = await postReview('techfix-hogar', { rating: 3 }, `Bearer ${token}`);
    expect(second.status).toBe(409);

    const body = await second.json() as { error: string };
    expect(body.error).toBe('Ya dejaste una reseña para este negocio.');
  });
});


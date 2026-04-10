import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { SignJWT, exportJWK, generateKeyPair } from 'jose';
import app from '../src/index.js';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

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
  body: Record<string, unknown>,
  token?: string
) {
  const url = `http://localhost/businesses/${slug}/reviews`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const ctx = createExecutionContext();
  const response = await app.fetch(
    new Request(url, { method: 'POST', headers, body: JSON.stringify(body) }),
    env,
    ctx
  );
  await waitOnExecutionContext(ctx);
  return response;
}

/** Create a valid HS256 JWT signed with the test secret. */
async function makeToken(userId: string, email: string, name: string): Promise<string> {
  const secret = new TextEncoder().encode('test-secret');
  return new SignJWT({ sub: userId, email, user_metadata: { full_name: name } })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

// ---------------------------------------------------------------------------
// Seed reviews into the in-memory D1 before tests run.
// The migration already ran (via wrangler config), so the tables exist and businesses are seeded.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// GET tests (existing, preserved)
// ---------------------------------------------------------------------------
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
// POST tests — use biz-02 (el-asador-del-llano) to avoid polluting GET test data
// Clean up after each test so duplicate checks don't bleed across cases
// ---------------------------------------------------------------------------
describe('POST /businesses/:slug/reviews', () => {
  const POST_SLUG = 'el-asador-del-llano';
  const POST_BIZ_ID = 'biz-02';

  afterEach(async () => {
    const db = (env as unknown as { DB: D1Database }).DB;
    await db.prepare('DELETE FROM reviews WHERE business_id = ?').bind(POST_BIZ_ID).run();
    // Reset aggregates so biz-02 reads cleanly for the empty-reviews GET test above
    await db
      .prepare('UPDATE businesses SET avg_rating = 0, review_count = 0 WHERE id = ?')
      .bind(POST_BIZ_ID)
      .run();
  });

  it('returns 401 when Authorization header is missing', async () => {
    const response = await postReview(POST_SLUG, { rating: 4 });
    expect(response.status).toBe(401);
    const body = await response.json() as { error: string };
    expect(body.error).toBe('Tu sesión no es válida. Inicia sesión de nuevo.');
  });

  it('returns 401 for a malformed / invalid token', async () => {
    const response = await postReview(POST_SLUG, { rating: 4 }, 'not.a.valid.jwt');
    expect(response.status).toBe(401);
    const body = await response.json() as { error: string };
    expect(body.error).toBe('Tu sesión no es válida. Inicia sesión de nuevo.');
  });

  it('returns 201 with correct shape on first valid review', async () => {
    const token = await makeToken('user-post-01', 'maria@test.com', 'María López');
    const response = await postReview(POST_SLUG, { rating: 5, comment: 'La mejor parrilla' }, token);

    expect(response.status).toBe(201);

    const body = await response.json() as {
      success: boolean;
      data: {
        id: string;
        user_name: string;
        rating: number;
        comment: string | null;
        created_at: string;
      };
      business: { avg_rating: number; review_count: number };
    };

    expect(body.success).toBe(true);

    // data shape
    expect(body.data).toHaveProperty('id');
    expect(typeof body.data.id).toBe('string');
    expect(body.data.user_name).toBe('María López');
    expect(body.data.rating).toBe(5);
    expect(body.data.comment).toBe('La mejor parrilla');
    expect(body.data).toHaveProperty('created_at');

    // private fields must not leak
    expect(body.data).not.toHaveProperty('user_email');
    expect(body.data).not.toHaveProperty('user_id');

    // aggregates updated
    expect(body.business.review_count).toBe(1);
    expect(body.business.avg_rating).toBe(5);
  });

  it('accepts a valid Supabase-style JWKS token', async () => {
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    const jwk = await exportJWK(publicKey);
    const originalFetch = globalThis.fetch;
    const originalSecret = (env as unknown as { SUPABASE_JWT_SECRET?: string }).SUPABASE_JWT_SECRET;
    const originalJwksUrl = (env as unknown as { SUPABASE_JWKS_URL?: string }).SUPABASE_JWKS_URL;

    (env as unknown as { SUPABASE_JWT_SECRET?: string }).SUPABASE_JWT_SECRET = undefined;
    (env as unknown as { SUPABASE_JWKS_URL?: string }).SUPABASE_JWKS_URL = 'https://example-project.supabase.co/auth/v1/.well-known/jwks.json';

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

        if (url === 'https://example-project.supabase.co/auth/v1/.well-known/jwks.json') {
          return new Response(
            JSON.stringify({
              keys: [{ ...jwk, kid: 'review-test-key', use: 'sig', alg: 'RS256' }],
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        return originalFetch(input);
      })
    );

    try {
      const token = await new SignJWT({
        email: 'jwks@test.com',
        user_metadata: { full_name: 'JWKS User' },
      })
        .setProtectedHeader({ alg: 'RS256', kid: 'review-test-key' })
        .setSubject('user-jwks-01')
        .setIssuer('https://example-project.supabase.co/auth/v1')
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(privateKey);

      const response = await postReview(POST_SLUG, { rating: 5, comment: 'Token firmado por JWKS' }, token);
      expect(response.status).toBe(201);

      const body = await response.json() as {
        success: boolean;
        data: { user_name: string; rating: number; comment: string | null };
      };

      expect(body.success).toBe(true);
      expect(body.data.user_name).toBe('JWKS User');
      expect(body.data.rating).toBe(5);
      expect(body.data.comment).toBe('Token firmado por JWKS');
    } finally {
      vi.unstubAllGlobals();
      (env as unknown as { SUPABASE_JWT_SECRET?: string }).SUPABASE_JWT_SECRET = originalSecret;
      (env as unknown as { SUPABASE_JWKS_URL?: string }).SUPABASE_JWKS_URL = originalJwksUrl;
    }
  });

  it('updates avg_rating correctly when multiple reviews exist in DB for that business', async () => {
    const db = (env as unknown as { DB: D1Database }).DB;

    // Pre-seed a rating=3 review so the average can be computed
    await db
      .prepare(
        `INSERT INTO reviews (id, business_id, user_id, user_name, user_email, rating, comment, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      )
      .bind('pre-seed-rev', POST_BIZ_ID, 'user-pre', 'Pre User', 'pre@test.com', 3, null)
      .run();
    await db
      .prepare('UPDATE businesses SET avg_rating = 3, review_count = 1 WHERE id = ?')
      .bind(POST_BIZ_ID)
      .run();

    const token = await makeToken('user-post-02', 'jose@test.com', 'José Pérez');
    const response = await postReview(POST_SLUG, { rating: 5 }, token);

    expect(response.status).toBe(201);
    const body = await response.json() as {
      success: boolean;
      business: { avg_rating: number; review_count: number };
    };

    expect(body.business.review_count).toBe(2);
    // avg of 3 and 5 = 4.0
    expect(body.business.avg_rating).toBeCloseTo(4.0);
  });

  it('returns 409 when the same user submits a duplicate review', async () => {
    const token = await makeToken('user-dup', 'dup@test.com', 'Dup User');

    // First review — should succeed
    const first = await postReview(POST_SLUG, { rating: 4 }, token);
    expect(first.status).toBe(201);

    // Second review — must be rejected
    const second = await postReview(POST_SLUG, { rating: 5, comment: 'Intento duplicado' }, token);
    expect(second.status).toBe(409);
    const body = await second.json() as { error: string };
    expect(body.error).toBe('Ya has dejado una reseña para este negocio');

    // Confirm only one row in DB for this user+business
    const db = (env as unknown as { DB: D1Database }).DB;
    const count = await db
      .prepare('SELECT COUNT(*) as n FROM reviews WHERE business_id = ? AND user_id = ?')
      .bind(POST_BIZ_ID, 'user-dup')
      .first<{ n: number }>();
    expect(count?.n).toBe(1);
  });

  it('returns 400 when rating is missing', async () => {
    const token = await makeToken('user-val-01', 'val01@test.com', 'Val User');
    const response = await postReview(POST_SLUG, { comment: 'Sin rating' }, token);
    expect(response.status).toBe(400);
    const body = await response.json() as { error: string };
    expect(body.error).toBe('La reseña enviada no es válida.');
  });

  it('returns 400 when rating is out of range (6)', async () => {
    const token = await makeToken('user-val-02', 'val02@test.com', 'Val User 2');
    const response = await postReview(POST_SLUG, { rating: 6 }, token);
    expect(response.status).toBe(400);
    const body = await response.json() as { error: string };
    expect(body.error).toBe('La reseña enviada no es válida.');
  });

  it('returns 400 when rating is 0 (below minimum)', async () => {
    const token = await makeToken('user-val-03', 'val03@test.com', 'Val User 3');
    const response = await postReview(POST_SLUG, { rating: 0 }, token);
    expect(response.status).toBe(400);
    const body = await response.json() as { error: string };
    expect(body.error).toBe('La reseña enviada no es válida.');
  });

  it('returns 400 when comment exceeds 500 characters', async () => {
    const token = await makeToken('user-val-04', 'val04@test.com', 'Val User 4');
    const longComment = 'a'.repeat(501);
    const response = await postReview(POST_SLUG, { rating: 3, comment: longComment }, token);
    expect(response.status).toBe(400);
    const body = await response.json() as { error: string };
    expect(body.error).toBe('La reseña enviada no es válida.');
  });

  it('accepts a review with no comment (comment omitted)', async () => {
    const token = await makeToken('user-nocomment', 'nocomment@test.com', 'Sin Comentario');
    const response = await postReview(POST_SLUG, { rating: 4 }, token);
    expect(response.status).toBe(201);
    const body = await response.json() as { success: boolean; data: { comment: unknown } };
    expect(body.success).toBe(true);
    expect(body.data.comment).toBeNull();
  });

  it('returns 404 for an unknown business slug', async () => {
    const token = await makeToken('user-404', '404@test.com', 'Not Found User');
    const response = await postReview('negocio-que-no-existe', { rating: 3 }, token);
    expect(response.status).toBe(404);
    const body = await response.json() as { error: string };
    expect(body.error).toBe('Negocio no encontrado');
  });
});


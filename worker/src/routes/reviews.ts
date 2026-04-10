import { Hono } from 'hono';
import {
  createRemoteJWKSet,
  decodeJwt,
  decodeProtectedHeader,
  jwtVerify,
  type JWTPayload,
} from 'jose';
import type { Env, Review } from '../db/schema.js';

const reviews = new Hono<{ Bindings: Env }>();
const remoteJwkSets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function normalizeSupabaseIssuer(urlOrIssuer: string): string {
  const url = new URL(urlOrIssuer);
  const trimmedPath = url.pathname.replace(/\/$/, '');
  const normalizedPath = trimmedPath.endsWith('/auth/v1') ? trimmedPath : `${trimmedPath}/auth/v1`;
  return `${url.origin}${normalizedPath}`;
}

function resolveSupabaseJwksUrl(token: string, env: Env): URL | null {
  if (env.SUPABASE_JWKS_URL) {
    return new URL(env.SUPABASE_JWKS_URL);
  }

  if (env.SUPABASE_URL) {
    return new URL('/auth/v1/.well-known/jwks.json', env.SUPABASE_URL);
  }

  try {
    const { iss } = decodeJwt(token);
    if (typeof iss !== 'string') return null;

    const issuer = new URL(iss);
    const isTrustedSupabaseHost =
      issuer.protocol === 'https:' &&
      (issuer.hostname.endsWith('.supabase.co') ||
        issuer.hostname.endsWith('.supabase.in') ||
        issuer.hostname.endsWith('.supabase.net'));

    if (!isTrustedSupabaseHost) return null;

    return new URL(`${normalizeSupabaseIssuer(iss)}/.well-known/jwks.json`);
  } catch {
    return null;
  }
}

function getRemoteJwkSet(jwksUrl: URL) {
  const cacheKey = jwksUrl.toString();
  const cached = remoteJwkSets.get(cacheKey);
  if (cached) return cached;

  const created = createRemoteJWKSet(jwksUrl);
  remoteJwkSets.set(cacheKey, created);
  return created;
}

async function verifySupabaseAccessToken(token: string, env: Env): Promise<JWTPayload> {
  const { alg } = decodeProtectedHeader(token);
  const verifyOptions = env.SUPABASE_URL
    ? { issuer: normalizeSupabaseIssuer(env.SUPABASE_URL) }
    : undefined;

  if (alg?.startsWith('HS')) {
    if (!env.SUPABASE_JWT_SECRET) {
      throw new Error('Missing SUPABASE_JWT_SECRET for HS256 token verification');
    }

    const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, verifyOptions);
    return payload;
  }

  const jwksUrl = resolveSupabaseJwksUrl(token, env);
  if (jwksUrl) {
    const { payload } = await jwtVerify(token, getRemoteJwkSet(jwksUrl), verifyOptions);
    return payload;
  }

  if (env.SUPABASE_JWT_SECRET) {
    const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, verifyOptions);
    return payload;
  }

  throw new Error('Missing Supabase JWT verification configuration');
}

// GET /businesses/:slug/reviews?limit=10&offset=0
// Public endpoint — no auth required
reviews.get('/:slug/reviews', async (c) => {
  const { slug } = c.req.param();

  // Parse and clamp pagination params
  const rawLimit = parseInt(c.req.query('limit') ?? '10', 10);
  const rawOffset = parseInt(c.req.query('offset') ?? '0', 10);
  const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 100);
  const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;

  // Resolve slug → business_id
  const business = await c.env.DB.prepare(
    'SELECT id FROM businesses WHERE slug = ?'
  )
    .bind(slug)
    .first<{ id: string }>();

  if (!business) {
    return c.json({ error: 'Negocio no encontrado' }, 404);
  }

  // Fetch paginated reviews — never expose user_email or user_id
  const reviewsResult = await c.env.DB.prepare(
    `SELECT id, user_name, rating, comment, created_at
     FROM reviews
     WHERE business_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`
  )
    .bind(business.id, limit, offset)
    .all<Pick<Review, 'id' | 'user_name' | 'rating' | 'comment' | 'created_at'>>();

  // Total count for pagination metadata
  const countResult = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM reviews WHERE business_id = ?'
  )
    .bind(business.id)
    .first<{ count: number }>();

  return c.json({
    data: reviewsResult.results,
    meta: {
      total: countResult?.count ?? 0,
      limit,
      offset,
    },
  });
});

// POST /businesses/:slug/reviews
// Auth-gated — requires valid Supabase JWT in Authorization header
reviews.post('/:slug/reviews', async (c) => {
  // 1. Parse Authorization header
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Tu sesión no es válida. Inicia sesión de nuevo.' }, 401);
  }
  const token = authHeader.slice(7);

  // 2. Verify JWT and extract claims
  let userId: string;
  let userEmail: string;
  let userName: string;
  try {
    const payload = await verifySupabaseAccessToken(token, c.env);
    userId = payload.sub as string;
    userEmail = (payload.email as string | undefined) ?? '';
    const meta = payload.user_metadata as { full_name?: string } | undefined;
    userName = meta?.full_name ?? userEmail;
  } catch {
    return c.json({ error: 'Tu sesión no es válida. Inicia sesión de nuevo.' }, 401);
  }

  // 3. Validate request body
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'La reseña enviada no es válida.' }, 400);
  }

  const { rating, comment } = body as { rating?: unknown; comment?: unknown };

  if (
    typeof rating !== 'number' ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return c.json({ error: 'La reseña enviada no es válida.' }, 400);
  }

  if (comment !== undefined && comment !== null) {
    if (typeof comment !== 'string' || comment.length > 500) {
      return c.json({ error: 'La reseña enviada no es válida.' }, 400);
    }
  }

  const safeComment: string | null =
    comment === undefined || comment === null ? null : (comment as string);

  // 4. Resolve slug → business_id
  const { slug } = c.req.param();
  const business = await c.env.DB.prepare(
    'SELECT id FROM businesses WHERE slug = ?'
  )
    .bind(slug)
    .first<{ id: string }>();

  if (!business) {
    return c.json({ error: 'Negocio no encontrado' }, 404);
  }

  // 5. Insert review — let UNIQUE(business_id, user_id) enforce one review per user
  const reviewId = crypto.randomUUID();
  try {
    await c.env.DB.prepare(
      `INSERT INTO reviews (id, business_id, user_id, user_name, user_email, rating, comment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
      .bind(reviewId, business.id, userId, userName, userEmail, rating, safeComment)
      .run();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('UNIQUE')) {
      return c.json({ error: 'Ya has dejado una reseña para este negocio' }, 409);
    }
    return c.json({ error: 'No se pudo guardar la reseña. Inténtalo de nuevo.' }, 500);
  }

  // 6. Synchronously update business aggregates
  await c.env.DB.prepare(
    `UPDATE businesses
     SET avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE business_id = ?),
         review_count = (SELECT COUNT(*) FROM reviews WHERE business_id = ?)
     WHERE id = ?`
  )
    .bind(business.id, business.id, business.id)
    .run();

  // 7. Fetch updated aggregates
  const updated = await c.env.DB.prepare(
    'SELECT avg_rating, review_count FROM businesses WHERE id = ?'
  )
    .bind(business.id)
    .first<{ avg_rating: number; review_count: number }>();

  // 8. Fetch the inserted review for the response (no user_email / user_id exposed)
  const inserted = await c.env.DB.prepare(
    'SELECT id, user_name, rating, comment, created_at FROM reviews WHERE id = ?'
  )
    .bind(reviewId)
    .first<Pick<Review, 'id' | 'user_name' | 'rating' | 'comment' | 'created_at'>>();

  return c.json(
    {
      success: true,
      data: inserted,
      business: {
        avg_rating: updated?.avg_rating ?? 0,
        review_count: updated?.review_count ?? 0,
      },
    },
    201
  );
});

export default reviews;

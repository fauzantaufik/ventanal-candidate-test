import { Hono } from 'hono';
import type { Env, Review } from '../db/schema.js';

const reviews = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// JWT helpers — HS256 via Web Crypto API (no npm deps, Workers-native)
// ---------------------------------------------------------------------------

/** Decode a base64url string to a Uint8Array. */
function base64urlToBytes(b64url: string): Uint8Array {
  const base64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

interface JWTClaims {
  sub: string;
  exp?: number;
  email?: string;
  user_metadata?: { full_name?: string };
  [key: string]: unknown;
}

/**
 * Verify an HS256 JWT signature and return the decoded claims, or null if
 * the token is malformed, has an invalid signature, or is expired.
 */
async function verifyJWT(token: string, secret: string): Promise<JWTClaims | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts;

  // Import the HMAC key
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  // Verify signature over "headerB64.payloadB64"
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64urlToBytes(sigB64);
  const valid = await crypto.subtle.verify('HMAC', key, signature, data);
  if (!valid) return null;

  // Decode and parse payload
  let claims: JWTClaims;
  try {
    const payloadJson = new TextDecoder().decode(base64urlToBytes(payloadB64));
    claims = JSON.parse(payloadJson) as JWTClaims;
  } catch {
    return null;
  }

  // Check expiry
  if (typeof claims.exp === 'number' && Date.now() / 1000 > claims.exp) return null;

  return claims;
}

// ---------------------------------------------------------------------------
// GET /businesses/:slug/reviews?limit=10&offset=0
// Public endpoint — no auth required
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// POST /businesses/:slug/reviews
// Authenticated — requires a valid Supabase Bearer JWT
// ---------------------------------------------------------------------------
reviews.post('/:slug/reviews', async (c) => {
  // 1. Validate Authorization header
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Autenticación requerida' }, 401);
  }
  const token = authHeader.slice(7);

  // 2. Verify JWT signature and expiry
  const claims = await verifyJWT(token, c.env.SUPABASE_JWT_SECRET);
  if (!claims || !claims.sub) {
    return c.json({ error: 'Token inválido o expirado' }, 401);
  }

  const userId = claims.sub;
  const userName = claims.user_metadata?.full_name ?? claims.email ?? 'Usuario';
  const userEmail = claims.email ?? '';

  // 3. Parse request body
  let body: { rating?: unknown; comment?: unknown };
  try {
    body = await c.req.json<{ rating?: unknown; comment?: unknown }>();
  } catch {
    return c.json({ error: 'Cuerpo de solicitud inválido' }, 400);
  }

  const { rating, comment } = body;

  // 4. Validate rating: required integer 1–5
  if (
    rating === undefined ||
    rating === null ||
    !Number.isInteger(rating) ||
    (rating as number) < 1 ||
    (rating as number) > 5
  ) {
    return c.json({ error: 'La calificación debe ser un número entero entre 1 y 5' }, 400);
  }

  // 5. Validate comment: optional string, max 500 chars
  if (comment !== undefined && comment !== null) {
    if (typeof comment !== 'string') {
      return c.json({ error: 'El comentario debe ser texto' }, 400);
    }
    if (comment.length > 500) {
      return c.json({ error: 'El comentario no puede superar los 500 caracteres' }, 400);
    }
  }

  const { slug } = c.req.param();

  // 6. Resolve slug → business_id
  const business = await c.env.DB.prepare(
    'SELECT id FROM businesses WHERE slug = ?'
  )
    .bind(slug)
    .first<{ id: string }>();

  if (!business) {
    return c.json({ error: 'Negocio no encontrado' }, 404);
  }

  // 7. Insert review — UNIQUE(business_id, user_id) enforces one review per user
  const reviewId = 'rev-' + crypto.randomUUID().slice(0, 8);
  const commentValue = typeof comment === 'string' ? comment : null;

  try {
    await c.env.DB.prepare(
      `INSERT INTO reviews (id, business_id, user_id, user_name, user_email, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(reviewId, business.id, userId, userName, userEmail, rating as number, commentValue)
      .run();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Ya dejaste una reseña para este negocio.' }, 409);
    }
    return c.json({ error: 'Error interno del servidor' }, 500);
  }

  // 8. Recalculate business aggregates synchronously (cheap local write)
  await c.env.DB.prepare(
    `UPDATE businesses
     SET avg_rating    = (SELECT AVG(CAST(rating AS REAL)) FROM reviews WHERE business_id = ?),
         review_count  = (SELECT COUNT(*) FROM reviews WHERE business_id = ?)
     WHERE id = ?`
  )
    .bind(business.id, business.id, business.id)
    .run();

  // 9. Read back the inserted review and updated business aggregates
  const insertedReview = await c.env.DB.prepare(
    `SELECT id, user_name, rating, comment, created_at FROM reviews WHERE id = ?`
  )
    .bind(reviewId)
    .first<Pick<Review, 'id' | 'user_name' | 'rating' | 'comment' | 'created_at'>>();

  const updatedBusiness = await c.env.DB.prepare(
    `SELECT avg_rating, review_count FROM businesses WHERE id = ?`
  )
    .bind(business.id)
    .first<{ avg_rating: number; review_count: number }>();

  return c.json(
    {
      success: true,
      data: insertedReview,
      business: {
        avg_rating: updatedBusiness?.avg_rating ?? 0,
        review_count: updatedBusiness?.review_count ?? 0,
      },
    },
    201,
  );
});

export default reviews;


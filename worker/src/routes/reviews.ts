import { Hono } from 'hono';
import type { Env, Review } from '../db/schema.js';

const reviews = new Hono<{ Bindings: Env }>();

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

export default reviews;

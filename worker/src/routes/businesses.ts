import { Hono } from 'hono';
import type { Env, Business } from '../db/schema.js';

const businesses = new Hono<{ Bindings: Env }>()
  // GET /businesses — paginated list with optional city filter
  .get('/', async (c) => {
    const { page = '1', limit = '20', city, category } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT b.*, cat.name as category_name, cat.slug as category_slug, cat.icon as category_icon
      FROM businesses b
      JOIN categories cat ON b.category_id = cat.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (city) {
      query += ` AND LOWER(b.city) = LOWER(?)`;
      params.push(city);
    }
    if (category) {
      query += ` AND cat.slug = ?`;
      params.push(category);
    }

    query += ` ORDER BY b.verified DESC, b.avg_rating DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const result = await c.env.DB.prepare(query).bind(...params).all<
      Business & { category_name: string; category_slug: string; category_icon: string }
    >();

    const countQuery = `
      SELECT COUNT(*) as total FROM businesses b
      JOIN categories cat ON b.category_id = cat.id
      WHERE 1=1
      ${city ? ' AND LOWER(b.city) = LOWER(?)' : ''}
      ${category ? ' AND cat.slug = ?' : ''}
    `;
    const countParams: string[] = [];
    if (city) countParams.push(city);
    if (category) countParams.push(category);

    const countResult = await c.env.DB.prepare(countQuery)
      .bind(...countParams)
      .first<{ total: number }>();

    return c.json({
      data: result.results,
      meta: {
        total: countResult?.total ?? 0,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  })

  // GET /businesses/:slug — single business by slug
  .get('/:slug', async (c) => {
    const { slug } = c.req.param();

    const business = await c.env.DB.prepare(`
      SELECT b.*, cat.name as category_name, cat.slug as category_slug, cat.icon as category_icon
      FROM businesses b
      JOIN categories cat ON b.category_id = cat.id
      WHERE b.slug = ?
    `).bind(slug).first<Business & { category_name: string; category_slug: string; category_icon: string }>();

    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }

    return c.json({ data: business });
  });

export default businesses;

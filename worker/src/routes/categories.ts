import { Hono } from 'hono';
import type { Env } from '../db/schema.js';

const categories = new Hono<{ Bindings: Env }>();

// GET /categories — all categories
categories.get('/', async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT * FROM categories ORDER BY name ASC'
  ).all();

  return c.json({ data: result.results });
});

export default categories;

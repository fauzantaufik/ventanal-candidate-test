import { Hono } from 'hono';
import type { Category, Env } from '../db/schema.js';

const categories = new Hono<{ Bindings: Env }>().get('/', async (c) => {
  const result = await c.env.DB.prepare(
    'SELECT * FROM categories ORDER BY name ASC'
  ).all<Category>();

  return c.json({ data: result.results });
});

export default categories;

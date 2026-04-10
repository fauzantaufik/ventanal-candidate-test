import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './db/schema.js';
import businessesRoutes from './routes/businesses.js';
import categoriesRoutes from './routes/categories.js';
import reviewsRoutes from './routes/reviews.js';

const app = new Hono<{ Bindings: Env }>();

const allowedOriginPatterns = [
  /^http:\/\/localhost(?::\d+)?$/i,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i,
];

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return 'http://localhost:3000';
      return allowedOriginPatterns.some((pattern) => pattern.test(origin))
        ? origin
        : 'http://localhost:3000';
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

const routes = app
  .get('/health', (c) => c.json({ status: 'ok', env: c.env.ENVIRONMENT }))
  .route('/businesses', businessesRoutes)
  .route('/categories', categoriesRoutes)
  .route('/businesses', reviewsRoutes); // /businesses/:slug/reviews

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export type AppType = typeof routes;
export default app;

import { Hono } from 'hono';
import type { Env } from '../db/schema.js';

const reviews = new Hono<{ Bindings: Env }>();

// TODO: Implement these endpoints as part of the candidate test
//
// POST /businesses/:slug/reviews
//   - Requires authenticated user (Supabase JWT in Authorization header)
//   - Body: { rating: number (1-5), comment?: string (max 500 chars) }
//   - Returns: 201 with created review, or 409 if user already reviewed this business
//
// GET /businesses/:slug/reviews
//   - Public endpoint, no auth required
//   - Returns: paginated list of reviews for this business, newest first
//
// Hints:
//   - The reviews table schema is in migrations/0002_reviews.sql
//   - Validate the Supabase JWT to get the user's ID, name, and email
//   - Update businesses.avg_rating and businesses.review_count after each new review
//   - Return proper HTTP status codes (400 for validation, 401 for unauth, 409 for duplicate)

export default reviews;

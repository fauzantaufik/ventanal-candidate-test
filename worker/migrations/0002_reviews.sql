-- Migration 0002: Reviews table
-- NOTE: This table exists but there are no API endpoints for it yet.
-- Your task is to implement the review endpoints in src/routes/reviews.ts

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  user_id TEXT NOT NULL,           -- Supabase Auth user ID
  user_name TEXT NOT NULL,         -- Display name from Supabase Auth
  user_email TEXT NOT NULL,        -- Email from Supabase Auth
  rating INTEGER NOT NULL,         -- 1-5 stars
  comment TEXT,                    -- Optional review text, max 500 chars
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(business_id, user_id)     -- One review per user per business
);

CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

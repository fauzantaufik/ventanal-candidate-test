// Minimal D1 typings shared across the worker and web app for client inference.
export interface D1PreparedStatementLike {
  bind(...values: Array<string | number | null>): D1PreparedStatementLike;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta: Record<string, unknown> }>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
}

// D1 type definitions for the directorio database

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string;
  city: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  verified: number; // 0=unverified, 1=verified, 2=premium
  avg_rating: number;
  review_count: number;
  created_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Env {
  DB: D1DatabaseLike;
  ENVIRONMENT: string;
  SUPABASE_JWT_SECRET: string;
}

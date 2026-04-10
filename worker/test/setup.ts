// Test setup: apply D1 migrations so tables exist in the in-memory Miniflare D1.
// @cloudflare/vitest-pool-workers runs setupFiles inside the isolated Workers runtime,
// so `env` from cloudflare:test is available here.
import { env } from 'cloudflare:test';
import { beforeAll } from 'vitest';

// SQL from migrations/0001_businesses.sql and migrations/0002_reviews.sql
// We inline the DDL so tests don't need filesystem access at runtime.

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '🏢'
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  avg_rating REAL NOT NULL DEFAULT 0.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(business_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
`;

const SEED_SQL = `
INSERT OR IGNORE INTO categories (id, name, slug, icon) VALUES
  ('cat-01', 'Restaurantes', 'restaurantes', '🍽️'),
  ('cat-02', 'Servicios del hogar', 'servicios-hogar', '🔧'),
  ('cat-03', 'Salud y bienestar', 'salud-bienestar', '💊');

INSERT OR IGNORE INTO businesses (id, slug, name, description, category_id, city, address, phone, whatsapp, verified, avg_rating, review_count) VALUES
  ('biz-01', 'la-cocina-de-maria', 'La Cocina de María', 'Restaurante familiar con comida casera venezolana.', 'cat-01', 'Caracas', 'Av. Principal de Las Mercedes, Local 12', '+58 212 555 0101', '+58 412 555 0101', 1, 4.5, 28),
  ('biz-02', 'el-asador-del-llano', 'El Asador del Llano', 'Parrilla llanera con las mejores carnes a la brasa.', 'cat-01', 'Caracas', 'Calle Sucre, Chacao', '+58 212 555 0102', '+58 414 555 0102', 2, 4.8, 64),
  ('biz-03', 'sushi-nikkei-caracas', 'Sushi Nikkei Caracas', 'Fusión japonesa-peruana con ingredientes frescos.', 'cat-01', 'Caracas', 'Torre Este, Piso 2, Chacao', '+58 212 555 0103', '+58 416 555 0103', 1, 4.3, 19),
  ('biz-04', 'techfix-hogar', 'TechFix Hogar', 'Servicio técnico certificado para electrodomésticos.', 'cat-02', 'Caracas', 'Urbanización Santa Fe, Local 5', '+58 212 555 0201', '+58 424 555 0201', 1, 4.1, 33),
  ('biz-05', 'plomeria-express', 'Plomería Express', 'Plomeros certificados disponibles 24/7.', 'cat-02', 'Caracas', 'Servicio a domicilio', '+58 212 555 0202', '+58 426 555 0202', 0, 3.8, 12),
  ('biz-06', 'electricidad-segura', 'Electricidad Segura', 'Electricistas industriales y residenciales.', 'cat-02', 'Maracaibo', 'Av. Bella Vista, Galería Comercial Local 8', '+58 261 555 0203', '+58 412 555 0203', 1, 4.6, 41),
  ('biz-07', 'clinica-dental-sonrisa', 'Clínica Dental Sonrisa', 'Odontología integral con tecnología de última generación.', 'cat-03', 'Caracas', 'Torre Médica La Trinidad, Piso 3', '+58 212 555 0301', '+58 414 555 0301', 2, 4.9, 87),
  ('biz-08', 'bienestar-yoga-studio', 'Bienestar Yoga Studio', 'Clases de yoga y meditación para todos los niveles.', 'cat-03', 'Valencia', 'Centro Comercial Prebo, Nivel 2', '+58 241 555 0302', '+58 416 555 0302', 1, 4.4, 22),
  ('biz-09', 'farmacia-san-pedro', 'Farmacia San Pedro', 'Farmacia comunitaria con más de 30 años de servicio.', 'cat-03', 'Maracaibo', 'Av. 4 Bella Vista, Local 12', '+58 261 555 0303', '+58 424 555 0303', 1, 4.2, 15),
  ('biz-10', 'nutricion-y-vida', 'Nutrición y Vida', 'Consultas nutricionales personalizadas.', 'cat-03', 'Caracas', 'Clínica El Ávila, Consultorio 205', '+58 212 555 0304', '+58 426 555 0304', 0, 0.0, 0);
`;

beforeAll(async () => {
  const db = (env as unknown as { DB: D1Database }).DB;

  // Execute DDL statements one at a time (D1 doesn't support multi-statement batches via prepare)
  const ddlStatements = SCHEMA_SQL
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of ddlStatements) {
    await db.prepare(stmt).run();
  }

  // Execute seed as batch — INSERT OR IGNORE is safe to rerun
  const seedStatements = SEED_SQL
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of seedStatements) {
    await db.prepare(stmt).run();
  }
});

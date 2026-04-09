-- Migration 0001: Businesses and Categories

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
  verified INTEGER NOT NULL DEFAULT 0,  -- 0=unverified, 1=verified, 2=premium
  avg_rating REAL NOT NULL DEFAULT 0.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed categories
INSERT INTO categories (id, name, slug, icon) VALUES
  ('cat-01', 'Restaurantes', 'restaurantes', '🍽️'),
  ('cat-02', 'Servicios del hogar', 'servicios-hogar', '🔧'),
  ('cat-03', 'Salud y bienestar', 'salud-bienestar', '💊');

-- Seed businesses (10 fake businesses, Spanish names)
INSERT INTO businesses (id, slug, name, description, category_id, city, address, phone, whatsapp, verified, avg_rating, review_count) VALUES
  ('biz-01', 'la-cocina-de-maria', 'La Cocina de María', 'Restaurante familiar con comida casera venezolana. Especialistas en pabellón criollo, arepas y hallacas. Ambiente acogedor y precios accesibles.', 'cat-01', 'Caracas', 'Av. Principal de Las Mercedes, Local 12', '+58 212 555 0101', '+58 412 555 0101', 1, 4.5, 28),
  ('biz-02', 'el-asador-del-llano', 'El Asador del Llano', 'Parrilla llanera con las mejores carnes a la brasa. Más de 15 años sirviendo cortes premium y chorizos artesanales en Chacao.', 'cat-01', 'Caracas', 'Calle Sucre, Chacao', '+58 212 555 0102', '+58 414 555 0102', 2, 4.8, 64),
  ('biz-03', 'sushi-nikkei-caracas', 'Sushi Nikkei Caracas', 'Fusión japonesa-peruana con ingredientes frescos. Rolls creativos, ceviches nikkei y tiraditos. Reservaciones recomendadas los fines de semana.', 'cat-01', 'Caracas', 'Torre Este, Piso 2, Chacao', '+58 212 555 0103', '+58 416 555 0103', 1, 4.3, 19),
  ('biz-04', 'techfix-hogar', 'TechFix Hogar', 'Servicio técnico certificado para electrodomésticos. Reparación de neveras, lavadoras, aires acondicionados y más. Garantía de 90 días en todos los trabajos.', 'cat-02', 'Caracas', 'Urbanización Santa Fe, Local 5', '+58 212 555 0201', '+58 424 555 0201', 1, 4.1, 33),
  ('biz-05', 'plomeria-express', 'Plomería Express', 'Plomeros certificados disponibles 24/7. Atendemos emergencias de tuberías, filtraciones, instalaciones sanitarias y tanques de agua. Sin recargo por urgencias nocturnas.', 'cat-02', 'Caracas', 'Servicio a domicilio, zona Metropolitana', '+58 212 555 0202', '+58 426 555 0202', 0, 3.8, 12),
  ('biz-06', 'electricidad-segura', 'Electricidad Segura', 'Electricistas industriales y residenciales. Instalaciones eléctricas, tableros de distribución, mantenimiento preventivo. Cumplimos normas COVENIN.', 'cat-02', 'Maracaibo', 'Av. Bella Vista, Galería Comercial Local 8', '+58 261 555 0203', '+58 412 555 0203', 1, 4.6, 41),
  ('biz-07', 'clinica-dental-sonrisa', 'Clínica Dental Sonrisa', 'Odontología integral con tecnología de última generación. Ortodoncia, implantes, blanqueamiento y limpieza dental. Primera consulta sin costo.', 'cat-03', 'Caracas', 'Torre Médica La Trinidad, Piso 3', '+58 212 555 0301', '+58 414 555 0301', 2, 4.9, 87),
  ('biz-08', 'bienestar-yoga-studio', 'Bienestar Yoga Studio', 'Clases de yoga y meditación para todos los niveles. Hatha, Vinyasa, Yin Yoga y mindfulness. Instructores certificados, grupos pequeños para atención personalizada.', 'cat-03', 'Valencia', 'Centro Comercial Prebo, Nivel 2', '+58 241 555 0302', '+58 416 555 0302', 1, 4.4, 22),
  ('biz-09', 'farmacia-san-pedro', 'Farmacia San Pedro', 'Farmacia comunitaria con más de 30 años de servicio. Medicamentos, suplementos, cosmética y artículos médicos. Asesoría farmacéutica gratuita.', 'cat-03', 'Maracaibo', 'Av. 4 Bella Vista, Local 12', '+58 261 555 0303', '+58 424 555 0303', 1, 4.2, 15),
  ('biz-10', 'nutricion-y-vida', 'Nutrición y Vida', 'Consultas nutricionales personalizadas. Planes alimenticios para perder peso, ganar masa muscular, controlar diabetes y otras condiciones. Seguimiento online disponible.', 'cat-03', 'Caracas', 'Clínica El Ávila, Consultorio 205', '+58 212 555 0304', '+58 426 555 0304', 0, 0.0, 0);

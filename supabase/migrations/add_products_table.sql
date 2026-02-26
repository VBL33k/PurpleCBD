-- Migration : table produits
-- À exécuter dans le SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS products (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT         NOT NULL,
  description   TEXT         DEFAULT '',
  strain        TEXT         DEFAULT '',
  badge         TEXT         DEFAULT '',
  tags          TEXT[]       DEFAULT '{}',
  price         INTEGER      NOT NULL DEFAULT 150,
  loyalty_price INTEGER      NOT NULL DEFAULT 100,
  image_url     TEXT,
  active        BOOLEAN      DEFAULT true,
  sort_order    INTEGER      DEFAULT 0,
  created_at    TIMESTAMPTZ  DEFAULT now()
);

-- Seed : produits de base (ignorer si déjà présents)
INSERT INTO products (name, description, price, loyalty_price, strain, badge, tags, sort_order)
SELECT * FROM (VALUES
  ('Purple Haze',  'Notes de baies sauvages et boost créatif d''une rare intensité.', 150, 100, 'Sativa Dominante',  'Signature',    ARRAY['Créatif','Euphorisant','Diurne'],       1),
  ('OG Kush',      'Arôme terreux boisé aux accents de pin et d''épices. Relaxation profonde.', 150, 100, 'Indica Dominante', 'VIP Select',   ARRAY['Relaxation','Intense','Nocturne'],      2),
  ('Lemon Haze',   'Fraîcheur citronnée vive qui ouvre les sens et affine la concentration.', 150, 100, 'Sativa Pure',       'Fresh Cut',    ARRAY['Énergie','Focus','Citronné'],           3),
  ('Dark Devil',   'Teintes anthracite et améthyste. Goût sucré d''encens qui enveloppe.',   150, 100, 'Hybrid Exclusive',  'Ultra Rare',   ARRAY['Exclusif','Sucré','Prestige'],          4)
) AS v(name, description, price, loyalty_price, strain, badge, tags, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

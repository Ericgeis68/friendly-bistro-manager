/*
  Migration complète pour l'application restaurant
  
  Ce script contient toutes les tables, permissions, et configurations nécessaires
  pour faire fonctionner l'application sur un nouveau compte Supabase.
  
  Tables incluses:
  - menu_items (éléments du menu)
  - orders (commandes) 
  - notifications (notifications temps réel)
  - cooking_options (options de cuisson)
  - waitresses (serveuses)
  - floor_plans (plans de salle)
  
  Fonctionnalités:
  - RLS (Row Level Security) activé
  - Triggers pour timestamps automatiques
  - Politiques d'accès public
  - Données par défaut
  - Support temps réel
*/

-- Extensions requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TABLE: menu_items (éléments du menu)
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('drinks', 'meals')),
  needs_cooking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: orders (commandes)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  table_number TEXT NOT NULL,
  table_comment TEXT DEFAULT '',
  room_name TEXT,
  waitress TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'delivered', 'cancelled')),
  drinks_status TEXT DEFAULT 'pending' CHECK (drinks_status IN ('pending', 'ready', 'delivered')),
  meals_status TEXT DEFAULT 'pending' CHECK (meals_status IN ('pending', 'ready', 'delivered')),
  drinks JSONB DEFAULT '[]',
  meals JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: notifications (notifications temps réel)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  waitress TEXT NOT NULL,
  table_number TEXT,
  status TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: cooking_options (options de cuisson)
-- =====================================================
CREATE TABLE IF NOT EXISTS cooking_options (
  id SERIAL PRIMARY KEY,
  option_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: waitresses (serveuses)
-- =====================================================
CREATE TABLE IF NOT EXISTS waitresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLE: floor_plans (plans de salle)
-- =====================================================
CREATE TABLE IF NOT EXISTS floor_plans (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  room_size JSONB NOT NULL DEFAULT '{"width": 800, "height": 600}'::jsonb,
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  grid_size INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- TRIGGERS pour updated_at
-- =====================================================
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at 
  BEFORE UPDATE ON menu_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_floor_plans_updated_at ON floor_plans;
CREATE TRIGGER update_floor_plans_updated_at
  BEFORE UPDATE ON floor_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ACTIVATION RLS (Row Level Security)
-- =====================================================
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLITIQUES D'ACCÈS (accès complet pour app interne)
-- =====================================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Allow all operations on menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all operations on cooking_options" ON cooking_options;
DROP POLICY IF EXISTS "Allow all operations on waitresses" ON waitresses;
DROP POLICY IF EXISTS "Allow all operations on floor_plans" ON floor_plans;

-- Créer les nouvelles politiques
CREATE POLICY "Allow all operations on menu_items" 
  ON menu_items FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on orders" 
  ON orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on notifications" 
  ON notifications FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on cooking_options" 
  ON cooking_options FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on waitresses" 
  ON waitresses FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on floor_plans" 
  ON floor_plans FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- DONNÉES PAR DÉFAUT
-- =====================================================

-- Options de cuisson par défaut
INSERT INTO cooking_options (option_name) VALUES
  ('BLEU'),
  ('SAIGNANT'),
  ('A POINT'),
  ('CUIT'),
  ('BIEN CUIT')
ON CONFLICT (option_name) DO NOTHING;

-- Éléments de menu par défaut
INSERT INTO menu_items (name, price, category, needs_cooking) VALUES
  ('Bière', 4.50, 'drinks', false),
  ('Coca', 3.50, 'drinks', false),
  ('Eau', 2.00, 'drinks', false),
  ('Vin Rouge', 5.50, 'drinks', false),
  ('Entrecôte', 18.50, 'meals', true),
  ('Entrecôte spécial', 22.50, 'meals', true),
  ('Frites', 4.00, 'meals', false),
  ('Saucisse blanche frite', 12.50, 'meals', false),
  ('Merguez pain', 8.50, 'meals', false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- CONFIGURATION TEMPS RÉEL
-- =====================================================

-- Activer les publications pour le temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE cooking_options;
ALTER PUBLICATION supabase_realtime ADD TABLE waitresses;
ALTER PUBLICATION supabase_realtime ADD TABLE floor_plans;

-- =====================================================
-- VÉRIFICATIONS FINALES
-- =====================================================

-- Afficher un résumé des tables créées
DO $$
BEGIN
  RAISE NOTICE '=== MIGRATION TERMINÉE ===';
  RAISE NOTICE 'Tables créées:';
  RAISE NOTICE '- menu_items: % lignes', (SELECT COUNT(*) FROM menu_items);
  RAISE NOTICE '- orders: % lignes', (SELECT COUNT(*) FROM orders);
  RAISE NOTICE '- notifications: % lignes', (SELECT COUNT(*) FROM notifications);
  RAISE NOTICE '- cooking_options: % lignes', (SELECT COUNT(*) FROM cooking_options);
  RAISE NOTICE '- waitresses: % lignes', (SELECT COUNT(*) FROM waitresses);
  RAISE NOTICE '- floor_plans: % lignes', (SELECT COUNT(*) FROM floor_plans);
  RAISE NOTICE '=== MIGRATION TERMINÉE ===';
END $$;

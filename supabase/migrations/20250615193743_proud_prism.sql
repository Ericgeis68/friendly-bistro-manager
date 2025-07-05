/*
  # Création du schéma de base pour l'application restaurant

  1. Nouvelles Tables
    - `menu_items` - Stockage des éléments du menu (boissons et repas)
    - `orders` - Stockage des commandes
    - `notifications` - Stockage des notifications
    - `cooking_options` - Options de cuisson disponibles
    - `waitresses` - Stockage des informations sur les serveuses

  2. Sécurité
    - Activation de RLS sur toutes les tables
    - Politiques pour permettre l'accès public (application interne)

  3. Fonctions
    - Triggers pour la gestion automatique des timestamps
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table pour les éléments du menu
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('drinks', 'meals')),
  needs_cooking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les commandes
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  table_number TEXT NOT NULL,
  table_comment TEXT DEFAULT '',
  waitress TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'delivered', 'cancelled')),
  drinks_status TEXT DEFAULT 'pending' CHECK (drinks_status IN ('pending', 'ready', 'delivered')),
  meals_status TEXT DEFAULT 'pending' CHECK (meals_status IN ('pending', 'ready', 'delivered')),
  drinks JSONB DEFAULT '[]',
  meals JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  waitress TEXT NOT NULL,
  table_number TEXT NOT NULL,
  status TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les options de cuisson
CREATE TABLE IF NOT EXISTS cooking_options (
  id SERIAL PRIMARY KEY,
  option_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les serveuses
CREATE TABLE IF NOT EXISTS waitresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activation de RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitresses ENABLE ROW LEVEL SECURITY; -- Enable RLS for waitresses table

-- Politiques pour permettre l'accès complet (application interne)
CREATE POLICY "Allow all operations on menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on cooking_options" ON cooking_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on waitresses" ON waitresses FOR ALL USING (true) WITH CHECK (true); -- Policy for waitresses table

-- Insertion des options de cuisson par défaut
INSERT INTO cooking_options (option_name) VALUES
  ('BLEU'),
  ('SAIGNANT'),
  ('A POINT'),
  ('CUIT'),
  ('BIEN CUIT')
ON CONFLICT (option_name) DO NOTHING;

-- Insertion des éléments de menu par défaut
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

-- Insertion des serveuses par défaut (optionnel, vous pouvez les ajouter via l'interface)
-- INSERT INTO waitresses (name) VALUES
--   ('Celine'),
--   ('Audrey'),
--   ('Stephanie')
-- ON CONFLICT (name) DO NOTHING;

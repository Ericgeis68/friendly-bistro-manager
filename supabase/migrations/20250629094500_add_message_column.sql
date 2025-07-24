-- Ajouter la colonne message à la table notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT;

-- Mettre à jour la contrainte pour permettre order_id nullable pour les appels cuisine
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_order_id_fkey;
ALTER TABLE notifications ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE notifications ADD CONSTRAINT notifications_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

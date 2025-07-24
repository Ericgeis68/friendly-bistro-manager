-- Ajouter une colonne variants à la table menu_items pour stocker les variantes des boissons
ALTER TABLE public.menu_items 
ADD COLUMN variants jsonb DEFAULT NULL;
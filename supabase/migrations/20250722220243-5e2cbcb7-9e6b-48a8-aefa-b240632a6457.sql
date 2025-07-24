-- Désactiver RLS sur les tables existantes pour permettre la lecture des données
-- Ceci est temporaire pour une application de restaurant interne

-- Désactiver RLS sur la table orders
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur les autres tables existantes
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooking_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.floor_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

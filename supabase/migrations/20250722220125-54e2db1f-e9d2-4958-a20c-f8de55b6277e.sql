-- Désactiver RLS sur toutes les tables pour permettre la lecture des données
-- Ceci est temporaire pour une application de restaurant interne

-- Désactiver RLS sur la table orders
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur les autres tables si elles existent
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooking_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_service_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.floor_plans DISABLE ROW LEVEL SECURITY;

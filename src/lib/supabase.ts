
import { createClient } from '@supabase/supabase-js';
import { toast } from "@/hooks/use-toast";

// Les clés d'API Supabase (à remplacer par vos propres clés)
// Dans un environnement de production, ces valeurs devraient être des variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

// Création du client Supabase
let supabase;

// Vérifier si les clés sont disponibles
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    realtime: {
      timeout: 60000, // 60 secondes
      params: {
        eventsPerSecond: 10
      }
    }
  });
} else {
  // Mode hors-ligne / fallback
  console.warn('Supabase credentials not found. Running in offline mode.');
  
  // Création d'un client mock qui ne fait rien mais ne plante pas
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
        match: () => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
        match: () => Promise.resolve({ data: null, error: null })
      }),
      eq: () => ({ 
        order: () => Promise.resolve({ data: [], error: null }) 
      })
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {}
  };
  
  // Notification à l'utilisateur
  setTimeout(() => {
    toast({
      title: "Mode hors-ligne activé",
      description: "L'application fonctionne sans connexion à la base de données.",
      variant: "default"
    });
  }, 1000);
}

export { supabase };

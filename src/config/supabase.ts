
// Configuration Supabase pour le projet "Restaurant Manager"

// Statut des commandes
export const ORDER_STATUS = {
  PENDING: 'pending',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

// Types de produits
export const ITEM_TYPES = {
  DRINK: 'drink',
  MEAL: 'meal'
} as const;

// Nombres maximum pour le plan gratuit
export const SUPABASE_FREE_TIER_LIMITS = {
  MAX_ROWS: 100000,
  MAX_STORAGE: 500, // En Mo
  MAX_TRANSFER: 2, // En Go
};

// Configuration RLS (Row Level Security)
export const DEFAULT_RLS_POLICIES = {
  // Ces politiques seront appliquées à toutes les tables
  ENABLE_READ_FOR_ALL: true,
  ENABLE_INSERT_FOR_AUTHENTICATED: true,
  ENABLE_UPDATE_FOR_AUTHENTICATED: true,
  ENABLE_DELETE_FOR_AUTHENTICATED: false
};

export const SUPABASE_ERROR_CODES = {
  NETWORK_ERROR: 'network_error',
  TIMEOUT: 'timeout',
  CONSTRAINT_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  CHECK_VIOLATION: '23514',
  TABLE_NOT_FOUND: '42P01',
  PERMISSION_DENIED: '42501',
  SYNTAX_ERROR: '42601',
  INVALID_DATA_FORMAT: '22P02'
};

export const getErrorMessage = (error: any): string => {
  if (!error) return "Une erreur inconnue s'est produite";
  
  // Messages d'erreur personnalisés
  const errorMap: Record<string, string> = {
    "23505": "Un enregistrement avec cet identifiant existe déjà.",
    "23503": "Impossible de supprimer cet élément car il est utilisé par d'autres enregistrements.",
    "23514": "Les données fournies ne respectent pas les contraintes de la base de données.",
    "42P01": "La table demandée n'existe pas.",
    "42501": "Vous n'avez pas les permissions nécessaires pour cette opération.",
    "42601": "Erreur de syntaxe SQL.",
    "22P02": "Format de données invalide.",
    [SUPABASE_ERROR_CODES.NETWORK_ERROR]: "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
    [SUPABASE_ERROR_CODES.TIMEOUT]: "La requête a pris trop de temps. Veuillez réessayer plus tard."
  };
  
  // Si c'est une erreur fetch
  if (error.message && error.message.includes('Failed to fetch')) {
    return "Erreur de connexion au serveur. L'application passe en mode hors-ligne.";
  }
  
  // Si c'est une erreur postgres avec un code
  if (error.code && errorMap[error.code]) {
    return errorMap[error.code];
  }
  
  // Message d'erreur par défaut ou personnalisé
  return error.message || error.error_description || "Une erreur s'est produite";
};

// Vérifier la connexion internet
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

// Vérifier si une erreur est une erreur de réseau
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  return (
    (error.message && error.message.includes('Failed to fetch')) ||
    (error.code === SUPABASE_ERROR_CODES.NETWORK_ERROR) ||
    (error.code === SUPABASE_ERROR_CODES.TIMEOUT) ||
    !navigator.onLine
  );
};

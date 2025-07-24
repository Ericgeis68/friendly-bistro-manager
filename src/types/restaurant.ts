export type ScreenType = 'login' | 'waitress' | 'table' | 'category' | 'boissons' | 'repas' | 'recap' | 'splitPayment' | 'cuisine' | 'admin' | 'printing' | 'floorPlanView';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category?: string; // Optionnel pour compatibilité
  cooking?: string;
  quantity?: number;
  needsCooking?: boolean;
  comment?: string;
  variants?: { name: string; price: number }[]; // Pour verre/bouteille
  selectedVariant?: string; // Variante sélectionnée (verre/bouteille)
}

export interface Order {
  id: string;
  table: string;
  tableNumber?: string; // Optionnel pour compatibilité
  tableComment?: string;
  room?: string; // Nom de la salle
  waitress: string;
  drinks: MenuItem[];
  meals: MenuItem[];
  status: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  drinksStatus?: 'pending' | 'ready' | 'delivered';
  mealsStatus?: 'pending' | 'in_progress' | 'ready' | 'delivered';
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin';

export interface User {
  id: string;
  name: string;
  role?: UserRole;
}

export interface MenuItems {
  boissons: MenuItem[];
  repas: MenuItem[];
}

export interface AppSettings {
  autoPrintEnabled: boolean;
}

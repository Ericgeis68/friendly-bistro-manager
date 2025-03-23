
export type MenuItem = {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  cooking?: string;
  needsCooking?: boolean; // New field to indicate if this item needs cooking options
};

export type Order = {
  id: string;
  table: string;
  tableComment?: string;
  waitress: string;
  drinks: MenuItem[];
  meals: MenuItem[];
  status: 'pending' | 'ready' | 'delivered' | 'cancelled';
  createdAt: number | string;
  drinksStatus?: 'pending' | 'ready' | 'delivered';
  mealsStatus?: 'pending' | 'ready' | 'delivered';
};

export type MenuItems = {
  drinks: MenuItem[];
  meals: MenuItem[];
};

export type ScreenType = 'login' | 'waitress' | 'cuisine' | 'admin' | 'table' | 'category' | 'boissons' | 'repas' | 'recap' | 'splitPayment';

export type UserRole = 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin';

export type CookingOption = string;

export type MenuItem = {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  cooking?: string;
};

export type Order = {
  id?: number;
  table?: string;
  waitress: string;
  drinks: MenuItem[];
  meals: MenuItem[];
  status?: 'pending' | 'completed' | 'cancelled';
  createdAt?: string | Date;
};

export type ScreenType = 'login' | 'waitress' | 'table' | 'category' | 'boissons' | 'repas' | 'recap' | 'cuisine' | 'admin';
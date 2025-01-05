import { MenuItem, Order } from './types';

export type ScreenType = 'login' | 'waitress' | 'table' | 'category' | 'boissons' | 'repas' | 'recap' | 'cuisine' | 'pending' | 'completed';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  drinks: MenuItem[];
  meals: MenuItem[];
}

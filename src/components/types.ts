export type ScreenType = 'login' | 'waitress' | 'table' | 'category' | 'boissons' | 'repas' | 'recap' | 'cuisine' | 'pending' | 'completed';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cooking?: string;
}

export interface Order {
  drinks: MenuItem[];
  meals: MenuItem[];
}
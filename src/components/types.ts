export type ScreenType = 'login' | 'waitress' | 'table' | 'category' | 'boissons' | 'repas' | 'recap' | 'cuisine' | 'pending' | 'completed';

export type CookingType = 'Bleu' | 'Saignant' | 'À point' | 'Bien cuit';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cooking?: CookingType;
}

export interface Order {
  drinks: MenuItem[];
  meals: MenuItem[];
  tableNumber?: string;
}
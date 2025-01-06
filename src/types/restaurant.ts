export type MenuItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cooking?: string;
};

export type Order = {
  waitress: string;
  drinks: MenuItem[];
  meals: MenuItem[];
};

export type ScreenType = 'login' | 'waitress' | 'table' | 'category' | 'boissons' | 'repas' | 'recap' | 'cuisine';
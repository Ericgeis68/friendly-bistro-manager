export type MenuItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cooking?: string;
};

export type Order = {
  drinks: MenuItem[];
  meals: MenuItem[];
};
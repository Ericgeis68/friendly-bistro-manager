
export type MenuItem = {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  cooking?: string;
};

export type Order = {
  id: string;
  table: string;
  tableComment?: string;
  waitress: string;
  drinks: MenuItem[];
  meals: MenuItem[];
  status: 'pending' | 'completed' | 'cancelled' | 'ready' | 'delivered';
  drinksStatus?: 'pending' | 'completed' | 'cancelled' | 'ready' | 'delivered';
  mealsStatus?: 'pending' | 'completed' | 'cancelled' | 'ready' | 'delivered';
  createdAt: string;
  notificationAcknowledged?: boolean;
  originalOrderId?: string; // Pour lier les commandes séparées (repas/boissons)
};

export type ScreenType = 
  | 'login' 
  | 'waitress' 
  | 'table' 
  | 'category' 
  | 'boissons' 
  | 'repas' 
  | 'recap' 
  | 'cuisine' 
  | 'admin' 
  | 'splitPayment'
  | 'Celine'
  | 'Audrey'
  | 'Stephanie';

export interface UseOrderHandlersProps {
  loggedInUser: string;
  setLoggedInUser: (user: string) => void;
  setCurrentScreen: (screen: ScreenType) => void;
  tableNumber: string;
  tableComment: string;
  order: Order;
  setOrder: React.Dispatch<React.SetStateAction<Order>>;
  setTableNumber: React.Dispatch<React.SetStateAction<string>>;
  setTableComment: React.Dispatch<React.SetStateAction<string>>;
  setDrinksMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  setMealsMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  setTempMeals: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setPendingNotifications: React.Dispatch<React.SetStateAction<Order[]>>;
  pendingOrders: Order[];
  handleOrderComplete: (order: Order) => void;
  handleOrderCancel: (order: Order) => void;
  handleDrinksComplete: (order: Order) => void;
  setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  completedOrders: Order[]; // Property needed for useOrderHandlers
}

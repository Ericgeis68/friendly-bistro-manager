
import { toast } from "@/hooks/use-toast";
import { generateOrderId } from '../utils/orderUtils';
import type { Order, MenuItem, ScreenType, UserRole } from '../types/restaurant';

interface UseOrderHandlersProps {
  loggedInUser: string;
  setLoggedInUser: (user: string | null) => void;
  setCurrentScreen: (screen: ScreenType) => void;
  tableNumber: string;
  tableComment: string;
  order: Order;
  setOrder: (order: any) => void;
  setTableNumber: (number: string) => void;
  setTableComment: (comment: string) => void;
  setDrinksMenu: (menu: any) => void;
  setMealsMenu: (menu: any) => void;
  setTempMeals: (meals: MenuItem[]) => void;
  setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setPendingNotifications: React.Dispatch<React.SetStateAction<Order[]>>;
  pendingOrders: Order[];
  handleOrderComplete: (order: Order) => void;
  handleOrderCancel: (order: Order) => void;
  handleDrinksComplete: (order: Order) => void;
  setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export const useOrderHandlers = ({
  loggedInUser,
  setLoggedInUser,
  setCurrentScreen,
  tableNumber,
  tableComment,
  order,
  setOrder,
  setTableNumber,
  setTableComment,
  setDrinksMenu,
  setMealsMenu,
  setTempMeals,
  setPendingOrders,
  setPendingNotifications,
  pendingOrders,
  handleOrderComplete,
  handleOrderCancel,
  handleDrinksComplete,
  setCompletedOrders
}: UseOrderHandlersProps) => {
  const handleLogin = (user: string) => {
    setLoggedInUser(user);
    if (user === 'cuisine') {
      setCurrentScreen('cuisine');
    } else if (user === 'admin') {
      setCurrentScreen('admin');
    } else {
      setCurrentScreen('waitress');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setCurrentScreen('login');
    setTableNumber('');
    setTableComment('');
    setOrder({
      table: '',
      drinks: [],
      meals: []
    });
    setDrinksMenu((prevDrinksMenu: MenuItem[]) => prevDrinksMenu.map(drink => ({ ...drink, quantity: 0 })));
    setMealsMenu((prevMealsMenu: MenuItem[]) => prevMealsMenu.map(meal => ({ ...meal, quantity: 0 })));
    setTempMeals([]);
  };

  const handleSubmitOrder = () => {
    // Create separate orders for drinks and meals
    if (order.drinks.length > 0) {
      const drinksOrder: Order = {
        id: generateOrderId() + '-drinks',
        waitress: loggedInUser!,
        meals: [],
        drinks: [...order.drinks],
        table: tableNumber,
        tableComment: tableComment || undefined,
        status: 'pending',
        drinksStatus: 'pending',
        createdAt: new Date().toISOString()
      };
      
      setPendingOrders(prevOrders => [...prevOrders, drinksOrder]);
      
      toast({
        title: "Commande boissons envoyée",
        description: `La commande de boissons pour la table ${tableNumber} a été envoyée.`,
      });
    }
    
    if (order.meals.length > 0) {
      const mealsOrder: Order = {
        id: generateOrderId() + '-meals',
        waitress: loggedInUser!,
        meals: [...order.meals],
        drinks: [],
        table: tableNumber,
        tableComment: tableComment || undefined,
        status: 'pending',
        mealsStatus: 'pending',
        createdAt: new Date().toISOString()
      };
      
      setPendingOrders(prevOrders => [...prevOrders, mealsOrder]);
      
      toast({
        title: "Commande repas envoyée",
        description: `La commande de repas pour la table ${tableNumber} a été envoyée en cuisine.`,
      });
    }
    
    if (order.drinks.length === 0 && order.meals.length === 0) {
      return;
    }

    setDrinksMenu((prevDrinksMenu: MenuItem[]) => prevDrinksMenu.map(drink => ({ ...drink, quantity: 0 })));
    setMealsMenu((prevMealsMenu: MenuItem[]) => prevMealsMenu.map(meal => ({ ...meal, quantity: 0 })));
    setTempMeals([]);
    setOrder({
      table: '',
      drinks: [],
      meals: []
    });
    setTableNumber('');
    setTableComment('');
    setCurrentScreen('waitress');
  };

  const handleNotificationAcknowledge = (orderId: string) => {
    setPendingNotifications(prev => prev.filter(order => order.id !== orderId));
  };

  const handleOrderCompleteWithType = (order: Order, type: 'drinks' | 'meals' | 'both') => {
    // For completely separate orders, we won't need the 'both' type anymore
    if (type === 'drinks' && order.drinks.length > 0) {
      handleOrderComplete(order);
      toast({
        title: "Commande boissons terminée",
        description: `La commande de boissons pour la table ${order.table} a été terminée.`,
      });
    } else if (type === 'meals' && order.meals.length > 0) {
      handleOrderComplete(order);
      toast({
        title: "Commande repas terminée",
        description: `La commande de repas pour la table ${order.table} a été terminée.`,
      });
    } else if (type === 'both' && order.drinks.length > 0 && order.meals.length > 0) {
      // Handle 'both' case - mark everything as complete
      handleOrderComplete(order);
      toast({
        title: "Commande terminée",
        description: `La commande pour la table ${order.table} a été terminée.`,
      });
    }
  };

  const handleOrderCancelWithType = (order: Order, type: 'drinks' | 'meals' | 'all') => {
    // Since orders are now separate, we just cancel the entire order
    handleOrderCancel(order);
    
    if (order.drinks.length > 0) {
      toast({
        title: "Commande boissons annulée",
        description: `La commande de boissons pour la table ${order.table} a été annulée.`,
      });
    } else if (order.meals.length > 0) {
      toast({
        title: "Commande repas annulée",
        description: `La commande de repas pour la table ${order.table} a été annulée.`,
      });
    } else {
      toast({
        title: "Commande annulée",
        description: `La commande pour la table ${order.table} a été annulée.`,
      });
    }
  };

  return {
    handleLogin,
    handleLogout,
    handleSubmitOrder,
    handleNotificationAcknowledge,
    handleOrderCompleteWithType,
    handleOrderCancelWithType
  };
};

import { toast } from "@/hooks/use-toast";
import { generateOrderId } from '../utils/orderUtils';
import type { Order, MenuItem, ScreenType } from '../types/restaurant';

interface UseOrderHandlersProps {
  loggedInUser: string | null;
  setLoggedInUser: (user: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin' | null) => void;
  setCurrentScreen: (screen: ScreenType) => void;
  tableNumber: string;
  tableComment: string;
  order: Omit<Order, 'waitress' | 'id' | 'status' | 'createdAt'>;
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
  handleDrinksComplete
}: UseOrderHandlersProps) => {
  const handleLogin = (user: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin') => {
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
    setDrinksMenu(prevDrinksMenu => prevDrinksMenu.map(drink => ({ ...drink, quantity: 0 })));
    setMealsMenu(prevMealsMenu => prevMealsMenu.map(meal => ({ ...meal, quantity: 0 })));
    setTempMeals([]);
  };

  const handleSubmitOrder = () => {
    if (order.meals.length === 0 && order.drinks.length === 0) {
      return;
    }
    
    const newOrder: Order = {
      id: generateOrderId(),
      waitress: loggedInUser!,
      meals: [...order.meals],
      drinks: [...order.drinks],
      table: tableNumber,
      tableComment: tableComment || undefined,
      status: 'pending',
      drinksStatus: order.drinks.length > 0 ? 'pending' : undefined,
      mealsStatus: order.meals.length > 0 ? 'pending' : undefined,
      createdAt: new Date().toISOString()
    };

    setPendingOrders(prevOrders => [...prevOrders, newOrder]);
    toast({
      title: "Commande envoyée",
      description: `La commande pour la table ${tableNumber} a été envoyée en cuisine.`,
    });

    setDrinksMenu(prevDrinksMenu => prevDrinksMenu.map(drink => ({ ...drink, quantity: 0 })));
    setMealsMenu(prevMealsMenu => prevMealsMenu.map(meal => ({ ...meal, quantity: 0 })));
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

  const handleOrderCompleteWithType = (order: Order, type: 'drinks' | 'meals') => {
    if (type === 'drinks') {
      // If there are no meals, complete the entire order
      if (!order.meals.length) {
        handleOrderComplete(order);
        toast({
          title: "Commande terminée",
          description: `La commande pour la table ${order.table} a été terminée.`,
        });
      } else {
        // If there are meals, just complete the drinks portion
        handleDrinksComplete(order);
      }
    } else if (type === 'meals') {
      // Set meals status to delivered
      const updatedOrder = { ...order, mealsStatus: 'delivered' as const };
      
      // If there are no drinks or drinks are already delivered, complete the entire order
      if (!updatedOrder.drinks.length || updatedOrder.drinksStatus === 'delivered') {
        handleOrderComplete(updatedOrder);
        toast({
          title: "Commande terminée",
          description: `La commande pour la table ${order.table} a été terminée.`,
        });
      } else {
        // If there are drinks that aren't delivered yet, just update the order
        setPendingOrders(prevOrders => 
          prevOrders.map(o => o.id === order.id ? updatedOrder : o)
        );
        
        toast({
          title: "Repas livrés",
          description: `Les repas pour la table ${order.table} ont été livrés.`,
        });
      }
    }
  };

  const handleOrderCancelWithType = (order: Order, type: 'drinks' | 'meals' | 'all') => {
    if (type === 'all') {
      // Cancel the entire order
      handleOrderCancel(order);
      toast({
        title: "Commande annulée",
        description: `La commande pour la table ${order.table} a été annulée.`,
      });
      return;
    }

    const updatedOrder = { ...order };
    
    if (type === 'drinks') {
      // For drinks only, set drinks to empty array
      updatedOrder.drinks = [];
      updatedOrder.drinksStatus = 'cancelled';
      
      toast({
        title: "Boissons annulées",
        description: `Les boissons pour la table ${order.table} ont été annulées.`,
      });
    } else if (type === 'meals') {
      // For meals only, set meals to empty array
      updatedOrder.meals = [];
      updatedOrder.mealsStatus = 'cancelled';
      
      toast({
        title: "Repas annulés",
        description: `Les repas pour la table ${order.table} ont été annulés.`,
      });
    }

    // If both drinks and meals are cancelled or empty, cancel the entire order
    if (
      (updatedOrder.drinks.length === 0 || updatedOrder.drinksStatus === 'cancelled') &&
      (updatedOrder.meals.length === 0 || updatedOrder.mealsStatus === 'cancelled')
    ) {
      handleOrderCancel(order);
    } else {
      // Update the order in pendingOrders
      setPendingOrders(prevOrders =>
        prevOrders.map(o => o.id === order.id ? updatedOrder : o)
      );
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

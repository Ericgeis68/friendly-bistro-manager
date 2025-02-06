import { toast } from "@/hooks/use-toast";
import { generateOrderId } from '../utils/orderUtils';
import type { Order, MenuItem } from '../types/restaurant';

interface UseOrderHandlersProps {
  loggedInUser: string | null;
  setLoggedInUser: (user: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin' | null) => void;
  setCurrentScreen: (screen: any) => void;
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
  setPendingNotifications: (notifications: Order[]) => void;
  pendingOrders: Order[];
  handleOrderComplete: (order: Order) => void;
  handleOrderCancel: (order: Order) => void;
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
  handleOrderCancel
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
    const updatedOrder = { ...order };
    
    if (type === 'drinks') {
      updatedOrder.drinksStatus = 'delivered';
      setPendingOrders(prevOrders => 
        prevOrders.map(o => o.id === order.id ? updatedOrder : o)
      );
    } else {
      updatedOrder.mealsStatus = 'delivered';
      updatedOrder.status = 'delivered';
      setPendingOrders(prevOrders => 
        prevOrders.map(o => o.id === order.id ? updatedOrder : o)
      );
    }

    // Vérifier si les deux sont livrés
    if (
      (!updatedOrder.drinks.length || updatedOrder.drinksStatus === 'delivered') &&
      (!updatedOrder.meals.length || updatedOrder.mealsStatus === 'delivered')
    ) {
      handleOrderComplete(updatedOrder);
    }
  };

  const handleOrderCancelWithType = (order: Order, type: 'drinks' | 'meals') => {
    const updatedOrder = { ...order };
    if (type === 'drinks') {
      updatedOrder.drinksStatus = 'cancelled';
    } else {
      updatedOrder.mealsStatus = 'cancelled';
      if (order.meals.length > 0) {
        updatedOrder.status = 'cancelled';
      }
    }

    if (
      (!updatedOrder.drinks.length || updatedOrder.drinksStatus === 'cancelled') &&
      (!updatedOrder.meals.length || updatedOrder.mealsStatus === 'cancelled')
    ) {
      handleOrderCancel(updatedOrder);
    } else {
      setPendingOrders(prev =>
        prev.map(o => o.id === order.id ? updatedOrder : o)
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
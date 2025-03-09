import { toast } from "@/hooks/use-toast";
import { generateOrderId } from '../utils/orderUtils';
import type { Order, MenuItem, ScreenType } from '../types/restaurant';

interface UseOrderHandlersProps {
  loggedInUser: string;
  setLoggedInUser: (user: string) => void;
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
  completedOrders: Order[];
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
  setCompletedOrders,
  completedOrders
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
    setLoggedInUser('');
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

  const handleOrderCompleteWithType = (order: Order, type: 'drinks' | 'meals') => {
    if (type === 'drinks') {
      if (!order.meals.length) {
        handleOrderComplete(order);
        toast({
          title: "Commande terminée",
          description: `La commande pour la table ${order.table} a été terminée.`,
        });
      } else {
        handleDrinksComplete(order);
      }
    } else if (type === 'meals') {
      const mealsOnlyOrder: Order = {
        ...order,
        id: `${order.id}-meals`,
        drinks: [],
        status: 'delivered' as const,
        mealsStatus: 'delivered' as const,
        drinksStatus: undefined,
        createdAt: order.createdAt
      };
      
      if (!order.drinks.length || order.drinksStatus === 'delivered') {
        handleOrderComplete(order);
        toast({
          title: "Commande terminée",
          description: `La commande pour la table ${order.table} a été terminée.`,
        });
      } else {
        const drinksOnlyOrder: Order = {
          ...order,
          meals: [],
          mealsStatus: undefined,
          status: 'pending' as const
        };
        
        setCompletedOrders(prev => [...prev, mealsOnlyOrder]);
        setPendingOrders(prevOrders => 
          prevOrders.map(o => o.id === order.id ? drinksOnlyOrder : o)
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
      handleOrderCancel(order);
      toast({
        title: "Commande annulée",
        description: `La commande pour la table ${order.table} a été annulée.`,
      });
      return;
    }

    const updatedOrder = { ...order };
    
    if (type === 'drinks') {
      updatedOrder.drinks = [];
      updatedOrder.drinksStatus = 'cancelled';
      
      toast({
        title: "Boissons annulées",
        description: `Les boissons pour la table ${order.table} ont été annulées.`,
      });
    } else if (type === 'meals') {
      updatedOrder.meals = [];
      updatedOrder.mealsStatus = 'cancelled';
      
      toast({
        title: "Repas annulés",
        description: `Les repas pour la table ${order.table} ont été annulés.`,
      });
    }

    if (
      (updatedOrder.drinks.length === 0 || updatedOrder.drinksStatus === 'cancelled') &&
      (updatedOrder.meals.length === 0 || updatedOrder.mealsStatus === 'cancelled')
    ) {
      handleOrderCancel(order);
    } else {
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

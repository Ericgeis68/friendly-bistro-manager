import { toast } from "@/hooks/use-toast";
import { generateOrderId } from '../utils/orderUtils';
import type { Order, MenuItem, ScreenType, UserRole } from '../types/restaurant';
import { db } from '../lib/firebase';
import { ref, set, push, update } from "firebase/database";

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

  const handleSubmitOrder = async () => {
    if (!tableNumber || (!order.drinks.length && !order.meals.length)) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer une commande vide ou sans numéro de table.",
        variant: "destructive"
      });
      return;
    }

    let isOfflineMode = false;
    let offlineOrdersStorage: Order[] = [];

    if (order.drinks.length > 0) {
      const orderId = generateOrderId() + '-drinks';
      
      try {
        const orderRef = ref(db, `orders/${orderId}`);
        await set(orderRef, {
          id: orderId,
          table: tableNumber,
          table_comment: tableComment || null,
          waitress: loggedInUser!,
          status: 'pending',
          drinks_status: 'pending',
          created_at: new Date().toISOString()
        });
        
        order.drinks.forEach(async (drink) => {
          const orderItemRef = ref(db, `order_items/${orderId}/${drink.id}`);
          await set(orderItemRef, {
            order_id: orderId,
            menu_item_id: drink.id,
            name: drink.name,
            price: drink.price,
            quantity: drink.quantity || 0,
            type: 'drink'
          });
        });
      } catch (error) {
        console.error("Erreur Firebase:", error);
        isOfflineMode = true;
        
        toast({
          title: "Mode hors-ligne activé",
          description: "La commande sera enregistrée localement jusqu'à ce que la connexion soit rétablie.",
          variant: "default"
        });
      }
      
      const drinksOrder: Order = {
        id: orderId,
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
      
      if (isOfflineMode) {
        offlineOrdersStorage.push(drinksOrder);
        localStorage.setItem('offlineOrders', JSON.stringify(
          [...JSON.parse(localStorage.getItem('offlineOrders') || '[]'), drinksOrder]
        ));
      }
      
      toast({
        title: "Commande boissons envoyée",
        description: `La commande de boissons pour la table ${tableNumber} a été envoyée.`,
      });
    }
    
    if (order.meals.length > 0) {
      const orderId = generateOrderId() + '-meals';
      
      try {
        const orderRef = ref(db, `orders/${orderId}`);
        await set(orderRef, {
          id: orderId,
          table: tableNumber,
          table_comment: tableComment || null,
          waitress: loggedInUser!,
          status: 'pending',
          meals_status: 'pending',
          created_at: new Date().toISOString()
        });
        
        order.meals.forEach(async (meal) => {
          const orderItemRef = ref(db, `order_items/${orderId}/${meal.id}`);
          await set(orderItemRef, {
            order_id: orderId,
            menu_item_id: meal.id,
            name: meal.name,
            price: meal.price,
            quantity: meal.quantity || 0,
            cooking: meal.cooking,
            type: 'meal'
          });
        });
      } catch (error) {
        console.error("Erreur Firebase:", error);
        isOfflineMode = true;
        
        if (!offlineOrdersStorage.length) {
          toast({
            title: "Mode hors-ligne activé",
            description: "La commande sera enregistrée localement jusqu'à ce que la connexion soit rétablie.",
            variant: "default"
          });
        }
      }
      
      const mealsOrder: Order = {
        id: orderId,
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
      
      if (isOfflineMode) {
        offlineOrdersStorage.push(mealsOrder);
        localStorage.setItem('offlineOrders', JSON.stringify(
          [...JSON.parse(localStorage.getItem('offlineOrders') || '[]'), mealsOrder]
        ));
      }
      
      toast({
        title: "Commande repas envoyée",
        description: `La commande de repas pour la table ${tableNumber} a été envoyée en cuisine.`,
      });
    }
    
    if (order.drinks.length === 0 && order.meals.length === 0) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer une commande vide.",
        variant: "destructive"
      });
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
      handleOrderComplete(order);
      toast({
        title: "Commande terminée",
        description: `La commande pour la table ${order.table} a été terminée.`,
      });
    }
  };

  const handleOrderCancelWithType = (order: Order, type: 'drinks' | 'meals' | 'all') => {
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


import { toast } from "@/hooks/use-toast";
import { generateOrderId } from '../utils/orderUtils';
import type { Order, MenuItem, ScreenType, UserRole } from '../types/restaurant';
import { ref, set } from "firebase/database";
import { database } from '../utils/firebase';

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
    console.log("In handleSubmitOrder function");
    console.log("Order drinks:", order.drinks.length, "Order meals:", order.meals.length);
    console.log("LoggedInUser:", loggedInUser);
    console.log("TableNumber:", tableNumber);
    
    // Create separate orders for drinks and meals
    if (order.drinks.length > 0) {
      console.log("Creating drinks order");
      const drinksOrder: Order = {
        id: generateOrderId() + '-drinks',
        waitress: loggedInUser!,
        meals: [],
        drinks: [...order.drinks],
        table: tableNumber,
        tableComment: tableComment || '', // Use empty string instead of undefined
        status: 'pending',
        drinksStatus: 'pending',
        createdAt: new Date().toISOString()
      };
      
      console.log("Drinks order to save:", drinksOrder);
      
      // Save to Firebase pendingOrders with the ID as the key
      const orderRef = ref(database, `pendingOrders/${drinksOrder.id}`);
      set(orderRef, drinksOrder)
        .then(() => {
          console.log("Drink order saved to Firebase successfully");
          // Update local state
          setPendingOrders(prevOrders => [...prevOrders, drinksOrder]);
          
          toast({
            title: "Commande boissons envoyée",
            description: `La commande de boissons pour la table ${tableNumber} a été envoyée.`,
          });
        })
        .catch(error => {
          console.error("Error saving drink order to Firebase:", error);
          toast({
            title: "Erreur",
            description: "Erreur lors de l'envoi de la commande de boissons.",
            variant: "destructive",
          });
        });
    }
    
    if (order.meals.length > 0) {
      console.log("Creating meals order");
      const mealsOrder: Order = {
        id: generateOrderId() + '-meals',
        waitress: loggedInUser!,
        meals: [...order.meals],
        drinks: [],
        table: tableNumber,
        tableComment: tableComment || '', // Use empty string instead of undefined
        status: 'pending',
        mealsStatus: 'pending',
        createdAt: new Date().toISOString()
      };
      
      console.log("Meals order to save:", mealsOrder);
      
      // Save to Firebase pendingOrders with the ID as the key
      const orderRef = ref(database, `pendingOrders/${mealsOrder.id}`);
      set(orderRef, mealsOrder)
        .then(() => {
          console.log("Meal order saved to Firebase successfully");
          // Update local state
          setPendingOrders(prevOrders => [...prevOrders, mealsOrder]);
          
          toast({
            title: "Commande repas envoyée",
            description: `La commande de repas pour la table ${tableNumber} a été envoyée en cuisine.`,
          });
        })
        .catch(error => {
          console.error("Error saving meal order to Firebase:", error);
          toast({
            title: "Erreur",
            description: "Erreur lors de l'envoi de la commande de repas.",
            variant: "destructive",
          });
        });
    }
    
    if (order.drinks.length === 0 && order.meals.length === 0) {
      console.log("No items in order, returning");
      return;
    }

    console.log("Resetting order state");
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

  // Assurez-vous que la fonction handleOrderCompleteWithType est correctement implémentée
  const handleOrderCompleteWithType = (order: Order, type: 'drinks' | 'meals' | 'both') => {
  console.log("Completing order with type:", type, "Order:", order.id);
  
  // Ajout de logs pour le débogage
  if (type === 'drinks') {
    console.log("Completing drinks");
    handleDrinksComplete(order);
  } else if (type === 'meals') {
    console.log("Completing meals");
    handleOrderComplete(order);
  } else if (type === 'both') {
    console.log("Completing both");
    // Si les deux sont terminés, marquer la commande comme complète
    const updatedOrder = { ...order, status: 'completed' };
    setCompletedOrders(prev => [...prev, updatedOrder]);
    setPendingOrders(prev => prev.filter(o => o.id !== order.id));
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

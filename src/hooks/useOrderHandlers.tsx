import { toast } from "@/hooks/use-toast";
import { generateOrderId } from '../utils/orderUtils';
import type { Order, MenuItem, ScreenType, UserRole } from '../types/restaurant';
import { supabaseHelpers } from '../utils/supabase';

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

  const handleSubmitOrder = async () => {
    console.log("In handleSubmitOrder function");
    console.log("Order drinks:", order.drinks.length, "Order meals:", order.meals.length);
    console.log("LoggedInUser:", loggedInUser);
    console.log("TableNumber:", tableNumber);
    console.log("TableComment:", tableComment);
    
    if (order.drinks.length === 0 && order.meals.length === 0) {
      console.log("No items in order, returning");
      return;
    }
    
    const existingOrders = await supabaseHelpers.getPendingOrders();
    const sameTableOrders = existingOrders.filter((existingOrder: any) => 
      existingOrder.table_number === tableNumber
    );
    
    console.log("Existing orders for this table:", sameTableOrders.length);
    
    const generateId = generateOrderId();
    
    if (order.drinks.length > 0) {
      console.log("Creating drinks order");
      
      // Vérifier s'il existe déjà une commande de boissons pour cette table et cette serveuse
      // SANS commentaire ou avec le même commentaire
      const existingDrinkOrder = sameTableOrders.find((existingOrder: any) => 
        existingOrder.drinks && existingOrder.drinks.length > 0 && 
        (!existingOrder.meals || existingOrder.meals.length === 0) &&
        existingOrder.waitress === loggedInUser &&
        (!tableComment || existingOrder.table_comment === tableComment)
      );
      
      if (existingDrinkOrder && !tableComment) {
        console.log("A drink order already exists for this table and waitress without comment");
        toast({
          title: "Attention",
          description: `Une commande de boissons existe déjà pour la table ${tableNumber}. Ajoutez un commentaire pour créer une nouvelle commande.`,
          variant: "destructive",
        });
        return;
      } else {
        const drinksOrder: Order = {
          id: generateId(tableNumber, 'drinks'),
          waitress: loggedInUser!,
          meals: [],
          drinks: [...order.drinks],
          table: tableNumber,
          tableComment: tableComment || '',
          status: 'pending',
          drinksStatus: 'pending',
          createdAt: new Date().toISOString()
        };
        
        console.log("Drinks order to save:", drinksOrder);
        
        const isDuplicate = pendingOrders.some(existingOrder => 
          existingOrder.table === drinksOrder.table && 
          existingOrder.waitress === drinksOrder.waitress &&
          existingOrder.drinks.length > 0 && 
          existingOrder.meals.length === 0 &&
          existingOrder.tableComment === drinksOrder.tableComment
        );
        
        if (!isDuplicate) {
          try {
            await supabaseHelpers.createOrder(drinksOrder);
            console.log("Drink order saved to Supabase successfully");
            
            if (!pendingOrders.some(o => o.id === drinksOrder.id)) {
              setPendingOrders(prevOrders => [...prevOrders, drinksOrder]);
            }
            
            toast({
              title: "Commande boissons envoyée",
              description: `La commande de boissons pour la table ${tableNumber} a été envoyée.`,
            });
          } catch (error) {
            console.error("Error saving drink order to Supabase:", error);
            toast({
              title: "Erreur",
              description: "Erreur lors de l'envoi de la commande de boissons.",
              variant: "destructive",
            });
          }
        } else {
          console.log("Duplicate drink order detected, not saving");
        }
      }
    }
    
    if (order.meals.length > 0) {
      console.log("Creating meals order");
      
      // Vérifier s'il existe déjà une commande de repas pour cette table et cette serveuse
      // SANS commentaire ou avec le même commentaire
      const existingMealOrder = sameTableOrders.find((existingOrder: any) => 
        existingOrder.meals && existingOrder.meals.length > 0 && 
        (!existingOrder.drinks || existingOrder.drinks.length === 0) &&
        existingOrder.waitress === loggedInUser &&
        (!tableComment || existingOrder.table_comment === tableComment)
      );
      
      if (existingMealOrder && !tableComment) {
        console.log("A meal order already exists for this table and waitress without comment");
        toast({
          title: "Attention",
          description: `Une commande de repas existe déjà pour la table ${tableNumber}. Ajoutez un commentaire pour créer une nouvelle commande.`,
          variant: "destructive",
        });
        return;
      } else {
        const mealsOrder: Order = {
          id: generateId(tableNumber, 'meals'),
          waitress: loggedInUser!,
          meals: [...order.meals],
          drinks: [],
          table: tableNumber,
          tableComment: tableComment || '',
          status: 'pending',
          mealsStatus: 'pending',
          createdAt: new Date().toISOString()
        };
        
        console.log("Meals order to save:", mealsOrder);
        
        const isDuplicate = pendingOrders.some(existingOrder => 
          existingOrder.table === mealsOrder.table && 
          existingOrder.waitress === mealsOrder.waitress &&
          existingOrder.meals.length > 0 && 
          existingOrder.drinks.length === 0 &&
          existingOrder.tableComment === mealsOrder.tableComment
        );
        
        if (!isDuplicate) {
          try {
            await supabaseHelpers.createOrder(mealsOrder);
            console.log("Meal order saved to Supabase successfully");
            
            if (!pendingOrders.some(o => o.id === mealsOrder.id)) {
              setPendingOrders(prevOrders => [...prevOrders, mealsOrder]);
            }
            
            toast({
              title: "Commande repas envoyée",
              description: `La commande de repas pour la table ${tableNumber} a été envoyée en cuisine.`,
            });
          } catch (error) {
            console.error("Error saving meal order to Supabase:", error);
            toast({
              title: "Erreur",
              description: "Erreur lors de l'envoi de la commande de repas.",
              variant: "destructive",
            });
          }
        } else {
          console.log("Duplicate meal order detected, not saving");
        }
      }
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

  const handleNotificationAcknowledge = async (orderId: string) => {
    console.log("Acknowledging notification for order:", orderId);
    
    try {
      await supabaseHelpers.deleteNotification(orderId);
      console.log("Notification removed from Supabase:", orderId);
      
      // Mettre à jour l'état local des notifications
      setPendingNotifications(prev => prev.filter(order => order.id !== orderId));
      
    } catch (error) {
      console.error("Error removing notification:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la notification",
        variant: "destructive",
      });
    }
  };

  const handleOrderCompleteWithType = (order: Order, type: 'drinks' | 'meals' | 'both') => {
    console.log("Completing order with type:", type, "Order:", order.id);
    
    if (type === 'drinks') {
      console.log("Completing drinks");
      handleDrinksComplete(order);
    } else if (type === 'meals') {
      console.log("Completing meals");
      handleOrderComplete(order);
    } else if (type === 'both') {
      console.log("Completing both");
      const updatedOrder: Order = { 
        ...order, 
        status: 'delivered' as const 
      };
      setCompletedOrders(prev => [...prev, updatedOrder]);
      setPendingOrders(prev => prev.filter(o => o.id !== order.id));
    }
  };

  const handleOrderCancelWithType = (order: Order, type: 'drinks' | 'meals' | 'all') => {
    console.log("Cancelling order with type:", type, "Order:", order);
    
    handleOrderCancel(order);
    
    if (type === 'drinks' || (order.drinks && order.drinks.length > 0 && order.meals && order.meals.length === 0)) {
      toast({
        title: "Commande boissons annulée",
        description: `La commande de boissons pour la table ${order.table} a été annulée.`,
      });
    } else if (type === 'meals' || (order.meals && order.meals.length > 0 && order.drinks && order.drinks.length === 0)) {
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

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import type { MenuItem, Order } from '../types/restaurant';
import { supabase, supabaseHelpers } from '../utils/supabase';
import { toast } from '@/hooks/use-toast';
import { DEFAULT_COOKING_OPTIONS } from '../utils/itemGrouping';

type MenuItems = {
  drinks: MenuItem[];
  meals: MenuItem[];
};

type RestaurantContextType = {
  menuItems: MenuItems;
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItems>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  pendingOrders: Order[];
  setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  completedOrders: Order[];
  setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  pendingNotifications: Order[];
  setPendingNotifications: React.Dispatch<React.SetStateAction<Order[]>>;
  cookingOptions: string[];
  setCookingOptions: React.Dispatch<React.SetStateAction<string[]>>;
  saveMenuItemsToSupabase: () => void;
  refreshOrders: () => Promise<void>;
  resetOrders: () => Promise<void>;
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default menu items with globally unique IDs
  const defaultMenuItems: MenuItems = {
    drinks: [
      { id: 1, name: 'Bière', price: 4.50, quantity: 0 },
      { id: 2, name: 'Coca', price: 3.50, quantity: 0 },
      { id: 3, name: 'Eau', price: 2.00, quantity: 0 },
      { id: 4, name: 'Vin Rouge', price: 5.50, quantity: 0 }
    ],
    meals: [
      { id: 101, name: 'Entrecôte', price: 18.50, quantity: 0, needsCooking: true },
      { id: 102, name: 'Entrecôte spécial', price: 22.50, quantity: 0, needsCooking: true },
      { id: 103, name: 'Frites', price: 4.00, quantity: 0 },
      { id: 104, name: 'Saucisse blanche frite', price: 12.50, quantity: 0 },
      { id: 105, name: 'Merguez pain', price: 8.50, quantity: 0 }
    ]
  };

  const [menuItems, setMenuItems] = useState<MenuItems>(defaultMenuItems);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<Order[]>([]);
  const [cookingOptions, setCookingOptions] = useState<string[]>(DEFAULT_COOKING_OPTIONS);
  const processedNotificationsRef = useRef<Set<string>>(new Set());

  // Function to save menu items to Supabase
  const saveMenuItemsToSupabase = async () => {
    try {
      await supabaseHelpers.updateMenuItems(menuItems);
    } catch (error) {
      console.error('Error saving menu items to Supabase:', error);
    }
  };

  // Refresh orders function
  const refreshOrders = async () => {
    console.log("Manually refreshing orders from Supabase");
    try {
      const pendingData = await supabaseHelpers.getPendingOrders();
      const formattedPendingOrders = pendingData.map(order => ({
        id: order.id,
        table: order.table_number,
        tableComment: order.table_comment,
        waitress: order.waitress,
        status: order.status,
        drinksStatus: order.drinks_status,
        mealsStatus: order.meals_status,
        drinks: order.drinks || [],
        meals: order.meals || [],
        createdAt: order.created_at
      }));
      console.log("Refreshed pending orders:", formattedPendingOrders.length);
      setPendingOrders(formattedPendingOrders);

      const completedData = await supabaseHelpers.getCompletedOrders();
      const formattedCompletedOrders = completedData.map(order => ({
        id: order.id,
        table: order.table_number,
        tableComment: order.table_comment,
        waitress: order.waitress,
        status: order.status,
        drinksStatus: order.drinks_status,
        mealsStatus: order.meals_status,
        drinks: order.drinks || [],
        meals: order.meals || [],
        createdAt: order.created_at
      }));
      console.log("Refreshed completed orders:", formattedCompletedOrders.length);
      setCompletedOrders(formattedCompletedOrders);
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  };

  // Reset orders function
  const resetOrders = async () => {
    console.log("Réinitialisation complète des commandes et de la base Supabase");
    
    try {
      await supabaseHelpers.resetAllData();
      
      setPendingOrders([]);
      setCompletedOrders([]);
      setPendingNotifications([]);
      processedNotificationsRef.current = new Set();
      
      toast({
        title: "Réinitialisation terminée",
        description: "Toutes les données de commande ont été supprimées",
      });
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réinitialisation",
        variant: "destructive"
      });
    }
  };

  // Load menu items from Supabase on initial load
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const data = await supabaseHelpers.getMenuItems();
        if (data && data.length > 0) {
          const drinks = data.filter(item => item.category === 'drinks').map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 0,
            needsCooking: item.needs_cooking
          }));
          
          const meals = data.filter(item => item.category === 'meals').map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 0,
            needsCooking: item.needs_cooking
          }));
          
          setMenuItems({ drinks, meals });
        } else {
          // No data in Supabase, use defaults and save them
          setMenuItems(defaultMenuItems);
          await supabaseHelpers.updateMenuItems(defaultMenuItems);
        }
      } catch (error) {
        console.error('Error loading menu items from Supabase:', error);
        // Fallback to localStorage
        const savedMenuItems = localStorage.getItem('menuItems');
        if (savedMenuItems) {
          try {
            const parsedMenuItems = JSON.parse(savedMenuItems);
            setMenuItems(parsedMenuItems);
          } catch (e) {
            console.error("Error parsing menuItems from localStorage:", e);
            setMenuItems(defaultMenuItems);
          }
        }
      }
    };

    loadMenuItems();

    // Set up real-time subscription for menu items
    const menuSubscription = supabaseHelpers.subscribeToMenuItems((payload) => {
      console.log("Menu items updated in Supabase", payload);
      loadMenuItems(); // Reload menu items when they change
    });

    return () => {
      supabase.removeChannel(menuSubscription);
    };
  }, []);

  // Load cooking options with better error handling
  useEffect(() => {
    const loadCookingOptions = async () => {
      console.log("Loading cooking options...");
      
      try {
        // First try to load from localStorage as fallback
        const savedOptions = localStorage.getItem('cookingOptions');
        if (savedOptions) {
          try {
            const parsedOptions = JSON.parse(savedOptions);
            if (Array.isArray(parsedOptions) && parsedOptions.length > 0) {
              console.log("Loaded cooking options from localStorage:", parsedOptions);
              setCookingOptions(parsedOptions);
            }
          } catch (e) {
            console.error("Error parsing cookingOptions from localStorage:", e);
          }
        }

        // Then try to load from Supabase
        const options = await supabaseHelpers.getCookingOptions();
        if (options && options.length > 0) {
          console.log("Loaded cooking options from Supabase:", options);
          setCookingOptions(options);
          // Save to localStorage as backup
          localStorage.setItem('cookingOptions', JSON.stringify(options));
        } else {
          console.log("No cooking options found in Supabase, using defaults");
          // If no options in Supabase and no localStorage, use defaults
          if (!savedOptions) {
            console.log("Setting default cooking options:", DEFAULT_COOKING_OPTIONS);
            setCookingOptions(DEFAULT_COOKING_OPTIONS);
            localStorage.setItem('cookingOptions', JSON.stringify(DEFAULT_COOKING_OPTIONS));
          }
        }
      } catch (error) {
        console.error("Error loading cooking options from Supabase:", error);
        
        // Check if we have localStorage fallback
        const savedOptions = localStorage.getItem('cookingOptions');
        if (savedOptions) {
          try {
            const parsedOptions = JSON.parse(savedOptions);
            console.log("Using cooking options from localStorage fallback:", parsedOptions);
            setCookingOptions(parsedOptions);
          } catch (e) {
            console.error("Error parsing cookingOptions from localStorage:", e);
            console.log("Using default cooking options due to all failures");
            setCookingOptions(DEFAULT_COOKING_OPTIONS);
          }
        } else {
          console.log("No localStorage fallback, using default cooking options");
          setCookingOptions(DEFAULT_COOKING_OPTIONS);
          localStorage.setItem('cookingOptions', JSON.stringify(DEFAULT_COOKING_OPTIONS));
        }
      }
    };

    loadCookingOptions();

    // Set up subscription with error handling
    try {
      const cookingSubscription = supabaseHelpers.subscribeToCookingOptions((payload) => {
        console.log("Cooking options updated in Supabase:", payload);
        loadCookingOptions();
      });

      return () => {
        try {
          supabase.removeChannel(cookingSubscription);
        } catch (error) {
          console.error("Error removing cooking options subscription:", error);
        }
      };
    } catch (error) {
      console.error("Error setting up cooking options subscription:", error);
    }
  }, []);

  // Load and keep in sync pending orders from Supabase
  useEffect(() => {
    const loadPendingOrders = async () => {
      try {
        const data = await supabaseHelpers.getPendingOrders();
        const formattedOrders = data.map(order => ({
          id: order.id,
          table: order.table_number,
          tableComment: order.table_comment,
          waitress: order.waitress,
          status: order.status,
          drinksStatus: order.drinks_status,
          mealsStatus: order.meals_status,
          drinks: order.drinks || [],
          meals: order.meals || [],
          createdAt: order.created_at
        }));
        
        const filteredOrders = formattedOrders.filter(order => order.id !== '99');
        
        const orderMap = new Map<string, Order>();
        filteredOrders.forEach(order => {
          orderMap.set(order.id, order);
        });
        
        const uniqueOrders = Array.from(orderMap.values());
        setPendingOrders(uniqueOrders);
      } catch (error) {
        console.error('Error loading pending orders from Supabase:', error);
        // Fallback to localStorage
        const savedOrders = localStorage.getItem('pendingOrders');
        if (savedOrders) {
          try {
            const parsedOrders = JSON.parse(savedOrders);
            setPendingOrders(parsedOrders);
          } catch (e) {
            console.error("Error parsing pendingOrders from localStorage:", e);
            setPendingOrders([]);
          }
        }
      }
    };

    loadPendingOrders();

    // Set up real-time subscription for orders
    const ordersSubscription = supabaseHelpers.subscribeToOrders((payload) => {
      console.log("Orders updated in Supabase", payload);
      loadPendingOrders(); // Reload orders when they change
    });

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  // Load and keep in sync completed orders from Supabase
  useEffect(() => {
    const loadCompletedOrders = async () => {
      try {
        const data = await supabaseHelpers.getCompletedOrders();
        const formattedOrders = data.map(order => ({
          id: order.id,
          table: order.table_number,
          tableComment: order.table_comment,
          waitress: order.waitress,
          status: order.status,
          drinksStatus: order.drinks_status,
          mealsStatus: order.meals_status,
          drinks: order.drinks || [],
          meals: order.meals || [],
          createdAt: order.created_at
        }));
        
        const filteredOrders = formattedOrders.filter(order => order.id !== '99');
        
        const orderMap = new Map<string, Order>();
        filteredOrders.forEach(order => {
          orderMap.set(order.id, order);
        });
        
        const uniqueOrders = Array.from(orderMap.values());
        setCompletedOrders(uniqueOrders);
      } catch (error) {
        console.error('Error loading completed orders from Supabase:', error);
        // Fallback to localStorage
        const savedCompletedOrders = localStorage.getItem('completedOrders');
        if (savedCompletedOrders) {
          try {
            const parsedOrders = JSON.parse(savedCompletedOrders);
            setCompletedOrders(parsedOrders);
          } catch (e) {
            console.error("Error parsing completedOrders from localStorage:", e);
            setCompletedOrders([]);
          }
        }
      }
    };

    loadCompletedOrders();
  }, []);

  // Load and keep in sync notifications from Supabase
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifications = await supabaseHelpers.getNotifications();
        
        const pendingOrdersMap = new Map();
        pendingOrders.forEach(order => {
          pendingOrdersMap.set(order.id, order);
        });
        
        const notifiedOrders: Order[] = [];
        
        notifications.forEach((notification: any) => {
          const notificationId = `${notification.order_id}-${notification.created_at}`;
          
          if (!processedNotificationsRef.current.has(notificationId)) {
            console.log("Processing unread notification:", notification);
            
            processedNotificationsRef.current.add(notificationId);
            
            const matchingOrder = pendingOrdersMap.get(notification.order_id);
            
            if (matchingOrder) {
              console.log("Found matching order for notification:", matchingOrder.id);
              notifiedOrders.push(matchingOrder);
            }
          }
        });
        
        if (notifiedOrders.length > 0) {
          console.log("Setting pending notifications:", notifiedOrders.length);
          
          setPendingNotifications(prev => {
            const newNotifications = [...prev];
            notifiedOrders.forEach(order => {
              if (!newNotifications.some(o => o.id === order.id)) {
                newNotifications.push(order);
              }
            });
            return newNotifications;
          });
        }
      } catch (error) {
        console.error("Error in notifications listener:", error);
      }
    };

    loadNotifications();

    const notificationsSubscription = supabaseHelpers.subscribeToNotifications((payload) => {
      console.log("Notifications updated in Supabase", payload);
      loadNotifications();
    });

    return () => {
      supabase.removeChannel(notificationsSubscription);
    };
  }, [pendingOrders]);

  return (
    <RestaurantContext.Provider
      value={{
        menuItems,
        setMenuItems,
        orders,
        setOrders,
        pendingOrders,
        setPendingOrders,
        completedOrders,
        setCompletedOrders,
        pendingNotifications,
        setPendingNotifications,
        cookingOptions,
        setCookingOptions,
        saveMenuItemsToSupabase,
        refreshOrders,
        resetOrders
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

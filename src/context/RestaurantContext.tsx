import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import type { MenuItem, Order, User, AppSettings } from '../types/restaurant';
import { supabase, supabaseHelpers } from '../utils/supabase';
import { toast } from '@/hooks/use-toast';
import { DEFAULT_COOKING_OPTIONS } from '../utils/itemGrouping';
// Import sera ajouté après le composant pour éviter les références circulaires

type MenuItems = {
  drinks: MenuItem[];
  meals: MenuItem[];
};

type FloorPlanSettings = {
  showRoomSelector: boolean;
  showFloorPlan: boolean;
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
  floorPlanSettings: FloorPlanSettings;
  setFloorPlanSettings: React.Dispatch<React.SetStateAction<FloorPlanSettings>>;
  selectedRoom: string;
  setSelectedRoom: React.Dispatch<React.SetStateAction<string>>;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  autoPrintEnabled: boolean; // New state for auto print
  setAutoPrintEnabled: React.Dispatch<React.SetStateAction<boolean>>; // Setter for auto print
  autoPrintMealsEnabled: boolean; // Auto print for meals only
  setAutoPrintMealsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  autoPrintDrinksEnabled: boolean; // Auto print for drinks only  
  setAutoPrintDrinksEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  localBackupEnabled: boolean; // New state for local backup
  setLocalBackupEnabled: React.Dispatch<React.SetStateAction<boolean>>; // Setter for local backup
  localBackupMealsEnabled: boolean; // Local backup for meals only
  setLocalBackupMealsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  localBackupDrinksEnabled: boolean; // Local backup for drinks only
  setLocalBackupDrinksEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  localBackupListening: boolean; // Local backup service listening state
  setLocalBackupListening: React.Dispatch<React.SetStateAction<boolean>>;
  saveMenuItemsToSupabase: () => void;
  refreshOrders: () => Promise<void>;
  resetOrders: () => Promise<void>;
  saveFloorPlanSettings: (settings: FloorPlanSettings) => Promise<void>;
  saveAutoPrintSetting: (enabled: boolean) => Promise<void>; // New function to save auto print setting
  saveAutoPrintMealsSetting: (enabled: boolean) => Promise<void>; // Auto print meals setting
  saveAutoPrintDrinksSetting: (enabled: boolean) => Promise<void>; // Auto print drinks setting
  
  saveLocalBackupSetting: (enabled: boolean) => Promise<void>; // New function to save local backup setting
  saveLocalBackupMealsSetting: (enabled: boolean) => Promise<void>; // Local backup meals setting
  saveLocalBackupDrinksSetting: (enabled: boolean) => Promise<void>; // Local backup drinks setting
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default menu items with globally unique IDs
  const defaultMenuItems: MenuItems = {
    drinks: [
      { id: 1, name: 'Bière', price: 4.50, quantity: 0 },
      { id: 2, name: 'Coca', price: 3.50, quantity: 0 },
      { id: 3, name: 'Eau', price: 2.00, quantity: 0 },
      { 
        id: 4, 
        name: 'Vin Rouge', 
        price: 5.50, 
        quantity: 0,
        variants: [
          { name: 'verre', price: 5.50 },
          { name: 'bouteille', price: 22.00 }
        ]
      },
      { 
        id: 5, 
        name: 'Vin Blanc', 
        price: 5.50, 
        quantity: 0,
        variants: [
          { name: 'verre', price: 5.50 },
          { name: 'bouteille', price: 23.00 }
        ]
      },
      { 
        id: 6, 
        name: 'Rosé', 
        price: 5.50, 
        quantity: 0,
        variants: [
          { name: 'verre', price: 5.50 },
          { name: 'bouteille', price: 21.00 }
        ]
      }
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
  const [floorPlanSettings, setFloorPlanSettings] = useState<FloorPlanSettings>({
    showRoomSelector: true,
    showFloorPlan: true
  });
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse currentUser from localStorage", e);
      return null;
    }
  });
  const [autoPrintEnabled, setAutoPrintEnabled] = useState<boolean>(false); // Initialize auto print setting
  const [autoPrintMealsEnabled, setAutoPrintMealsEnabled] = useState<boolean>(false); // Auto print meals
  const [autoPrintDrinksEnabled, setAutoPrintDrinksEnabled] = useState<boolean>(false); // Auto print drinks
  
  const [localBackupEnabled, setLocalBackupEnabled] = useState<boolean>(false); // Initialize local backup setting
  const [localBackupMealsEnabled, setLocalBackupMealsEnabled] = useState<boolean>(false); // Local backup meals
  const [localBackupDrinksEnabled, setLocalBackupDrinksEnabled] = useState<boolean>(false); // Local backup drinks
  const [localBackupListening, setLocalBackupListening] = useState<boolean>(false); // Local backup service listening state
  const processedNotificationsRef = useRef<Set<string>>(new Set());

  // Note: Le service de sauvegarde locale sera initialisé depuis les composants pour éviter les références circulaires

  // Function to save menu items to Supabase
  const saveMenuItemsToSupabase = async () => {
    try {
      await supabaseHelpers.updateMenuItems(menuItems);
    } catch (error) {
      console.error('Error saving menu items to Supabase:', error);
    }
  };

  // Save floor plan settings
  const saveFloorPlanSettings = async (settings: FloorPlanSettings) => {
    try {
      const { error } = await supabaseHelpers.supabase
        .from('settings')
        .upsert({
          id: 'floor_plan_settings',
          data: settings
        });
      
      if (error) throw error;
      
      setFloorPlanSettings(settings);
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres du plan de salle ont été enregistrés.",
      });
    } catch (error) {
      console.error('Error saving floor plan settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    }
  };

  // Save auto print setting
  const saveAutoPrintSetting = async (enabled: boolean) => {
    try {
      await supabaseHelpers.saveAutoPrintSetting(enabled);
      setAutoPrintEnabled(enabled);
      toast({
        title: "Paramètre sauvegardé",
        description: `Impression automatique ${enabled ? 'activée' : 'désactivée'}.`,
      });
    } catch (error) {
      console.error('Error saving auto print setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le paramètre d'impression automatique.",
        variant: "destructive",
      });
    }
  };


  // Save local backup setting
  const saveLocalBackupSetting = async (enabled: boolean) => {
    try {
      await supabaseHelpers.saveLocalBackupSetting(enabled);
      setLocalBackupEnabled(enabled);
      toast({
        title: "Paramètre sauvegardé",
        description: `Sauvegarde locale ${enabled ? 'activée' : 'désactivée'}.`,
      });
    } catch (error) {
      console.error('Error saving local backup setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le paramètre de sauvegarde locale.",
        variant: "destructive",
      });
    }
  };

  // Save auto print meals setting
  const saveAutoPrintMealsSetting = async (enabled: boolean) => {
    try {
      await supabaseHelpers.saveAutoPrintMealsSetting(enabled);
      setAutoPrintMealsEnabled(enabled);
      toast({
        title: "Paramètre sauvegardé",
        description: `Impression automatique repas ${enabled ? 'activée' : 'désactivée'}.`,
      });
    } catch (error) {
      console.error('Error saving auto print meals setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le paramètre d'impression automatique repas.",
        variant: "destructive",
      });
    }
  };

  // Save auto print drinks setting
  const saveAutoPrintDrinksSetting = async (enabled: boolean) => {
    try {
      await supabaseHelpers.saveAutoPrintDrinksSetting(enabled);
      setAutoPrintDrinksEnabled(enabled);
      toast({
        title: "Paramètre sauvegardé",
        description: `Impression automatique boissons ${enabled ? 'activée' : 'désactivée'}.`,
      });
    } catch (error) {
      console.error('Error saving auto print drinks setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le paramètre d'impression automatique boissons.",
        variant: "destructive",
      });
    }
  };

  // Save local backup meals setting
  const saveLocalBackupMealsSetting = async (enabled: boolean) => {
    try {
      await supabaseHelpers.saveLocalBackupMealsSetting(enabled);
      setLocalBackupMealsEnabled(enabled);
      toast({
        title: "Paramètre sauvegardé",
        description: `Sauvegarde locale repas ${enabled ? 'activée' : 'désactivée'}.`,
      });
    } catch (error) {
      console.error('Error saving local backup meals setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le paramètre de sauvegarde locale repas.",
        variant: "destructive",
      });
    }
  };

  // Save local backup drinks setting
  const saveLocalBackupDrinksSetting = async (enabled: boolean) => {
    try {
      await supabaseHelpers.saveLocalBackupDrinksSetting(enabled);
      setLocalBackupDrinksEnabled(enabled);
      toast({
        title: "Paramètre sauvegardé",
        description: `Sauvegarde locale boissons ${enabled ? 'activée' : 'désactivée'}.`,
      });
    } catch (error) {
      console.error('Error saving local backup drinks setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le paramètre de sauvegarde locale boissons.",
        variant: "destructive",
      });
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
          room: order.room_name,
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
          room: order.room_name,
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
            needsCooking: item.needs_cooking,
            variants: item.variants || undefined // Inclure les variantes
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
          try {
            await supabaseHelpers.updateMenuItems(defaultMenuItems);
          } catch (error) {
            console.error('Error saving default menu items:', error);
            // Continue without saving - app will still work with local data
          }
        }
      } catch (error) {
        console.error('Error loading menu items from Supabase:', error);
        
        // Fallback to localStorage
        const savedMenuItems = localStorage.getItem('menuItems');
        if (savedMenuItems) {
          try {
            const parsedMenuItems = JSON.parse(savedMenuItems);
            setMenuItems(parsedMenuItems);
            console.log('Loaded menu items from localStorage fallback');
          } catch (e) {
            console.error("Error parsing menuItems from localStorage:", e);
            setMenuItems(defaultMenuItems);
          }
        } else {
          // Use default menu items if no localStorage and Supabase fails
          console.log('Using default menu items due to connection issues');
          setMenuItems(defaultMenuItems);
        }
      }
    };

    loadMenuItems();

    // Set up real-time subscription for menu items
    console.log('🔗 Setting up menu subscription...');
    try {
      const menuSubscription = supabaseHelpers.subscribeToMenuItems((payload) => {
        console.log("Menu items updated in Supabase", payload);
        loadMenuItems(); // Reload menu items when they change
      });

      console.log('🔗 Menu subscription established');

      return () => {
        console.log('🔗 Cleaning up menu subscription...');
        try {
          if (menuSubscription) {
            supabase.removeChannel(menuSubscription);
            console.log('🔗 Menu subscription cleaned up successfully');
          }
        } catch (error) {
          console.error('❌ Error removing menu subscription:', error);
        }
      };
    } catch (error) {
      console.error('❌ Error setting up menu subscription:', error);
      // Continue without subscription - app will still work
    }
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

    // Load floor plan settings
    const loadFloorPlanSettings = async () => {
      try {
        const { data, error } = await supabaseHelpers.supabase
          .from('settings')
          .select('data')
          .eq('id', 'floor_plan_settings')
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data?.data) {
          setFloorPlanSettings(data.data);
        }
      } catch (error) {
        console.error('Error loading floor plan settings:', error);
      }
    };

    loadFloorPlanSettings();

    // Load app settings (including auto print and auto email)
    const loadAppSettings = async () => {
      try {
        const settings = await supabaseHelpers.getSettings('app_settings');
        if (settings) {
          setAutoPrintEnabled(settings.autoPrintEnabled ?? false);
          setAutoPrintMealsEnabled(settings.autoPrintMealsEnabled ?? false);
          setAutoPrintDrinksEnabled(settings.autoPrintDrinksEnabled ?? false);
          setLocalBackupEnabled(settings.localBackupEnabled ?? false);
          setLocalBackupMealsEnabled(settings.localBackupMealsEnabled ?? false);
          setLocalBackupDrinksEnabled(settings.localBackupDrinksEnabled ?? false);
        }
      } catch (error) {
        console.error('Error loading app settings:', error);
      }
    };

    loadAppSettings();

    // Set up subscription with error handling
    console.log('🔗 Setting up cooking options subscription...');
    try {
      const cookingSubscription = supabaseHelpers.subscribeToCookingOptions((payload) => {
        console.log("Cooking options updated in Supabase:", payload);
        loadCookingOptions();
      });

      console.log('🔗 Cooking options subscription established');

      return () => {
        console.log('🔗 Cleaning up cooking options subscription...');
        try {
          if (cookingSubscription) {
            supabase.removeChannel(cookingSubscription);
            console.log('🔗 Cooking options subscription cleaned up successfully');
          }
        } catch (error) {
          console.error('❌ Error removing cooking options subscription:', error);
        }
      };
    } catch (error) {
      console.error('❌ Error setting up cooking options subscription:', error);
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
          room: order.room_name,
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
    console.log('🔗 Setting up orders subscription...');
    try {
      const ordersSubscription = supabaseHelpers.subscribeToOrders((payload) => {
        console.log("Orders updated in Supabase", payload);
        loadPendingOrders(); // Reload orders when they change
      });

      console.log('🔗 Orders subscription established');

      return () => {
        console.log('🔗 Cleaning up orders subscription...');
        try {
          if (ordersSubscription) {
            supabase.removeChannel(ordersSubscription);
            console.log('🔗 Orders subscription cleaned up successfully');
          }
        } catch (error) {
          console.error('❌ Error removing orders subscription:', error);
        }
      };
    } catch (error) {
      console.error('❌ Error setting up orders subscription:', error);
    }
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
          room: order.room_name,
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

    console.log('🔗 Setting up notifications subscription...');
    try {
      const notificationsSubscription = supabaseHelpers.subscribeToNotifications((payload) => {
        console.log("Notifications updated in Supabase", payload);
        loadNotifications();
      });

      console.log('🔗 Notifications subscription established');

      return () => {
        console.log('🔗 Cleaning up notifications subscription...');
        try {
          if (notificationsSubscription) {
            supabase.removeChannel(notificationsSubscription);
            console.log('🔗 Notifications subscription cleaned up successfully');
          }
        } catch (error) {
          console.error('❌ Error removing notifications subscription:', error);
        }
      };
    } catch (error) {
      console.error('❌ Error setting up notifications subscription:', error);
    }
  }, [pendingOrders]);

  // Effect to save currentUser to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Configuration de la sauvegarde automatique et impression automatique
  useEffect(() => {
    const initAutoBackupAndPrint = async () => {
      try {
        const generalSettings = await supabaseHelpers.getSettings('app_settings');
        console.log('Paramètres sauvegarde auto chargés:', generalSettings);
        setLocalBackupEnabled(generalSettings.localBackupEnabled || false);
        setLocalBackupDrinksEnabled(generalSettings.localBackupDrinksEnabled || false);
        setLocalBackupMealsEnabled(generalSettings.localBackupMealsEnabled || false);
        
        // Charger les paramètres d'impression automatique
        setAutoPrintEnabled(generalSettings.autoPrintEnabled || false);
        setAutoPrintDrinksEnabled(generalSettings.autoPrintDrinksEnabled || false);
        setAutoPrintMealsEnabled(generalSettings.autoPrintMealsEnabled || false);
        
        console.log('Paramètres impression auto chargés:', {
          autoPrintEnabled: generalSettings.autoPrintEnabled || false,
          autoPrintDrinksEnabled: generalSettings.autoPrintDrinksEnabled || false,
          autoPrintMealsEnabled: generalSettings.autoPrintMealsEnabled || false
        });
      } catch (error) {
        console.error('Erreur chargement paramètres sauvegarde auto:', error);
      }
    };

    initAutoBackupAndPrint();
  }, []);

  // Le service d'impression automatique est maintenant géré par usePrintingService

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
        floorPlanSettings,
        setFloorPlanSettings,
        selectedRoom,
        setSelectedRoom,
        currentUser,
        setCurrentUser,
        autoPrintEnabled, // Provide autoPrintEnabled
        setAutoPrintEnabled, // Provide setAutoPrintEnabled
        autoPrintMealsEnabled, // Provide autoPrintMealsEnabled
        setAutoPrintMealsEnabled, // Provide setAutoPrintMealsEnabled
        autoPrintDrinksEnabled, // Provide autoPrintDrinksEnabled
        setAutoPrintDrinksEnabled, // Provide setAutoPrintDrinksEnabled
        localBackupEnabled, // Provide localBackupEnabled
        setLocalBackupEnabled, // Provide setLocalBackupEnabled
        localBackupMealsEnabled, // Provide localBackupMealsEnabled
        setLocalBackupMealsEnabled, // Provide setLocalBackupMealsEnabled
        localBackupDrinksEnabled, // Provide localBackupDrinksEnabled
        setLocalBackupDrinksEnabled, // Provide setLocalBackupDrinksEnabled
        localBackupListening, // Provide localBackupListening
        setLocalBackupListening, // Provide setLocalBackupListening
        saveMenuItemsToSupabase,
        refreshOrders,
        resetOrders,
        saveFloorPlanSettings,
        saveAutoPrintSetting, // Provide saveAutoPrintSetting
        saveAutoPrintMealsSetting, // Provide saveAutoPrintMealsSetting
        saveAutoPrintDrinksSetting, // Provide saveAutoPrintDrinksSetting
        
        saveLocalBackupSetting, // Provide saveLocalBackupSetting
        saveLocalBackupMealsSetting, // Provide saveLocalBackupMealsSetting
        saveLocalBackupDrinksSetting // Provide saveLocalBackupDrinksSetting
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

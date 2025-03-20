
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { MenuItem, Order } from '../types/restaurant';
import { db } from '../lib/firebase';
import { ref, onValue, set, push, remove, get } from "firebase/database";
import { toast } from "@/hooks/use-toast";

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
  cookingOptions: string[];
  setCookingOptions: React.Dispatch<React.SetStateAction<string[]>>;
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItems>({ drinks: [], meals: [] });
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [cookingOptions, setCookingOptions] = useState<string[]>([]);

  // Charge les données initiales depuis Firebase
  useEffect(() => {
    // Charger les éléments du menu
    const loadMenuItems = async () => {
      try {
        // Essayer de charger depuis Firebase
        const menuRef = ref(db, 'menu_items');
        const snapshot = await get(menuRef);
        
        if (snapshot.exists()) {
          const menuData = snapshot.val();
          // Transformer les données de Firebase en format MenuItems
          const formattedMenuItems: MenuItems = { drinks: [], meals: [] };
          
          Object.values(menuData).forEach((item: any) => {
            const menuItem = {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: 0
            };
            
            if (item.type === 'drink') {
              formattedMenuItems.drinks.push(menuItem);
            } else if (item.type === 'meal') {
              formattedMenuItems.meals.push(menuItem);
            }
          });
          
          setMenuItems(formattedMenuItems);
        } else {
          // Rien dans Firebase, essayer localStorage
          const savedMenuItems = localStorage.getItem('menuItems');
          if (savedMenuItems) {
            try {
              setMenuItems(JSON.parse(savedMenuItems));
              // Sauvegarder dans Firebase pour la prochaine fois
              const defaultItems = JSON.parse(savedMenuItems);
              initializeFirebaseData(defaultItems);
            } catch (e) {
              console.error("Erreur lors de l'analyse des données du menu:", e);
              const defaultItems = loadDefaultMenuItems();
              setMenuItems(defaultItems);
              initializeFirebaseData(defaultItems);
            }
          } else {
            // Rien dans localStorage non plus, utiliser les valeurs par défaut
            const defaultItems = loadDefaultMenuItems();
            setMenuItems(defaultItems);
            initializeFirebaseData(defaultItems);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du menu:', error);
        // En cas d'erreur, essayer localStorage
        const savedMenuItems = localStorage.getItem('menuItems');
        if (savedMenuItems) {
          try {
            setMenuItems(JSON.parse(savedMenuItems));
          } catch (e) {
            console.error("Erreur lors de l'analyse des données du menu:", e);
            setMenuItems(loadDefaultMenuItems());
          }
        } else {
          setMenuItems(loadDefaultMenuItems());
        }
      }
    };

    // Charger les options de cuisson
    const loadCookingOptions = async () => {
      try {
        const cookingRef = ref(db, 'cooking_options');
        const snapshot = await get(cookingRef);
        
        if (snapshot.exists()) {
          const cookingData = snapshot.val();
          // Extraire les noms des options
          const options = Object.values(cookingData).map((option: any) => option.name);
          setCookingOptions(options);
        } else {
          // Rien dans Firebase, essayer localStorage
          const savedOptions = localStorage.getItem('cookingOptions');
          if (savedOptions) {
            const options = JSON.parse(savedOptions);
            setCookingOptions(options);
            
            // Sauvegarder dans Firebase pour la prochaine fois
            options.forEach((option: string, index: number) => {
              set(ref(db, `cooking_options/${index}`), { name: option });
            });
          } else {
            // Utilisez les options par défaut
            const defaultOptions = loadDefaultCookingOptions();
            setCookingOptions(defaultOptions);
            
            // Sauvegarder dans Firebase
            defaultOptions.forEach((option: string, index: number) => {
              set(ref(db, `cooking_options/${index}`), { name: option });
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des options de cuisson:', error);
        // En cas d'erreur, essayer localStorage
        const savedOptions = localStorage.getItem('cookingOptions');
        setCookingOptions(savedOptions ? JSON.parse(savedOptions) : []);
      }
    };

    // S'abonner aux changements d'ordres en temps réel
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        fetchAllOrders();
      }
    });

    // Charger les données initiales
    loadMenuItems();
    loadCookingOptions();
    fetchAllOrders();

    // Nettoyage
    return () => {
      unsubscribe(); // Désabonnement de Firebase
    };
  }, []);

  // Fonction pour récupérer toutes les commandes
  const fetchAllOrders = async () => {
    try {
      const ordersRef = ref(db, 'orders');
      const snapshot = await get(ordersRef);
      
      if (!snapshot.exists()) {
        return;
      }
      
      const ordersData = snapshot.val();
      const ordersArray = Object.values(ordersData);
      
      // Récupérer les éléments de commande pour chaque commande
      const ordersWithItems = await Promise.all(
        ordersArray.map(async (order: any) => {
          const orderItemsRef = ref(db, `order_items/${order.id}`);
          const itemsSnapshot = await get(orderItemsRef);
          
          if (!itemsSnapshot.exists()) {
            return null;
          }
          
          const orderItems = itemsSnapshot.val();
          
          // Organiser les éléments en boissons et repas
          const drinks: MenuItem[] = [];
          const meals: MenuItem[] = [];
          
          Object.values(orderItems).forEach((item: any) => {
            const menuItem = {
              id: item.menu_item_id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              cooking: item.cooking
            };
            
            if (item.type === 'drink') {
              drinks.push(menuItem);
            } else {
              meals.push(menuItem);
            }
          });
          
          // Conversion en format Order
          return {
            id: order.id,
            table: order.table,
            tableComment: order.table_comment,
            waitress: order.waitress,
            drinks,
            meals,
            status: order.status,
            drinksStatus: order.drinks_status,
            mealsStatus: order.meals_status,
            createdAt: order.created_at
          } as Order;
        })
      );
      
      // Filtrer les commandes nulles (en cas d'erreur)
      const validOrders = ordersWithItems.filter(Boolean) as Order[];
      
      // Mise à jour des états
      setOrders(validOrders);
      
      // Trier les commandes entre en cours et terminées
      setPendingOrders(
        validOrders.filter(
          (order) => order.status === 'pending' || order.status === 'ready'
        )
      );
      
      setCompletedOrders(
        validOrders.filter(
          (order) => order.status === 'delivered' || order.status === 'cancelled'
        )
      );
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    }
  };

  // Fonction pour initialiser les données Firebase
  const initializeFirebaseData = async (defaultItems: MenuItems) => {
    // Insérer les boissons
    for (const drink of defaultItems.drinks) {
      const drinkRef = ref(db, `menu_items/drink_${drink.id}`);
      await set(drinkRef, {
        id: drink.id,
        name: drink.name,
        price: drink.price,
        type: 'drink'
      });
    }
    
    // Insérer les repas
    for (const meal of defaultItems.meals) {
      const mealRef = ref(db, `menu_items/meal_${meal.id}`);
      await set(mealRef, {
        id: meal.id,
        name: meal.name,
        price: meal.price,
        type: 'meal'
      });
    }
    
    toast({
      title: "Base de données initialisée",
      description: "Les données par défaut ont été chargées dans Firebase.",
    });
  };

  // Charge les éléments de menu par défaut
  const loadDefaultMenuItems = (): MenuItems => {
    return {
      drinks: [
        { id: 1, name: 'Bière', price: 4.50, quantity: 0 },
        { id: 2, name: 'Coca', price: 3.50, quantity: 0 },
        { id: 3, name: 'Eau', price: 2.00, quantity: 0 },
        { id: 4, name: 'Vin Rouge', price: 5.50, quantity: 0 }
      ],
      meals: [
        { id: 1, name: 'Entrecôte', price: 18.50, quantity: 0 },
        { id: 2, name: 'Entrecôte spécial', price: 22.50, quantity: 0 },
        { id: 3, name: 'Frites', price: 4.00, quantity: 0 },
        { id: 4, name: 'Saucisse blanche frite', price: 12.50, quantity: 0 },
        { id: 5, name: 'Merguez pain', price: 8.50, quantity: 0 }
      ]
    };
  };

  const loadDefaultCookingOptions = (): string[] => {
    const savedOptions = localStorage.getItem('cookingOptions');
    return savedOptions ? JSON.parse(savedOptions) : [];
  };

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
        cookingOptions,
        setCookingOptions
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

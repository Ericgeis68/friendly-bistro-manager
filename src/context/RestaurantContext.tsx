import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { MenuItem, Order } from '../types/restaurant';
import { getDatabase, ref, onValue, set, update } from "firebase/database";
import { database, menuItemsRef, pendingOrdersRef, completedOrdersRef } from '../utils/firebase';

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
  saveMenuItemsToFirebase: () => void;
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default menu items in case we need them
  const defaultMenuItems: MenuItems = {
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

  const [menuItems, setMenuItems] = useState<MenuItems>(defaultMenuItems);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  // Function to save menu items to Firebase
  const saveMenuItemsToFirebase = () => {
    set(menuItemsRef, menuItems);
  };

  // Initially load menu items from Firebase, fallback to localStorage if not found in Firebase
  useEffect(() => {
    const unsubscribe = onValue(menuItemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Data exists in Firebase
        setMenuItems(data);
      } else {
        // No data in Firebase, try loading from localStorage
        const savedMenuItems = localStorage.getItem('menuItems');
        if (savedMenuItems) {
          try {
            const parsedMenuItems = JSON.parse(savedMenuItems);
            setMenuItems(parsedMenuItems);
            // Save to Firebase for future use
            set(menuItemsRef, parsedMenuItems);
          } catch (e) {
            console.error("Error parsing menuItems from localStorage:", e);
            setMenuItems(defaultMenuItems);
            set(menuItemsRef, defaultMenuItems);
          }
        } else {
          // No data in localStorage either, use defaults
          setMenuItems(defaultMenuItems);
          set(menuItemsRef, defaultMenuItems);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Load and keep in sync pending orders from Firebase
  useEffect(() => {
    const unsubscribe = onValue(pendingOrdersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.values(data) as Order[];
        setPendingOrders(ordersArray);
      } else {
        // No orders in Firebase, check localStorage
        const savedOrders = localStorage.getItem('pendingOrders');
        if (savedOrders) {
          try {
            const parsedOrders = JSON.parse(savedOrders);
            setPendingOrders(parsedOrders);
            // Save to Firebase for future use
            const ordersObject = parsedOrders.reduce((acc: Record<string, Order>, order: Order) => {
              acc[order.id] = order;
              return acc;
            }, {});
            set(pendingOrdersRef, ordersObject);
          } catch (e) {
            console.error("Error parsing pendingOrders from localStorage:", e);
            setPendingOrders([]);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Load and keep in sync completed orders from Firebase
  useEffect(() => {
    const unsubscribe = onValue(completedOrdersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.values(data) as Order[];
        setCompletedOrders(ordersArray);
      } else {
        // No completed orders in Firebase, check localStorage
        const savedCompletedOrders = localStorage.getItem('completedOrders');
        if (savedCompletedOrders) {
          try {
            const parsedOrders = JSON.parse(savedCompletedOrders);
            setCompletedOrders(parsedOrders);
            // Save to Firebase for future use
            const ordersObject = parsedOrders.reduce((acc: Record<string, Order>, order: Order) => {
              acc[order.id] = order;
              return acc;
            }, {});
            set(completedOrdersRef, ordersObject);
          } catch (e) {
            console.error("Error parsing completedOrders from localStorage:", e);
            setCompletedOrders([]);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

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
        saveMenuItemsToFirebase
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

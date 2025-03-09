
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { MenuItem, Order } from '../types/restaurant';

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
};

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load menu items from localStorage if available, or use defaults
  const loadMenuItems = (): MenuItems => {
    const savedMenuItems = localStorage.getItem('menuItems');
    if (savedMenuItems) {
      try {
        return JSON.parse(savedMenuItems);
      } catch (e) {
        console.error("Error parsing menuItems from localStorage:", e);
      }
    }
    // Default menu items
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

  const [menuItems, setMenuItems] = useState<MenuItems>(loadMenuItems());
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

  // Save menu items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
  }, [menuItems]);

  // Make sure the menu items are properly initialized
  useEffect(() => {
    // This ensures drinks and meals arrays exist
    if (!menuItems.drinks || !menuItems.meals) {
      setMenuItems(loadMenuItems());
    }
  }, [menuItems]);

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
        setCompletedOrders
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

import { useState, useEffect } from 'react';
import type { MenuItem } from '../types/restaurant';
import { useRestaurant } from '../context/RestaurantContext';

export const useMenuManagement = () => {
  // Get the menuItems from RestaurantContext
  const { menuItems, setMenuItems, saveMenuItemsToSupabase } = useRestaurant();
  
  // Initialize state with the values from context
  const [drinksMenu, setDrinksMenu] = useState<MenuItem[]>(menuItems.drinks || []);
  const [mealsMenu, setMealsMenu] = useState<MenuItem[]>(menuItems.meals || []);

  // Update local state when context changes
  useEffect(() => {
    if (menuItems.drinks) {
      setDrinksMenu(menuItems.drinks);
    }
    if (menuItems.meals) {
      setMealsMenu(menuItems.meals);
    }
  }, [menuItems]);

  // Function to add a new menu item
  const addMenuItem = async (newItem: MenuItem, category: 'drinks' | 'meals') => {
    const updatedMenuItems = { ...menuItems };
    updatedMenuItems[category] = [...updatedMenuItems[category], newItem];
    setMenuItems(updatedMenuItems);
    await saveMenuItemsToSupabase();
    
    // Also update the local state directly
    if (category === 'drinks') {
      setDrinksMenu(prev => [...prev, newItem]);
    } else {
      setMealsMenu(prev => [...prev, newItem]);
    }
  };

  // Function to update an existing menu item
  const updateMenuItem = async (updatedItem: MenuItem, category: 'drinks' | 'meals') => {
    const updatedMenuItems = { ...menuItems };
    updatedMenuItems[category] = updatedMenuItems[category].map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    setMenuItems(updatedMenuItems);
    await saveMenuItemsToSupabase();
    
    // Also update the local state directly
    if (category === 'drinks') {
      setDrinksMenu(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    } else {
      setMealsMenu(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    }
  };

  // Function to delete a menu item
  const deleteMenuItem = async (itemId: number, category: 'drinks' | 'meals') => {
    const updatedMenuItems = { ...menuItems };
    updatedMenuItems[category] = updatedMenuItems[category].filter(item => item.id !== itemId);
    setMenuItems(updatedMenuItems);
    await saveMenuItemsToSupabase();
    
    // Also update the local state directly
    if (category === 'drinks') {
      setDrinksMenu(prev => prev.filter(item => item.id !== itemId));
    } else {
      setMealsMenu(prev => prev.filter(item => item.id !== itemId));
    }
  };

  return {
    drinksMenu,
    setDrinksMenu,
    mealsMenu,
    setMealsMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
  };
};

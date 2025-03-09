
import { useState, useEffect } from 'react';
import type { MenuItem } from '../types/restaurant';
import { useRestaurant } from '../context/RestaurantContext';

export const useMenuManagement = () => {
  // Get the menuItems from RestaurantContext
  const { menuItems } = useRestaurant();
  
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

  return {
    drinksMenu,
    setDrinksMenu,
    mealsMenu,
    setMealsMenu
  };
};

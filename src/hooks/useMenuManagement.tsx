
import { useState, useEffect } from 'react';
import type { MenuItem } from '../types/restaurant';
import { useRestaurant } from '../context/RestaurantContext';
import { get, onValue, ref, set } from 'firebase/database';
import { menuItemsRef, database } from '../utils/firebase';

export const useMenuManagement = () => {
  // Get the menuItems from RestaurantContext
  const { menuItems, setMenuItems, saveMenuItemsToFirebase } = useRestaurant();
  
  // Initialize state with the values from context
  const [drinksMenu, setDrinksMenu] = useState<MenuItem[]>(menuItems.drinks || []);
  const [mealsMenu, setMealsMenu] = useState<MenuItem[]>(menuItems.meals || []);

  // Add a listener for real-time updates from Firebase
  useEffect(() => {
    console.log("Setting up menu items listener");
    const unsubscribe = onValue(menuItemsRef, (snapshot) => {
      console.log("Menu items updated in Firebase");
      const data = snapshot.val();
      if (data) {
        console.log("Updating menu items from Firebase:", data);
        // Update the context with the latest data from Firebase
        setMenuItems(data);
        
        // Also store in localStorage as backup
        try {
          localStorage.setItem('menuItems', JSON.stringify(data));
        } catch (e) {
          console.error("Error saving menu items to localStorage:", e);
        }
      } else {
        // If no data in Firebase, try to get from localStorage
        try {
          const localData = localStorage.getItem('menuItems');
          if (localData) {
            const parsedData = JSON.parse(localData);
            console.log("Using menu items from localStorage:", parsedData);
            setMenuItems(parsedData);
            // Push the local data to Firebase
            set(menuItemsRef, parsedData);
          }
        } catch (e) {
          console.error("Error reading menu items from localStorage:", e);
        }
      }
    }, (error) => {
      console.error("Error in menuItems listener:", error);
      // Try to get from localStorage if Firebase fails
      try {
        const localData = localStorage.getItem('menuItems');
        if (localData) {
          const parsedData = JSON.parse(localData);
          console.log("Using menu items from localStorage due to Firebase error");
          setMenuItems(parsedData);
        }
      } catch (e) {
        console.error("Error reading menu items from localStorage:", e);
      }
    });

    return () => {
      console.log("Cleaning up menu items listener");
      unsubscribe();
    };
  }, [setMenuItems]);

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
  const addMenuItem = (newItem: MenuItem, category: 'drinks' | 'meals') => {
    const updatedMenuItems = { ...menuItems };
    updatedMenuItems[category] = [...updatedMenuItems[category], newItem];
    setMenuItems(updatedMenuItems);
    saveMenuItemsToFirebase();
    
    // Also update the local state directly
    if (category === 'drinks') {
      setDrinksMenu(prev => [...prev, newItem]);
    } else {
      setMealsMenu(prev => [...prev, newItem]);
    }
  };

  // Function to update an existing menu item
  const updateMenuItem = (updatedItem: MenuItem, category: 'drinks' | 'meals') => {
    const updatedMenuItems = { ...menuItems };
    updatedMenuItems[category] = updatedMenuItems[category].map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    setMenuItems(updatedMenuItems);
    saveMenuItemsToFirebase();
    
    // Also update the local state directly
    if (category === 'drinks') {
      setDrinksMenu(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    } else {
      setMealsMenu(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    }
  };

  // Function to delete a menu item
  const deleteMenuItem = (itemId: number, category: 'drinks' | 'meals') => {
    const updatedMenuItems = { ...menuItems };
    updatedMenuItems[category] = updatedMenuItems[category].filter(item => item.id !== itemId);
    setMenuItems(updatedMenuItems);
    saveMenuItemsToFirebase();
    
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

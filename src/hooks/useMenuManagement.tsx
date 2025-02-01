import { useState } from 'react';
import type { MenuItem } from '../types/restaurant';

export const useMenuManagement = () => {
  const [drinksMenu, setDrinksMenu] = useState<MenuItem[]>([
    { id: 1, name: 'Bière', price: 4.50, quantity: 0 },
    { id: 2, name: 'Coca', price: 3.50, quantity: 0 },
    { id: 3, name: 'Eau', price: 2.00, quantity: 0 },
    { id: 4, name: 'Vin Rouge', price: 5.50, quantity: 0 }
  ]);

  const [mealsMenu, setMealsMenu] = useState<MenuItem[]>([
    { id: 1, name: 'Entrecôte', price: 18.50, quantity: 0 },
    { id: 2, name: 'Entrecôte spécial', price: 22.50, quantity: 0 },
    { id: 3, name: 'Frites', price: 4.00, quantity: 0 },
    { id: 4, name: 'Saucisse blanche frite', price: 12.50, quantity: 0 },
    { id: 5, name: 'Merguez pain', price: 8.50, quantity: 0 }
  ]);

  return {
    drinksMenu,
    setDrinksMenu,
    mealsMenu,
    setMealsMenu
  };
};
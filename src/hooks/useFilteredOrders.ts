
import { useMemo } from 'react';
import { Order } from '../types/restaurant';

type FilterType = 'all' | 'drinks' | 'meals';

export const useFilteredOrders = (
  orders: Order[], 
  filter: FilterType, 
  searchQuery: string
) => {
  const filteredOrders = useMemo(() => {
    // Ensure orders is an array
    if (!Array.isArray(orders)) {
      console.error("Orders is not an array:", orders);
      return [];
    }

    return orders.filter(order => {
      // Basic validation of order object
      if (!order || typeof order !== 'object') {
        console.warn("Invalid order object:", order);
        return false;
      }
      
      // Ensure required properties exist
      if (!order.id || !order.table) {
        console.warn("Order missing required properties:", order);
        return false;
      }
      
      // Ensure arrays are properly initialized
      const meals = Array.isArray(order.meals) ? order.meals : [];
      const drinks = Array.isArray(order.drinks) ? order.drinks : [];
      
      // Search functionality
      const searchTerm = searchQuery.toLowerCase();
      const table = String(order.table).toLowerCase();
      const tableComment = order.tableComment ? String(order.tableComment).toLowerCase() : '';
      const waitress = order.waitress ? String(order.waitress).toLowerCase() : '';
      
      const matchesSearch =
        table.includes(searchTerm) ||
        tableComment.includes(searchTerm) ||
        waitress.includes(searchTerm) ||
        meals.some(meal => meal && meal.name && meal.name.toLowerCase().includes(searchTerm)) ||
        drinks.some(drink => drink && drink.name && drink.name.toLowerCase().includes(searchTerm));

      // Filter by type
      if (filter === 'drinks') return drinks.length > 0 && matchesSearch;
      if (filter === 'meals') return meals.length > 0 && matchesSearch;
      return matchesSearch;
    });
  }, [orders, filter, searchQuery]);

  return filteredOrders;
};

import { useMemo } from 'react';
import { Order } from '../types/restaurant';

type FilterType = 'all' | 'drinks' | 'meals';

export const useFilteredOrders = (
  orders: Order[], 
  filter: FilterType, 
  searchQuery: string
) => {
  const filteredOrders = useMemo(() => {
    // Make sure orders is an array before filtering
    const safeOrders = Array.isArray(orders) ? orders : [];
    
    return safeOrders.filter(order => {
      // Safety checks for order properties
      const searchTerm = searchQuery.toLowerCase();
      const table = order.table?.toString() || '';
      const tableComment = order.tableComment || '';
      const waitress = order.waitress || '';
      const orderId = order.id || '';
      const meals = Array.isArray(order.meals) ? order.meals : [];
      const drinks = Array.isArray(order.drinks) ? order.drinks : [];
      
      const matchesSearch =
        table.toLowerCase().includes(searchTerm) ||
        tableComment.toLowerCase().includes(searchTerm) ||
        waitress.toLowerCase().includes(searchTerm) ||
        orderId.toLowerCase().includes(searchTerm) ||
        meals.some(meal => (meal.name || '').toLowerCase().includes(searchTerm)) ||
        drinks.some(drink => (drink.name || '').toLowerCase().includes(searchTerm));

      if (filter === 'drinks') return drinks.length > 0 && matchesSearch;
      if (filter === 'meals') return meals.length > 0 && matchesSearch;
      return matchesSearch;
    });
  }, [orders, filter, searchQuery]);

  return filteredOrders;
};

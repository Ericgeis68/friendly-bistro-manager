
import { useMemo } from 'react';
import { Order } from '../types/restaurant';

type FilterType = 'all' | 'drinks' | 'meals';

export const useFilteredOrders = (
  orders: Order[], 
  filter: FilterType, 
  searchQuery: string
) => {
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch =
        order.table.toLowerCase().includes(searchTerm) ||
        (order.tableComment && order.tableComment.toLowerCase().includes(searchTerm)) ||
        order.waitress.toLowerCase().includes(searchTerm) ||
        order.meals.some(meal => meal.name.toLowerCase().includes(searchTerm)) ||
        order.drinks.some(drink => drink.name.toLowerCase().includes(searchTerm));

      if (filter === 'drinks') return order.drinks.length > 0 && matchesSearch;
      if (filter === 'meals') return order.meals.length > 0 && matchesSearch;
      return matchesSearch;
    });
  }, [orders, filter, searchQuery]);

  return filteredOrders;
};

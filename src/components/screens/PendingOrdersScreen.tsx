
import React, { useState } from 'react';
import type { Order } from '../../types/restaurant';
import Header from './pendingOrders/Header';
import FilterBar from './pendingOrders/FilterBar';
import SearchBar from './pendingOrders/SearchBar';
import OrderCard from './pendingOrders/OrderCard';
import { useFilteredOrders } from '../../hooks/useFilteredOrders';

type FilterType = 'all' | 'drinks' | 'meals';

interface PendingOrdersScreenProps {
  orders: Order[];
  onOrderComplete: (order: Order, type: 'drinks' | 'meals') => void;
  onOrderCancel: (order: Order, type: 'drinks' | 'meals' | 'all') => void;
  onBack: () => void;
  setPendingOrders: (orders: Order[]) => void;
}

const PendingOrdersScreen: React.FC<PendingOrdersScreenProps> = ({
  orders,
  onOrderComplete,
  onOrderCancel,
  onBack,
  setPendingOrders
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredOrders = useFilteredOrders(orders, filter, searchQuery);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onBack={onBack} />

      <div className="p-4">
        <FilterBar filter={filter} setFilter={setFilter} />
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOrderComplete={onOrderComplete}
              onOrderCancel={onOrderCancel}
            />
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {filter === 'drinks' && "Aucune commande de boissons en cours"}
              {filter === 'meals' && "Aucune commande de repas en cours"}
              {filter === 'all' && "Aucune commande en cours"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingOrdersScreen;


import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Order } from '../../types/restaurant';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { groupMenuItems } from '../../utils/itemGrouping';
import SearchBar from './pendingOrders/SearchBar';
import { useFilteredOrders } from '@/hooks/useFilteredOrders';

interface CompletedOrdersScreenProps {
  orders: Order[];
  onBack: () => void;
  userRole?: 'waitress' | 'cuisine';
}

const CompletedOrdersScreen: React.FC<CompletedOrdersScreenProps> = ({
  orders,
  onBack,
  userRole = 'waitress'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const formatOrderDate = (date: string | number) => {
    try {
      if (typeof date === 'number') {
        return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
      }
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch {
      return 'Date indisponible';
    }
  };

  const formatDate = (dateString: string | number) => {
    if (typeof dateString === 'number') {
      dateString = new Date(dateString).toISOString();
    }
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Base filter to show only relevant orders by status and type
  const baseFilteredOrders = orders.filter(order => {
    if (userRole === 'cuisine') {
      // Only show meal orders in the kitchen (no drinks)
      return (order.status === 'ready' || order.status === 'delivered' || order.status === 'cancelled') && 
              Array.isArray(order.meals) && order.meals.length > 0;
    } else {
      return (order.status === 'delivered' || order.status === 'cancelled');
    }
  });
  
  // Apply search filter to the base filtered orders
  const filteredOrders = useFilteredOrders(baseFilteredOrders, 'all', searchQuery);

  const getOrderType = (order: Order) => {
    // Add null checks for drinks
    if (order.id.includes('-drinks') || (Array.isArray(order.drinks) && order.drinks.length > 0)) {
      return 'Boissons';
    } else {
      return 'Repas';
    }
  };

  const getStatusText = (status: Order['status'], userRole: string) => {
    switch (status) {
      case 'ready':
        return userRole === 'cuisine' ? 'En cours' : 'Prêt';
      case 'delivered':
        return 'Livré';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUniqueKey = (order: Order) => {
    return `${order.id}-${order.status}-${Date.now()}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-500 p-4 text-white flex items-center">
        <button onClick={onBack} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Commandes terminées</h1>
      </div>

      <div className="p-4">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <div className="space-y-4 mt-4">
          {filteredOrders.map((order) => {
            const orderType = getOrderType(order);
            const orderId = order.id
              .replace('-drinks', '')
              .replace('-meals', '');
              
            // Group meals and drinks by name and cooking style with null checks
            const groupedMeals = Array.isArray(order.meals) && order.meals.length > 0 
              ? groupMenuItems(order.meals) 
              : {};
              
            const groupedDrinks = Array.isArray(order.drinks) && order.drinks.length > 0 
              ? groupMenuItems(order.drinks, false) 
              : {};
              
            return (
              <div key={getUniqueKey(order)} className="bg-white rounded-2xl p-4 shadow">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium text-lg">
                      Table {order.table}
                      {order.tableComment && <span className="text-gray-600 text-sm ml-2">({order.tableComment})</span>}
                    </div>
                    <div className="text-sm text-gray-500">
                      {orderId} - {formatOrderDate(order.createdAt)}
                      <span className="ml-2 italic">({orderType})</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full ${
                      getStatusColor(order.status)
                    }`}>
                      {getStatusText(order.status, userRole)}
                    </span>
                  </div>
                </div>
                {Array.isArray(order.meals) && order.meals.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium mb-1">Repas:</div>
                    {Object.values(groupedMeals).map((meal, mealIndex) => (
                      <div key={`${order.id}-meal-${mealIndex}`} className="text-gray-600 ml-2">
                        {meal.name} x{meal.quantity || 1} {meal.cooking && `(${meal.cooking})`}
                      </div>
                    ))}
                  </div>
                )}
                {Array.isArray(order.drinks) && order.drinks.length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium mb-1">Boissons:</div>
                    {Object.values(groupedDrinks).map((drink, drinkIndex) => (
                      <div key={`${order.id}-drink-${drinkIndex}`} className="text-gray-600 ml-2">
                        {drink.name} x{drink.quantity || 1}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "Aucune commande ne correspond à votre recherche" : "Aucune commande terminée"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedOrdersScreen;

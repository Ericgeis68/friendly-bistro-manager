import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Order } from '../../types/restaurant';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const formatOrderDate = (date: string) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch {
      return 'Date indisponible';
    }
  };

  // Filter orders based on user role
  const filteredOrders = orders.filter(order => {
    // Base filter criteria depends on user role
    if (userRole === 'cuisine') {
      // For cuisine, show ready, delivered or cancelled orders, but not drink-only orders
      return (order.status === 'ready' || order.status === 'delivered' || order.status === 'cancelled') && !order.id.includes('-drinks');
    } else {
      // For waitresses, only show completed or cancelled orders (not 'ready' ones)
      return (order.status === 'delivered' || order.status === 'cancelled');
    }
  });

  // Helper function to determine order type
  const getOrderType = (order: Order) => {
    if (order.id.includes('-drinks')) {
      return 'Boissons';
    } else {
      return 'Repas';
    }
  };

  // Get status text based on order status
  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'ready':
        return 'En cours';
      case 'delivered':
        return 'Livré';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  // Get status color based on order status
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

  // Créer une clé unique pour chaque commande en combinant l'ID et le statut
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

      <div className="p-4 space-y-4">
        {filteredOrders.map((order) => {
          const orderType = getOrderType(order);
          const orderId = order.id
            .replace('-drinks', '')
            .replace('-meals', '');
            
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
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
              {order.meals && order.meals.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium mb-1">Repas:</div>
                  {order.meals.map((meal, mealIndex) => (
                    <div key={`${order.id}-meal-${mealIndex}`} className="text-gray-600 ml-2">
                      {meal.name} x{meal.quantity || 1} {meal.cooking && `(${meal.cooking})`}
                    </div>
                  ))}
                </div>
              )}
              {order.drinks && order.drinks.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium mb-1">Boissons:</div>
                  {order.drinks.map((drink, drinkIndex) => (
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
            Aucune commande terminée
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedOrdersScreen;
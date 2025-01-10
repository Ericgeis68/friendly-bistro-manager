import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Order } from '../../types/restaurant';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PendingOrdersScreenProps {
  orders: Order[];
  onBack: () => void;
  onOrderComplete: (order: Order) => void;
  onOrderCancel: (order: Order) => void;
}

const PendingOrdersScreen: React.FC<PendingOrdersScreenProps> = ({
  orders,
  onBack,
  onOrderComplete,
  onOrderCancel
}) => {
  const formatOrderDate = (date: string) => {
    try {
      const orderDate = new Date(date);
      return format(orderDate, 'HH:mm', { locale: fr });
    } catch {
      return 'Heure indisponible';
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: 'En cours',
      ready: 'Prêt',
      delivered: 'Livré',
      cancelled: 'Annulé',
      completed: 'Terminé'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-500 p-4 text-white flex items-center">
        <button onClick={onBack} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Commandes en cours</h1>
      </div>

      <div className="p-4 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl p-4 shadow">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="font-medium text-lg">Table {order.table}</div>
                <div className="text-sm text-gray-500">
                  {order.id} - {formatOrderDate(order.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(order.status)}
                <div className="flex gap-2">
                  {order.status === 'ready' && (
                    <button
                      onClick={() => onOrderComplete({ ...order, status: 'delivered' })}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      Terminé
                    </button>
                  )}
                  <button
                    onClick={() => onOrderCancel(order)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Annulé
                  </button>
                </div>
              </div>
            </div>
            {order.meals.length > 0 && (
              <div className="mt-2">
                <div className="font-medium mb-1">Repas:</div>
                {order.meals.map((meal, mealIndex) => (
                  <div key={`${order.id}-meal-${mealIndex}`} className="text-gray-600 ml-2">
                    {meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}
                  </div>
                ))}
              </div>
            )}
            {order.drinks.length > 0 && (
              <div className="mt-2">
                <div className="font-medium mb-1">Boissons:</div>
                {order.drinks.map((drink, drinkIndex) => (
                  <div key={`${order.id}-drink-${drinkIndex}`} className="text-gray-600 ml-2">
                    {drink.name} x{drink.quantity}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune commande en cours
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingOrdersScreen;
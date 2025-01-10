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
      return format(new Date(date), 'HH:mm', { locale: fr });
    } catch {
      return 'Heure indisponible';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    if (status === 'ready') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return '';
  };

  const getStatusText = (status: Order['status']) => {
    if (status === 'ready') {
      return 'Prêt';
    }
    return '';
  };

  const calculateSubtotals = (order: Order) => {
    const drinksTotal = order.drinks.reduce((sum, drink) => sum + (drink.price * drink.quantity), 0);
    const mealsTotal = order.meals.reduce((sum, meal) => sum + (meal.price * meal.quantity), 0);
    return { drinksTotal, mealsTotal, total: drinksTotal + mealsTotal };
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
        {orders.map((order) => {
          const { drinksTotal, mealsTotal, total } = calculateSubtotals(order);
          return (
            <div key={order.id} className="bg-white rounded-2xl p-4 shadow">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium text-lg">Table {order.table}</div>
                  <div className="text-sm text-gray-500">
                    {order.id} - {formatOrderDate(order.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {order.status === 'ready' && (
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onOrderComplete(order)}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Terminé
                    </button>
                    <button
                      onClick={() => onOrderCancel(order)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
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
                    <div key={`${order.id}-meal-${mealIndex}`} className="text-gray-600 ml-2 flex justify-between">
                      <span>
                        {meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}
                      </span>
                      <span>{(meal.price * meal.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                  <div className="text-right text-sm text-gray-600 mt-1">
                    Sous-total repas: {mealsTotal.toFixed(2)} €
                  </div>
                </div>
              )}
              {order.drinks.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium mb-1">Boissons:</div>
                  {order.drinks.map((drink, drinkIndex) => (
                    <div key={`${order.id}-drink-${drinkIndex}`} className="text-gray-600 ml-2 flex justify-between">
                      <span>
                        {drink.name} x{drink.quantity}
                      </span>
                      <span>{(drink.price * drink.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                  <div className="text-right text-sm text-gray-600 mt-1">
                    Sous-total boissons: {drinksTotal.toFixed(2)} €
                  </div>
                </div>
              )}
              <div className="mt-3 text-right font-medium">
                Total: {total.toFixed(2)} €
              </div>
            </div>
          );
        })}
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
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Order } from '../../types/restaurant';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PendingOrdersScreenProps {
  orders: Order[];
  onBack: () => void;
  onOrderComplete: (order: Order, type: 'drinks' | 'meals') => void;
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
                  <div className="font-medium text-lg">
                    Table {order.table}
                    {order.tableComment && <span className="text-gray-600 text-sm ml-2">({order.tableComment})</span>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.id} - {formatOrderDate(order.createdAt)}
                  </div>
                </div>
              </div>

              {order.drinks.length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">Boissons:</div>
                    <div className="flex gap-2">
                      {order.drinksStatus !== 'delivered' && (
                        <button
                          onClick={() => onOrderComplete(order, 'drinks')}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                        >
                          Livré
                        </button>
                      )}
                    </div>
                  </div>
                  {order.drinks.map((drink, drinkIndex) => (
                    <div key={`${order.id}-drink-${drinkIndex}`} className="text-gray-600 ml-2 flex justify-between">
                      <span>{drink.name} x{drink.quantity}</span>
                      <span>{(drink.price * drink.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                  <div className="text-right text-sm text-gray-600 mt-1">
                    Sous-total boissons: {drinksTotal.toFixed(2)} €
                  </div>
                </div>
              )}

              {order.meals.length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">Repas:</div>
                    <div className="flex gap-2">
                      {order.mealsStatus !== 'delivered' && (
                        <button
                          onClick={() => onOrderComplete(order, 'meals')}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                        >
                          Livré
                        </button>
                      )}
                    </div>
                  </div>
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

              <div className="mt-3 pt-2 border-t flex justify-between items-center">
                <button
                  onClick={() => onOrderCancel(order)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Annuler
                </button>
                <div className="font-medium">
                  Total: {total.toFixed(2)} €
                </div>
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
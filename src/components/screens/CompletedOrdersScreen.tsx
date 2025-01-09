import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Order } from '../../types/restaurant';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CompletedOrdersScreenProps {
  orders: Order[];
  onBack: () => void;
}

const CompletedOrdersScreen: React.FC<CompletedOrdersScreenProps> = ({
  orders,
  onBack
}) => {
  const formatOrderDate = (date: string) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch {
      return 'Date indisponible';
    }
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
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl p-4 shadow">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="font-medium text-lg">Table {order.table}</div>
                <div className="text-sm text-gray-500">
                  {order.id} - {formatOrderDate(order.createdAt)}
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
            Aucune commande terminée
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedOrdersScreen;
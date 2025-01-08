import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
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
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-500 p-4 text-white flex items-center">
        <button onClick={onBack} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Commandes en cours</h1>
      </div>

      <div className="p-4 space-y-4">
        {orders.map((order, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-medium text-lg">Table {order.table}</span>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                  <Clock size={16} className="mr-1" />
                  {format(new Date(order.createdAt!), 'HH:mm', { locale: fr })}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onOrderComplete(order)}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  Terminé
                </button>
                <button
                  onClick={() => onOrderCancel(order)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  Annulé
                </button>
              </div>
            </div>
            {order.meals.map((meal, mealIndex) => (
              <div key={`${index}-${mealIndex}`} className="text-gray-600">
                {meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}
              </div>
            ))}
            {order.drinks.map((drink, drinkIndex) => (
              <div key={`${index}-${drinkIndex}`} className="text-gray-600">
                {drink.name} x{drink.quantity}
              </div>
            ))}
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
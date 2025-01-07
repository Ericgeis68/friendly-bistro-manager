import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Order } from '../../types/restaurant';

interface PendingOrdersScreenProps {
  orders: Order[];
  onBack: () => void;
}

const PendingOrdersScreen: React.FC<PendingOrdersScreenProps> = ({ orders, onBack }) => {
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
              <span className="font-medium text-lg">Table {order.table}</span>
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
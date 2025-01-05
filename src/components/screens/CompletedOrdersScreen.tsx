import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Order, ScreenType } from '../types';

interface CompletedOrdersScreenProps {
  setCurrentScreen: (screen: ScreenType) => void;
  completedOrders: Order[];
}

const CompletedOrdersScreen: React.FC<CompletedOrdersScreenProps> = ({
  setCurrentScreen,
  completedOrders,
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#0EA5E9] p-4 text-white flex items-center">
        <button onClick={() => setCurrentScreen('waitress')} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Commandes terminées</h1>
      </div>

      <div className="p-4">
        {completedOrders.map((order, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 shadow mb-4 border-l-4 border-green-500">
            <h3 className="text-lg font-medium mb-2 text-gray-800">Commande #{index + 1}</h3>
            {order.drinks.length > 0 && (
              <>
                <h4 className="text-md font-medium mb-1 text-gray-800">Boissons:</h4>
                <ul>
                  {order.drinks.map(drink => (
                    <li key={drink.id} className="flex justify-between text-gray-800">
                      <span>{drink.name} x{drink.quantity}</span>
                      <span>{(drink.price * drink.quantity).toFixed(2)} €</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {order.meals.length > 0 && (
              <>
                <h4 className="text-md font-medium mb-1 mt-2 text-gray-800">Repas:</h4>
                <ul>
                  {order.meals.map(meal => (
                    <li key={meal.id} className="flex justify-between text-gray-800">
                      <span>{meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}</span>
                      <span>{(meal.price * meal.quantity).toFixed(2)} €</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedOrdersScreen;
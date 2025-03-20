import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { Order, MenuItem } from '../../types/restaurant';
import { useToast } from '@/hooks/use-toast';
import { groupMenuItems } from '../../utils/itemGrouping';

interface OrderDetailScreenProps {
  order: Order;
  onBack: () => void;
  onOrderComplete: (order: Order, type: 'drinks' | 'meals') => void;
  onOrderCancel: (order: Order, type: 'drinks' | 'meals' | 'all') => void; // Add this line
}

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({
  order,
  onBack,
  onOrderComplete,
  onOrderCancel
}) => {
  // Add a handleCompleteOrder function that calls onOrderComplete and then navigates back
  const handleCompleteOrder = (type: 'drinks' | 'meals') => {
    onOrderComplete(order, type);
    // Navigate back to the waitress home screen after completing the order
    onBack();
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

  const calculateTotal = (items: MenuItem[]) => {
    return items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2);
  };

  const hasDrinks = order.drinks && order.drinks.length > 0;
  const hasMeals = order.meals && order.meals.length > 0;
  const isDrinksReady = order.drinksStatus === 'ready';
  const isMealsReady = order.mealsStatus === 'ready';

  const groupedDrinks = groupMenuItems(order.drinks, false);
  const groupedMeals = groupMenuItems(order.meals);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex items-center">
        <ArrowLeft className="mr-2 cursor-pointer" onClick={onBack} />
        <div className="text-lg font-medium text-gray-800">Détails Commande - Table {order.table}</div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Heure de commande:</span>
            <span className="font-medium">{formatDate(order.createdAt)}</span>
          </div>
          {order.tableComment && (
            <div className="bg-yellow-50 p-2 rounded-md text-sm mb-4">
              Note: {order.tableComment}
            </div>
          )}
        </div>

        {hasDrinks && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Boissons</h3>
              {isDrinksReady && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Prêt à servir
                </div>
              )}
            </div>
            {Object.values(groupedDrinks).map((drink, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center">
                  <span className="font-medium">
                    {drink.quantity || 1}x
                  </span>
                  <span className="ml-2">{drink.name}</span>
                </div>
                <span>{drink.price.toFixed(2)} €</span>
              </div>
            ))}
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-200">
              <span className="font-medium">Total boissons:</span>
              <span className="font-medium">{calculateTotal(order.drinks)} €</span>
            </div>
            {isDrinksReady && (
              <button
                onClick={() => handleCompleteOrder('drinks')}
                className="mt-4 bg-green-600 text-white py-2 px-4 rounded-md w-full flex items-center justify-center"
              >
                <CheckCircle2 className="mr-2" size={18} />
                Boissons servies
              </button>
            )}
          </div>
        )}

        {hasMeals && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Repas</h3>
              {isMealsReady && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Prêt à servir
                </div>
              )}
            </div>
            {Object.values(groupedMeals).map((meal, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="font-medium">
                      {meal.quantity || 1}x
                    </span>
                    <span className="ml-2">{meal.name}</span>
                  </div>
                  {meal.cooking && (
                    <span className="text-xs text-gray-500 ml-5">
                      Cuisson: {meal.cooking}
                    </span>
                  )}
                </div>
                <span>{meal.price.toFixed(2)} €</span>
              </div>
            ))}
            <div className="flex justify-between mt-3 pt-2 border-t border-gray-200">
              <span className="font-medium">Total repas:</span>
              <span className="font-medium">{calculateTotal(order.meals)} €</span>
            </div>
            {isMealsReady && (
              <button
                onClick={() => handleCompleteOrder('meals')}
                className="mt-4 bg-green-600 text-white py-2 px-4 rounded-md w-full flex items-center justify-center"
              >
                <CheckCircle2 className="mr-2" size={18} />
                Repas servis
              </button>
            )}
          </div>
        )}

        {(isDrinksReady && isMealsReady && hasDrinks && hasMeals) && (
          <button
            onClick={() => {
              // Complete both drinks and meals, then navigate back
              onOrderComplete(order, 'drinks');
              onOrderComplete(order, 'meals');
              onBack();
            }}
            className="mt-4 bg-blue-600 text-white py-3 px-4 rounded-md w-full flex items-center justify-center"
          >
            <CheckCircle2 className="mr-2" size={18} />
            Tout est servi
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetailScreen;

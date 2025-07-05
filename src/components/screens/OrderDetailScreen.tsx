import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Order, MenuItem } from '../../types/restaurant';
import { Badge } from '../ui/badge';

export interface OrderDetailScreenProps {
  order: Order;
  onBack: () => void;
  onOrderComplete: (order: Order, type: 'drinks' | 'meals' | 'both') => void;
  onOrderCancel: (order: Order, type: 'drinks' | 'meals' | 'all') => void;
}

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({
  order,
  onBack,
  onOrderComplete,
  onOrderCancel
}) => {
  const { drinks = [], meals = [], table, tableComment, status } = order;
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const formatDate = (date: string | number) => {
    return new Date(String(date)).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ensure meals and drinks are arrays
  const safeMeals = Array.isArray(meals) ? meals : [];
  const safeDrinks = Array.isArray(drinks) ? drinks : [];

  // Grouper manuellement pour préserver les commentaires
  const groupDrinksWithComments = (drinks: MenuItem[]) => {
    const grouped: { [key: string]: MenuItem } = {};
    
    drinks.forEach(drink => {
      const key = drink.comment ? `${drink.name}-${drink.comment}` : drink.name;
      
      if (grouped[key]) {
        grouped[key].quantity = (grouped[key].quantity || 1) + (drink.quantity || 1);
      } else {
        grouped[key] = { ...drink };
      }
    });
    
    return Object.values(grouped);
  };

  const groupMealsWithComments = (meals: MenuItem[]) => {
    const grouped: { [key: string]: MenuItem } = {};
    
    meals.forEach(meal => {
      const cookingPart = meal.cooking ? `-${meal.cooking}` : '';
      const commentPart = meal.comment ? `-${meal.comment}` : '';
      const key = `${meal.name}${cookingPart}${commentPart}`;
      
      if (grouped[key]) {
        grouped[key].quantity = (grouped[key].quantity || 1) + (meal.quantity || 1);
      } else {
        grouped[key] = { ...meal };
      }
    });
    
    return Object.values(grouped);
  };

  const groupedMeals = safeMeals.length > 0 ? groupMealsWithComments(safeMeals) : [];
  const groupedDrinks = safeDrinks.length > 0 ? groupDrinksWithComments(safeDrinks) : [];

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="bg-blue-500 p-4 text-white flex items-center">
        <button onClick={onBack} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Détails de commande</h1>
          <div className="text-sm">Table {table}</div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 mb-4`}>
          <div className="flex justify-between mb-2">
            <div>
              <h2 className="font-bold text-lg">Table {table}</h2>
              {tableComment && <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{tableComment}</p>}
            </div>
            <Badge
              variant={status === 'ready' ? 'secondary' : status === 'pending' ? 'default' : 'outline'}
            >
              {status === 'ready' ? 'Prêt' : status === 'pending' ? 'En attente' : 'Livré'}
            </Badge>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {order.createdAt && `Commande à ${formatDate(String(order.createdAt))}`}
          </div>
        </div>

        {groupedDrinks.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 mb-4`}>
            <h2 className={`font-bold mb-2 text-lg border-b pb-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Boissons</h2>
            {groupedDrinks.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className={isDarkMode ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}> x{item.quantity || 1}</span>
                  </div>
                  <span>{(item.price * (item.quantity || 1)).toFixed(2)} €</span>
                </div>
                {item.comment && (
                  <div className={`text-sm italic mt-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    "{item.comment}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {groupedMeals.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 mb-4`}>
            <h2 className={`font-bold mb-2 text-lg border-b pb-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>Repas</h2>
            {groupedMeals.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className={isDarkMode ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}> x{item.quantity || 1}</span>
                    {item.cooking && <span className={isDarkMode ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}> ({item.cooking})</span>}
                  </div>
                  <span>{(item.price * (item.quantity || 1)).toFixed(2)} €</span>
                </div>
                {item.comment && (
                  <div className={`text-sm italic mt-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    "{item.comment}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
        {status === 'pending' && (
          <div className="grid grid-cols-2 gap-2">
            {safeDrinks.length > 0 && (
              <button
                onClick={() => onOrderComplete(order, 'drinks')}
                className="h-12 bg-green-500 text-white rounded-md"
              >
                Boissons servies
              </button>
            )}
            {safeMeals.length > 0 && order.mealsStatus === 'ready' && (
              <button
                onClick={() => onOrderComplete(order, 'meals')}
                className="h-12 bg-green-500 text-white rounded-md"
              >
                Repas servis
              </button>
            )}
            <button
              onClick={() => onOrderCancel(order, safeDrinks.length > 0 ? 'drinks' : 'meals')}
              className="h-12 bg-red-500 text-white rounded-md col-span-2 mt-2"
            >
              Annuler la commande
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailScreen;

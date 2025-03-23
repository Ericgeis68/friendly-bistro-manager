
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { MenuItem } from '../../types/restaurant';

interface DrinkMenuScreenProps {
  tableNumber: string;
  drinksMenu: MenuItem[];
  setDrinksMenu: (drinks: MenuItem[]) => void;
  setCurrentScreen: (screen: 'category') => void;
  setOrder: (order: any) => void;
}

const DrinkMenuScreen: React.FC<DrinkMenuScreenProps> = ({
  tableNumber,
  drinksMenu,
  setDrinksMenu,
  setCurrentScreen,
  setOrder
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const updateQuantity = (id: number, increment: number) => {
    const updatedDrinks = drinksMenu.map(drink => {
      if (drink.id === id) {
        return {...drink, quantity: Math.max(0, drink.quantity + increment)};
      }
      return drink;
    });
    setDrinksMenu(updatedDrinks);
  };

  const handleValidate = () => {
    const orderedDrinks = drinksMenu.filter(d => d.quantity > 0);
    if (orderedDrinks.length === 0) {
      return;
    }
    setOrder(prev => ({ ...prev, drinks: orderedDrinks }));
    setCurrentScreen('category');
  };

  const totalAmount = drinksMenu.reduce((sum, drink) => sum + (drink.price * drink.quantity), 0);

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="bg-blue-500 p-4 text-white flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => setCurrentScreen('category')} className="mr-2">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Boissons</h1>
            <div className="text-sm">Table {tableNumber}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {drinksMenu.map(drink => (
          <div key={drink.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mb-3 shadow`}>
            <div className="flex justify-between items-center">
              <div>
                <div className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{drink.name}</div>
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{drink.price.toFixed(2)} €</div>
              </div>
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => updateQuantity(drink.id, -1)}
                  className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-500'} flex items-center justify-center text-xl font-medium`}
                >
                  -
                </button>
                <span className={`w-6 text-center text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{drink.quantity}</span>
                <button
                  onClick={() => updateQuantity(drink.id, 1)}
                  className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-500'} flex items-center justify-center text-xl font-medium`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`flex justify-between mb-4 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          <span>Total</span>
          <span>{totalAmount.toFixed(2)} €</span>
        </div>
        <button
          onClick={handleValidate}
          className={`w-full h-12 text-lg ${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md`}
        >
          Valider la commande
        </button>
      </div>
    </div>
  );
};

export default DrinkMenuScreen;

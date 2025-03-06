
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { MenuItem } from '../../types/restaurant';

interface RecapOrderScreenProps {
  tableNumber: string;
  order: {
    drinks: MenuItem[];
    meals: MenuItem[];
  };
  handleSubmitOrder: () => void;
  setCurrentScreen: (screen: 'category' | 'splitPayment') => void;
}

const RecapOrderScreen: React.FC<RecapOrderScreenProps> = ({
  tableNumber,
  order,
  handleSubmitOrder,
  setCurrentScreen
}) => {
  const [amountReceived, setAmountReceived] = useState('');
  const { drinks = [], meals = [] } = order;

  const drinkTotal = drinks.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const mealTotal = meals.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalAmount = drinkTotal + mealTotal;
  const change = amountReceived ? parseFloat(amountReceived) - totalAmount : 0;

  const groupedMeals = meals.reduce<Record<string, MenuItem>>((acc, meal) => {
    const key = `${meal.name}-${meal.cooking || 'none'}`;
    if (acc[key]) {
      acc[key].quantity = (acc[key].quantity || 1) + 1;
    } else {
      acc[key] = { ...meal, quantity: 1 };
    }
    return acc;
  }, {});

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-blue-500 p-4 text-white flex items-center">
        <button onClick={() => setCurrentScreen('category')} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Addition</h1>
          <div className="text-sm">Table {tableNumber}</div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {drinks.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <h2 className="font-bold mb-2 text-lg border-b pb-2 text-gray-800">Boissons</h2>
            {drinks.map(item => (
              <div key={item.id} className="flex justify-between mb-2 text-gray-800">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 text-sm"> x{item.quantity || 1}</span>
                </div>
                <span>{((item.price * (item.quantity || 1))).toFixed(2)} €</span>
              </div>
            ))}
            <div className="text-right text-gray-600 border-t pt-2 mt-2">
              Sous-total boissons: {drinkTotal.toFixed(2)} €
            </div>
          </div>
        )}
        {Object.values(groupedMeals).length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <h2 className="font-bold mb-2 text-lg border-b pb-2 text-gray-800">Repas</h2>
            {Object.values(groupedMeals).map(item => (
              <div key={`${item.id}-${item.cooking}`} className="flex justify-between mb-2 text-gray-800">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 text-sm"> x{item.quantity}</span>
                  {item.cooking && <span className="text-gray-600 text-sm"> ({item.cooking})</span>}
                </div>
                <span>{(item.price * (item.quantity || 1)).toFixed(2)} €</span>
              </div>
            ))}
            <div className="text-right text-gray-600 border-t pt-2 mt-2">
              Sous-total repas: {mealTotal.toFixed(2)} €
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex justify-between mb-4 text-lg font-medium text-gray-800">
          <span>Total</span>
          <span>{totalAmount.toFixed(2)} €</span>
        </div>
        <div className="mb-4">
          <input
            type="number"
            placeholder="Somme reçue"
            className="w-full mb-2 h-12 text-lg px-3 rounded-md border border-gray-300 text-gray-800"
            value={amountReceived}
            onChange={(e) => setAmountReceived(e.target.value)}
          />
          {amountReceived && <div className="text-right text-gray-600">
            Rendu: {change.toFixed(2)} €
          </div>}
        </div>
        <button
          onClick={handleSubmitOrder}
          className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-md mb-2"
        >
          Valider la commande
        </button>
        <button
          onClick={() => setCurrentScreen('splitPayment')}
          className="w-full h-12 text-lg bg-green-500 hover:bg-green-600 text-white rounded-md"
        >
          Paiement séparé
        </button>
      </div>
    </div>
  );
};

export default RecapOrderScreen;

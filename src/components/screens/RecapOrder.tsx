import React from 'react';
import { Button } from "@/components/ui/button";
import type { MenuItem } from '../../types/restaurant';

interface RecapOrderProps {
  order: { drinks: MenuItem[], meals: MenuItem[] };
  tableNumber: string;
  handleSubmitOrder: () => void;
  setCurrentScreen: (screen: 'category') => void;
}

const RecapOrder: React.FC<RecapOrderProps> = ({
  order,
  tableNumber,
  handleSubmitOrder,
  setCurrentScreen
}) => {
  const calculateTotal = () => {
    const drinksTotal = order.drinks.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);
    const mealsTotal = order.meals.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);
    return (drinksTotal + mealsTotal).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6">Récapitulatif de la commande</h2>
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-medium mb-2">Table {tableNumber}</h3>
          
          {order.drinks.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Boissons:</h4>
              {order.drinks.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{(item.price * (item.quantity || 0)).toFixed(2)}€</span>
                </div>
              ))}
            </div>
          )}
          
          {order.meals.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Repas:</h4>
              {order.meals.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span>
                    {item.name} x{item.quantity}
                    {item.cooking && ` (${item.cooking})`}
                  </span>
                  <span>{(item.price * (item.quantity || 0)).toFixed(2)}€</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="border-t pt-2 mt-4">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{calculateTotal()}€</span>
            </div>
          </div>
        </div>
        
        <div className="space-x-4">
          <Button onClick={() => setCurrentScreen('category')} variant="outline">
            Modifier
          </Button>
          <Button onClick={handleSubmitOrder}>
            Valider la commande
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecapOrder;
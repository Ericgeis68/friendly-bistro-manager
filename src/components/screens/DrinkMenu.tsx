import React from 'react';
import { Button } from "@/components/ui/button";
import type { MenuItem } from '../../types/restaurant';

interface DrinkMenuProps {
  drinksMenu: MenuItem[];
  setDrinksMenu: (menu: MenuItem[]) => void;
  order: { drinks: MenuItem[], meals: MenuItem[] };
  setOrder: (order: { drinks: MenuItem[], meals: MenuItem[] }) => void;
  setCurrentScreen: (screen: 'category' | 'recap') => void;
}

const DrinkMenu: React.FC<DrinkMenuProps> = ({
  drinksMenu,
  setDrinksMenu,
  order,
  setOrder,
  setCurrentScreen
}) => {
  const handleQuantityChange = (itemId: number, change: number) => {
    const updatedMenu = drinksMenu.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(0, (item.quantity || 0) + change) };
      }
      return item;
    });
    setDrinksMenu(updatedMenu);
  };

  const handleSubmit = () => {
    const selectedDrinks = drinksMenu.filter(item => item.quantity > 0);
    setOrder({ ...order, drinks: selectedDrinks });
    setCurrentScreen('recap');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6">Boissons</h2>
        <div className="space-y-4">
          {drinksMenu.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">{item.price.toFixed(2)}€</div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handleQuantityChange(item.id, -1)}
                  variant="outline"
                  size="sm"
                >
                  -
                </Button>
                <span className="w-8 text-center">{item.quantity || 0}</span>
                <Button
                  onClick={() => handleQuantityChange(item.id, 1)}
                  variant="outline"
                  size="sm"
                >
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 space-x-4">
          <Button onClick={() => setCurrentScreen('category')} variant="outline">
            Retour
          </Button>
          <Button onClick={handleSubmit}>
            Continuer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DrinkMenu;
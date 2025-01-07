import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import type { MenuItem } from '../../types/restaurant';

interface MealMenuProps {
  mealsMenu: MenuItem[];
  setMealsMenu: (menu: MenuItem[]) => void;
  order: { drinks: MenuItem[], meals: MenuItem[] };
  setOrder: (order: { drinks: MenuItem[], meals: MenuItem[] }) => void;
  setCurrentScreen: (screen: 'category' | 'recap') => void;
}

const MealMenu: React.FC<MealMenuProps> = ({
  mealsMenu,
  setMealsMenu,
  order,
  setOrder,
  setCurrentScreen
}) => {
  const handleQuantityChange = (itemId: number, change: number) => {
    const updatedMenu = mealsMenu.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(0, (item.quantity || 0) + change) };
      }
      return item;
    });
    setMealsMenu(updatedMenu);
  };

  const handleCookingChange = (itemId: number, cooking: string) => {
    const updatedMenu = mealsMenu.map(item => {
      if (item.id === itemId) {
        return { ...item, cooking };
      }
      return item;
    });
    setMealsMenu(updatedMenu);
  };

  const handleSubmit = () => {
    const selectedMeals = mealsMenu.filter(item => item.quantity > 0);
    setOrder({ ...order, meals: selectedMeals });
    setCurrentScreen('recap');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6">Repas</h2>
        <div className="space-y-4">
          {mealsMenu.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
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
              {(item.name.includes('Entrecôte') && item.quantity > 0) && (
                <div className="mt-2">
                  <select
                    className="w-full p-2 border rounded"
                    value={item.cooking || 'A POINT'}
                    onChange={(e) => handleCookingChange(item.id, e.target.value)}
                  >
                    <option value="BLEU">Bleu</option>
                    <option value="SAIGNANT">Saignant</option>
                    <option value="A POINT">À point</option>
                    <option value="BIEN CUIT">Bien cuit</option>
                  </select>
                </div>
              )}
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

export default MealMenu;
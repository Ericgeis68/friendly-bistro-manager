import React from 'react';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { MenuItem, ScreenType } from '../types';

interface MealMenuProps {
  setCurrentScreen: (screen: ScreenType) => void;
  mealsMenu: MenuItem[];
  setMealsMenu: (menu: MenuItem[]) => void;
  order: { drinks: MenuItem[]; meals: MenuItem[] };
  setOrder: (order: { drinks: MenuItem[]; meals: MenuItem[] }) => void;
  tableNumber: string;
  handleLogout: () => void;
}

const MealMenu: React.FC<MealMenuProps> = ({
  setCurrentScreen,
  mealsMenu,
  setMealsMenu,
  order,
  setOrder,
  tableNumber,
  handleLogout,
}) => {
  const updateQuantity = (itemId: number, increment: boolean) => {
    const updatedMenu = mealsMenu.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: increment ? item.quantity + 1 : Math.max(0, item.quantity - 1),
        };
      }
      return item;
    });
    setMealsMenu(updatedMenu);

    // Update order
    const updatedMeals = updatedMenu.filter(item => item.quantity > 0);
    setOrder({ ...order, meals: updatedMeals });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <ArrowLeft
            className="h-6 w-6 text-[#0EA5E9] cursor-pointer mr-4"
            onClick={() => setCurrentScreen('category')}
          />
          <div className="text-lg font-medium text-gray-800">Table {tableNumber}</div>
        </div>
        <div onClick={handleLogout} className="text-[#0EA5E9] cursor-pointer">
          Déconnexion
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Repas</h2>
        <div className="space-y-4">
          {mealsMenu.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-gray-600">{item.price.toFixed(2)} €</div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => updateQuantity(item.id, false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Minus className="h-6 w-6 text-[#0EA5E9]" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, true)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Plus className="h-6 w-6 text-[#0EA5E9]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealMenu;
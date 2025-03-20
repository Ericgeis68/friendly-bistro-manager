
import React from 'react';
import { MenuItems } from '../../../types/restaurant';

interface MenuScreenProps {
  menuItems: MenuItems;
  handleEditMenu: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ menuItems, handleEditMenu }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Gestion du Menu</h2>
        <button onClick={handleEditMenu} className="bg-blue-500 hover:bg-blue-600 text-white rounded-md p-2">Modifier</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-medium mb-2">Boissons</h3>
          {menuItems.drinks && menuItems.drinks.map(drink => (
            <div key={drink.id} className="bg-white rounded-xl p-4 shadow flex justify-between mb-2">
              <div>
                <div className="font-medium text-lg">{drink.name}</div>
                <div className="text-gray-600">{drink.price.toFixed(2)} €</div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-medium mb-2">Repas</h3>
          {menuItems.meals && menuItems.meals.map(meal => (
            <div key={meal.id} className="bg-white rounded-xl p-4 shadow flex justify-between mb-2">
              <div>
                <div className="font-medium text-lg">{meal.name}</div>
                <div className="text-gray-600">{meal.price.toFixed(2)} €</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;

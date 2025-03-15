
import React from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { MenuItems, MenuItem } from '../../../types/restaurant';

interface EditMenuScreenProps {
  menuItems: MenuItems;
  setCurrentScreenLocal: (screen: string) => void;
  handleAddItem: (category: 'drinks' | 'meals') => void;
  handleEditItem: (item: MenuItem, category: 'drinks' | 'meals') => void;
  handleDeleteItem: (id: number, category: 'drinks' | 'meals') => void;
}

const EditMenuScreen: React.FC<EditMenuScreenProps> = ({ 
  menuItems, 
  setCurrentScreenLocal, 
  handleAddItem, 
  handleEditItem, 
  handleDeleteItem 
}) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Modifier le Menu</h2>
        <button onClick={() => setCurrentScreenLocal('menu')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md p-2">
          <X size={20}/>
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg md:text-xl font-medium">Boissons</h3>
            <button onClick={() => handleAddItem('drinks')} className="bg-green-500 hover:bg-green-600 text-white rounded-md p-2">
              <Plus size={20}/>
            </button>
          </div>
          {menuItems.drinks && menuItems.drinks.map(drink => (
            <div key={drink.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center mb-2">
              <div>
                <div className="font-medium text-lg">{drink.name}</div>
                <div className="text-gray-600">{drink.price.toFixed(2)} €</div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEditItem(drink, 'drinks')} className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-md p-2">
                  <Edit size={20}/>
                </button>
                <button onClick={() => handleDeleteItem(drink.id, 'drinks')} className="bg-red-500 hover:bg-red-600 text-white rounded-md p-2">
                  <Trash2 size={20}/>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg md:text-xl font-medium">Repas</h3>
            <button onClick={() => handleAddItem('meals')} className="bg-green-500 hover:bg-green-600 text-white rounded-md p-2">
              <Plus size={20}/>
            </button>
          </div>
          {menuItems.meals && menuItems.meals.map(meal => (
            <div key={meal.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center mb-2">
              <div>
                <div className="font-medium text-lg">{meal.name}</div>
                <div className="text-gray-600">{meal.price.toFixed(2)} €</div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEditItem(meal, 'meals')} className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-md p-2">
                  <Edit size={20}/>
                </button>
                <button onClick={() => handleDeleteItem(meal.id, 'meals')} className="bg-red-500 hover:bg-red-600 text-white rounded-md p-2">
                  <Trash2 size={20}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditMenuScreen;


import React from 'react';
import type { MenuItem } from '../../types/restaurant';

interface MealItemProps {
  meal: MenuItem;
  onQuantityChange: (id: number, increment: number) => void;
}

const MealItem: React.FC<MealItemProps> = ({ meal, onQuantityChange }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mb-3 shadow`}>
      <div className="flex justify-between items-center">
        <div>
          <div className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{meal.name}</div>
          <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{meal.price.toFixed(2)} €</div>
          {meal.cooking && (
            <div className={`${isDarkMode ? 'text-blue-300' : 'text-blue-500'} text-sm mt-1`}>({meal.cooking})</div>
          )}
        </div>
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onQuantityChange(meal.id, -1)}
            className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-500'} flex items-center justify-center text-xl font-medium`}
          >
            -
          </button>
          <span className={`w-6 text-center text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{meal.quantity}</span>
          <button
            onClick={() => onQuantityChange(meal.id, 1)}
            className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-500'} flex items-center justify-center text-xl font-medium`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealItem;

import React from 'react';
import type { MenuItem } from '../../types/restaurant';

interface MealItemProps {
  meal: MenuItem;
  onQuantityChange: (id: number, increment: number) => void;
}

const MealItem: React.FC<MealItemProps> = ({ meal, onQuantityChange }) => {
  return (
    <div className="bg-white rounded-xl p-4 mb-3 shadow">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium text-lg text-gray-800">{meal.name}</div>
          <div className="text-gray-600">{meal.price.toFixed(2)} €</div>
          {meal.cooking && (
            <div className="text-blue-500 text-sm mt-1">({meal.cooking})</div>
          )}
        </div>
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onQuantityChange(meal.id, -1)}
            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-medium"
          >
            -
          </button>
          <span className="w-6 text-center text-lg text-gray-800">{meal.quantity}</span>
          <button
            onClick={() => onQuantityChange(meal.id, 1)}
            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-medium"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealItem;

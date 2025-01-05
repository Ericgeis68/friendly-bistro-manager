import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScreenType } from '../types';

interface CategoryMenuProps {
  setCurrentScreen: (screen: ScreenType) => void;
  tableNumber: string;
  handleLogout: () => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({
  setCurrentScreen,
  tableNumber,
  handleLogout,
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <ArrowLeft
            className="h-6 w-6 text-[#0EA5E9] cursor-pointer mr-4"
            onClick={() => setCurrentScreen('table')}
          />
          <div className="text-lg font-medium text-gray-800">Table {tableNumber}</div>
        </div>
        <div onClick={handleLogout} className="text-[#0EA5E9] cursor-pointer">
          Déconnexion
        </div>
      </div>

      <div className="p-4 space-y-4">
        <button
          onClick={() => setCurrentScreen('boissons')}
          className="w-full bg-[#0EA5E9] text-white p-4 rounded-lg"
        >
          Boissons
        </button>
        <button
          onClick={() => setCurrentScreen('repas')}
          className="w-full bg-[#0EA5E9] text-white p-4 rounded-lg"
        >
          Repas
        </button>
        <button
          onClick={() => setCurrentScreen('recap')}
          className="w-full bg-[#0EA5E9] text-white p-4 rounded-lg"
        >
          Récapitulatif
        </button>
      </div>
    </div>
  );
};

export default CategoryMenu;
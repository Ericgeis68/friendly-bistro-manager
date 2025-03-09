import React from 'react';
import { Beer, UtensilsCrossed, FileText } from 'lucide-react';

interface CategoryMenuScreenProps {
  tableNumber: string;
  handleLogout: () => void;
  setCurrentScreen: (screen: 'boissons' | 'repas' | 'recap') => void;
}

const CategoryMenuScreen: React.FC<CategoryMenuScreenProps> = ({
  tableNumber,
  handleLogout,
  setCurrentScreen
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="text-lg font-medium text-gray-800">Table {tableNumber}</div>
        <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
      </div>

      <div className="p-4 space-y-4">
        <button
          onClick={() => setCurrentScreen('boissons')}
          className="w-full bg-white p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50"
        >
          <Beer size={48} className="mb-3 text-blue-500" />
          <span className="text-lg text-gray-800">Boissons</span>
        </button>

        <button
          onClick={() => setCurrentScreen('repas')}
          className="w-full bg-white p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50"
        >
          <UtensilsCrossed size={48} className="mb-3 text-blue-500" />
          <span className="text-lg text-gray-800">Repas</span>
        </button>

        <button
          onClick={() => setCurrentScreen('recap')}
          className="w-full bg-white p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50"
        >
          <FileText size={48} className="mb-3 text-blue-500" />
          <span className="text-lg text-gray-800">Récapitulatif</span>
        </button>
      </div>
    </div>
  );
};

export default CategoryMenuScreen;

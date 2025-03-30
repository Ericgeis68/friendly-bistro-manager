
import React from 'react';
import { Beer, UtensilsCrossed, FileText } from 'lucide-react';

interface CategoryMenuScreenProps {
  tableNumber: string;
  handleLogout: () => void;
  setCurrentScreen: (screen: 'boissons' | 'repas' | 'recap') => void;
  darkMode: boolean;
}

const CategoryMenuScreen: React.FC<CategoryMenuScreenProps> = ({
  tableNumber,
  handleLogout,
  setCurrentScreen,
  darkMode
}) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`p-4 flex justify-between items-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Table {tableNumber}</div>
        <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
      </div>

      <div className="p-4 space-y-4">
        <button
          onClick={() => setCurrentScreen('boissons')}
          className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow flex flex-col items-center ${darkMode ? 'active:bg-gray-700' : 'active:bg-gray-50'}`}
        >
          <Beer size={48} className={`mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-500'}`} />
          <span className={`text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>Boissons</span>
        </button>

        <button
          onClick={() => setCurrentScreen('repas')}
          className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow flex flex-col items-center ${darkMode ? 'active:bg-gray-700' : 'active:bg-gray-50'}`}
        >
          <UtensilsCrossed size={48} className={`mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-500'}`} />
          <span className={`text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>Repas</span>
        </button>

        <button
          onClick={() => setCurrentScreen('recap')}
          className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow flex flex-col items-center ${darkMode ? 'active:bg-gray-700' : 'active:bg-gray-50'}`}
        >
          <FileText size={48} className={`mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-500'}`} />
          <span className={`text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>Récapitulatif</span>
        </button>
      </div>
    </div>
  );
};

export default CategoryMenuScreen;

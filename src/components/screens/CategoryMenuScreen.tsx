import React, { useState } from 'react';
import { Beer, UtensilsCrossed, FileText, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

interface CategoryMenuScreenProps {
  tableNumber: string;
  handleLogout: () => void;
  setCurrentScreen: (screen: 'boissons' | 'repas' | 'recap' | 'table') => void;
  darkMode: boolean;
  resetOrderState: () => void;
}

const CategoryMenuScreen: React.FC<CategoryMenuScreenProps> = ({
  tableNumber,
  handleLogout,
  setCurrentScreen,
  darkMode,
  resetOrderState,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleConfirmReset = () => {
    resetOrderState();
    setCurrentScreen('table');
    setShowResetConfirm(false); // Close dialog after action
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Updated Header */}
      <div className="bg-blue-500 p-4 text-white flex justify-between items-center">
        {/* Back Button - Navigates to tableInput (screen type 'table') */}
        <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <AlertDialogTrigger asChild>
            <button className="p-2 rounded-md hover:bg-blue-600">
              <ArrowLeft size={24} className="text-white" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Attention ! Commande en cours</AlertDialogTitle>
              <AlertDialogDescription>
                Si vous retournez à l'écran de saisie de table, la commande actuelle sera perdue. Êtes-vous sûr de vouloir continuer ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmReset}>Continuer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="text-lg font-medium text-white">Table {tableNumber}</div>
        <div onClick={handleLogout} className="text-blue-200 hover:text-white cursor-pointer">Déconnexion</div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-auto">
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

import React from 'react';
import { Menu } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface MobileHeaderProps {
  currentScreenLocal: string;
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
}

const MobileHeader = ({
  currentScreenLocal,
  setSidebarOpen,
  sidebarOpen
}: MobileHeaderProps) => {
  const isMobile = useMobile();
  
  const getScreenTitle = () => {
    switch (currentScreenLocal) {
      case 'dashboard': return 'Tableau de Bord';
      case 'menu': return 'Menus';
      case 'cooking': return 'Cuissons';
      case 'waitresses': return 'Serveuses';
      case 'dailySales': return 'Ventes du Jour';
      case 'settings': return 'Paramètres';
      case 'editMenu': return 'Modifier Menu';
      case 'addMenuItem': return 'Ajouter Élément';
      case 'editItem': return 'Modifier Élément';
      case 'editCooking': return 'Modifier Cuisson';
      case 'addCookingOption': return 'Ajouter Cuisson';
      default: return 'Admin';
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4 flex items-center justify-between shadow-md">
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className="text-white p-1 rounded hover:bg-gray-700 transition-colors"
      >
        <Menu size={24} />
      </button>
      <h1 className="text-lg font-bold">
        {getScreenTitle()}
      </h1>
      <div className="w-6"></div> {/* Spacer pour centrer le titre */}
    </div>
  );
};

export default MobileHeader;

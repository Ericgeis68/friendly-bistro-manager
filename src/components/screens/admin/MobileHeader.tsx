
import React from 'react';
import { Menu } from 'lucide-react';

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
  return (
    <div className="md:hidden bg-gray-800 text-white p-4 flex items-center justify-between">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
        <Menu size={24} />
      </button>
      <h1 className="text-lg font-bold">
        {currentScreenLocal === 'dashboard' && 'Tableau de Bord'}
        {currentScreenLocal === 'menu' && 'Menu'}
        {currentScreenLocal === 'cooking' && 'Cuissons'}
        {currentScreenLocal === 'dailySales' && 'Ventes du Jour'}
        {currentScreenLocal === 'settings' && 'Paramètres'}
        {currentScreenLocal === 'editMenu' && 'Modifier Menu'}
        {currentScreenLocal === 'addMenuItem' && 'Ajouter Élément'}
        {currentScreenLocal === 'editItem' && 'Modifier Élément'}
        {currentScreenLocal === 'editCooking' && 'Modifier Cuissons'}
        {currentScreenLocal === 'addCookingOption' && 'Ajouter Cuisson'}
      </h1>
      <div className="w-6"></div> {/* Spacer to center title */}
    </div>
  );
};

export default MobileHeader;

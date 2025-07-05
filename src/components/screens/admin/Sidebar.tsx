import React from 'react';
import { ArrowLeft, BarChart2, UtensilsCrossed, Settings, List, X, Users, Map } from 'lucide-react';

interface SidebarProps {
  currentScreenLocal: string;
  setCurrentScreenLocal: (screen: any) => void;
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
  handleLogoutAdmin: () => void;
  onLogout: () => void;
}

const Sidebar = ({
  currentScreenLocal,
  setCurrentScreenLocal,
  setSidebarOpen,
  sidebarOpen,
  handleLogoutAdmin,
  onLogout
}: SidebarProps) => {
  return (
    <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block bg-gray-800 text-white w-full md:w-64 p-4 md:h-screen md:fixed md:left-0 md:top-0 z-50`}>
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold text-center">Admin Panel</div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white">
          <X size={20} />
        </button>
      </div>
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => {
            setCurrentScreenLocal('dashboard');
            setSidebarOpen(false);
          }}
          className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreenLocal === 'dashboard' ? 'bg-gray-700' : ''}`}
        >
          <BarChart2 size={20} className="mr-2" />
          Tableau de Bord
        </button>
        <button
          onClick={() => {
            setCurrentScreenLocal('menu');
            setSidebarOpen(false);
          }}
          className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreenLocal === 'menu' ? 'bg-gray-700' : ''}`}
        >
          <UtensilsCrossed size={20} className="mr-2" />
          Menu
        </button>
        <button
          onClick={() => {
            setCurrentScreenLocal('cooking');
            setSidebarOpen(false);
          }}
          className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreenLocal === 'cooking' ? 'bg-gray-700' : ''}`}
        >
          <UtensilsCrossed size={20} className="mr-2" />
          Cuissons
        </button>
        <button
          onClick={() => {
            setCurrentScreenLocal('floorplan');
            setSidebarOpen(false);
          }}
          className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreenLocal === 'floorplan' ? 'bg-gray-700' : ''}`}
        >
          <Map size={20} className="mr-2" />
          Plans de Salle
        </button>
        <button
          onClick={() => {
            setCurrentScreenLocal('waitresses');
            setSidebarOpen(false);
          }}
          className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreenLocal === 'waitresses' ? 'bg-gray-700' : ''}`}
        >
          <Users size={20} className="mr-2" />
          Serveuses
        </button>
        <button
          onClick={() => {
            setCurrentScreenLocal('dailySales');
            setSidebarOpen(false);
          }}
          className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreenLocal === 'dailySales' ? 'bg-gray-700' : ''}`}
        >
          <List size={20} className="mr-2" />
          Ventes du Jour
        </button>
        <button
          onClick={() => {
            setCurrentScreenLocal('settings');
            setSidebarOpen(false);
          }}
          className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreenLocal === 'settings' ? 'bg-gray-700' : ''}`}
        >
          <Settings size={20} className="mr-2" />
          Paramètres
        </button>
        <button
          onClick={handleLogoutAdmin}
          className="flex items-center py-2 px-4 rounded-md hover:bg-gray-700"
        >
          <ArrowLeft size={20} className="mr-2" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

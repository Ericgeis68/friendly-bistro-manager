import React from 'react';
import { ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';
import { Order, ScreenType } from '../types';

interface WaitressScreenProps {
  loggedInUser: string | null;
  handleLogout: () => void;
  setCurrentScreen: (screen: ScreenType) => void;
  pendingOrders: Order[];
  completedOrders: Order[];
}

const WaitressScreen: React.FC<WaitressScreenProps> = ({
  loggedInUser,
  handleLogout,
  setCurrentScreen,
  pendingOrders,
  completedOrders
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="text-lg font-medium text-gray-800">Bonjour {loggedInUser}</div>
        <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
      </div>

      <div className="p-4 space-y-4">
        <button
          onClick={() => setCurrentScreen('table')}
          className="w-full bg-[#0EA5E9] p-6 rounded-2xl shadow flex flex-col items-center active:bg-[#0EA5E9]/90"
        >
          <ShoppingBag size={48} className="mb-3 text-white" />
          <span className="text-lg text-white">Nouvelle commande</span>
        </button>

        <button
          onClick={() => setCurrentScreen('pending')}
          className="w-full bg-[#0EA5E9] p-6 rounded-2xl shadow flex flex-col items-center active:bg-[#0EA5E9]/90"
        >
          <Clock size={48} className="mb-3 text-white" />
          <span className="text-lg text-white">Commandes en cours ({pendingOrders.length})</span>
        </button>

        <button
          onClick={() => setCurrentScreen('completed')}
          className="w-full bg-[#0EA5E9] p-6 rounded-2xl shadow flex flex-col items-center active:bg-[#0EA5E9]/90"
        >
          <CheckCircle2 size={48} className="mb-3 text-white" />
          <span className="text-lg text-white">Commandes terminées ({completedOrders.length})</span>
        </button>
      </div>
    </div>
  );
};

export default WaitressScreen;
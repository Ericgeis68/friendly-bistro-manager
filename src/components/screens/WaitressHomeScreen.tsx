import React from 'react';
import { ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';

interface WaitressHomeScreenProps {
  loggedInUser: string;
  handleLogout: () => void;
  handleNewOrder: () => void;
  setShowPendingOrders: (show: boolean) => void;
}

const WaitressHomeScreen: React.FC<WaitressHomeScreenProps> = ({
  loggedInUser,
  handleLogout,
  handleNewOrder,
  setShowPendingOrders
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="text-lg font-medium text-gray-800">Bonjour {loggedInUser}</div>
        <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
      </div>

      <div className="p-4 space-y-4">
        <button
          onClick={handleNewOrder}
          className="w-full bg-[#0EA5E9] p-6 rounded-2xl shadow flex flex-col items-center active:bg-[#0EA5E9]/90"
        >
          <ShoppingBag size={48} className="mb-3 text-white" />
          <span className="text-lg text-white">Nouvelle commande</span>
        </button>

        <button
          onClick={() => setShowPendingOrders(true)}
          className="w-full bg-white p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50"
        >
          <Clock size={48} className="mb-3 text-blue-500" />
          <span className="text-lg text-gray-800">Commandes en cours</span>
        </button>

        <button
          onClick={() => {}}
          className="w-full bg-white p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50"
        >
          <CheckCircle2 size={48} className="mb-3 text-blue-500" />
          <span className="text-lg text-gray-800">Commandes terminées</span>
        </button>
      </div>
    </div>
  );
};

export default WaitressHomeScreen;
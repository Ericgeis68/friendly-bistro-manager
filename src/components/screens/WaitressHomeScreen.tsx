import React from 'react';
import { ShoppingBag, Clock, CheckCircle2, Bell } from 'lucide-react';
import type { Order } from '../../types/restaurant';

interface WaitressHomeScreenProps {
  loggedInUser: string;
  handleLogout: () => void;
  handleNewOrder: () => void;
  setShowPendingOrders: (show: boolean) => void;
  setShowCompletedOrders: (show: boolean) => void;
  pendingNotifications: Order[];
  onNotificationAcknowledge: (orderId: string) => void;
}

const WaitressHomeScreen: React.FC<WaitressHomeScreenProps> = ({
  loggedInUser,
  handleLogout,
  handleNewOrder,
  setShowPendingOrders,
  setShowCompletedOrders,
  pendingNotifications,
  onNotificationAcknowledge
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="text-lg font-medium text-gray-800">Bonjour {loggedInUser}</div>
        <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
      </div>

      {pendingNotifications.length > 0 && (
        <div className="p-4">
          {pendingNotifications.map((order) => (
            <div 
              key={order.id}
              className="bg-blue-100 p-4 rounded-lg mb-4 flex justify-between items-center"
              onClick={() => onNotificationAcknowledge(order.id)}
            >
              <div className="flex items-center">
                <Bell className="text-blue-500 mr-2" />
                <span>Commande prête - Table {order.table}</span>
              </div>
              <button className="text-blue-500 underline">
                Voir
              </button>
            </div>
          ))}
        </div>
      )}

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
          className="w-full bg-white p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50 relative"
        >
          <Clock size={48} className="mb-3 text-blue-500" />
          <span className="text-lg text-gray-800">Commandes en cours</span>
          {pendingNotifications.length > 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              {pendingNotifications.length}
            </div>
          )}
        </button>

        <button
          onClick={() => setShowCompletedOrders(true)}
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
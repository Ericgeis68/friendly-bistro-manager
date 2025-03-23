
import React, { useState } from 'react';
import { ShoppingBag, Clock, CheckCircle2, Bell, Moon, Sun } from 'lucide-react';
import type { Order } from '../../types/restaurant';
import OrderDetailScreen from './OrderDetailScreen';
import { useMobile } from '@/hooks/use-mobile';

interface WaitressHomeScreenProps {
  loggedInUser: string;
  handleLogout: () => void;
  handleNewOrder: () => void;
  setShowPendingOrders: (show: boolean) => void;
  setShowCompletedOrders: (show: boolean) => void;
  pendingNotifications: Order[];
  onNotificationAcknowledge: (orderId: string) => void;
  pendingOrders: Order[];
  onOrderComplete: (order: Order, type: 'drinks' | 'meals' | 'both') => void;
  onOrderCancel?: (order: Order, type: 'drinks' | 'meals' | 'all') => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const WaitressHomeScreen: React.FC<WaitressHomeScreenProps> = ({
  loggedInUser,
  handleLogout,
  handleNewOrder,
  setShowPendingOrders,
  setShowCompletedOrders,
  pendingNotifications,
  onNotificationAcknowledge,
  pendingOrders,
  onOrderComplete,
  onOrderCancel = () => {}, // Provide default implementation
  darkMode,
  toggleDarkMode
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const isMobile = useMobile();

  const handleViewOrderDetails = (orderId: string) => {
    console.log("Viewing order details for:", orderId);
    console.log("Available pending orders:", pendingOrders.map(o => o.id));
    
    const order = pendingOrders.find(order => order.id === orderId);
    if (order) {
      console.log("Found order to display:", order);
      setSelectedOrder(order);
      onNotificationAcknowledge(orderId);
    } else {
      console.error("Order not found:", orderId);
    }
  };

  const handleBack = () => {
    setSelectedOrder(null);
  };

  // Si une commande est sélectionnée, afficher l'écran de détails
  if (selectedOrder) {
    return (
      <OrderDetailScreen 
        order={selectedOrder} 
        onBack={handleBack}
        onOrderComplete={onOrderComplete}
        onOrderCancel={onOrderCancel}
      />
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`p-4 flex justify-between items-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center">
          <div className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Bonjour {loggedInUser}
          </div>
          <button 
            onClick={toggleDarkMode} 
            className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
          >
            {darkMode ? 
              <Sun size={20} className="text-yellow-400" /> : 
              <Moon size={20} className="text-gray-500" />
            }
          </button>
        </div>
        <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
      </div>

      {pendingNotifications.length > 0 && (
        <div className="p-4">
          {pendingNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`${darkMode ? 'bg-blue-900' : 'bg-blue-100'} p-4 rounded-lg mb-4 flex justify-between items-center`}
              onClick={() => onNotificationAcknowledge(notification.id)}
            >
              <div className="flex items-center">
                <Bell className={`${darkMode ? 'text-blue-300' : 'text-blue-500'} mr-2`} />
                <span>Commande prête - Table {notification.table}</span>
              </div>
              <button
                className={`${darkMode ? 'text-blue-300' : 'text-blue-500'} underline`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent notification click handler
                  handleViewOrderDetails(notification.id);
                }}
              >
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
          className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50 relative`}
        >
          <Clock size={48} className={`mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-500'}`} />
          <span className={`text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>Commandes en cours</span>
          {pendingNotifications.length > 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              {pendingNotifications.length}
            </div>
          )}
        </button>

        <button
          onClick={() => setShowCompletedOrders(true)}
          className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50`}
        >
          <CheckCircle2 size={48} className={`mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-500'}`} />
          <span className={`text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>Commandes terminées</span>
        </button>
      </div>
    </div>
  );
};

export default WaitressHomeScreen;

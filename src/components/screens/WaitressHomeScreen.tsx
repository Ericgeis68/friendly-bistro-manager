
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle2, Bell } from 'lucide-react';
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
  darkMode
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const isMobile = useMobile();
  const [processedNotifications, setProcessedNotifications] = useState<Set<string>>(new Set());

  // Effet pour jouer un son de notification quand de nouvelles notifications arrivent
  useEffect(() => {
    if (pendingNotifications.length > 0) {
      // Identifier les nouvelles notifications non traitées
      const newNotifications = pendingNotifications.filter(notification => {
        const notificationId = `${notification.id}-${Date.now()}`;
        return !processedNotifications.has(notificationId);
      });
      
      if (newNotifications.length > 0) {
        // Jouer le son uniquement pour les nouvelles notifications
        try {
          const audio = new Audio('/notification-sound.mp3');
          audio.play().catch(e => console.log('Erreur de lecture audio:', e));
        } catch (error) {
          console.error("Erreur lors de la lecture du son:", error);
        }
        
        // Marquer ces notifications comme traitées localement
        const updatedProcessed = new Set(processedNotifications);
        newNotifications.forEach(notification => {
          updatedProcessed.add(`${notification.id}-${Date.now()}`);
        });
        setProcessedNotifications(updatedProcessed);
      }
    }
  }, [pendingNotifications, processedNotifications]);

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

  // Dédupliquer les notifications pour éviter les doublons
  const uniqueNotifications = [...pendingNotifications];
  const seenOrderIds = new Set();
  const filteredNotifications = uniqueNotifications.filter(notification => {
    if (seenOrderIds.has(notification.id)) {
      return false; // Ignorer les doublons
    }
    seenOrderIds.add(notification.id);
    return true;
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`p-4 flex justify-between items-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-lg font-medium">
          Bonjour {loggedInUser}
        </div>
        <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
      </div>

      {filteredNotifications.length > 0 && (
        <div className="p-4">
          {filteredNotifications.map((notification) => (
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
          {filteredNotifications.length > 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              {filteredNotifications.length}
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

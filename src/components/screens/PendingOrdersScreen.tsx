
import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Order } from '../../types/restaurant';
import Header from './pendingOrders/Header';
import FilterBar from './pendingOrders/FilterBar';
import SearchBar from './pendingOrders/SearchBar';
import OrderCard from './pendingOrders/OrderCard';
import { useFilteredOrders } from '@/hooks/useFilteredOrders';
// Suppression de l'import dupliqué de useEffect
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/utils/firebase';
import { toast } from '@/hooks/use-toast';

type FilterType = 'all' | 'drinks' | 'meals';

interface PendingOrdersScreenProps {
  orders: Order[];
  onBack: () => void;
  onOrderComplete?: (order: Order, type: 'drinks' | 'meals' | 'both') => void;
  onOrderCancel?: (order: Order, type: 'drinks' | 'meals' | 'all') => void;
  setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const PendingOrdersScreen: React.FC<PendingOrdersScreenProps> = ({
  orders,
  onBack,
  onOrderComplete,
  onOrderCancel,
  setPendingOrders
}) => {
  // Add the missing state variables
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedType, setSelectedType] = useState<'drinks' | 'meals' | 'both' | null>(null);

  // Suppression de l'import au milieu du code
  // import React, { useEffect } from 'react';
  
  useEffect(() => {
    // Listen for changes in the notifications collection
    const notificationsRef = ref(database, 'notifications');
    
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        console.log("Notifications reçues:", notificationsData);
        
        // Traiter chaque notification
        Object.keys(notificationsData).forEach(key => {
          const notification = notificationsData[key];
          
          // Traiter uniquement les notifications non lues et prêtes
          if (notification.status === 'ready' && !notification.read) {
            console.log("Traitement de la notification non lue:", notification);
            
            // Marquer la notification comme lue
            const notificationRef = ref(database, `notifications/${key}`);
            update(notificationRef, { read: true });
            
            // Afficher la notification toast
            toast({
              title: "Commande prête",
              description: `La commande pour la table ${notification.tableNumber} est prête à être servie.`,
              variant: "default",
              duration: 5000,
            });
            
            // Jouer un son de notification
            try {
              const notificationSound = new Audio('/notification-sound.mp3');
              notificationSound.play().catch(e => console.log('Erreur de lecture audio:', e));
            } catch (error) {
              console.error("Erreur lors de la lecture du son:", error);
            }
          }
        });
      }
    });
    
    // Nettoyer l'écouteur lors du démontage du composant
    return () => {
      console.log("Nettoyage de l'écouteur de notifications");
      unsubscribe();
    };
  }, []);

  // Add the handleCompleteConfirm function
  const handleCompleteConfirm = (order: Order, type: 'drinks' | 'meals' | 'both') => {
    setShowCompleteConfirm(false);
    if (onOrderComplete) {
      console.log("Confirming order completion:", order.id, "Type:", type);
      onOrderComplete(order, type);
    }
  };

  // Add a function to open the confirmation dialog
  const openCompleteConfirmation = (order: Order, type: 'drinks' | 'meals' | 'both') => {
    setSelectedOrder(order);
    setSelectedType(type);
    setShowCompleteConfirm(true);
  };

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Make sure orders is always an array even if it's undefined
  const safeOrders = Array.isArray(orders) ? orders : [];
  const filteredOrders = useFilteredOrders(safeOrders, filter, searchQuery);

  console.log("PendingOrdersScreen - Orders:", safeOrders.length);
  console.log("PendingOrdersScreen - Filtered Orders:", filteredOrders.length);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onBack={onBack} />

      <div className="p-4">
        <FilterBar filter={filter} setFilter={setFilter} />
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOrderComplete={onOrderComplete}
                onOrderCancel={onOrderCancel}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {filter === 'drinks' && "Aucune commande de boissons en cours"}
              {filter === 'meals' && "Aucune commande de repas en cours"}
              {filter === 'all' && "Aucune commande en cours"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingOrdersScreen;

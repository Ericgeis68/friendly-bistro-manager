
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { Order } from '../../types/restaurant';
import Header from './pendingOrders/Header';
import FilterBar from './pendingOrders/FilterBar';
import SearchBar from './pendingOrders/SearchBar';
import OrderCard from './pendingOrders/OrderCard';
import { useFilteredOrders } from '@/hooks/useFilteredOrders';
import { ref, onValue, update, get } from 'firebase/database';
import { database, notificationsRef } from '@/utils/firebase';
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
  const processedNotificationsRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    // Listen for changes in the notifications collection
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        console.log("Notifications reçues:", notificationsData);
        
        // Traiter chaque notification
        Object.entries(notificationsData).forEach(([key, notification]: [string, any]) => {
          // Créer un ID unique pour cette notification
          const notificationId = `${notification.orderId}-${notification.timestamp || Date.now()}`;
          
          // Traiter uniquement les notifications non lues, prêtes et non encore traitées
          if (notification.status === 'ready' && !notification.read && 
              !processedNotificationsRef.current.has(notificationId)) {
            console.log("Traitement de la notification non lue:", notification);
            
            // Marquer la notification comme lue
            const notificationRef = ref(database, `notifications/${key}`);
            update(notificationRef, { read: true });
            
            // Marquer cette notification comme traitée localement pour éviter les doublons
            processedNotificationsRef.current.add(notificationId);
            
            // Vérifier si l'ordre correspondant existe dans les ordres locaux
            const matchingOrder = orders.find(order => order.id === notification.orderId);
            
            // Si l'ordre n'est pas trouvé localement, essayons de le récupérer de Firebase
            if (!matchingOrder) {
              console.log("Ordre non trouvé localement, tentative de récupération depuis Firebase");
              get(ref(database, `pendingOrders/${notification.orderId}`))
                .then(orderSnapshot => {
                  if (orderSnapshot.exists()) {
                    const order = orderSnapshot.val();
                    console.log("Ordre récupéré depuis Firebase:", order);
                    setPendingOrders(prevOrders => {
                      if (!prevOrders.some(o => o.id === order.id)) {
                        return [...prevOrders, order];
                      }
                      return prevOrders;
                    });
                  }
                })
                .catch(error => console.error("Erreur lors de la récupération de l'ordre:", error));
            }
            
            // Afficher la notification toast
            toast({
              title: "Commande prête",
              description: `La commande pour la table ${notification.table || notification.tableNumber} est prête à être servie.`,
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
  }, [orders, setPendingOrders]);

  // Ensure we're handling orders that are passed from props correctly
  useEffect(() => {
    console.log("Orders passed to PendingOrdersScreen:", orders.length);
    // We don't need to set pending orders here as they are passed as props
  }, [orders]);

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
  
  // Dédupliquer les commandes en utilisant un Map pour plus d'efficacité
  const ordersMap = new Map<string, Order>();
  safeOrders.forEach(order => {
    if (!ordersMap.has(order.id)) {
      ordersMap.set(order.id, order);
    } else {
      // Si l'ordre existe déjà, ne conserver que la version la plus récente (statut le plus élevé)
      const existingOrder = ordersMap.get(order.id)!;
      if (order.status === 'ready' && existingOrder.status === 'pending') {
        ordersMap.set(order.id, order);
      }
    }
  });
  
  const uniqueOrders = Array.from(ordersMap.values());
  
  const filteredOrders = useFilteredOrders(uniqueOrders, filter, searchQuery);

  console.log("PendingOrdersScreen - Orders:", safeOrders.length);
  console.log("PendingOrdersScreen - Unique Orders:", uniqueOrders.length);
  console.log("PendingOrdersScreen - Filtered Orders:", filteredOrders.length);
  console.log("PendingOrdersScreen - Current Filter:", filter);

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

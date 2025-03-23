
import { useState, useEffect } from 'react';
import type { Order } from '../types/restaurant';
import { toast } from "@/hooks/use-toast";
import { ref, set, remove, update, get, onValue, push } from "firebase/database";
import { database, pendingOrdersRef, completedOrdersRef, notificationsRef } from '../utils/firebase';

export const useOrderManagement = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<Order[]>([]);

  // Écouter les changements des commandes en cours
  useEffect(() => {
    console.log("Setting up pendingOrders listener");
    const unsubscribe = onValue(pendingOrdersRef, (snapshot) => {
      if (snapshot.exists()) {
        const orders = Object.values(snapshot.val()) as Order[];
        console.log("Received pending orders:", orders.length);
        setPendingOrders(orders);
      } else {
        console.log("No pending orders found");
        setPendingOrders([]);
      }
    });

    return () => {
      console.log("Cleaning up pendingOrders listener");
      unsubscribe();
    };
  }, []);

  // Écouter les changements des commandes terminées
  useEffect(() => {
    console.log("Setting up completedOrders listener");
    const unsubscribe = onValue(completedOrdersRef, (snapshot) => {
      if (snapshot.exists()) {
        const orders = Object.values(snapshot.val()) as Order[];
        console.log("Received completed orders:", orders.length);
        setCompletedOrders(orders);
      } else {
        console.log("No completed orders found");
        setCompletedOrders([]);
      }
    });

    return () => {
      console.log("Cleaning up completedOrders listener");
      unsubscribe();
    };
  }, []);

  // Écouter les notifications en temps réel
  useEffect(() => {
    console.log("Setting up notifications listener");
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log("Notifications data received");
        const notifications = snapshot.val();
        
        // Map pendingOrders to their IDs for quick lookup
        const pendingOrdersMap = new Map();
        pendingOrders.forEach(order => {
          pendingOrdersMap.set(order.id, order);
        });
        
        // Process notifications and find matching orders
        const notifiedOrders: Order[] = [];
        
        Object.entries(notifications).forEach(([key, notification]: [string, any]) => {
          if (!notification.read) {
            console.log("Processing unread notification:", notification);
            
            // Find the matching order
            const matchingOrder = pendingOrdersMap.get(notification.orderId);
            
            if (matchingOrder) {
              console.log("Found matching order for notification:", matchingOrder.id);
              notifiedOrders.push(matchingOrder);
            } else {
              console.log("No matching order found for notification orderId:", notification.orderId);
            }
          }
        });
        
        console.log("Setting pending notifications:", notifiedOrders.length);
        setPendingNotifications(notifiedOrders);

        // Jouer le son pour les nouvelles notifications
        if (notifiedOrders.length > 0) {
          try {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(e => console.log('Erreur de lecture audio:', e));
          } catch (error) {
            console.error("Erreur lors de la lecture du son:", error);
          }
        }
      } else {
        console.log("No notifications found");
        setPendingNotifications([]);
      }
    });

    return () => {
      console.log("Cleaning up notifications listener");
      unsubscribe();
    };
  }, [pendingOrders]);

  const handleOrderReady = async (order: Order) => {
    console.log("Marking order as ready:", order.id);
    if (order.meals.length > 0) {
      // Mettre à jour le statut de la commande
      const updatedOrder = { 
        ...order, 
        status: 'ready' as const, 
        mealsStatus: 'ready' as const 
      };

      // Mettre à jour dans Firebase
      const orderRef = ref(database, `pendingOrders/${order.id}`);
      await update(orderRef, updatedOrder);

      // Créer une nouvelle notification
      const newNotificationRef = push(notificationsRef);
      await set(newNotificationRef, {
        orderId: order.id,
        waitress: order.waitress,
        table: order.table,
        status: 'ready',
        read: false,
        timestamp: Date.now()
      });

      // Mettre à jour les états locaux
      setPendingOrders(prev => 
        prev.map(o => o.id === order.id ? updatedOrder : o)
      );

      toast({
        title: "Commande prête",
        description: `La commande pour la table ${order.table} est prête.`,
      });
    }
  };

  const handleOrderComplete = async (order: Order) => {
    console.log("Completing order:", order.id);
    // Supprimer de pendingOrders
    const pendingRef = ref(database, `pendingOrders/${order.id}`);
    await remove(pendingRef);

    // Ajouter à completedOrders avec le statut 'delivered'
    const completedRef = ref(database, `completedOrders/${order.id}`);
    const updatedOrder = { ...order, status: 'delivered' as const };
    await set(completedRef, updatedOrder);

    // Supprimer les notifications associées
    const notificationsSnapshot = await get(notificationsRef);
    if (notificationsSnapshot.exists()) {
      const notifications = notificationsSnapshot.val();
      Object.entries(notifications).forEach(([key, notification]: [string, any]) => {
        if (notification.orderId === order.id) {
          remove(ref(database, `notifications/${key}`));
        }
      });
    }

    // Mettre à jour les états locaux
    setPendingOrders(prev => prev.filter(o => o.id !== order.id));
    setCompletedOrders(prev => [...prev, updatedOrder]);
    setPendingNotifications(prev => prev.filter(o => o.id !== order.id));

    toast({
      title: "Commande livrée",
      description: `La commande pour la table ${order.table} a été livrée.`,
    });
  };

  const handleOrderCancel = async (order: Order) => {
    console.log("Cancelling order:", order.id);
    // Supprimer de pendingOrders
    const pendingRef = ref(database, `pendingOrders/${order.id}`);
    await remove(pendingRef);

    // Ajouter à completedOrders avec le statut 'cancelled'
    const completedRef = ref(database, `completedOrders/${order.id}`);
    const updatedOrder = { ...order, status: 'cancelled' as const };
    await set(completedRef, updatedOrder);

    // Supprimer les notifications associées
    const notificationsSnapshot = await get(notificationsRef);
    if (notificationsSnapshot.exists()) {
      const notifications = notificationsSnapshot.val();
      Object.entries(notifications).forEach(([key, notification]: [string, any]) => {
        if (notification.orderId === order.id) {
          remove(ref(database, `notifications/${key}`));
        }
      });
    }

    // Mettre à jour les états locaux
    setPendingOrders(prev => prev.filter(o => o.id !== order.id));
    setCompletedOrders(prev => [...prev, updatedOrder]);
    setPendingNotifications(prev => prev.filter(o => o.id !== order.id));

    toast({
      title: "Commande annulée",
      description: `La commande pour la table ${order.table} a été annulée.`,
    });
  };

  const handleDrinksComplete = (order: Order) => {
    if (order.drinks.length > 0) {
      handleOrderComplete(order);
    }
  };

  const handleNotificationAcknowledge = async (orderId: string) => {
    console.log("Acknowledging notification for order:", orderId);
    // Marquer toutes les notifications de cette commande comme lues
    const notificationsSnapshot = await get(notificationsRef);
    if (notificationsSnapshot.exists()) {
      const notifications = notificationsSnapshot.val();
      Object.entries(notifications).forEach(([key, notification]: [string, any]) => {
        if (notification.orderId === orderId) {
          console.log("Marking notification as read:", key);
          update(ref(database, `notifications/${key}`), { read: true });
        }
      });
    }

    // Mettre à jour l'état local
    setPendingNotifications(prev => prev.filter(order => order.id !== orderId));
  };

  return {
    pendingOrders,
    setPendingOrders,
    completedOrders,
    setCompletedOrders,
    pendingNotifications,
    setPendingNotifications,
    handleOrderReady,
    handleOrderComplete,
    handleOrderCancel,
    handleDrinksComplete,
    handleNotificationAcknowledge
  };
};

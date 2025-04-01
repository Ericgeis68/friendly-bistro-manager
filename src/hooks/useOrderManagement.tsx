import { useState, useEffect } from 'react';
import type { Order } from '../types/restaurant';
import { toast } from "@/hooks/use-toast";
import { ref, set, remove, update, get, onValue, push } from "firebase/database";
import { database, pendingOrdersRef, completedOrdersRef, notificationsRef } from '../utils/firebase';

export const useOrderManagement = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<Order[]>([]);

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

  useEffect(() => {
    console.log("Setting up notifications listener");
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log("Notifications data received");
        const notifications = snapshot.val();
        
        const pendingOrdersMap = new Map();
        pendingOrders.forEach(order => {
          pendingOrdersMap.set(order.id, order);
        });
        
        const notifiedOrders: Order[] = [];
        
        Object.entries(notifications).forEach(([key, notification]: [string, any]) => {
          if (!notification.read) {
            console.log("Processing unread notification:", notification);
            
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
      const updatedOrder = { 
        ...order, 
        status: 'ready' as const, 
        mealsStatus: 'ready' as const 
      };

      const orderRef = ref(database, `pendingOrders/${order.id}`);
      await update(orderRef, updatedOrder);

      const newNotificationRef = push(notificationsRef);
      await set(newNotificationRef, {
        orderId: order.id,
        waitress: order.waitress,
        table: order.table,
        status: 'ready',
        read: false,
        timestamp: Date.now()
      });

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
    const pendingRef = ref(database, `pendingOrders/${order.id}`);
    await remove(pendingRef);

    const completedRef = ref(database, `completedOrders/${order.id}`);
    const updatedOrder = { ...order, status: 'delivered' as const };
    await set(completedRef, updatedOrder);

    const notificationsSnapshot = await get(notificationsRef);
    if (notificationsSnapshot.exists()) {
      const notifications = notificationsSnapshot.val();
      Object.entries(notifications).forEach(([key, notification]: [string, any]) => {
        if (notification.orderId === order.id) {
          remove(ref(database, `notifications/${key}`));
        }
      });
    }

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
    const pendingRef = ref(database, `pendingOrders/${order.id}`);
    await remove(pendingRef);

    const completedRef = ref(database, `completedOrders/${order.id}`);
    const updatedOrder = { ...order, status: 'cancelled' as const };
    await set(completedRef, updatedOrder);

    const notificationsSnapshot = await get(notificationsRef);
    if (notificationsSnapshot.exists()) {
      const notifications = notificationsSnapshot.val();
      Object.entries(notifications).forEach(([key, notification]: [string, any]) => {
        if (notification.orderId === order.id) {
          remove(ref(database, `notifications/${key}`));
        }
      });
    }

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

    setPendingNotifications(prev => prev.filter(order => order.id !== orderId));
  };

  const resetOrders = async () => {
    console.log("Resetting orders in local state and ensuring Firebase data is cleared");
    
    try {
      // Clear all individual entries first
      const pendingSnapshot = await get(pendingOrdersRef);
      if (pendingSnapshot.exists()) {
        const pendingData = pendingSnapshot.val();
        for (const orderId in pendingData) {
          await remove(ref(database, `pendingOrders/${orderId}`));
          console.log(`Removed pending order ${orderId}`);
        }
      }
      
      const completedSnapshot = await get(completedOrdersRef);
      if (completedSnapshot.exists()) {
        const completedData = completedSnapshot.val();
        for (const orderId in completedData) {
          await remove(ref(database, `completedOrders/${orderId}`));
          console.log(`Removed completed order ${orderId}`);
        }
      }
      
      const notificationsSnapshot = await get(notificationsRef);
      if (notificationsSnapshot.exists()) {
        const notificationsData = notificationsSnapshot.val();
        for (const notifId in notificationsData) {
          await remove(ref(database, `notifications/${notifId}`));
        }
      }
      
      // Then remove the entire nodes
      await remove(pendingOrdersRef);
      await remove(completedOrdersRef);
      await remove(notificationsRef);
      
      // Specifically check and remove order 99 if it exists
      await remove(ref(database, 'pendingOrders/99'));
      await remove(ref(database, 'completedOrders/99'));
      
      console.log("Firebase data has been cleared");
      
      // Update local state
      setPendingOrders([]);
      setCompletedOrders([]);
      setPendingNotifications([]);
      
      console.log("All order data has been reset in the local state");
    } catch (error) {
      console.error("Error clearing Firebase data:", error);
      throw error;
    }
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
    handleNotificationAcknowledge,
    resetOrders
  };
};
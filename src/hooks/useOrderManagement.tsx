import { useState, useEffect, useCallback, useRef } from 'react';
import type { Order } from '../types/restaurant';
import { toast } from "@/hooks/use-toast";
import { ref, set, remove, update, get, onValue, push } from "firebase/database";
import { database, pendingOrdersRef, completedOrdersRef, notificationsRef, orderItemsRef, ordersRef } from '../utils/firebase';

export const useOrderManagement = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<Order[]>([]);
  const processedNotificationsRef = useRef<Set<string>>(new Set());

  const refreshOrders = useCallback(async () => {
    console.log("Manually refreshing orders from Firebase");
    try {
      const pendingSnapshot = await get(pendingOrdersRef);
      if (pendingSnapshot.exists()) {
        const orders = Object.values(pendingSnapshot.val()) as Order[];
        console.log("Refreshed pending orders:", orders.length);
        setPendingOrders(orders);
      } else {
        console.log("No pending orders found during refresh");
        setPendingOrders([]);
      }

      const completedSnapshot = await get(completedOrdersRef);
      if (completedSnapshot.exists()) {
        const orders = Object.values(completedSnapshot.val()) as Order[];
        console.log("Refreshed completed orders:", orders.length);
        setCompletedOrders(orders);
      } else {
        console.log("No completed orders found during refresh");
        setCompletedOrders([]);
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  }, []);

  useEffect(() => {
    console.log("Setting up pendingOrders listener");
    const unsubscribe = onValue(pendingOrdersRef, (snapshot) => {
      if (snapshot.exists()) {
        const orders = Object.values(snapshot.val()) as Order[];
        console.log("Received pending orders:", orders.length);
        
        const filteredOrders = orders.filter(order => order.id !== '99');
        
        const orderMap = new Map<string, Order>();
        filteredOrders.forEach(order => {
          orderMap.set(order.id, order);
        });
        
        const uniqueOrders = Array.from(orderMap.values());
        setPendingOrders(uniqueOrders);
      } else {
        console.log("No pending orders found");
        setPendingOrders([]);
      }
    }, error => {
      console.error("Error in pendingOrders listener:", error);
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
        
        const filteredOrders = orders.filter(order => order.id !== '99');
        
        const orderMap = new Map<string, Order>();
        filteredOrders.forEach(order => {
          orderMap.set(order.id, order);
        });
        
        const uniqueOrders = Array.from(orderMap.values());
        setCompletedOrders(uniqueOrders);
      } else {
        console.log("No completed orders found");
        setCompletedOrders([]);
      }
    }, error => {
      console.error("Error in completedOrders listener:", error);
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
          const notificationId = `${notification.orderId}-${notification.timestamp}`;
          
          if (!notification.read && !processedNotificationsRef.current.has(notificationId)) {
            console.log("Processing unread notification:", notification);
            
            processedNotificationsRef.current.add(notificationId);
            
            const matchingOrder = pendingOrdersMap.get(notification.orderId);
            
            if (matchingOrder) {
              console.log("Found matching order for notification:", matchingOrder.id);
              notifiedOrders.push(matchingOrder);
            } else {
              console.log("No matching order found for notification orderId:", notification.orderId);
              
              get(ref(database, `pendingOrders/${notification.orderId}`))
                .then(orderSnapshot => {
                  if (orderSnapshot.exists()) {
                    const order = orderSnapshot.val();
                    console.log("Retrieved order directly from Firebase:", order.id);
                    
                    if (!pendingNotifications.some(o => o.id === order.id)) {
                      setPendingNotifications(prev => [...prev, order]);
                    }
                    
                    setPendingOrders(prev => {
                      if (!prev.some(o => o.id === order.id)) {
                        return [...prev, order];
                      }
                      return prev;
                    });
                  }
                })
                .catch(err => console.error("Error fetching order:", err));
            }
          }
        });
        
        if (notifiedOrders.length > 0) {
          console.log("Setting pending notifications:", notifiedOrders.length);
          
          setPendingNotifications(prev => {
            const newNotifications = [...prev];
            notifiedOrders.forEach(order => {
              if (!newNotifications.some(o => o.id === order.id)) {
                newNotifications.push(order);
              }
            });
            return newNotifications;
          });
        }
      } else {
        console.log("No notifications found");
        setPendingNotifications([]);
      }
    }, error => {
      console.error("Error in notifications listener:", error);
    });

    return () => {
      console.log("Cleaning up notifications listener");
      unsubscribe();
    };
  }, [pendingOrders, pendingNotifications]);

  const handleOrderReady = async (order: Order) => {
    console.log("Marking order as ready:", order.id);
    if (order.meals && order.meals.length > 0) {
      try {
        const updatedOrder = { 
          ...order, 
          status: 'ready' as const, 
          mealsStatus: 'ready' as const 
        };
  
        const orderRef = ref(database, `pendingOrders/${order.id}`);
        await update(orderRef, updatedOrder);
  
        const notificationsSnapshot = await get(notificationsRef);
        let notificationExists = false;
        
        if (notificationsSnapshot.exists()) {
          const notifications = notificationsSnapshot.val();
          for (const key in notifications) {
            const notification = notifications[key];
            if (notification.orderId === order.id && notification.status === 'ready' && !notification.read) {
              notificationExists = true;
              break;
            }
          }
        }
        
        if (!notificationExists) {
          const newNotificationRef = ref(database, `notifications/${order.id}`);
          await set(newNotificationRef, {
            orderId: order.id,
            waitress: order.waitress,
            table: order.table,
            status: 'ready',
            read: false,
            timestamp: Date.now()
          });
        }
  
        setPendingOrders(prev => {
          const newOrders = prev.map(o => o.id === order.id ? updatedOrder : o);
          const orderMap = new Map<string, Order>();
          newOrders.forEach(order => orderMap.set(order.id, order));
          return Array.from(orderMap.values());
        });
  
        toast({
          title: "Commande prête",
          description: `La commande pour la table ${order.table} est prête.`,
        });
      } catch (error) {
        console.error("Error marking order as ready:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour de la commande.",
          variant: "destructive",
        });
      }
    }
  };

  const handleOrderComplete = async (order: Order) => {
    console.log("Completing order:", order.id);
    try {
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

      setPendingOrders(prev => {
        return prev.filter(o => o.id !== order.id);
      });
      
      setCompletedOrders(prev => {
        const exists = prev.some(o => o.id === updatedOrder.id);
        if (!exists) {
          return [...prev, updatedOrder];
        }
        return prev;
      });
      
      setPendingNotifications(prev => prev.filter(o => o.id !== order.id));

      setTimeout(refreshOrders, 500);

      toast({
        title: "Commande livrée",
        description: `La commande pour la table ${order.table} a été livrée.`,
      });
    } catch (error) {
      console.error("Error completing order:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la livraison de la commande.",
        variant: "destructive",
      });
    }
  };

  const handleOrderCancel = async (order: Order) => {
    console.log("Cancelling order:", order.id);
    try {
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
      
      setCompletedOrders(prev => {
        const exists = prev.some(o => o.id === updatedOrder.id);
        if (!exists) {
          return [...prev, updatedOrder];
        }
        return prev;
      });
      
      setPendingNotifications(prev => prev.filter(o => o.id !== order.id));

      setTimeout(refreshOrders, 500);

      toast({
        title: "Commande annulée",
        description: `La commande pour la table ${order.table} a été annulée.`,
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'annulation de la commande.",
        variant: "destructive",
      });
    }
  };

  const handleDrinksComplete = (order: Order) => {
    if (order.drinks && order.drinks.length > 0) {
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
    console.log("Réinitialisation complète des commandes et de la base Firebase");
    
    try {
      const collectionsToClean = [
        { name: 'pendingOrders', ref: pendingOrdersRef },
        { name: 'completedOrders', ref: completedOrdersRef },
        { name: 'notifications', ref: notificationsRef },
        { name: 'orderItems', ref: orderItemsRef },
        { name: 'orders', ref: ordersRef }
      ];
      
      const problematicTables = ['99', '56', '64', '79', '7'];
      
      const problematicOrderIds = ['CMD-250320-067-meals'];
      
      const deleteOrderCompletely = async (orderId) => {
        console.log(`Suppression complète de la commande ${orderId} de toutes les collections`);
        
        for (const collection of collectionsToClean) {
          try {
            await remove(ref(database, `${collection.name}/${orderId}`));
            await set(ref(database, `${collection.name}/${orderId}`), null);
            console.log(`Supprimé ${collection.name}/${orderId}`);
          } catch (e) {
            console.error(`Erreur lors de la suppression de ${collection.name}/${orderId}:`, e);
          }
        }
      };
      
      for (const collection of collectionsToClean) {
        try {
          await set(collection.ref, null);
          console.log(`Collection ${collection.name} vidée`);
        } catch (e) {
          console.error(`Erreur lors de la suppression de ${collection.name}:`, e);
        }
      }
      
      for (const orderId of problematicOrderIds) {
        await deleteOrderCompletely(orderId);
      }
      
      for (const tableNum of problematicTables) {
        console.log(`Suppression des commandes pour la table ${tableNum}...`);
        
        if (tableNum === '7') {
          console.log("Suppression spéciale pour la table 7");
          for (const collection of collectionsToClean) {
            const snapshot = await get(collection.ref);
            if (snapshot.exists()) {
              const data = snapshot.val();
              for (const key in data) {
                const item = data[key];
                if (item && (
                    String(item.table) === '7' || 
                    item.table === 7 || 
                    String(item.tableNumber) === '7' || 
                    item.tableNumber === 7
                )) {
                  console.log(`Suppression de ${collection.name}/${key} (table 7)`);
                  await remove(ref(database, `${collection.name}/${key}`));
                  await set(ref(database, `${collection.name}/${key}`), null);
                }
              }
            }
          }
        }
        
        for (const collection of collectionsToClean) {
          const snapshot = await get(collection.ref);
          if (snapshot.exists()) {
            const data = snapshot.val();
            for (const key in data) {
              const item = data[key];
              if (item && (
                  String(item.table) === tableNum || 
                  item.table === Number(tableNum) || 
                  String(item.tableNumber) === tableNum || 
                  item.tableNumber === Number(tableNum)
              )) {
                console.log(`Suppression de ${collection.name}/${key} (table ${tableNum})`);
                await remove(ref(database, `${collection.name}/${key}`));
                await set(ref(database, `${collection.name}/${key}`), null);
              }
            }
          }
        }
      }
      
      console.log("Suppression des entrées offline et timestamps...");
      const dbRootRef = ref(database, '/');
      const rootSnapshot = await get(dbRootRef);
      if (rootSnapshot.exists()) {
        const rootData = rootSnapshot.val();
        for (const key in rootData) {
          if (rootData[key] === "offline") {
            console.log(`Suppression de l'entrée offline: ${key}`);
            await remove(ref(database, key));
            await set(ref(database, key), null);
          }
          
          if (!isNaN(Number(key)) && key.length > 10) {
            console.log(`Suppression de l'entrée timestamp: ${key}`);
            await remove(ref(database, key));
            await set(ref(database, key), null);
          }
        }
      }
      
      for (const collection of collectionsToClean) {
        try {
          await set(collection.ref, {});
          await set(collection.ref, null);
          console.log(`Collection ${collection.name} vidée à nouveau`);
        } catch (e) {
          console.error(`Erreur lors de la réinitialisation de ${collection.name}:`, e);
        }
      }
      
      setPendingOrders([]);
      setCompletedOrders([]);
      setPendingNotifications([]);
      processedNotificationsRef.current = new Set();
      
      setTimeout(async () => {
        for (const collection of collectionsToClean) {
          try {
            const snapshot = await get(collection.ref);
            if (snapshot.exists()) {
              const data = snapshot.val();
              console.log(`⚠️ ${collection.name} contient encore des données:`, data);
              await set(collection.ref, null);
            } else {
              console.log(`✅ ${collection.name} est bien vide`);
            }
          } catch (e) {
            console.error(`Erreur lors de la vérification de ${collection.name}:`, e);
          }
        }
      }, 2000);
      
      toast({
        title: "Réinitialisation terminée",
        description: "Toutes les données de commande ont été supprimées",
      });
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réinitialisation",
        variant: "destructive"
      });
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
    resetOrders,
    refreshOrders
  };
};

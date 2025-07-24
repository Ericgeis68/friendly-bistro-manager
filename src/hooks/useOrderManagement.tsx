import { useCallback } from 'react';
import type { Order } from '../types/restaurant';
import { toast } from "@/hooks/use-toast";
import { supabaseHelpers } from '../utils/supabase';
import { useRestaurant } from '../context/RestaurantContext';


export const useOrderManagement = () => {
  const {
    pendingOrders,
    setPendingOrders,
    completedOrders,
    setCompletedOrders,
    pendingNotifications,
    setPendingNotifications,
    refreshOrders,
    resetOrders
  } = useRestaurant();

  const handleOrderReady = async (order: Order) => {
    console.log("Marking order as ready:", order.id);
    if (order.meals && order.meals.length > 0) {
      try {
        const updatedOrder = { 
          status: 'ready' as const, 
          meals_status: 'ready' as const 
        };

        await supabaseHelpers.updateOrder(order.id, updatedOrder);

        // Check if notification already exists
        const notifications = await supabaseHelpers.getNotifications();
        const notificationExists = notifications.some(notification => 
          notification.order_id === order.id && notification.status === 'ready' && !notification.read
        );
        
        if (!notificationExists) {
          await supabaseHelpers.createNotification({
            orderId: order.id,
            waitress: order.waitress,
            table: order.table,
            status: 'ready'
          });
        }

        setPendingOrders(prev => {
          const newOrders = prev.map(o => o.id === order.id ? { ...o, ...updatedOrder } : o);
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
      await supabaseHelpers.updateOrder(order.id, { status: 'delivered' });
      await supabaseHelpers.deleteNotification(order.id);

      setPendingOrders(prev => prev.filter(o => o.id !== order.id));
      
      setCompletedOrders(prev => {
        const updatedOrder = { ...order, status: 'delivered' as const };
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
      await supabaseHelpers.updateOrder(order.id, { status: 'cancelled' });
      await supabaseHelpers.deleteNotification(order.id);

      setPendingOrders(prev => prev.filter(o => o.id !== order.id));
      
      setCompletedOrders(prev => {
        const updatedOrder = { ...order, status: 'cancelled' as const };
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
    try {
      await supabaseHelpers.markNotificationAsRead(orderId);
      setPendingNotifications(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      console.error("Error acknowledging notification:", error);
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

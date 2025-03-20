import { useState, useEffect } from 'react';
import type { Order } from '../types/restaurant';
import { toast } from "@/hooks/use-toast";

export const useOrderManagement = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('pendingOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  const [completedOrders, setCompletedOrders] = useState<Order[]>(() => {
    const savedCompletedOrders = localStorage.getItem('completedOrders');
    return savedCompletedOrders ? JSON.parse(savedCompletedOrders) : [];
  });

  const [pendingNotifications, setPendingNotifications] = useState<Order[]>([]);

  useEffect(() => {
    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
  }, [pendingOrders]);

  useEffect(() => {
    localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
  }, [completedOrders]);

  const handleOrderReady = (order: Order) => {
    // For meal orders only (used in kitchen)
    if (order.meals.length > 0) {
      // Create a copy of the order with "ready" status
      const updatedOrder = { ...order, status: 'ready' as const, mealsStatus: 'ready' as const };
      
      // MODIFICATION: Keep the order in pendingOrders for the waitress view but update its status
      setPendingOrders(prev => 
        prev.map(o => o.id === order.id ? updatedOrder : o)
      );
      
      // Also add the order to completedOrders for the kitchen view
      setCompletedOrders(prev => {
        // Check if it's already in completedOrders
        const existingOrderIndex = prev.findIndex(o => o.id === order.id);
        if (existingOrderIndex !== -1) {
          // Update it if it exists
          const newOrders = [...prev];
          newOrders[existingOrderIndex] = updatedOrder;
          return newOrders;
        }
        // Add it if it doesn't exist
        return [...prev, updatedOrder];
      });
      
      // Add notification for the waitress
      setPendingNotifications(prev => [...prev, updatedOrder]);
      
      toast({
        title: "Commande prête",
        description: `La commande pour la table ${order.table} est prête.`,
      });
    }
  };

  const handleOrderComplete = (order: Order) => {
    // Important: Keep the current status (don't change to 'delivered' yet for kitchen view)
    // This will be moved to completed orders but keep the 'ready' status in kitchen view
    const updatedOrder = { ...order };
    
    // If it's a drink order (not handled by kitchen), we can mark it as delivered immediately
    if (order.drinks.length > 0 && order.meals.length === 0) {
      updatedOrder.status = 'delivered';
    }
    
    // For meal orders, we only remove it from pendingOrders if it's still there
    // (It might already be in completedOrders if kitchen marked it as ready)
    if (order.meals.length > 0) {
      // Remove from pendingOrders regardless of status
      setPendingOrders(prev => prev.filter(o => o.id !== order.id));
      
      // Update status to 'delivered' in completedOrders
      setCompletedOrders(prev => 
        prev.map(o => o.id === order.id ? { ...o, status: 'delivered' as const } : o)
      );
    } else {
      // For drink orders, just remove from pending and add to completed
      setPendingOrders(prev => prev.filter(o => o.id !== order.id));
      setCompletedOrders(prev => {
        const existingOrderIndex = prev.findIndex(o => o.id === order.id);
        if (existingOrderIndex !== -1) {
          const newOrders = [...prev];
          newOrders[existingOrderIndex] = updatedOrder;
          return newOrders;
        }
        return [...prev, updatedOrder];
      });
    }
    
    // Different messages based on order type
    if (order.drinks.length > 0) {
      updatedOrder.status = 'delivered';
      toast({
        title: "Commande boissons livrée",
        description: `La commande boissons pour la table ${order.table} a été livrée.`,
      });
    } else if (order.meals.length > 0) {
      toast({
        title: "Commande repas livrée",
        description: `La commande repas pour la table ${order.table} a été livrée.`,
      });
    }
  };

  const handleOrderCancel = (cancelledOrder: Order) => {
    // Remove the order from pendingOrders
    setPendingOrders(prev => prev.filter(order => order.id !== cancelledOrder.id));
    
    // Add or update the order in completedOrders with the status "cancelled"
    const updatedOrder = { ...cancelledOrder, status: 'cancelled' as const };
    setCompletedOrders(prev => {
      const existingOrderIndex = prev.findIndex(o => o.id === cancelledOrder.id);
      if (existingOrderIndex !== -1) {
        const newOrders = [...prev];
        newOrders[existingOrderIndex] = updatedOrder;
        return newOrders;
      }
      return [...prev, updatedOrder];
    });
    
    // Different messages based on order type
    if (cancelledOrder.drinks.length > 0) {
      toast({
        title: "Commande boissons annulée",
        description: `La commande boissons pour la table ${cancelledOrder.table} a été annulée.`,
      });
    } else if (cancelledOrder.meals.length > 0) {
      toast({
        title: "Commande repas annulée",
        description: `La commande repas pour la table ${cancelledOrder.table} a été annulée.`,
      });
    }
  };
  
  const handleDrinksComplete = (order: Order) => {
    // This should only be called for drink orders now
    if (order.drinks.length > 0) {
      handleOrderComplete(order);
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
    handleDrinksComplete
  };
};

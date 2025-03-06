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
    // Update the order status to 'ready' in pending orders
    setPendingOrders(prev => 
      prev.map(o => o.id === order.id ? { ...o, status: 'ready' as const, mealsStatus: 'ready' as const } : o)
    );
    
    // Add notification for the waitress
    setPendingNotifications(prev => [...prev, { ...order, status: 'ready' as const, mealsStatus: 'ready' as const }]);
    
    toast({
      title: "Commande prête",
      description: `La commande pour la table ${order.table} est prête.`,
    });
  };

  const handleOrderComplete = (order: Order) => {
    const updatedOrder = { ...order, status: 'delivered' as const };
    
    // Add the updated order to completed orders
    setCompletedOrders(prev => [...prev, updatedOrder]);
    
    // Remove the order from pending orders
    setPendingOrders(prev => prev.filter(o => o.id !== order.id));
    
    toast({
      title: "Commande livrée",
      description: `La commande pour la table ${order.table} a été livrée.`,
    });
  };

  const handleOrderCancel = (cancelledOrder: Order) => {
    // Remove the order from pending orders
    setPendingOrders(prev => prev.filter(order => order.id !== cancelledOrder.id));
    
    // Add the order to completed orders with "cancelled" status
    setCompletedOrders(prev => [...prev, { ...cancelledOrder, status: 'cancelled' as const }]);
    
    toast({
      title: "Commande annulée",
      description: `La commande pour la table ${cancelledOrder.table} a été annulée.`,
    });
  };
  
  // Function to handle completing drinks separately
  const handleDrinksComplete = (order: Order) => {
    // Create a drinks-only order for the completed orders
    const drinksOnlyOrder: Order = {
      ...order,
      id: `${order.id}-drinks`, // Create a unique ID for the drinks order
      meals: [],
      status: 'delivered' as const,
      drinksStatus: 'delivered' as const,
      mealsStatus: undefined
    };
    
    // Update the order in pending orders (without drinks)
    const orderWithoutDrinks: Order = {
      ...order,
      drinks: [],
      drinksStatus: 'delivered' as const
    };
    
    // Update the pending orders list with the updated order (without drinks)
    setPendingOrders(prev => 
      prev.map(o => o.id === order.id ? orderWithoutDrinks : o)
    );
    
    // Add the drinks-only order to completed orders
    setCompletedOrders(prev => [...prev, drinksOnlyOrder]);
    
    toast({
      title: "Boissons livrées",
      description: `Les boissons pour la table ${order.table} ont été livrées.`,
    });
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

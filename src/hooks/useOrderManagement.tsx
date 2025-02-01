import { useState, useEffect } from 'react';
import type { Order, MenuItem } from '../types/restaurant';
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
    const updatedOrder = { ...order, status: 'ready' as const };
    setPendingOrders(pendingOrders.filter(o => o.id !== order.id));
    setCompletedOrders(prev => [...prev, updatedOrder]);
    setPendingNotifications(prev => [...prev, updatedOrder]);
    toast({
      title: "Commande prête",
      description: `La commande pour la table ${order.table} est prête.`,
    });
  };

  const handleOrderComplete = (completedOrder: Order) => {
    setPendingOrders(prev => prev.filter(order => order.id !== completedOrder.id));
    setCompletedOrders(prev => [...prev, { ...completedOrder, status: 'delivered' as const }]);
    
    const updatedOrder = { ...completedOrder, status: 'delivered' as const };
    setCompletedOrders(prev => prev.map(o => o.id === completedOrder.id ? updatedOrder : o));
  };

  const handleOrderCancel = (cancelledOrder: Order) => {
    setPendingOrders(prev => prev.filter(order => order.id !== cancelledOrder.id));
    setCompletedOrders(prev => [...prev, { ...cancelledOrder, status: 'cancelled' as const }]);
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
    handleOrderCancel
  };
};
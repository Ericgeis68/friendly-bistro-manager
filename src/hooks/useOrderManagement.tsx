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
    // Mettre à jour le statut de la commande à 'ready'
    const updatedOrder = { ...order, status: 'ready' as const };
    
    // Retirer la commande des commandes en cours
    setPendingOrders(prev => prev.filter(o => o.id !== order.id));
    
    // Ajouter la commande aux commandes terminées
    setCompletedOrders(prev => [...prev, updatedOrder]);
    
    // Ajouter la notification pour la serveuse
    setPendingNotifications(prev => [...prev, updatedOrder]);
  };

  const handleOrderComplete = (order: Order) => {
    const updatedOrder = { ...order, status: 'delivered' as const };
    setCompletedOrders(prev => 
      prev.map(o => o.id === order.id ? updatedOrder : o)
    );
    setPendingOrders(prev => prev.filter(o => o.id !== order.id));
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
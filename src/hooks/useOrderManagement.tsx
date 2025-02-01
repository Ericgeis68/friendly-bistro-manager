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
    // Mettre à jour le statut dans les commandes en cours de la serveuse
    const updatedOrder = { ...order, status: 'ready' as const };
    setPendingOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
    
    // Ajouter la commande aux commandes terminées de la cuisine
    setCompletedOrders(prev => [...prev, updatedOrder]);
    
    // Ajouter la notification pour la serveuse
    setPendingNotifications(prev => [...prev, updatedOrder]);
    
    toast({
      title: "Commande prête",
      description: `La commande pour la table ${order.table} est prête.`,
    });
  };

  const handleOrderComplete = (order: Order) => {
    // Retirer des commandes en cours de la serveuse
    setPendingOrders(prev => prev.filter(o => o.id !== order.id));
    
    // Mettre à jour le statut à "delivered" dans les commandes terminées
    const updatedOrder = { ...order, status: 'delivered' as const };
    setCompletedOrders(prev => 
      prev.map(o => o.id === order.id ? updatedOrder : o)
    );
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
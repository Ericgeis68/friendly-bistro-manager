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
    // Créer une copie de la commande avec le statut "ready"
    const updatedOrder = { ...order, status: 'ready' as const, mealsStatus: 'ready' as const };
    
    // Mettre à jour la commande dans pendingOrders
    setPendingOrders(prev => 
      prev.map(o => o.id === order.id ? updatedOrder : o)
    );
    
    // Mettre à jour la commande dans completedOrders si elle existe, sinon l'ajouter
    setCompletedOrders(prev => {
      const existingOrderIndex = prev.findIndex(o => o.id === order.id);
      if (existingOrderIndex !== -1) {
        const newOrders = [...prev];
        newOrders[existingOrderIndex] = updatedOrder;
        return newOrders;
      }
      return [...prev, updatedOrder];
    });
    
    // Ajouter la notification pour la serveuse
    setPendingNotifications(prev => [...prev, updatedOrder]);
    
    toast({
      title: "Commande prête",
      description: `La commande pour la table ${order.table} est prête.`,
    });
  };

  const handleOrderComplete = (order: Order) => {
    // Mettre à jour le statut de la commande
    const updatedOrder = { ...order, status: 'delivered' as const };
    
    // Mettre à jour la commande dans completedOrders si elle existe, sinon l'ajouter
    setCompletedOrders(prev => {
      const existingOrderIndex = prev.findIndex(o => o.id === order.id);
      if (existingOrderIndex !== -1) {
        const newOrders = [...prev];
        newOrders[existingOrderIndex] = updatedOrder;
        return newOrders;
      }
      return [...prev, updatedOrder];
    });
    
    // Retirer la commande des pendingOrders
    setPendingOrders(prev => prev.filter(o => o.id !== order.id));
    
    toast({
      title: "Commande livrée",
      description: `La commande pour la table ${order.table} a été livrée.`,
    });
  };

  const handleOrderCancel = (cancelledOrder: Order) => {
    // Retirer la commande des pendingOrders
    setPendingOrders(prev => prev.filter(order => order.id !== cancelledOrder.id));
    
    // Ajouter ou mettre à jour la commande dans completedOrders avec le statut "cancelled"
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
    
    toast({
      title: "Commande annulée",
      description: `La commande pour la table ${cancelledOrder.table} a été annulée.`,
    });
  };
  
  const handleDrinksComplete = (order: Order) => {
    // Créer une commande uniquement pour les boissons
    const drinksOnlyOrder: Order = {
      ...order,
      id: `${order.id}-drinks`,
      meals: [],
      status: 'delivered' as const,
      drinksStatus: 'delivered' as const,
      mealsStatus: undefined
    };
    
    // Mettre à jour la commande dans pendingOrders (sans les boissons)
    const orderWithoutDrinks: Order = {
      ...order,
      drinks: [],
      drinksStatus: 'delivered' as const
    };
    
    // Mettre à jour les pendingOrders
    setPendingOrders(prev => 
      prev.map(o => o.id === order.id ? orderWithoutDrinks : o)
    );
    
    // Ajouter ou mettre à jour la commande des boissons dans completedOrders
    setCompletedOrders(prev => {
      const existingOrderIndex = prev.findIndex(o => o.id === drinksOnlyOrder.id);
      if (existingOrderIndex !== -1) {
        const newOrders = [...prev];
        newOrders[existingOrderIndex] = drinksOnlyOrder;
        return newOrders;
      }
      return [...prev, drinksOnlyOrder];
    });
    
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
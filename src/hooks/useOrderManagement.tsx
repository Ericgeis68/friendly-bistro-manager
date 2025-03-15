
import { useState, useEffect } from 'react';
import type { Order } from '../types/restaurant';
import { toast } from "@/hooks/use-toast";
import { useSyncService } from './useSyncService';
import { syncService } from '../services/syncService';

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
  const { syncMode } = useSyncService();

  useEffect(() => {
    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
    
    if (syncMode !== 'standalone') {
      syncService.syncOrders(pendingOrders, completedOrders);
    }
  }, [pendingOrders, completedOrders, syncMode]);

  useEffect(() => {
    localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
  }, [completedOrders]);

  useEffect(() => {
    const handleOrderUpdate = (data: { pendingOrders: Order[], completedOrders: Order[] }) => {
      const pendingOrdersString = JSON.stringify(data.pendingOrders);
      const completedOrdersString = JSON.stringify(data.completedOrders);
      const currentPendingOrdersString = JSON.stringify(pendingOrders);
      const currentCompletedOrdersString = JSON.stringify(completedOrders);
      
      if (pendingOrdersString !== currentPendingOrdersString) {
        setPendingOrders(data.pendingOrders);
      }
      
      if (completedOrdersString !== currentCompletedOrdersString) {
        setCompletedOrders(data.completedOrders);
      }
    };

    if (syncMode !== 'standalone') {
      // Directly use syncService instead of require
      syncService.addEventListener('orderUpdate', handleOrderUpdate);
      
      return () => {
        syncService.removeEventListener('orderUpdate', handleOrderUpdate);
      };
    }
  }, [syncMode, pendingOrders, completedOrders]);

  const handleOrderReady = (order: Order) => {
    if (order.meals.length > 0) {
      const updatedOrder = { ...order, status: 'ready' as const, mealsStatus: 'ready' as const };
      
      setPendingOrders(prev => 
        prev.map(o => o.id === order.id ? updatedOrder : o)
      );
      
      setCompletedOrders(prev => {
        const existingOrderIndex = prev.findIndex(o => o.id === order.id);
        if (existingOrderIndex !== -1) {
          const newOrders = [...prev];
          newOrders[existingOrderIndex] = updatedOrder;
          return newOrders;
        }
        return [...prev, updatedOrder];
      });
      
      setPendingNotifications(prev => [...prev, updatedOrder]);
      
      toast({
        title: "Commande prête",
        description: `La commande pour la table ${order.table} est prête.`,
      });
    }
  };

  const handleOrderComplete = (order: Order) => {
    const updatedOrder = { ...order };
    
    if (order.drinks.length > 0 && order.meals.length === 0) {
      updatedOrder.status = 'delivered';
    }
    
    if (order.meals.length > 0) {
      setPendingOrders(prev => prev.filter(o => o.id !== order.id));
      
      setCompletedOrders(prev => 
        prev.map(o => o.id === order.id ? { ...o, status: 'delivered' as const } : o)
      );
    } else {
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
    setPendingOrders(prev => prev.filter(order => order.id !== cancelledOrder.id));
    
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

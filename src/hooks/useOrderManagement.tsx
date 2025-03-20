
import { useState, useEffect } from 'react';
import type { Order } from '../types/restaurant';
import { toast } from "@/hooks/use-toast";
import { db } from '../lib/firebase';
import { ref, set, update, get, remove } from "firebase/database";

export const useOrderManagement = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('pendingOrders');
    if (savedOrders) {
      setPendingOrders(JSON.parse(savedOrders));
    }

    const savedCompletedOrders = localStorage.getItem('completedOrders');
    if (savedCompletedOrders) {
      setCompletedOrders(JSON.parse(savedCompletedOrders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
  }, [pendingOrders]);

  useEffect(() => {
    localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
  }, [completedOrders]);

  const handleOrderReady = async (order: Order) => {
    if (order.meals.length > 0) {
      const updatedOrder = { ...order, status: 'ready' as const, mealsStatus: 'ready' as const };
      
      try {
        const orderRef = ref(db, `orders/${order.id}`);
        await update(orderRef, { 
          status: 'ready',
          meals_status: 'ready'
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la commande:', error);
        toast({
          title: "Erreur",
          description: "Impossible de marquer la commande comme prête.",
          variant: "destructive"
        });
        return;
      }
      
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

  const handleOrderComplete = async (order: Order) => {
    const updatedOrder = { ...order };
    
    if (order.drinks.length > 0 && order.meals.length === 0) {
      updatedOrder.status = 'delivered';
      
      try {
        const orderRef = ref(db, `orders/${order.id}`);
        await update(orderRef, { 
          status: 'delivered',
          drinks_status: 'delivered'
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la commande:', error);
        toast({
          title: "Erreur",
          description: "Impossible de marquer la commande comme livrée.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (order.meals.length > 0) {
      setPendingOrders(prev => prev.filter(o => o.id !== order.id));
      
      try {
        const orderRef = ref(db, `orders/${order.id}`);
        await update(orderRef, { 
          status: 'delivered',
          meals_status: 'delivered'
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la commande:', error);
        toast({
          title: "Erreur",
          description: "Impossible de marquer la commande comme livrée.",
          variant: "destructive"
        });
        return;
      }
      
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

  const handleOrderCancel = async (cancelledOrder: Order) => {
    setPendingOrders(prev => prev.filter(order => order.id !== cancelledOrder.id));
    
    try {
      const orderRef = ref(db, `orders/${cancelledOrder.id}`);
      await update(orderRef, { status: 'cancelled' });
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la commande:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la commande.",
        variant: "destructive"
      });
      return;
    }
    
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

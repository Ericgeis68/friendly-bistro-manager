
import { useState } from 'react';
import { db } from '../lib/firebase';
import { ref, update } from "firebase/database";
import { toast } from "@/hooks/use-toast";
import type { Order } from '../types/restaurant';

export function useOrderStatus() {
  const [pendingNotifications, setPendingNotifications] = useState<Order[]>([]);

  const updateFirebaseOrderStatus = async (
    orderId: string,
    status: string,
    mealsStatus?: string,
    drinksStatus?: string
  ) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      const updateData: Record<string, string> = { status };
      
      if (mealsStatus) updateData.meals_status = mealsStatus;
      if (drinksStatus) updateData.drinks_status = drinksStatus;
      
      await update(orderRef, updateData);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      return false;
    }
  };

  const handleOrderReady = async (
    order: Order,
    setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>,
    setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>
  ) => {
    if (order.meals.length > 0) {
      const updatedOrder = { ...order, status: 'ready' as const, mealsStatus: 'ready' as const };
      
      try {
        const success = await updateFirebaseOrderStatus(order.id, 'ready', 'ready');
        if (!success) {
          toast({
            title: "Erreur",
            description: "Impossible de marquer la commande comme prête.",
            variant: "destructive"
          });
          return;
        }
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

  const handleOrderComplete = async (
    order: Order,
    setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>,
    setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>
  ) => {
    const updatedOrder = { ...order };
    
    if (order.drinks.length > 0 && order.meals.length === 0) {
      updatedOrder.status = 'delivered';
      
      try {
        const success = await updateFirebaseOrderStatus(order.id, 'delivered', undefined, 'delivered');
        if (!success) {
          toast({
            title: "Erreur",
            description: "Impossible de marquer la commande comme livrée.",
            variant: "destructive"
          });
          return;
        }
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
        const success = await updateFirebaseOrderStatus(order.id, 'delivered', 'delivered');
        if (!success) {
          toast({
            title: "Erreur",
            description: "Impossible de marquer la commande comme livrée.",
            variant: "destructive"
          });
          return;
        }
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

  const handleOrderCancel = async (
    cancelledOrder: Order,
    setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>,
    setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>
  ) => {
    setPendingOrders(prev => prev.filter(order => order.id !== cancelledOrder.id));
    
    try {
      const success = await updateFirebaseOrderStatus(cancelledOrder.id, 'cancelled');
      if (!success) {
        toast({
          title: "Erreur",
          description: "Impossible d'annuler la commande.",
          variant: "destructive"
        });
        return;
      }
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

  return {
    pendingNotifications,
    setPendingNotifications,
    handleOrderReady,
    handleOrderComplete,
    handleOrderCancel
  };
}

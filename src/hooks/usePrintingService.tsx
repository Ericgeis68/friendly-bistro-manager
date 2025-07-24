import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { generateSimpleTextTicket } from '@/utils/escPosFormatter';
import { sendToPrinter } from '@/utils/printingUtils';
import { supabaseHelpers } from '@/utils/supabase'; // Import supabaseHelpers
import { useRestaurant } from '@/context/RestaurantContext'; // Import useRestaurant

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cooking?: string;
  comment?: string;
  needsCooking: boolean;
}

interface Order {
  id: string;
  table_number: string;
  table_comment: string;
  room_name: string;
  waitress: string;
  status: string;
  drinks_status: string | null;
  meals_status: string | null;
  drinks: OrderItem[];
  meals: OrderItem[];
  created_at: string;
  updated_at: string;
}

interface PrintedOrder {
  id: string;
  table_number: string;
  room_name: string;
  waitress: string;
  total: number;
  printed_at: string;
  items_count: number;
}

interface PrintError {
  message: string;
  timestamp: Date;
  orderId?: string;
}

export const usePrintingService = () => {
  const { autoPrintMealsEnabled, autoPrintDrinksEnabled } = useRestaurant();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [printedOrders, setPrintedOrders] = useState<PrintedOrder[]>([]);
  const [lastPrintTime, setLastPrintTime] = useState<string | null>(null);
  const [errors, setErrors] = useState<PrintError[]>([]);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(false); // New state for auto-print setting
  
  const subscriptionRef = useRef<any>(null);
  const processedOrdersRef = useRef(new Set<string>());

  // Check Supabase connection and load auto-print setting
  useEffect(() => {
    const initializeService = async () => {
      try {
        const { data, error } = await supabase.from('orders').select('id').limit(1);
        setIsConnected(!error);
        
        const autoPrint = await supabaseHelpers.getAutoPrintSetting();
        console.log('Auto-print setting loaded:', autoPrint);
        setAutoPrintEnabled(autoPrint);

      } catch (error) {
        setIsConnected(false);
        addError('Erreur de connexion à Supabase');
      }
    };

    initializeService();
  }, []);

  // Load initial data when connected
  useEffect(() => {
    if (isConnected) {
      loadPendingOrders();
      loadPrintedOrders();
    }
  }, [isConnected]);

  const addError = useCallback((message: string, orderId?: string) => {
    setErrors(prev => [...prev, { message, timestamp: new Date(), orderId }]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const loadPendingOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'ready'])
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Filter out orders that are already processed locally
      const newOrders = (data || []).filter(order => !processedOrdersRef.current.has(order.id));
      setPendingOrders(newOrders);
    } catch (error) {
      addError('Erreur lors du chargement des commandes en attente');
    }
  };

  const loadPrintedOrders = async () => {
    try {
      // Load from local storage for now - in a real app, this would be from a database
      const stored = localStorage.getItem('printed_orders');
      if (stored) {
        setPrintedOrders(JSON.parse(stored));
      }
    } catch (error) {
      addError('Erreur lors du chargement de l\'historique d\'impression');
    }
  };

  const savePrintedOrder = (order: Order) => {
    const printedOrder: PrintedOrder = {
      id: order.id,
      table_number: order.table_number,
      room_name: order.room_name,
      waitress: order.waitress,
      total: order.drinks.reduce((sum, item) => sum + (item.price * item.quantity), 0) +
             order.meals.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      printed_at: new Date().toISOString(),
      items_count: order.drinks.length + order.meals.length
    };

    setPrintedOrders(prev => {
      const updated = [printedOrder, ...prev];
      localStorage.setItem('printed_orders', JSON.stringify(updated));
      return updated;
    });
  };

  const printOrder = useCallback(async (orderId: string) => {
    try {
      const order = pendingOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Commande non trouvée');
      }

      // Generate ticket content - use simple text format for web printing
      const ticketContent = generateSimpleTextTicket(order);
      
      // Send to printer
      await sendToPrinter(ticketContent);
      
      // Mark as printed locally
      processedOrdersRef.current.add(orderId);
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
      savePrintedOrder(order);
      setLastPrintTime(new Date().toISOString());

      // In a real implementation, you might want to update the order status in the database
      // await supabase.from('orders').update({ printed: true }).eq('id', orderId);

    } catch (error) {
      addError(`Erreur d'impression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, orderId);
      throw error;
    }
  }, [pendingOrders, addError]);

  const markAsPrinted = useCallback(async (orderId: string) => {
    try {
      const order = pendingOrders.find(o => o.id === orderId);
      if (!order) return;

      processedOrdersRef.current.add(orderId);
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
      savePrintedOrder(order);
      setLastPrintTime(new Date().toISOString());
    } catch (error) {
      addError('Erreur lors du marquage comme imprimé', orderId);
    }
  }, [pendingOrders, addError]);

  const handleOrderChange = useCallback(async (payload: any) => {
    // STRICT CHECK: Ne rien faire si l'écoute est désactivée ou toutes les options d'impression sont désactivées
    const shouldProcess = autoPrintEnabled || autoPrintMealsEnabled || autoPrintDrinksEnabled;
    if (!isListening || !shouldProcess) {
      console.log('🖨️ Service d\'impression inactif - aucune impression automatique');
      return;
    }
    
    const { eventType, new: newOrder, old: oldOrder } = payload;
    
    // Skip if already processed
    if (processedOrdersRef.current.has(newOrder?.id || oldOrder?.id)) {
      console.log(`🖨️ DOUBLON IMPRESSION: Commande ${newOrder?.id || oldOrder?.id} déjà traitée`);
      return;
    }
    
    console.log('🖨️ Nouvelle commande détectée pour impression automatique:', { 
      eventType, 
      orderId: newOrder?.id || oldOrder?.id,
      newStatus: newOrder?.status,
      oldStatus: oldOrder?.status,
      autoPrintEnabled,
      isListening,
      shouldProcess
    });
    
    // Handle new orders (INSERT) - when a new order is created and validated by waitress
    if (eventType === 'INSERT' && newOrder) {
      // Only process pending/ready orders
      if (!['pending', 'ready'].includes(newOrder.status)) return;

      console.log('🖨️ Début impression automatique commande', newOrder.id);

      // Marquer immédiatement comme traitée pour éviter les doublons
      processedOrdersRef.current.add(newOrder.id);

      // Add to pending orders FIRST
      setPendingOrders(prev => {
        const exists = prev.find(o => o.id === newOrder.id);
        if (exists) return prev;
        return [...prev, newOrder];
      });

      // Auto-print if enabled (this happens when waitress validates an order)
      const hasDrinks = newOrder.drinks && newOrder.drinks.length > 0;
      const hasMeals = newOrder.meals && newOrder.meals.length > 0;
      const shouldAutoPrint = autoPrintEnabled || 
        (hasDrinks && autoPrintDrinksEnabled) || 
        (hasMeals && autoPrintMealsEnabled);
      
      if (shouldAutoPrint && newOrder.status === 'pending') {
        // Wait a bit to ensure state is updated, then print directly with the order data
        setTimeout(async () => {
          try {
            // Generate ticket content directly from the order data - use simple text format
            const ticketContent = generateSimpleTextTicket(newOrder);
            
            // Send to printer
            await sendToPrinter(ticketContent);
            
            // Remove from queue and save to printed orders
            setPendingOrders(prev => prev.filter(o => o.id !== newOrder.id));
            savePrintedOrder(newOrder);
            setLastPrintTime(new Date().toISOString());
            
            console.log('🖨️ Commande', newOrder.id, 'imprimée automatiquement avec succès');
          } catch (error) {
            console.error('🖨️ Erreur impression automatique:', newOrder.id, error);
            addError(`Erreur d'impression automatique: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, newOrder.id);
          }
        }, 100);
      }
    }
    
    // Handle order updates (UPDATE) - normally shouldn't happen in auto-print mode
    if (eventType === 'UPDATE' && newOrder && oldOrder) {
      // Marquer comme traitée si pas déjà fait
      if (!processedOrdersRef.current.has(newOrder.id)) {
        processedOrdersRef.current.add(newOrder.id);
      }
      
      const statusChanged = oldOrder.status !== newOrder.status;
      const becomePending = newOrder.status === 'pending' && oldOrder.status !== 'pending';
      const becomeReady = newOrder.status === 'ready' && oldOrder.status !== 'ready';
      
      console.log('🖨️ Commande mise à jour:', { 
        orderId: newOrder.id, 
        oldStatus: oldOrder.status, 
        newStatus: newOrder.status,
        statusChanged,
        becomePending,
        becomeReady
      });
      
      // Update pending orders list only
      if (['pending', 'ready'].includes(newOrder.status)) {
        setPendingOrders(prev => {
          const filtered = prev.filter(o => o.id !== newOrder.id);
          return [...filtered, newOrder];
        });
      } else {
        setPendingOrders(prev => prev.filter(o => o.id !== newOrder.id));
      }
    }
  }, [isListening, autoPrintEnabled, autoPrintMealsEnabled, autoPrintDrinksEnabled, addError]);

  const startListening = useCallback(async () => {
    if (!isConnected || isListening) return;

    try {
      // Load current orders first
      await loadPendingOrders();

      // Set up real-time subscription
      subscriptionRef.current = supabase
        .channel('orders_printing')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          (payload) => handleOrderChange({ ...payload, eventType: payload.eventType })
        )
        .subscribe();

      setIsListening(true);
    } catch (error) {
      addError('Erreur lors du démarrage de l\'écoute');
    }
  }, [isConnected, isListening, loadPendingOrders, handleOrderChange, addError]);

  const stopListening = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Auto-start listening when connected and auto-print enabled
  useEffect(() => {
    const shouldStart = autoPrintEnabled || autoPrintMealsEnabled || autoPrintDrinksEnabled;
    if (isConnected && !isListening && shouldStart) {
      startListening();
    } else if (isListening && !shouldStart) {
      stopListening();
    }
  }, [isConnected, isListening, autoPrintEnabled, autoPrintMealsEnabled, autoPrintDrinksEnabled, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const toggleAutoPrint = useCallback(async (enabled: boolean) => {
    setAutoPrintEnabled(enabled);
    await supabaseHelpers.saveAutoPrintSetting(enabled);
  }, []);

  return {
    isConnected,
    isListening,
    pendingOrders,
    printedOrders,
    lastPrintTime,
    errors,
    autoPrintEnabled, // Expose autoPrintEnabled
    startListening,
    stopListening,
    printOrder,
    markAsPrinted,
    clearErrors,
    toggleAutoPrint // Expose toggleAutoPrint
  };
};

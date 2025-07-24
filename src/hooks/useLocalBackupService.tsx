import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { useRestaurant } from '@/context/RestaurantContext';
import { saveOrderToLocalFile } from '@/utils/localBackup';
import type { Order } from '@/types/restaurant';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cooking?: string;
  comment?: string;
  needsCooking: boolean;
}

// Utiliser le type Order du système au lieu de redéfinir

export const useLocalBackupService = () => {
  const { 
    localBackupEnabled, 
    localBackupDrinksEnabled, 
    localBackupMealsEnabled,
    localBackupListening,
    setLocalBackupListening
  } = useRestaurant();
  
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const subscriptionRef = useRef<any>(null);
  const processedOrdersRef = useRef(new Set<string>());
  const isProcessingRef = useRef(false);

  // Check connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('orders').select('id').limit(1);
        setIsConnected(!error);
      } catch {
        setIsConnected(false);
      }
    };
    checkConnection();
  }, []);

  const addError = useCallback((message: string) => {
    setErrors(prev => [...prev, message]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleOrderChange = useCallback(async (payload: any) => {
    // Éviter le traitement concurrent
    if (isProcessingRef.current) {
      console.log('🗂️ Traitement déjà en cours, ignoré');
      return;
    }
    
    // STRICT CHECK: Ne rien faire si l'écoute est désactivée ou toutes les options de sauvegarde sont désactivées
    const shouldProcess = localBackupListening && (localBackupEnabled || localBackupDrinksEnabled || localBackupMealsEnabled);
    if (!shouldProcess) {
      console.log('🗂️ Service de sauvegarde locale inactif - aucune sauvegarde automatique');
      return;
    }
    
    const { eventType, new: newOrder } = payload;
    
    // Only handle INSERT events (new orders)
    if (eventType !== 'INSERT' || !newOrder) return;
    
    // Skip if already processed
    if (processedOrdersRef.current.has(newOrder.id)) {
      console.log(`🗂️ DOUBLON SAUVEGARDE: Commande ${newOrder.id} déjà sauvegardée`);
      return;
    }
    
    // Only process pending orders
    if (newOrder.status !== 'pending') return;
    
    console.log('🗂️ Début sauvegarde automatique commande', newOrder.id);
    
    // Marquer immédiatement comme traitée pour éviter les doublons ET activer le verrou
    processedOrdersRef.current.add(newOrder.id);
    isProcessingRef.current = true;
    
    try {
      // Convertir au format Order du système
      const order: Order = {
        id: newOrder.id,
        table: newOrder.table_number,
        tableComment: newOrder.table_comment || '',
        room: newOrder.room_name && newOrder.room_name !== 'Hangar' ? newOrder.room_name : '',
        waitress: newOrder.waitress,
        status: newOrder.status as 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled',
        drinksStatus: (newOrder.drinks_status as 'pending' | 'ready' | 'delivered') || null,
        mealsStatus: (newOrder.meals_status as 'pending' | 'ready' | 'delivered') || null,
        drinks: newOrder.drinks || [],
        meals: newOrder.meals || [],
        createdAt: newOrder.created_at
      };
      
      // Vérifier si cette commande doit être sauvegardée selon les paramètres
      const hasDrinks = order.drinks && order.drinks.length > 0;
      const hasMeals = order.meals && order.meals.length > 0;
      
      // Logique corrigée : sauvegarder si au moins une condition est remplie
      let shouldBackup = false;
      
      if (localBackupEnabled) {
        // Si sauvegarde globale activée, sauvegarder tout
        shouldBackup = true;
      } else {
        // Sinon, vérifier les paramètres spécifiques
        if (hasDrinks && localBackupDrinksEnabled) shouldBackup = true;
        if (hasMeals && localBackupMealsEnabled) shouldBackup = true;
      }
      
      console.log('🗂️ Analyse sauvegarde:', { 
        orderId: order.id,
        hasDrinks, 
        hasMeals, 
        localBackupEnabled, 
        localBackupDrinksEnabled, 
        localBackupMealsEnabled,
        shouldBackup 
      });
      
      if (shouldBackup) {
        await saveOrderToLocalFile(order);
        console.log(`🗂️ Commande ${order.id} sauvegardée automatiquement avec succès`);
      } else {
        console.log(`🗂️ Commande ${order.id} non sauvegardée - ne correspond pas aux critères`);
      }
    } catch (error) {
      console.error('🗂️ Erreur sauvegarde automatique:', error);
      addError(`Erreur sauvegarde commande ${newOrder.id}`);
      // Retirer de la liste des traités en cas d'erreur pour permettre de réessayer
      processedOrdersRef.current.delete(newOrder.id);
    } finally {
      // Libérer le verrou
      isProcessingRef.current = false;
    }
  }, [localBackupListening, localBackupEnabled, localBackupDrinksEnabled, localBackupMealsEnabled, addError]);

  const startListening = useCallback(() => {
    if (!isConnected || isListening) return;
    
    // Check if any backup option is enabled AND service is listening
    const shouldListen = localBackupListening && (localBackupEnabled || localBackupDrinksEnabled || localBackupMealsEnabled);
    if (!shouldListen) return;

    try {
      // Nettoyer d'abord l'ancienne souscription si elle existe
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      // Créer un canal unique avec timestamp pour éviter les conflits
      const channelName = `local-backup-orders-${Date.now()}`;
      subscriptionRef.current = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders'
          },
          (payload) => handleOrderChange({ ...payload, eventType: payload.eventType })
        )
        .subscribe();

      setIsListening(true);
      console.log('🗂️ Service de sauvegarde locale démarré avec canal:', channelName);
    } catch (error) {
      console.error('🗂️ Erreur démarrage service sauvegarde:', error);
      addError('Erreur démarrage service sauvegarde');
    }
  }, [isConnected, isListening, localBackupListening, localBackupEnabled, localBackupDrinksEnabled, localBackupMealsEnabled, handleOrderChange, addError]);

  const stopListening = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    setIsListening(false);
    console.log('🗂️ Service de sauvegarde locale arrêté');
  }, []);

  // Auto-start/stop based on backup settings and listening state
  useEffect(() => {
    const shouldListen = localBackupListening && (localBackupEnabled || localBackupDrinksEnabled || localBackupMealsEnabled);
    if (isConnected && !isListening && shouldListen) {
      startListening();
    } else if (isListening && !shouldListen) {
      stopListening();
    }
  }, [isConnected, isListening, localBackupListening, localBackupEnabled, localBackupDrinksEnabled, localBackupMealsEnabled, startListening, stopListening]);

  // Auto-enable listening when backup is enabled
  useEffect(() => {
    if ((localBackupEnabled || localBackupDrinksEnabled || localBackupMealsEnabled) && !localBackupListening) {
      setLocalBackupListening(true);
    }
  }, [localBackupEnabled, localBackupDrinksEnabled, localBackupMealsEnabled, localBackupListening, setLocalBackupListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isConnected,
    isListening,
    errors,
    startListening,
    stopListening,
    clearErrors
  };
};
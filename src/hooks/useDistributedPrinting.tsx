import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { useRestaurant } from '@/context/RestaurantContext';
import { generateSimpleTextTicket } from '@/utils/escPosFormatter';
import { sendToPrinter } from '@/utils/printingUtils';
import type { Order } from '@/types/restaurant';

interface PrintJob {
  id: string;
  order_id: string;
  order_data: any;
  created_at: string;
  processed: boolean;
  device_id: string;
}

interface PrintError {
  message: string;
  timestamp: Date;
  orderId?: string;
}

export const useDistributedPrinting = () => {
  const { 
    autoPrintEnabled, 
    autoPrintDrinksEnabled, 
    autoPrintMealsEnabled,
    setAutoPrintEnabled 
  } = useRestaurant();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPrintingDevice, setIsPrintingDevice] = useState(false);
  const [printQueue, setPrintQueue] = useState<PrintJob[]>([]);
  const [errors, setErrors] = useState<PrintError[]>([]);
  const [lastPrintTime, setLastPrintTime] = useState<string | null>(null);
  
  const subscriptionRef = useRef<any>(null);
  const processedOrdersRef = useRef(new Set<string>());
  const isProcessingRef = useRef(false);
  const deviceId = useRef<string>('');

  // Générer un ID unique pour cet appareil
  useEffect(() => {
    const getDeviceId = () => {
      let id = localStorage.getItem('device_id');
      if (!id) {
        id = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('device_id', id);
      }
      return id;
    };
    deviceId.current = getDeviceId();
    
    // Vérifier si cet appareil est désigné comme imprimante
    const isPrinter = localStorage.getItem('is_printing_device') === 'true';
    setIsPrintingDevice(isPrinter);
  }, []);

  // Vérifier la connexion Supabase
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

  const addError = useCallback((message: string, orderId?: string) => {
    setErrors(prev => [...prev, { message, timestamp: new Date(), orderId }]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Créer une tâche d'impression dans la queue
  const createPrintJob = useCallback(async (order: any) => {
    try {
      // Stocker dans localStorage comme queue temporaire
      const existingJobs = JSON.parse(localStorage.getItem('print_queue') || '[]');
      const newJob: PrintJob = {
        id: `print_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        order_id: order.id,
        order_data: order,
        created_at: new Date().toISOString(),
        processed: false,
        device_id: deviceId.current
      };
      
      const updatedJobs = [...existingJobs, newJob];
      localStorage.setItem('print_queue', JSON.stringify(updatedJobs));
      setPrintQueue(updatedJobs);
      
      console.log('📋 Tâche d\'impression créée:', newJob.id);
      
      // Si cet appareil est l'imprimante, traiter immédiatement
      if (isPrintingDevice) {
        setTimeout(() => processPrintJob(newJob), 100);
      }
      
    } catch (error) {
      console.error('Erreur création tâche d\'impression:', error);
      addError('Erreur création tâche d\'impression', order.id);
    }
  }, [isPrintingDevice, addError]);

  // Traiter une tâche d'impression
  const processPrintJob = useCallback(async (job: PrintJob) => {
    if (!isPrintingDevice || job.processed) return;
    
    try {
      // Utiliser directement les données de la commande
      const orderData = job.order_data;
      
      // Générer le ticket en utilisant directement les données de la commande
      const ticketContent = generateSimpleTextTicket(orderData);
      
      // Envoyer à l'imprimante
      await sendToPrinter(ticketContent);
      
      // Marquer comme traité
      const existingJobs = JSON.parse(localStorage.getItem('print_queue') || '[]');
      const updatedJobs = existingJobs.map((j: PrintJob) => 
        j.id === job.id ? { ...j, processed: true } : j
      );
      localStorage.setItem('print_queue', JSON.stringify(updatedJobs));
      setPrintQueue(updatedJobs);
      
      setLastPrintTime(new Date().toISOString());
      console.log('🖨️ Commande imprimée avec succès:', job.order_id);
      
    } catch (error) {
      console.error('Erreur traitement impression:', error);
      addError(`Erreur impression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, job.order_id);
    }
  }, [isPrintingDevice, addError]);

  // Charger la queue d'impression
  const loadPrintQueue = useCallback(() => {
    try {
      const jobs = JSON.parse(localStorage.getItem('print_queue') || '[]');
      setPrintQueue(jobs);
      
      // Si cet appareil est l'imprimante, traiter les tâches non traitées
      if (isPrintingDevice) {
        jobs.filter((job: PrintJob) => !job.processed).forEach((job: PrintJob) => {
          setTimeout(() => processPrintJob(job), 100);
        });
      }
    } catch (error) {
      console.error('Erreur chargement queue d\'impression:', error);
    }
  }, [isPrintingDevice, processPrintJob]);

  // Charger la queue au démarrage
  useEffect(() => {
    loadPrintQueue();
  }, [loadPrintQueue]);

  // Gérer les nouvelles commandes
  const handleOrderChange = useCallback(async (payload: any) => {
    // Éviter le traitement concurrent
    if (isProcessingRef.current) {
      console.log('🖨️ Traitement déjà en cours, ignoré');
      return;
    }
    
    // Vérifier si l'impression automatique est activée
    const shouldProcess = autoPrintEnabled || autoPrintDrinksEnabled || autoPrintMealsEnabled;
    if (!shouldProcess) {
      console.log('🖨️ Impression automatique désactivée');
      return;
    }
    
    const { eventType, new: newOrder } = payload;
    
    // Traiter seulement les nouvelles commandes
    if (eventType !== 'INSERT' || !newOrder) return;
    
    // Ignorer les commandes déjà traitées
    if (processedOrdersRef.current.has(newOrder.id)) {
      console.log(`🖨️ DOUBLON: Commande ${newOrder.id} déjà traitée`);
      return;
    }
    
    // Traiter seulement les commandes en attente
    if (newOrder.status !== 'pending') return;
    
    console.log('🖨️ Nouvelle commande détectée:', newOrder.id);
    
    // Marquer comme traitée
    processedOrdersRef.current.add(newOrder.id);
    isProcessingRef.current = true;
    
    try {
      // Vérifier si cette commande doit être imprimée
      const hasDrinks = newOrder.drinks && newOrder.drinks.length > 0;
      const hasMeals = newOrder.meals && newOrder.meals.length > 0;
      
      let shouldPrint = false;
      
      if (autoPrintEnabled) {
        shouldPrint = true;
      } else {
        if (hasDrinks && autoPrintDrinksEnabled) shouldPrint = true;
        if (hasMeals && autoPrintMealsEnabled) shouldPrint = true;
      }
      
      console.log('🖨️ Analyse impression:', { 
        orderId: newOrder.id,
        hasDrinks, 
        hasMeals, 
        autoPrintEnabled, 
        autoPrintDrinksEnabled, 
        autoPrintMealsEnabled,
        shouldPrint 
      });
      
      if (shouldPrint) {
        await createPrintJob(newOrder);
        console.log(`🖨️ Tâche d'impression créée pour commande ${newOrder.id}`);
      }
      
    } catch (error) {
      console.error('🖨️ Erreur traitement commande:', error);
      addError(`Erreur traitement commande ${newOrder.id}`, newOrder.id);
      processedOrdersRef.current.delete(newOrder.id);
    } finally {
      isProcessingRef.current = false;
    }
  }, [autoPrintEnabled, autoPrintDrinksEnabled, autoPrintMealsEnabled, createPrintJob, addError]);

  // Démarrer l'écoute
  const startListening = useCallback(() => {
    if (!isConnected || isListening) return;
    
    const shouldListen = autoPrintEnabled || autoPrintDrinksEnabled || autoPrintMealsEnabled;
    if (!shouldListen) return;

    try {
      // Nettoyer l'ancienne souscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      // Créer un canal unique
      const channelName = `distributed-printing-${Date.now()}`;
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
      console.log('🖨️ Service d\'impression distribuée démarré:', channelName);
    } catch (error) {
      console.error('🖨️ Erreur démarrage service:', error);
      addError('Erreur démarrage service d\'impression');
    }
  }, [isConnected, isListening, autoPrintEnabled, autoPrintDrinksEnabled, autoPrintMealsEnabled, handleOrderChange, addError]);

  // Arrêter l'écoute
  const stopListening = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    setIsListening(false);
    console.log('🖨️ Service d\'impression distribuée arrêté');
  }, []);

  // Auto-start/stop basé sur les paramètres
  useEffect(() => {
    const shouldListen = autoPrintEnabled || autoPrintDrinksEnabled || autoPrintMealsEnabled;
    if (isConnected && !isListening && shouldListen) {
      startListening();
    } else if (isListening && !shouldListen) {
      stopListening();
    }
  }, [isConnected, isListening, autoPrintEnabled, autoPrintDrinksEnabled, autoPrintMealsEnabled, startListening, stopListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Définir cet appareil comme imprimante
  const setAssPrintingDevice = useCallback((enabled: boolean) => {
    localStorage.setItem('is_printing_device', enabled.toString());
    setIsPrintingDevice(enabled);
    
    if (enabled) {
      loadPrintQueue(); // Traiter les tâches en attente
    }
  }, [loadPrintQueue]);

  // Vider la queue d'impression
  const clearPrintQueue = useCallback(() => {
    localStorage.removeItem('print_queue');
    setPrintQueue([]);
  }, []);

  // Traiter manuellement une tâche d'impression
  const retryPrintJob = useCallback(async (jobId: string) => {
    const job = printQueue.find(j => j.id === jobId);
    if (job && isPrintingDevice) {
      await processPrintJob(job);
    }
  }, [printQueue, isPrintingDevice, processPrintJob]);

  return {
    isConnected,
    isListening,
    isPrintingDevice,
    printQueue,
    errors,
    lastPrintTime,
    startListening,
    stopListening,
    setAssPrintingDevice,
    clearPrintQueue,
    retryPrintJob,
    clearErrors
  };
};
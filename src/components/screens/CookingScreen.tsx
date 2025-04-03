
// Add these imports at the top of your file
import { ref, update, serverTimestamp, set, get } from 'firebase/database';
import { database, notificationsRef } from '../../utils/firebase';
import { toast } from '@/hooks/use-toast';

// Interface pour le type de commande
interface OrderWithId {
  id: string;
  table: string;
  waitress: string;
  // Autres propriétés nécessaires
}

// Fonction pour marquer une commande comme prête
const markOrderAsReady = async (order: OrderWithId) => {
  // Référence à la commande dans Firebase
  const orderRef = ref(database, `orders/${order.id}`);
  
  try {
    // Mettre à jour le statut de la commande dans Firebase
    await update(orderRef, {
      status: 'ready',
      mealsStatus: 'ready',
      readyTime: serverTimestamp(),
      notified: false // Reset notification status so all clients will be notified
    });
    
    console.log(`Commande ${order.id} marquée comme prête`);
    
    // Créer directement une notification avec l'ID de commande comme clé pour éviter les doublons
    const newNotificationRef = ref(database, `notifications/${order.id}`);
    await set(newNotificationRef, {
      orderId: order.id,
      table: order.table,
      waitress: order.waitress,
      status: 'ready',
      read: false,
      timestamp: Date.now()
    });
    
    console.log(`Notification créée pour la commande ${order.id}`);
    
    toast({
      title: "Commande prête",
      description: "La commande a été marquée comme prête et tous les appareils ont été notifiés.",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    toast({
      title: "Erreur",
      description: "Impossible de mettre à jour le statut de la commande.",
      variant: "destructive",
    });
  }
};

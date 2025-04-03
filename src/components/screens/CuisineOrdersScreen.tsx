
// Ajoutez ces imports en haut du fichier
import { ref, push, set, update, get } from 'firebase/database';
import { database, notificationsRef } from '@/utils/firebase';
import { serverTimestamp } from 'firebase/database';
import { toast } from '@/hooks/use-toast';

// Add this interface near the top of your file
interface OrderType {
  id: string;
  table: string;
  waitress: string;
  // Add other properties your order has
}

// Then your handleOrderReady function will work correctly
const handleOrderReady = async (order: OrderType) => {
  try {
    console.log("Marking order as ready:", order.id);
    
    // Mettre à jour le statut de la commande
    const orderRef = ref(database, `orders/${order.id}`);
    await update(orderRef, { 
      status: 'ready',
      mealsStatus: 'ready',
      readyTime: serverTimestamp(),
      notified: false // Réinitialiser le statut pour forcer la notification 
    });
    
    // Créer directement une notification avec l'ID de la commande comme clé pour éviter les doublons
    const newNotificationRef = ref(database, `notifications/${order.id}`);
    await set(newNotificationRef, {
      orderId: order.id,
      tableNumber: order.table,
      waitress: order.waitress,
      status: 'ready',
      read: false,
      timestamp: Date.now()
    });
    
    console.log("Notification créée pour la commande:", order.id);
    toast({
      title: "Commande prête",
      description: `Notification envoyée pour la table ${order.table}.`,
    });
  } catch (error) {
    console.error("Erreur:", error);
    toast({
      title: "Erreur",
      description: "Impossible de marquer la commande comme prête.",
      variant: "destructive",
    });
  }
};

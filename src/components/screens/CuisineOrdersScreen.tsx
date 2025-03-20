// Ajoutez ces imports en haut du fichier
import { ref, push, set, update } from 'firebase/database';
import { database } from '@/utils/firebase';
import { serverTimestamp } from 'firebase/database';

// Add this interface near the top of your file
interface OrderType {
  id: string;
  table: string;
  // Add other properties your order has
}

// Then your handleOrderReady function will work correctly
const handleOrderReady = async (order: OrderType) => {
  try {
    // Mettre à jour le statut de la commande
    const orderRef = ref(database, `orders/${order.id}`);
    await update(orderRef, { 
      status: 'ready',
      mealsStatus: 'ready' 
    });
    
    // Créer une notification
    const newNotificationRef = push(ref(database, 'notifications'));
    await set(newNotificationRef, {
      orderId: order.id,
      tableNumber: order.table,
      status: 'ready',
      read: false,
      timestamp: serverTimestamp()
    });
    
    console.log("Commande marquée comme prête et notification créée");
  } catch (error) {
    console.error("Erreur:", error);
  }
};
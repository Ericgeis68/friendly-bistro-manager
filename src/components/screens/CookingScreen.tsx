// Add these imports at the top of your file
import { ref, update, serverTimestamp, set } from 'firebase/database';
import { database } from '../../utils/firebase';
import { toast } from '../../components/ui/use-toast';

// Fonction pour marquer une commande comme prête
const markOrderAsReady = (orderId: string) => {
  // Référence à la commande dans Firebase
  const orderRef = ref(database, `orders/${orderId}`);
  
  // Mettre à jour le statut de la commande dans Firebase
  update(orderRef, {
    status: 'ready',
    readyTime: serverTimestamp(),
    notified: false // Reset notification status so all clients will be notified
  })
  .then(() => {
    console.log(`Commande ${orderId} marquée comme prête`);
    toast({
      title: "Commande prête",
      description: "La commande a été marquée comme prête et tous les appareils ont été notifiés.",
    });
  })
  .catch(error => {
    console.error("Erreur lors de la mise à jour du statut:", error);
    toast({
      title: "Erreur",
      description: "Impossible de mettre à jour le statut de la commande.",
      variant: "destructive",
    });
  });
};
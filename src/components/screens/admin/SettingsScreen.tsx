
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ref, remove, get, set, query, orderByChild, equalTo } from 'firebase/database';
import { database, pendingOrdersRef, completedOrdersRef, notificationsRef, orderItemsRef, ordersRef } from '../../../utils/firebase';
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SettingsScreenProps {
  serverIp: string;
  setServerIp: (ip: string) => void;
  connectedDevices: number;
  setConnectedDevices: (num: number) => void;
  resetApplication: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  serverIp, 
  setServerIp, 
  connectedDevices, 
  setConnectedDevices, 
  resetApplication 
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleResetInitiate = () => {
    setShowConfirmDialog(true);
  };

  const handleResetCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleResetConfirm = async () => {
    setShowConfirmDialog(false);
    setIsResetting(true);
    try {
      console.log("Suppression des commandes en cours...");
      
      // Tables problématiques connues
      const problematicTables = ['99', '56', '64', '79'];
      const problematicOrderIds = ['CMD-250320-067-meals'];
      
      // Créer un tableau des références à toutes les collections à nettoyer
      const collectionsToClean = [
        { name: 'pendingOrders', ref: pendingOrdersRef },
        { name: 'completedOrders', ref: completedOrdersRef },
        { name: 'notifications', ref: notificationsRef },
        { name: 'orderItems', ref: orderItemsRef },
        { name: 'orders', ref: ordersRef }
      ];
      
      // Fonction pour supprimer une commande et ses références associées
      const deleteOrderCompletely = async (orderId) => {
        console.log(`Suppression complète de la commande ${orderId} de toutes les collections`);
        
        // Supprimer de toutes les collections
        for (const collection of collectionsToClean) {
          await remove(ref(database, `${collection.name}/${orderId}`));
          await set(ref(database, `${collection.name}/${orderId}`), null);
        }
      };
      
      // 1. Supprimer les commandes problématiques spécifiques par ID
      for (const orderId of problematicOrderIds) {
        await deleteOrderCompletely(orderId);
      }
      
      // 2. Supprimer les commandes par table problématique
      for (const tableNumber of problematicTables) {
        console.log(`Recherche et suppression des commandes pour la table ${tableNumber}`);
        
        // Parcourir chaque collection et supprimer les commandes liées à cette table
        for (const collection of collectionsToClean) {
          const snapshot = await get(collection.ref);
          if (snapshot.exists()) {
            const data = snapshot.val();
            for (const key in data) {
              const item = data[key];
              // Vérifier si c'est une commande avec cette table
              if (item && (item.table === tableNumber || item.table === Number(tableNumber) || 
                  item.tableNumber === tableNumber || item.tableNumber === Number(tableNumber))) {
                console.log(`Suppression de ${collection.name}/${key} (table ${tableNumber})`);
                await remove(ref(database, `${collection.name}/${key}`));
                await set(ref(database, `${collection.name}/${key}`), null);
              }
            }
          }
        }
      }
      
      // 3. Supprimer toutes les entrées de statut "offline" et timestamps numériques
      console.log("Suppression des entrées offline et timestamps...");
      const dbRootRef = ref(database, '/');
      const rootSnapshot = await get(dbRootRef);
      if (rootSnapshot.exists()) {
        const rootData = rootSnapshot.val();
        for (const key in rootData) {
          // Supprimer les entrées avec valeur "offline"
          if (rootData[key] === "offline") {
            console.log(`Suppression de l'entrée offline: ${key}`);
            await remove(ref(database, key));
          }
          
          // Supprimer les entrées avec clés numériques (timestamps)
          if (!isNaN(Number(key)) && key.length > 10) {
            console.log(`Suppression de l'entrée timestamp: ${key}`);
            await remove(ref(database, key));
          }
        }
      }
      
      // 4. Suppression totale des collections principales
      console.log("Suppression complète des collections principales...");
      
      for (const collection of collectionsToClean) {
        console.log(`Vidage de la collection ${collection.name}...`);
        
        // D'abord supprimer tous les éléments individuellement
        const snapshot = await get(collection.ref);
        if (snapshot.exists()) {
          const data = snapshot.val();
          for (const key in data) {
            await remove(ref(database, `${collection.name}/${key}`));
          }
        }
        
        // Puis réinitialiser complètement la collection
        await remove(collection.ref);
        await set(collection.ref, null);
      }
      
      // 5. Vérification finale et réinitialisation complète
      setTimeout(async () => {
        try {
          // Vérification finale pour les commandes problématiques
          for (const orderId of problematicOrderIds) {
            await deleteOrderCompletely(orderId);
          }
          
          // Vérification finale pour les tables problématiques
          for (const tableNumber of problematicTables) {
            console.log(`Vérification finale pour la table ${tableNumber}`);
            for (const collection of collectionsToClean) {
              const pathRef = ref(database, `${collection.name}`);
              const snapshot = await get(pathRef);
              if (snapshot.exists()) {
                const data = snapshot.val();
                for (const key in data) {
                  const item = data[key];
                  if (item && (item.table === tableNumber || item.table === Number(tableNumber) ||
                      item.tableNumber === tableNumber || item.tableNumber === Number(tableNumber))) {
                    await remove(ref(database, `${collection.name}/${key}`));
                    await set(ref(database, `${collection.name}/${key}`), null);
                  }
                }
              }
            }
          }
          
          // Réinitialisation complète en définissant chaque collection à null puis en la recréant vide
          for (const collection of collectionsToClean) {
            await set(collection.ref, null);
            await set(collection.ref, {});
          }
          
        } catch (error) {
          console.error("Erreur lors de la vérification finale:", error);
        }
      }, 1000);
      
      toast({
        title: "Application réinitialisée",
        description: "Toutes les commandes ont été supprimées. Les menus et options de cuisson ont été conservés.",
      });
      
      // Call the provided resetApplication function to update local state
      resetApplication();
    } catch (error) {
      console.error("Error resetting application:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réinitialisation de l'application.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Paramètres</h2>
      <div className="bg-white rounded-xl p-6 shadow max-w-xl">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Adresse IP du serveur</label>
          <input
            type="text"
            value={serverIp}
            onChange={e => setServerIp(e.target.value)}
            className="w-full border rounded-md h-12 px-3"
          />
        </div>
        <div className="mb-4">
          <h3 className="text-gray-700 text-sm font-medium mb-2">Appareils connectés</h3>
          <p className="text-lg">{connectedDevices}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-gray-700 text-sm font-medium mb-2">Version de l'application</h3>
          <p className="text-lg">1.0.0</p>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <h3 className="text-red-600 text-lg font-medium mb-3">Zone dangereuse</h3>
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
            <p className="text-sm text-red-700">
              Attention : Cette action va supprimer toutes les commandes en cours et terminées. 
              Les menus et options de cuisson seront conservés.
            </p>
          </div>
          <button
            onClick={handleResetInitiate}
            disabled={isResetting}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md py-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={20} className="mr-2" />
            {isResetting ? "Réinitialisation en cours..." : "Réinitialiser l'application"}
          </button>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la réinitialisation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir réinitialiser l'application ? Cette action supprimera TOUTES les commandes en cours et terminées de tous les appareils et ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleResetCancel}>Annuler</Button>
            <Button variant="destructive" onClick={handleResetConfirm}>Réinitialiser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsScreen;

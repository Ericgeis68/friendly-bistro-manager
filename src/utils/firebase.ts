import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, remove, get, query, limitToFirst } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAXPWV532Pk05-CFuULphQRvVxeotEMLNY",
  authDomain: "holpla-geis.firebaseapp.com",
  databaseURL: "https://holpla-geis-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "holpla-geis",
  storageBucket: "holpla-geis.firebasestorage.app",
  messagingSenderId: "585405486765",
  appId: "1:585405486765:web:ac346ff74aa9561646d824"
};

console.log("Initializing Firebase...");
let app;
let database;
let cookingOptionsRef;
let menuItemsRef;
let pendingOrdersRef;
let completedOrdersRef;
let notificationsRef;
let orderItemsRef;
let ordersRef;

try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
  database = getDatabase(app);
  cookingOptionsRef = ref(database, 'cookingOptions');
  menuItemsRef = ref(database, 'menuItems');
  pendingOrdersRef = ref(database, 'pendingOrders');
  completedOrdersRef = ref(database, 'completedOrders');
  notificationsRef = ref(database, 'notifications');
  orderItemsRef = ref(database, 'orderItems');
  ordersRef = ref(database, 'orders');
  
  // Fonction améliorée pour supprimer les commandes problématiques
  const clearPersistentOrders = async () => {
    try {
      console.log("Tentative de suppression des ordres persistants...");
      
      // Tables problématiques connues
      const problematicTables = ['99', '56', '64', '79', '7'];
      
      // Commandes problématiques connues à supprimer explicitement
      const problematicOrderIds = [
        'CMD-250320-067-meals',
        'CMD-250320-746-meals'  // Ajout de la commande problématique
      ];
      
      // Collections à nettoyer
      const collectionsToClean = [
        { name: 'pendingOrders', ref: pendingOrdersRef },
        { name: 'completedOrders', ref: completedOrdersRef },
        { name: 'notifications', ref: notificationsRef },
        { name: 'orderItems', ref: orderItemsRef },
        { name: 'orders', ref: ordersRef }
      ];
      
      // Fonction pour supprimer une commande spécifique de toutes les collections
      const deleteOrderCompletely = async (orderId) => {
        console.log(`Suppression complète de la commande ${orderId}`);
        
        for (const collection of collectionsToClean) {
          try {
            await remove(ref(database, `${collection.name}/${orderId}`));
            await set(ref(database, `${collection.name}/${orderId}`), null);
            console.log(`Supprimé ${collection.name}/${orderId}`);
          } catch (e) {
            console.error(`Erreur lors de la suppression de ${collection.name}/${orderId}:`, e);
          }
        }
      };
      
      // 1. Suppression explicite des commandes problématiques par ID
      for (const orderId of problematicOrderIds) {
        await deleteOrderCompletely(orderId);
      }
      
      // 2. Suppression spécifique des commandes par table problématique
      for (const tableNum of problematicTables) {
        console.log(`Recherche et suppression des commandes pour la table ${tableNum}...`);
        
        // Traitement spécial pour la table 7
        if (tableNum === '7') {
          console.log("Suppression spéciale pour la table 7");
          // Rechercher dans toutes les collections
          for (const collection of collectionsToClean) {
            const snapshot = await get(collection.ref);
            if (snapshot.exists()) {
              const data = snapshot.val();
              for (const key in data) {
                const item = data[key];
                if (item && (
                    String(item.table) === '7' || 
                    item.table === 7 || 
                    String(item.tableNumber) === '7' || 
                    item.tableNumber === 7
                )) {
                  console.log(`Suppression de ${collection.name}/${key} (table 7)`);
                  await remove(ref(database, `${collection.name}/${key}`));
                  await set(ref(database, `${collection.name}/${key}`), null);
                }
              }
            }
          }
        }
        
        // Parcourir toutes les collections
        for (const collection of collectionsToClean) {
          const snapshot = await get(collection.ref);
          if (snapshot.exists()) {
            const data = snapshot.val();
            for (const key in data) {
              const item = data[key];
              if (item && (
                  String(item.table) === tableNum || 
                  item.table === Number(tableNum) || 
                  String(item.tableNumber) === tableNum || 
                  item.tableNumber === Number(tableNum)
              )) {
                console.log(`Suppression de ${collection.name}/${key} (table ${tableNum})`);
                await remove(ref(database, `${collection.name}/${key}`));
                await set(ref(database, `${collection.name}/${key}`), null);
              }
            }
          }
        }
      }
      
      // 3. Vider complètement les collections problématiques
      for (const collection of collectionsToClean) {
        try {
          // Vérifier si la collection contient encore des données
          const snapshot = await get(collection.ref);
          if (snapshot.exists()) {
            const data = snapshot.val();
            for (const key in data) {
              // Supprimer chaque entrée individuellement
              await remove(ref(database, `${collection.name}/${key}`));
              await set(ref(database, `${collection.name}/${key}`), null);
            }
          }
          
          // Réinitialiser complètement la collection
          await set(collection.ref, null);
        } catch (e) {
          console.error(`Erreur lors du nettoyage de ${collection.name}:`, e);
        }
      }
      
      // 4. Supprimer les entrées "offline" et timestamps numériques
      const dbRootRef = ref(database, '/');
      const rootSnapshot = await get(dbRootRef);
      if (rootSnapshot.exists()) {
        const rootData = rootSnapshot.val();
        for (const key in rootData) {
          // Supprimer les entrées avec valeur "offline"
          if (rootData[key] === "offline") {
            console.log(`Suppression de l'entrée offline: ${key}`);
            await remove(ref(database, key));
            await set(ref(database, key), null);
          }
          
          // Supprimer les entrées avec clés numériques (timestamps)
          if (!isNaN(Number(key)) && key.length > 10) {
            console.log(`Suppression de l'entrée timestamp: ${key}`);
            await remove(ref(database, key));
            await set(ref(database, key), null);
          }
        }
      }
      
      console.log("Nettoyage initial terminé, vérification finale...");
      
      // 5. Vérification finale et nettoyage supplémentaire si nécessaire
      setTimeout(async () => {
        for (const collection of collectionsToClean) {
          try {
            // Forcer la suppression complète
            await set(collection.ref, null);
            
            // Vérifier si la collection est vide
            const snapshot = await get(collection.ref);
            if (snapshot.exists()) {
              console.log(`⚠️ ${collection.name} contient encore des données:`, snapshot.val());
              // Tentative de suppression définitive
              await remove(collection.ref);
              await set(collection.ref, null);
            } else {
              console.log(`✅ ${collection.name} est bien vide`);
            }
          } catch (e) {
            console.error(`Erreur lors de la vérification de ${collection.name}:`, e);
          }
        }
      }, 3000);
      
    } catch (e) {
      console.error("Error clearing persistent orders:", e);
    }
  };
  
  // Exécuter à l'initialisation et après un délai pour s'assurer que la base est prête
  clearPersistentOrders();
  setTimeout(clearPersistentOrders, 2000);
  
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { 
  database, 
  cookingOptionsRef,
  menuItemsRef,
  pendingOrdersRef,
  completedOrdersRef,
  notificationsRef,
  orderItemsRef,
  ordersRef
};
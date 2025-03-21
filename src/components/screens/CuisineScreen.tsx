import React, { useState } from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import type { MenuItem, Order } from '../../types/restaurant';
import { toast } from "@/hooks/use-toast";
import CompletedOrdersScreen from './CompletedOrdersScreen';
// Ajoutez ces imports ici mais sans redéfinir toast
import { ref, update, serverTimestamp, set } from 'firebase/database';
import { database } from '../../utils/firebase';
// Supprimez l'import en double de toast

interface CuisineScreenProps {
  pendingOrders: Order[];
  completedOrders: Order[];
  setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onLogout: () => void;
  onOrderReady: (order: Order) => void;
}

// Component for order cards
const OrderCard = ({ order, handleOrderReady }: { order: Order, handleOrderReady: (order: Order) => void }) => {
  // Group meals by name and cooking style to combine quantities
  const groupedMeals: Record<string, MenuItem> = {};
  
  order.meals.forEach((meal) => {
    const key = `${meal.name}-${meal.cooking || 'standard'}`;
    if (!groupedMeals[key]) {
      groupedMeals[key] = { ...meal, quantity: 0 };
    }
    groupedMeals[key].quantity = (groupedMeals[key].quantity || 0) + (meal.quantity || 1);
  });

  return (
    <div className="bg-white rounded-xl p-4 shadow w-64">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-medium">
            Table {order.table}
            {order.tableComment && <span className="text-gray-600 text-sm ml-2">({order.tableComment})</span>}
          </h3>
          <p className="text-sm text-gray-600">Serveuse: {order.waitress}</p>
        </div>
      </div>
      <ul className="list-disc pl-6">
        {Object.values(groupedMeals).map((meal, index) => (
          <li key={`${order.id}-meal-${index}`}>
            {meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}
          </li>
        ))}
      </ul>
      {order.status === 'pending' && (
        <button
          onClick={() => handleOrderReady(order)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md mt-2 w-full"
        >
          Prêt
        </button>
      )}
    </div>
  );
};

// Component for dashboard table
const DashboardTable = ({ tableRows }: { tableRows: { name: string; cooking: string; count: number }[] }) => {
  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-lg">
      <div className="overflow-hidden">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">Vue d'ensemble des plats</h3>
          <p className="text-gray-500">Récapitulatif des plats en cours de préparation</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 tracking-wider rounded-l-lg">Plat</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 tracking-wider">Cuisson</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 tracking-wider rounded-r-lg">Quantité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableRows.map((row, idx) => (
                <tr 
                  key={`row-${idx}`}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{row.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                      {row.cooking}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                      {row.count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {tableRows.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun plat en préparation</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component
const CuisineScreen: React.FC<CuisineScreenProps> = ({
  pendingOrders,
  completedOrders,
  setPendingOrders,
  setCompletedOrders,
  onLogout,
  onOrderReady
}) => {
  const [showOrders, setShowOrders] = useState<'pending' | 'completed' | 'dashboard'>('pending');
  const [menuOpen, setMenuOpen] = useState(false);

  // Fonction pour marquer une commande comme prête dans Firebase
  const marquerCommandePrete = (idCommande: string) => {
    // Référence à la commande dans Firebase
    const refCommande = ref(database, `orders/${idCommande}`);
    
    // Mettre à jour le statut de la commande dans Firebase
    update(refCommande, {
      status: 'ready',
      readyTime: serverTimestamp(),
      notified: false // Réinitialiser le statut de notification pour que tous les clients soient notifiés
    })
    .then(() => {
      console.log(`Commande ${idCommande} marquée comme prête`);
      toast({
        title: "Commande prête",
        description: "La commande a été marquée comme prête et tous les appareils ont été notifiés.",
      });
      
      // Mettre également à jour le statut de notification dans un emplacement séparé pour une meilleure synchronisation
      const refNotification = ref(database, `notifications/${idCommande}`);
      set(refNotification, {
        orderId: idCommande,
        status: 'ready',
        timestamp: serverTimestamp(),
        read: false
      });
    })
    .catch(erreur => {
      console.error("Erreur lors de la mise à jour du statut:", erreur);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la commande.",
        variant: "destructive",
      });
    });
  };

  // Filtrer les commandes en cours pour n'afficher que celles qui sont en attente
  // et qui ont des repas (pas seulement des boissons)
  const pendingOrdersToShow = pendingOrders.filter(order => 
    order.status === 'pending' && order.meals && order.meals.length > 0
  );
  
  // Ajouter une vérification pour éliminer les doublons basée sur l'ID de commande
  const uniquePendingOrders = Array.from(
    new Map(pendingOrdersToShow.map(order => [order.id, order])).values()
  );
  
  // Si on montre les commandes terminées, utiliser le composant CompletedOrdersScreen
  if (showOrders === 'completed') {
    return (
      <CompletedOrdersScreen 
        orders={completedOrders.filter(order => order.meals && order.meals.length > 0)}
        onBack={() => setShowOrders('pending')}
        userRole="cuisine"
      />
    );
  }

  const handleOrderReady = (order: Order) => {
    // Appeler la fonction Firebase pour mettre à jour le statut
    marquerCommandePrete(order.id);
    
    // Appeler ensuite la fonction onOrderReady pour mettre à jour l'état local
    onOrderReady(order);
    
    toast({
      title: "Notification envoyée",
      description: `La serveuse ${order.waitress} a été notifiée que la commande est prête.`,
    });
  };

  const refreshOrders = () => {
    // This function is just a visual effect since the actual data should already be current
    toast({
      title: "Données actualisées",
      description: "Les commandes ont été mises à jour.",
    });
  };

  // Improved grouping for meals by cooking style
  const countItemsByCooking = () => {
    // Structure to store grouped items
    const groupedItems: Record<string, Record<string, number>> = {};
    
    pendingOrdersToShow.forEach((order) => {
      order.meals.forEach((meal) => {
        const itemName = meal.name;
        const cookingStyle = meal.cooking || 'standard';
        const quantity = meal.quantity || 1;
        
        // Create item category if it doesn't exist
        if (!groupedItems[itemName]) {
          groupedItems[itemName] = {};
        }
        
        // Add or update cooking style count
        if (!groupedItems[itemName][cookingStyle]) {
          groupedItems[itemName][cookingStyle] = 0;
        }
        
        groupedItems[itemName][cookingStyle] += quantity;
      });
    });
    
    return groupedItems;
  };

  const itemCounts = countItemsByCooking();
  
  // Prepare the rows for display with grouped items
  const prepareTableRows = () => {
    const tableRows: { name: string; cooking: string; count: number }[] = [];
    
    // Process all menu items
    Object.entries(itemCounts).forEach(([itemName, cookingCounts]) => {
      Object.entries(cookingCounts).forEach(([cooking, count]) => {
        if (count > 0) {
          tableRows.push({ name: itemName, cooking, count });
        }
      });
    });
    
    // Sort: Entrecôte first, then others by name
    return tableRows.sort((a, b) => {
      if (a.name.includes('Entrecôte') && !b.name.includes('Entrecôte')) {
        return -1;
      }
      if (!a.name.includes('Entrecôte') && b.name.includes('Entrecôte')) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  };

  const tableRows = prepareTableRows();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-transparent p-4 flex items-center justify-between">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-800 font-bold text-xl flex items-center">
          <Menu className="mr-2 text-2xl" />
        </button>
        <h1 className="text-gray-800 font-bold text-2xl">
          {showOrders === 'pending' ? 'Commandes en cours' : 
           showOrders === 'dashboard' ? 'Tableau de bord' : 'Commandes terminées'}
        </h1>
        <button 
          onClick={refreshOrders} 
          className="text-blue-600 hover:text-blue-800"
        >
          <RefreshCw size={24} />
        </button>
      </nav>
      
      {menuOpen && (
        <div className="absolute top-16 left-4 bg-white shadow-lg rounded-md p-4 z-50">
          <button onClick={() => { setShowOrders('pending'); setMenuOpen(false); }} className="w-full text-left py-2 px-4 hover:bg-gray-100">
            Commandes en cours
          </button>
          <button onClick={() => { setShowOrders('completed'); setMenuOpen(false); }} className="w-full text-left py-2 px-4 hover:bg-gray-100">
            Commandes terminées
          </button>
          <button onClick={() => { setShowOrders('dashboard'); setMenuOpen(false); }} className="w-full text-left py-2 px-4 hover:bg-gray-100">
            Tableau de bord
          </button>
          <button onClick={onLogout} className="w-full text-left py-2 px-4 hover:bg-gray-100">
            Déconnexion
          </button>
        </div>
      )}

      <div className="flex-1 p-4 overflow-auto">
        <div className="flex flex-wrap gap-4 justify-center">
          {uniquePendingOrders.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              Aucune commande en attente
            </div>
          ) : (
            uniquePendingOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                handleOrderReady={onOrderReady} 
              />
            ))
          )}
        </div>
      </div>
      
      {showOrders === 'dashboard' && (
        <DashboardTable tableRows={tableRows} />
      )}
    </div>
  );
};

export default CuisineScreen;

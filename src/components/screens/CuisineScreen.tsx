
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import type { MenuItem, Order } from '../../types/restaurant';
import { toast } from "@/hooks/use-toast";
import CompletedOrdersScreen from './CompletedOrdersScreen';

interface CuisineScreenProps {
  pendingOrders: Order[];
  completedOrders: Order[];
  setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onLogout: () => void;
  onOrderReady: (order: Order) => void;
}

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

  // Filtrer les commandes en cours pour n'afficher que celles qui sont en attente
  const pendingOrdersToShow = pendingOrders.filter(order => order.status === 'pending');

  // Si on montre les commandes terminées, utiliser le composant CompletedOrdersScreen
  if (showOrders === 'completed') {
    return (
      <CompletedOrdersScreen 
        orders={completedOrders}
        onBack={() => setShowOrders('pending')}
        userRole="cuisine"
      />
    );
  }

  const handleOrderReady = (order: Order) => {
    const updatedOrder = { ...order, status: 'ready' as const, mealsStatus: 'ready' as const };
    
    // Mettre à jour la commande dans pendingOrders
    setPendingOrders(prev => 
      prev.map(o => o.id === order.id ? updatedOrder : o)
    );
    
    // Mettre à jour ou ajouter la commande dans completedOrders
    setCompletedOrders(prev => {
      const existingOrderIndex = prev.findIndex(o => o.id === order.id);
      if (existingOrderIndex !== -1) {
        // Si la commande existe déjà, mettre à jour son statut
        const newOrders = [...prev];
        newOrders[existingOrderIndex] = updatedOrder;
        return newOrders;
      }
      // Si la commande n'existe pas, l'ajouter
      return [...prev, updatedOrder];
    });
    
    onOrderReady(order);
    
    toast({
      title: "Notification envoyée",
      description: `La serveuse ${order.waitress} a été notifiée que la commande est prête.`,
    });
  };

  // Group and count items by name and cooking style
  const countItemsByCooking = () => {
    // Structure: { itemName: { cookingStyle: count } }
    const counts: Record<string, Record<string, number>> = {};
    
    pendingOrdersToShow.forEach((order) => {
      order.meals.forEach((meal) => {
        const itemName = meal.name;
        const cookingStyle = meal.cooking || 'standard';
        const quantity = meal.quantity || 1;
        
        if (!counts[itemName]) {
          counts[itemName] = {};
        }
        
        if (!counts[itemName][cookingStyle]) {
          counts[itemName][cookingStyle] = 0;
        }
        
        counts[itemName][cookingStyle] += quantity;
      });
    });
    
    return counts;
  };

  const itemCounts = countItemsByCooking();
  
  // Flatten the grouped items into rows for display
  const itemRows: { name: string; cooking: string; count: number }[] = [];
  Object.entries(itemCounts).forEach(([itemName, cookingCounts]) => {
    Object.entries(cookingCounts).forEach(([cooking, count]) => {
      if (cooking !== 'standard' || (itemName !== 'Entrecôte' && itemName !== 'Entrecôte spécial')) {
        itemRows.push({ name: itemName, cooking, count });
      }
    });
  });
  
  // Special handling for Entrecôte items - group by cooking style
  const entrecoteTotals: Record<string, number> = {};
  
  if (itemCounts['Entrecôte']) {
    Object.entries(itemCounts['Entrecôte']).forEach(([cooking, count]) => {
      if (cooking !== 'standard') {
        entrecoteTotals[cooking] = (entrecoteTotals[cooking] || 0) + count;
      }
    });
  }
  
  if (itemCounts['Entrecôte spécial']) {
    Object.entries(itemCounts['Entrecôte spécial']).forEach(([cooking, count]) => {
      if (cooking !== 'standard') {
        entrecoteTotals[cooking] = (entrecoteTotals[cooking] || 0) + count;
      }
    });
  }
  
  // Add the grouped Entrecôte rows
  Object.entries(entrecoteTotals).forEach(([cooking, count]) => {
    itemRows.push({ name: 'Entrecôte (tous types)', cooking, count });
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-transparent p-4 flex items-center">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-800 font-bold text-xl flex items-center">
          <Menu className="mr-2 text-2xl" />
        </button>
        <h1 className="text-gray-800 font-bold text-2xl mx-auto">
          {showOrders === 'pending' ? 'Commandes en cours' : 
           showOrders === 'dashboard' ? 'Tableau de bord' : 'Commandes terminées'}
        </h1>
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

      <div className="p-4 mt-4 flex flex-wrap gap-4">
        {showOrders === 'pending' && pendingOrdersToShow.map((order) => (
          <div key={order.id} className="bg-white rounded-xl p-4 shadow w-64">
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
              {order.meals.map((meal, index) => (
                <li key={`${order.id}-meal-${index}`}>
                  {meal.name} x{meal.quantity || 1} {meal.cooking && `(${meal.cooking})`}
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
        ))}
        
        {showOrders === 'dashboard' && (
          <div className="w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Plat</th>
                  <th className="border px-4 py-2">Cuisson</th>
                  <th className="border px-4 py-2">Quantité</th>
                </tr>
              </thead>
              <tbody>
                {itemRows
                  .filter(row => row.count > 0) // Only show items with a count
                  .sort((a, b) => {
                    // Show entrecote group first, then sort by name
                    if (a.name.includes('Entrecôte') && !b.name.includes('Entrecôte')) return -1;
                    if (!a.name.includes('Entrecôte') && b.name.includes('Entrecôte')) return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((row, idx) => (
                    <tr key={`row-${idx}`}>
                      <td className="border px-4 py-2">{row.name}</td>
                      <td className="border px-4 py-2">{row.cooking === 'standard' ? '-' : row.cooking}</td>
                      <td className="border px-4 py-2">{row.count}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuisineScreen;

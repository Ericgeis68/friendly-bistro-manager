
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

  const pendingOrdersToShow = pendingOrders.filter(order => order.status === 'pending');

  const handleOrderReady = (order: Order) => {
    const updatedOrder = { ...order, status: 'ready' as const };
    setPendingOrders(prev => 
      prev.map(o => o.id === order.id ? updatedOrder : o)
    );
    setCompletedOrders(prev => [...prev, updatedOrder]);
    onOrderReady(order);
    toast({
      title: "Notification envoyée",
      description: `La serveuse ${order.waitress} a été notifiée que la commande est prête.`,
    });
  };

  // If showing completed orders, render the CompletedOrdersScreen component
  if (showOrders === 'completed') {
    return (
      <CompletedOrdersScreen 
        orders={completedOrders}
        onBack={() => setShowOrders('pending')}
        userRole="cuisine"
      />
    );
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'ready':
        return 'En cours';
      case 'delivered':
        return 'Livré';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const countItems = (itemName: string, cooking?: string): number => {
    let count = 0;
    pendingOrdersToShow.forEach((order) => {
      order.meals.forEach((meal) => {
        if (meal.name === itemName && (!cooking || meal.cooking === cooking)) {
          count += meal.quantity;
        }
      });
    });
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-transparent p-4 flex items-center">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-800 font-bold text-xl flex items-center">
          <Menu className="mr-2 text-2xl" />
        </button>
        <h1 className="text-gray-800 font-bold text-2xl mx-auto">
          {showOrders === 'pending' ? 'Commandes en cours' : showOrders === 'completed' ? 'Commandes terminées' : 'Tableau de bord'}
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
                <tr>
                  <td className="border px-4 py-2">Entrecôte</td>
                  <td className="border px-4 py-2">SAIGNANT</td>
                  <td className="border px-4 py-2">{countItems('Entrecôte', 'SAIGNANT')}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Entrecôte</td>
                  <td className="border px-4 py-2">A POINT</td>
                  <td className="border px-4 py-2">{countItems('Entrecôte', 'A POINT')}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Entrecôte spécial</td>
                  <td className="border px-4 py-2">A POINT</td>
                  <td className="border px-4 py-2">{countItems('Entrecôte spécial', 'A POINT')}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Merguez pain</td>
                  <td className="border px-4 py-2">-</td>
                  <td className="border px-4 py-2">{countItems('Merguez pain')}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Frites</td>
                  <td className="border px-4 py-2">-</td>
                  <td className="border px-4 py-2">{countItems('Frites')}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Saucisse blanche frite</td>
                  <td className="border px-4 py-2">-</td>
                  <td className="border px-4 py-2">{countItems('Saucisse blanche frite')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuisineScreen;

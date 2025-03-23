
import React, { useState, useEffect } from 'react';
import { RefreshCw, Beer, UtensilsCrossed, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Order } from '../../../types/restaurant';
import { database, pendingOrdersRef, completedOrdersRef } from '../../../utils/firebase';
import { onValue, get } from 'firebase/database';
import { toast } from '@/hooks/use-toast';

interface DashboardScreenProps {
  localOrders: Order[];
  refreshOrders: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ localOrders, refreshOrders }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOrders();
    // Mettre en place des écouteurs pour les mises à jour en temps réel
    const unsubscribePending = onValue(pendingOrdersRef, () => {
      fetchAllOrders();
    });
    
    const unsubscribeCompleted = onValue(completedOrdersRef, () => {
      fetchAllOrders();
    });
    
    return () => {
      unsubscribePending();
      unsubscribeCompleted();
    };
  }, []);

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      // Récupérer toutes les commandes (en cours et terminées)
      const pendingSnapshot = await get(pendingOrdersRef);
      const completedSnapshot = await get(completedOrdersRef);
      
      const pendingOrders = pendingSnapshot.exists() ? Object.values(pendingSnapshot.val()) as Order[] : [];
      const completedOrders = completedSnapshot.exists() ? Object.values(completedSnapshot.val()) as Order[] : [];
      
      // Combiner les commandes
      const allOrders = [...pendingOrders, ...completedOrders];
      setOrders(allOrders);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les commandes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllOrders();
    toast({
      title: "Actualisation",
      description: "Les données ont été actualisées.",
    });
  };

  // Calculer les statistiques
  const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;
  const readyOrdersCount = orders.filter(order => order.status === 'ready').length;
  const deliveredOrdersCount = orders.filter(order => order.status === 'delivered').length;
  const cancelledOrdersCount = orders.filter(order => order.status === 'cancelled').length;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Tableau de bord</h2>
        <button
          onClick={handleRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-md p-2 flex items-center"
          disabled={loading}
        >
          <RefreshCw size={20} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Chargement...' : 'Actualiser'}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-gray-500 mb-2">Commandes en cours</h3>
          <p className="text-3xl font-bold">{pendingOrdersCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-gray-500 mb-2">Commandes prêtes</h3>
          <p className="text-3xl font-bold">{readyOrdersCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-gray-500 mb-2">Commandes livrées</h3>
          <p className="text-3xl font-bold">{deliveredOrdersCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-gray-500 mb-2">Commandes annulées</h3>
          <p className="text-3xl font-bold">{cancelledOrdersCount}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Dernières commandes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500">ID</th>
                <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500">Type</th>
                <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500">Table</th>
                <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500">Serveuse</th>
                <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500">Heure</th>
                <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.slice(0, 10).map(order => {
                  const orderTime = typeof order.createdAt === 'string'
                    ? new Date(order.createdAt).toLocaleTimeString()
                    : new Date(order.createdAt).toLocaleTimeString();
                  
                  // Déterminer le type de commande
                  const orderType = order.drinks && order.drinks.length > 0 && (!order.meals || order.meals.length === 0)
                    ? "Boissons" 
                    : (!order.drinks || order.drinks.length === 0) && order.meals && order.meals.length > 0
                      ? "Repas"
                      : "Mixte";

                  return (
                    <tr key={order.id} className="border-b">
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-700">{order.id}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-700">
                        {orderType === "Boissons" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Beer className="w-3 h-3 mr-1"/>
                            Boissons
                          </span>
                        )}
                        {orderType === "Repas" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <UtensilsCrossed className="w-3 h-3 mr-1"/>
                            Repas
                          </span>
                        )}
                        {orderType === "Mixte" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <UtensilsCrossed className="w-3 h-3 mr-1"/>
                            Mixte
                          </span>
                        )}
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-700">{order.table}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-700">{order.waitress}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-700">{orderTime}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-700">
                        {order.status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1"/>
                            En cours
                          </span>
                        )}
                        {order.status === 'ready' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <CheckCircle className="w-3 h-3 mr-1"/>
                            Prêt
                          </span>
                        )}
                        {order.status === 'delivered' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1"/>
                            Livrée
                          </span>
                        )}
                        {order.status === 'cancelled' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1"/>
                            Annulée
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                    {loading ? "Chargement des commandes..." : "Aucune commande trouvée"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;

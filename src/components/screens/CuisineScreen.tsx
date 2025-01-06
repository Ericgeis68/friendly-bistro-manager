import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import type { MenuItem, Order } from '../../types/restaurant';

interface CuisineScreenProps {
  pendingOrders: Order[];
  completedOrders: Order[];
  setPendingOrders: (orders: Order[]) => void;
  setCompletedOrders: (orders: Order[]) => void;
  onLogout: () => void;
}

const CuisineScreen: React.FC<CuisineScreenProps> = ({
  pendingOrders,
  completedOrders,
  setPendingOrders,
  setCompletedOrders,
  onLogout
}) => {
  const [showOrders, setShowOrders] = useState<'pending' | 'completed' | 'dashboard'>('pending');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCompleteOrder = (waitress: string) => {
    const order = pendingOrders.find(order => order.waitress === waitress);
    if(order){
        setCompletedOrders([...completedOrders, order]);
        setPendingOrders(pendingOrders.filter((o) => o.waitress !== waitress));
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleOrdersView = (view: 'pending' | 'completed' | 'dashboard') => {
    setShowOrders(view);
    setMenuOpen(false);
  };

  const countItems = (itemName: string, cooking?: string): number => {
    let count = 0;
    pendingOrders.forEach((order) => {
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
        <button onClick={toggleMenu} className="text-gray-800 font-bold text-xl flex items-center">
          <Menu className="mr-2 text-2xl" />
        </button>
        <h1 className="text-gray-800 font-bold text-2xl mx-auto">
          {showOrders === 'pending' ? 'Commandes en cours' : showOrders === 'completed' ? 'Commandes terminées' : 'Tableau de bord'}
        </h1>
      </nav>
      
      {menuOpen && (
        <div className="absolute top-16 left-4 bg-white shadow-lg rounded-md p-4 z-50">
          <button onClick={() => handleOrdersView('pending')} className="w-full text-left py-2 px-4 hover:bg-gray-100">
            Commandes en cours
          </button>
          <button onClick={() => handleOrdersView('completed')} className="w-full text-left py-2 px-4 hover:bg-gray-100">
            Commandes terminées
          </button>
          <button onClick={() => handleOrdersView('dashboard')} className="w-full text-left py-2 px-4 hover:bg-gray-100">
            Tableau de bord
          </button>
          <button onClick={onLogout} className="w-full text-left py-2 px-4 hover:bg-gray-100">
            Déconnexion
          </button>
        </div>
      )}

      <div className="p-4 mt-4 flex space-x-8">
        {showOrders === 'pending' && pendingOrders.map((order, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow w-64">
            <h3 className="text-lg font-medium mb-2">Commande de {order.waitress}</h3>
            <ul className="list-disc pl-6">
              {order.meals.map((meal) => (
                <li key={meal.id} className="flex justify-between">
                  <span>
                    {meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCompleteOrder(order.waitress)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md mt-2"
            >
              Terminer
            </button>
          </div>
        ))}
        
        {showOrders === 'completed' && (
          <div>
            {completedOrders.map((order, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow mb-4">
                <h3 className="text-lg font-medium mb-2">Commande de {order.waitress}</h3>
                <ul className="list-disc pl-6">
                  {order.meals.map((meal) => (
                    <li key={meal.id} className="flex justify-between">
                      <span>
                        {meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        
        {showOrders === 'dashboard' && (
          <div>
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
import React from 'react';
import { ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';
import type { Order } from '../../types/restaurant';

interface WaitressOrdersScreenProps {
  pendingOrders: Order[];
  completedOrders: Order[];
  loggedInUser: string;
  onCompleteOrder: (order: Order) => void;
  onNewOrder: () => void;
  onLogout: () => void;
}

const WaitressOrdersScreen: React.FC<WaitressOrdersScreenProps> = ({
  pendingOrders,
  completedOrders,
  loggedInUser,
  onCompleteOrder,
  onNewOrder,
  onLogout
}) => {
  const [activeTab, setActiveTab] = React.useState<'new' | 'pending' | 'completed'>('new');
  
  const waitressOrders = pendingOrders.filter(order => order.waitress === loggedInUser);
  const waitressCompletedOrders = completedOrders.filter(order => order.waitress === loggedInUser);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="text-lg font-medium text-gray-800">Bonjour {loggedInUser}</div>
        <div onClick={onLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              activeTab === 'new' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
            }`}
          >
            Nouvelle commande
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              activeTab === 'pending' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
            }`}
          >
            En cours
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              activeTab === 'completed' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
            }`}
          >
            Terminées
          </button>
        </div>

        {activeTab === 'new' && (
          <button
            onClick={onNewOrder}
            className="w-full bg-[#0EA5E9] p-6 rounded-2xl shadow flex flex-col items-center active:bg-[#0EA5E9]/90"
          >
            <ShoppingBag size={48} className="mb-3 text-white" />
            <span className="text-lg text-white">Nouvelle commande</span>
          </button>
        )}

        {activeTab === 'pending' && (
          <div className="bg-white rounded-2xl p-4 shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Commandes en cours</h2>
            {waitressOrders.map((order, index) => (
              <div key={index} className="border-b last:border-0 py-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Table {order.table}</span>
                  <button
                    onClick={() => onCompleteOrder(order)}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Terminer
                  </button>
                </div>
                {order.meals.map((meal) => (
                  <div key={meal.id} className="text-gray-600">
                    {meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}
                  </div>
                ))}
                {order.drinks.map((drink) => (
                  <div key={drink.id} className="text-gray-600">
                    {drink.name} x{drink.quantity}
                  </div>
                ))}
              </div>
            ))}
            {waitressOrders.length === 0 && (
              <div className="text-gray-500 text-center py-4">
                Aucune commande en cours
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="bg-white rounded-2xl p-4 shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Commandes terminées</h2>
            {waitressCompletedOrders.map((order, index) => (
              <div key={index} className="border-b last:border-0 py-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Table {order.table}</span>
                  <span className="text-green-500">Terminée</span>
                </div>
                {order.meals.map((meal) => (
                  <div key={meal.id} className="text-gray-600">
                    {meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}
                  </div>
                ))}
                {order.drinks.map((drink) => (
                  <div key={drink.id} className="text-gray-600">
                    {drink.name} x{drink.quantity}
                  </div>
                ))}
              </div>
            ))}
            {waitressCompletedOrders.length === 0 && (
              <div className="text-gray-500 text-center py-4">
                Aucune commande terminée
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitressOrdersScreen;
import React from 'react';
import { Order } from '../types';
import { LogOut } from 'lucide-react';

interface CuisineScreenProps {
  pendingOrders: Order[];
  completedOrders: Order[];
  setPendingOrders: (orders: Order[]) => void;
  setCompletedOrders: (orders: Order[]) => void;
  handleLogout: () => void;
}

const CuisineScreen: React.FC<CuisineScreenProps> = ({
  pendingOrders,
  completedOrders,
  setPendingOrders,
  setCompletedOrders,
  handleLogout,
}) => {
  const handleCompleteOrder = (orderIndex: number) => {
    const completedOrder = pendingOrders[orderIndex];
    const newPendingOrders = pendingOrders.filter((_, index) => index !== orderIndex);
    setPendingOrders(newPendingOrders);
    setCompletedOrders([...completedOrders, completedOrder]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="text-lg font-medium text-gray-800">Interface Cuisine</div>
        <div onClick={handleLogout} className="flex items-center text-[#0EA5E9] cursor-pointer">
          <LogOut className="h-5 w-5 mr-2" />
          Déconnexion
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Commandes en attente</h2>
        <div className="space-y-4">
          {pendingOrders.map((order, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <div className="space-y-4">
                {order.meals.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Repas</h3>
                    <div className="space-y-2">
                      {order.meals.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>{item.name} x{item.quantity}</span>
                          {item.cooking && <span className="text-gray-600">{item.cooking}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleCompleteOrder(index)}
                  className="w-full bg-[#0EA5E9] text-white p-2 rounded-lg mt-4"
                >
                  Marquer comme terminé
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CuisineScreen;
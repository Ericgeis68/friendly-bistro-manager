import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { MenuItem, Order, ScreenType } from '../types';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface RecapOrderProps {
  setCurrentScreen: (screen: ScreenType) => void;
  order: Order;
  tableNumber: string;
  handleLogout: () => void;
  setPendingOrders: (orders: Order[]) => void;
  pendingOrders: Order[];
}

const RecapOrder: React.FC<RecapOrderProps> = ({
  setCurrentScreen,
  order,
  tableNumber,
  handleLogout,
  setPendingOrders,
  pendingOrders,
}) => {
  const { toast } = useToast();

  const calculateTotal = (items: MenuItem[]) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleSubmitOrder = () => {
    if (order.drinks.length > 0 || order.meals.length > 0) {
      const orderWithTable = { ...order, tableNumber };
      setPendingOrders([...pendingOrders, orderWithTable]);
      toast({
        title: "Commande envoyée",
        description: "La commande a été envoyée avec succès",
      });
      setCurrentScreen('waitress');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <ArrowLeft
            className="h-6 w-6 text-[#0EA5E9] cursor-pointer mr-4"
            onClick={() => setCurrentScreen('category')}
          />
          <div className="text-lg font-medium text-gray-800">Table {tableNumber}</div>
        </div>
        <div onClick={handleLogout} className="text-[#0EA5E9] cursor-pointer">
          Déconnexion
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Récapitulatif de la commande</h2>
        
        {order.drinks.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Boissons</h3>
            <div className="bg-white rounded-lg shadow p-4 space-y-2">
              {order.drinks.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
              <div className="border-t pt-2 font-medium">
                <div className="flex justify-between">
                  <span>Total Boissons</span>
                  <span>{calculateTotal(order.drinks).toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {order.meals.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Repas</h3>
            <div className="bg-white rounded-lg shadow p-4 space-y-2">
              {order.meals.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.name} x{item.quantity}
                    {item.cooking && ` (${item.cooking})`}
                  </span>
                  <span>{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
              <div className="border-t pt-2 font-medium">
                <div className="flex justify-between">
                  <span>Total Repas</span>
                  <span>{calculateTotal(order.meals).toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total Commande</span>
            <span>
              {(calculateTotal(order.drinks) + calculateTotal(order.meals)).toFixed(2)} €
            </span>
          </div>
        </div>

        <Button
          onClick={handleSubmitOrder}
          className="w-full bg-[#0EA5E9] text-white"
          disabled={order.drinks.length === 0 && order.meals.length === 0}
        >
          Valider la commande
        </Button>
      </div>
    </div>
  );
};

export default RecapOrder;
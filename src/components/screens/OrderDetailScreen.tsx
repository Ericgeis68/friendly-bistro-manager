
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Order } from '../../types/restaurant';
import { groupMenuItems } from '../../utils/itemGrouping';
import { Badge } from '../ui/badge';

export interface OrderDetailScreenProps {
  order: Order;
  onBack: () => void;
  onOrderComplete: (order: Order, type: 'drinks' | 'meals' | 'both') => void;
  onOrderCancel: (order: Order, type: 'drinks' | 'meals' | 'all') => void;
}

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({
  order,
  onBack,
  onOrderComplete,
  onOrderCancel
}) => {
  const { drinks, meals, table, tableComment, status } = order;
  
  const formatDate = (date: string | number) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupedMeals = groupMenuItems(meals);
  const groupedDrinks = groupMenuItems(drinks, false);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-blue-500 p-4 text-white flex items-center">
        <button onClick={onBack} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Détails de commande</h1>
          <div className="text-sm">Table {table}</div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex justify-between mb-2">
            <div>
              <h2 className="font-bold text-lg">Table {table}</h2>
              {tableComment && <p className="text-gray-600">{tableComment}</p>}
            </div>
            <Badge
              variant={status === 'ready' ? 'secondary' : status === 'pending' ? 'default' : 'outline'}
            >
              {status === 'ready' ? 'Prêt' : status === 'pending' ? 'En attente' : 'Livré'}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            {order.createdAt && `Commande à ${formatDate(String(order.createdAt))}`}
          </div>
        </div>

        {drinks.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <h2 className="font-bold mb-2 text-lg border-b pb-2">Boissons</h2>
            {Object.values(groupedDrinks).map((item, index) => (
              <div key={index} className="flex justify-between mb-2">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 text-sm"> x{item.quantity}</span>
                </div>
                <span>{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
        )}

        {meals.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <h2 className="font-bold mb-2 text-lg border-b pb-2">Repas</h2>
            {Object.values(groupedMeals).map((item, index) => (
              <div key={index} className="flex justify-between mb-2">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 text-sm"> x{item.quantity}</span>
                  {item.cooking && <span className="text-gray-600 text-sm"> ({item.cooking})</span>}
                </div>
                <span>{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        {status === 'pending' && (
          <div className="grid grid-cols-2 gap-2">
            {drinks.length > 0 && (
              <button
                onClick={() => onOrderComplete(order, 'drinks')}
                className="h-12 bg-green-500 text-white rounded-md"
              >
                Boissons servies
              </button>
            )}
            {meals.length > 0 && order.mealsStatus === 'ready' && (
              <button
                onClick={() => onOrderComplete(order, 'meals')}
                className="h-12 bg-green-500 text-white rounded-md"
              >
                Repas servis
              </button>
            )}
            <button
              onClick={() => onOrderCancel(order, order.drinks.length > 0 ? 'drinks' : 'meals')}
              className="h-12 bg-red-500 text-white rounded-md col-span-2 mt-2"
            >
              Annuler la commande
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailScreen;

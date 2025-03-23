
import React from 'react';
import { Bell } from 'lucide-react';
import { Order } from '../../../types/restaurant';
import { Badge } from "../../../components/ui/badge";
import ActionButton from './ActionButton';
import { groupMenuItems } from '../../../utils/itemGrouping';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OrderCardProps {
  order: Order;
  onOrderComplete: (order: Order, type: 'drinks' | 'meals') => void;
  onOrderCancel: (order: Order, type: 'drinks' | 'meals' | 'all') => void;
}

const formatOrderDate = (date: string | number) => {
  try {
    if (typeof date === 'number') {
      return format(new Date(date), 'HH:mm', { locale: fr });
    }
    return format(new Date(date), 'HH:mm', { locale: fr });
  } catch {
    return 'Heure indisponible';
  }
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onOrderComplete, onOrderCancel }) => {
  // Ensure meals and drinks are arrays before accessing them
  const safeMeals = Array.isArray(order.meals) ? order.meals : [];
  const safeDrinks = Array.isArray(order.drinks) ? order.drinks : [];
  
  // Group items only if arrays are not empty
  const groupedMeals = safeMeals.length > 0 ? groupMenuItems(safeMeals) : {};
  const groupedDrinks = safeDrinks.length > 0 ? groupMenuItems(safeDrinks, false) : {};

  // Determine the type of order for cancel action
  const orderType = () => {
    if (safeDrinks.length > 0 && safeMeals.length === 0) return 'drinks';
    if (safeMeals.length > 0 && safeDrinks.length === 0) return 'meals';
    return 'all';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium text-lg dark:text-white">
              Table {order.table}
              {order.tableComment && (
                <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">({order.tableComment})</span>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatOrderDate(order.createdAt)} - {order.waitress}
            </div>
          </div>
          <div className="flex gap-2">
            {safeDrinks.length > 0 && (
              <ActionButton 
                order={order} 
                type="drinks" 
                action="complete" 
                onComplete={onOrderComplete} 
                onCancel={onOrderCancel}
              />
            )}
            {safeMeals.length > 0 && order.mealsStatus === 'ready' && (
              <ActionButton 
                order={order} 
                type="meals" 
                action="complete" 
                onComplete={onOrderComplete} 
                onCancel={onOrderCancel}
              />
            )}
            {/* Unified cancel button that handles the appropriate order type */}
            <ActionButton 
              order={order} 
              type={orderType()} 
              onComplete={onOrderComplete} 
              onCancel={onOrderCancel}
            />
          </div>
        </div>
      </div>

      {safeDrinks.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Boissons</h3>
          </div>
          {Object.values(groupedDrinks).map((drink, index) => (
            <div key={index} className="text-gray-700 dark:text-gray-300 ml-2">
              {drink.name} x{drink.quantity}
            </div>
          ))}
        </div>
      )}

      {safeMeals.length > 0 && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="font-medium text-orange-800 dark:text-orange-300 mb-2">Repas</h3>
              {order.mealsStatus === 'ready' && (
                <Badge variant="secondary" className="ml-2 bg-green-500 text-white">
                  <Bell className="h-3 w-3 mr-1" />
                  Prêt
                </Badge>
              )}
            </div>
          </div>
          {Object.values(groupedMeals).map((meal, index) => (
            <div key={index} className="text-gray-700 dark:text-gray-300 ml-2">
              {meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderCard;

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cooking?: string;
  comment?: string;
  needsCooking: boolean;
}

interface Order {
  id: string;
  table_number: string;
  table_comment: string;
  room_name: string;
  waitress: string;
  status: string;
  drinks: OrderItem[];
  meals: OrderItem[];
  created_at: string;
}

interface TicketGeneratorProps {
  order: Order;
}

export const TicketGenerator: React.FC<TicketGeneratorProps> = ({ order }) => {
  const calculateTotal = () => {
    const drinksTotal = order.drinks.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const mealsTotal = order.meals.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return drinksTotal + mealsTotal;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDateTime(order.created_at);
  const total = calculateTotal();

  let orderTypeHeader = "COMMANDE";
  const hasDrinks = order.drinks.length > 0;
  const hasMeals = order.meals.length > 0;

  if (hasDrinks && !hasMeals) {
    orderTypeHeader = "COMMANDE BOISSONS";
  } else if (!hasDrinks && hasMeals) {
    orderTypeHeader = "COMMANDE REPAS";
  } else if (hasDrinks && hasMeals) {
    orderTypeHeader = "COMMANDE"; // Or "COMMANDE MIXTE" if preferred
  }

  return (
    <ScrollArea className="h-96">
      <div className="font-mono text-sm bg-white p-4 border-2 border-dashed border-muted-foreground/30">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg">HOPLA'GEIS</h2>
          <p>================================</p>
          <p>{orderTypeHeader}</p>
          <p>================================</p>
        </div>

        {/* Order Info */}
        <div className="mb-4">
          <p><strong>TABLE:</strong> {order.table_number}</p>
          <p><strong>SALLE:</strong> {order.room_name}</p>
          <p><strong>SERVEUSE:</strong> {order.waitress}</p>
          <p><strong>DATE:</strong> {date} {time}</p>
          {order.table_comment && (
            <p><strong>NOTE:</strong> {order.table_comment}</p>
          )}
          <p>--------------------------------</p>
        </div>

        {/* Drinks Section */}
        {order.drinks.length > 0 && (
          <div className="mb-4">
            <p className="font-bold">🥤 BOISSONS:</p>
            <p>--------------------------------</p>
            {order.drinks.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
                {item.comment && (
                  <p className="text-xs ml-4">→ {item.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Meals Section */}
        {order.meals.length > 0 && (
          <div className="mb-4">
            <p className="font-bold">🍽️ PLATS:</p>
            <p>--------------------------------</p>
            {order.meals.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
                {item.cooking && (
                  <p className="text-xs ml-4 font-bold">→ CUISSON: {item.cooking}</p>
                )}
                {item.comment && (
                  <p className="text-xs ml-4">→ {item.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="border-t-2 border-black pt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>TOTAL:</span>
            <span>{total.toFixed(2)}€</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p>================================</p>
          <p>Merci de votre visite!</p>
          <p className="text-xs">Imprimé le {new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
    </ScrollArea>
  );
};

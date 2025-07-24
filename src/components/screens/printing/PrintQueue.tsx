import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Eye, CheckCircle, Clock, Users } from 'lucide-react';
import { TicketGenerator } from './TicketGenerator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cooking?: string;
  comment?: string;
  needsCooking: boolean;
}

interface PendingOrder {
  id: string;
  table_number: string;
  table_comment: string;
  room_name: string;
  waitress: string;
  status: string;
  drinks_status: string | null;
  meals_status: string | null;
  drinks: OrderItem[];
  meals: OrderItem[];
  created_at: string;
  updated_at: string;
}

interface PrintQueueProps {
  orders: PendingOrder[];
  onPrint: (orderId: string) => void;
  onMarkPrinted: (orderId: string) => void;
}

export const PrintQueue: React.FC<PrintQueueProps> = ({
  orders,
  onPrint,
  onMarkPrinted
}) => {
  const calculateOrderTotal = (order: PendingOrder) => {
    const drinksTotal = order.drinks.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const mealsTotal = order.meals.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return drinksTotal + mealsTotal;
  };

  const getOrderAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h${diffMinutes % 60}min`;
  };

  const getOrderTypeIcon = (order: PendingOrder) => {
    if (order.drinks.length > 0 && order.meals.length > 0) return "🍽️🥤";
    if (order.meals.length > 0) return "🍽️";
    if (order.drinks.length > 0) return "🥤";
    return "📋";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Queue d'Impression ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => {
            const total = calculateOrderTotal(order);
            const itemsCount = order.drinks.length + order.meals.length;
            
            return (
              <div
                key={order.id}
                className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getOrderTypeIcon(order)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          Table {order.table_number}
                        </Badge>
                        <Badge variant="secondary">
                          {order.room_name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        <Users className="h-3 w-3 inline mr-1" />
                        {order.waitress} • {getOrderAge(order.created_at)}
                      </p>
                      {order.table_comment && (
                        <p className="text-sm text-blue-600 mt-1">
                          💬 {order.table_comment}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg">{total.toFixed(2)}€</p>
                    <p className="text-sm text-muted-foreground">
                      {itemsCount} articles
                    </p>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="mb-4 p-3 bg-muted/30 rounded">
                  {order.drinks.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-blue-600 mb-1">🥤 Boissons:</p>
                      {order.drinks.map((item, index) => (
                        <p key={index} className="text-sm ml-4">
                          {item.quantity}x {item.name}
                          {item.comment && <span className="text-muted-foreground"> ({item.comment})</span>}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {order.meals.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-600 mb-1">🍽️ Plats:</p>
                      {order.meals.map((item, index) => (
                        <p key={index} className="text-sm ml-4">
                          {item.quantity}x {item.name}
                          {item.cooking && <span className="text-orange-600 font-medium"> [{item.cooking}]</span>}
                          {item.comment && <span className="text-muted-foreground"> ({item.comment})</span>}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onPrint(order.id)}
                    className="flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimer
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Aperçu
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Aperçu du Ticket</DialogTitle>
                      </DialogHeader>
                      <TicketGenerator order={order} />
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkPrinted(order.id)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marquer comme imprimé
                  </Button>
                </div>
              </div>
            );
          })}
          
          {orders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucune commande en attente</p>
              <p className="text-sm">Toutes les commandes ont été imprimées</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

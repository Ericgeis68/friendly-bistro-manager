import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface PrintedOrder {
  id: string;
  table_number: string;
  room_name: string;
  waitress: string;
  total: number;
  printed_at: string;
  items_count: number;
}

interface PrintingDashboardProps {
  printedOrders: PrintedOrder[];
  isListening: boolean;
  lastPrintTime: string | null;
}

export const PrintingDashboard: React.FC<PrintingDashboardProps> = ({
  printedOrders,
  isListening,
  lastPrintTime
}) => {
  const todayPrinted = printedOrders.filter(order => {
    const printedDate = new Date(order.printed_at);
    const today = new Date();
    return printedDate.toDateString() === today.toDateString();
  });

  const totalToday = todayPrinted.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards - This section is being removed as per user request */}
      {/*
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aujourd'hui</p>
                <p className="text-2xl font-bold">{todayPrinted.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">CA Imprimé</p>
                <p className="text-2xl font-bold">{totalToday.toFixed(2)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      */}

      {/* Recent Printed Orders - This section is being removed as per user request */}
      {/*
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Commandes Imprimées Récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {printedOrders.slice(0, 10).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Table {order.table_number}</Badge>
                  <div>
                    <p className="font-medium">{order.room_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.waitress} • {order.items_count} articles
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{order.total.toFixed(2)}€</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.printed_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {printedOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune commande imprimée aujourd'hui</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      */}

      {/* Service Status - Simplified */}
      {lastPrintTime && (
        <Card>
          <CardHeader>
            <CardTitle>Dernière Activité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Dernière impression</p>
              <p className="text-lg font-medium">
                {new Date(lastPrintTime).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

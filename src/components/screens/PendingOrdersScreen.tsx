
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, Filter, Trash2, CheckCircle, Bell } from 'lucide-react';
import type { Order } from '../../types/restaurant';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type FilterType = 'all' | 'drinks' | 'meals';

interface PendingOrdersScreenProps {
  orders: Order[];
  onOrderComplete: (order: Order, type: 'drinks' | 'meals') => void;
  onOrderCancel: (order: Order, type: 'drinks' | 'meals' | 'all') => void;
  onBack: () => void;
  setPendingOrders: (orders: Order[]) => void;
}

const PendingOrdersScreen: React.FC<PendingOrdersScreenProps> = ({
  orders,
  onOrderComplete,
  onOrderCancel,
  onBack,
  setPendingOrders
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderToCancel, setOrderToCancel] = useState<{order: Order, type: 'drinks' | 'meals' | 'all'} | null>(null);

  const formatOrderDate = (date: string) => {
    try {
      return format(new Date(date), 'HH:mm', { locale: fr });
    } catch {
      return 'Heure indisponible';
    }
  };

  const handleCancelOrder = (order: Order, type: 'drinks' | 'meals' | 'all') => {
    onOrderCancel(order, type);
  };

  const handleCompleteOrder = (order: Order, type: 'drinks' | 'meals') => {
    onOrderComplete(order, type);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch =
        order.table.toLowerCase().includes(searchTerm) ||
        (order.tableComment && order.tableComment.toLowerCase().includes(searchTerm)) ||
        order.waitress.toLowerCase().includes(searchTerm) ||
        order.meals.some(meal => meal.name.toLowerCase().includes(searchTerm)) ||
        order.drinks.some(drink => drink.name.toLowerCase().includes(searchTerm));

      if (filter === 'drinks') return order.drinks.length > 0 && matchesSearch;
      if (filter === 'meals') return order.meals.length > 0 && matchesSearch;
      return matchesSearch;
    });
  }, [orders, filter, searchQuery]);

  const getActionButtonText = (order: Order, type: 'drinks' | 'meals' | 'all', action: 'cancel' | 'complete') => {
    if (type === 'drinks') {
      return action === 'complete' ? "Terminer boissons" : "Annuler boissons";
    }
    if (type === 'meals') {
      if (order.mealsStatus === 'ready') return "Terminer repas";
      return "Annuler repas";
    }
    return "Annuler commande";
  };

  const getConfirmationText = (order: Order, type: 'drinks' | 'meals' | 'all', action: 'cancel' | 'complete') => {
    if (type === 'drinks') {
      return action === 'complete' 
        ? "Cette action marquera les boissons comme livrées."
        : "Cette action supprimera les boissons de la commande.";
    }
    if (type === 'meals') {
      if (order.mealsStatus === 'ready') return "Cette action marquera les repas comme livrés.";
      return "Cette action supprimera les repas de la commande.";
    }
    return "Cette action supprimera la commande complète définitivement.";
  };

  const handleActionButtonClick = (order: Order, type: 'drinks' | 'meals' | 'all', action: 'cancel' | 'complete') => {
    if (action === 'complete') {
      handleCompleteOrder(order, type as 'drinks' | 'meals');
    } else {
      handleCancelOrder(order, type);
    }
  };

  const ActionButton = ({ 
    order, 
    type, 
    action = 'cancel',
    className = '' 
  }: { 
    order: Order, 
    type: 'drinks' | 'meals' | 'all',
    action?: 'cancel' | 'complete',
    className?: string
  }) => {
    if (type === 'meals' && order.mealsStatus === 'ready' && action === 'cancel') {
      return null;
    }

    const buttonText = getActionButtonText(order, type, action);
    const isCompleteAction = action === 'complete' || (type === 'meals' && order.mealsStatus === 'ready');
    const icon = isCompleteAction ? <CheckCircle className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />;

    return (
      <AlertDialog>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button 
                  variant={isCompleteAction ? "default" : "destructive"} 
                  size="sm"
                  className={className}
                >
                  {icon}
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{buttonText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmationText(order, type, action)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleActionButtonClick(order, type, action)}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-500 p-4 text-white flex items-center">
        <button onClick={onBack} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Commandes en cours</h1>
      </div>

      <div className="p-4">
        <div className="mb-4 grid grid-cols-3 gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            <Filter size={16} className="mr-2" />
            Tout
          </Button>
          <Button
            variant={filter === 'drinks' ? 'default' : 'outline'}
            onClick={() => setFilter('drinks')}
            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            <Filter size={16} className="mr-2" />
            Boissons
          </Button>
          <Button
            variant={filter === 'meals' ? 'default' : 'outline'}
            onClick={() => setFilter('meals')}
            className="bg-orange-100 text-orange-800 hover:bg-orange-200"
          >
            <Filter size={16} className="mr-2" />
            Repas
          </Button>
        </div>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 text-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-lg">
                      Table {order.table}
                      {order.tableComment && (
                        <span className="text-gray-600 text-sm ml-2">({order.tableComment})</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatOrderDate(order.createdAt)} - {order.waitress}
                    </div>
                  </div>
                  {filter === 'drinks' && (
                    <div className="flex gap-2">
                      <ActionButton order={order} type="drinks" action="complete" />
                      <ActionButton order={order} type="drinks" />
                    </div>
                  )}
                  {filter === 'meals' && (
                    <div className="flex gap-2">
                      {order.mealsStatus === 'ready' ? (
                        <ActionButton order={order} type="meals" action="complete" />
                      ) : (
                        <ActionButton order={order} type="meals" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {(filter === 'all' || filter === 'drinks') && order.drinks.length > 0 && (
                <div className="p-4 bg-blue-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-blue-800 mb-2">Boissons</h3>
                    {filter === 'all' && order.drinks.length > 0 && (
                      <div className="flex gap-2">
                        <ActionButton order={order} type="drinks" action="complete" />
                        <ActionButton order={order} type="drinks" />
                      </div>
                    )}
                  </div>
                  {order.drinks.map((drink, index) => (
                    <div key={index} className="text-gray-700 ml-2">
                      {drink.name} x{drink.quantity}
                    </div>
                  ))}
                </div>
              )}

              {(filter === 'all' || filter === 'meals') && order.meals.length > 0 && (
                <div className="p-4 bg-orange-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <h3 className="font-medium text-orange-800 mb-2">Repas</h3>
                      {order.mealsStatus === 'ready' && (
                        <Badge variant="secondary" className="ml-2 bg-green-500 text-white">
                          <Bell className="h-3 w-3 mr-1" />
                          Prêt
                        </Badge>
                      )}
                    </div>
                    {filter === 'all' && order.meals.length > 0 && (
                      <div className="ml-2">
                        {order.mealsStatus === 'ready' ? (
                          <ActionButton order={order} type="meals" action="complete" />
                        ) : (
                          <ActionButton order={order} type="meals" />
                        )}
                      </div>
                    )}
                  </div>
                  {order.meals.map((meal, index) => (
                    <div key={index} className="text-gray-700 ml-2">
                      {meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}
                    </div>
                  ))}
                </div>
              )}

              {filter === 'all' && (
                <div className="px-4 pb-4">
                  <ActionButton order={order} type="all" className="w-full mt-2" />
                </div>
              )}
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {filter === 'drinks' && "Aucune commande de boissons en cours"}
              {filter === 'meals' && "Aucune commande de repas en cours"}
              {filter === 'all' && "Aucune commande en cours"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingOrdersScreen;

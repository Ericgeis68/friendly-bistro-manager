import React, { useState, useEffect } from 'react';
import { RefreshCw, Calendar, Clock } from 'lucide-react';
import { Order } from '../../../types/restaurant';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { toast } from '@/hooks/use-toast';

interface DailySalesScreenProps {
  localOrders: Order[];
  refreshOrders: () => void;
}

const DailySalesScreen: React.FC<DailySalesScreenProps> = ({ localOrders, refreshOrders }) => {
  // État pour la date sélectionnée (par défaut aujourd'hui)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  
  // État pour le service sélectionné
  const [selectedService, setSelectedService] = useState<'midi' | 'soir' | 'personnalisé'>('midi');
  
  // États pour les heures personnalisées
  const [startTime, setStartTime] = useState<string>('11:00');
  const [endTime, setEndTime] = useState<string>('14:00');
  
  const handleRefresh = () => {
    setLoading(true);
    refreshOrders();
    setLoading(false);
    toast({
      title: "Actualisation",
      description: "Les données ont été actualisées.",
    });
  };
  
  // Fonction pour filtrer les commandes selon les critères
  const getFilteredOrders = () => {
    // S'assurer que localOrders est un tableau
    const safeOrders = Array.isArray(localOrders) ? localOrders : [];
    
    // Filtrer pour n'avoir que les commandes livrées
    const deliveredOrders = safeOrders.filter(order => order.status === 'delivered');
    
    // Créer les limites de temps basées sur la date sélectionnée
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Filtrer les commandes par date
    const ordersByDate = deliveredOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfDay && orderDate <= endOfDay;
    });
    
    // Appliquer le filtre par service/heure
    return ordersByDate.filter(order => {
      const orderDate = new Date(order.createdAt);
      const hour = orderDate.getHours();
      const minutes = orderDate.getMinutes();
      const orderTime = hour * 60 + minutes; // Convertir en minutes depuis minuit
      
      if (selectedService === 'midi') {
        // Service de midi: 11h00 - 14h00
        return hour >= 11 && hour < 14;
      } else if (selectedService === 'soir') {
        // Service du soir: 18h00 - 22h00
        return hour >= 18 && hour < 22;
      } else if (selectedService === 'personnalisé') {
        // Heures personnalisées
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;
        
        return orderTime >= startTimeInMinutes && orderTime <= endTimeInMinutes;
      }
      
      return true; // Par défaut, inclure toutes les commandes
    });
  };
  
  const filteredOrders = getFilteredOrders();
  
  // Calcul des statistiques de ventes
  const totalDrinks = filteredOrders.reduce((acc, order) => 
    acc + (order.drinks ? order.drinks.reduce((sum, drink) => sum + (drink.quantity || 1), 0) : 0), 0);
  
  const totalMeals = filteredOrders.reduce((acc, order) => 
    acc + (order.meals ? order.meals.reduce((sum, meal) => sum + (meal.quantity || 1), 0) : 0), 0);

  const totalRevenue = filteredOrders.reduce((acc, order) => {
    const drinksRevenue = order.drinks ? order.drinks.reduce((sum, drink) => 
      sum + (drink.price * (drink.quantity || 1)), 0) : 0;
    
    const mealsRevenue = order.meals ? order.meals.reduce((sum, meal) => 
      sum + (meal.price * (meal.quantity || 1)), 0) : 0;
    
    return acc + drinksRevenue + mealsRevenue;
  }, 0);

  // Liste des articles vendus 
  const soldItems: Record<string, {count: number, price: number, revenue: number}> = {};
  
  // Récupérer tous les éléments vendus
  filteredOrders.forEach(order => {
    // Ajouter les boissons
    if (order.drinks && Array.isArray(order.drinks)) {
      order.drinks.forEach(drink => {
        const quantity = drink.quantity || 1;
        if (!soldItems[drink.name]) {
          soldItems[drink.name] = {
            count: 0,
            price: drink.price,
            revenue: 0
          };
        }
        soldItems[drink.name].count += quantity;
        soldItems[drink.name].revenue += drink.price * quantity;
      });
    }
    
    // Ajouter les repas
    if (order.meals && Array.isArray(order.meals)) {
      order.meals.forEach(meal => {
        const quantity = meal.quantity || 1;
        if (!soldItems[meal.name]) {
          soldItems[meal.name] = {
            count: 0,
            price: meal.price,
            revenue: 0
          };
        }
        soldItems[meal.name].count += quantity;
        soldItems[meal.name].revenue += meal.price * quantity;
      });
    }
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Ventes du Jour</h2>
        <button
          onClick={handleRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-md p-2 flex items-center"
          disabled={loading}
        >
          <RefreshCw size={20} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Chargement...' : 'Actualiser'}</span>
        </button>
      </div>

      {/* Filtres de date et d'heure */}
      <div className="bg-white rounded-xl p-4 shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sélecteur de date */}
          <div>
            <Label htmlFor="date" className="mb-2 block">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Sélecteur de service */}
          <div>
            <Label htmlFor="service" className="mb-2 block">Service</Label>
            <Select 
              value={selectedService} 
              onValueChange={(value: 'midi' | 'soir' | 'personnalisé') => setSelectedService(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="midi">Service de Midi (11h-14h)</SelectItem>
                <SelectItem value="soir">Service du Soir (18h-22h)</SelectItem>
                <SelectItem value="personnalisé">Horaires personnalisés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Heures personnalisées (affichées uniquement si "personnalisé" est sélectionné) */}
          {selectedService === 'personnalisé' && (
            <div className="flex space-x-2 items-end">
              <div>
                <Label htmlFor="startTime" className="mb-2 block">De</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="endTime" className="mb-2 block">À</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Résumé des ventes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-gray-500 mb-2">Boissons vendues</h3>
          <p className="text-3xl font-bold">{totalDrinks}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-gray-500 mb-2">Repas vendus</h3>
          <p className="text-3xl font-bold">{totalMeals}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-gray-500 mb-2">Chiffre d'affaires</h3>
          <p className="text-3xl font-bold">{totalRevenue.toFixed(2)} €</p>
        </div>
      </div>
      
      {/* Tableau détaillé des ventes */}
      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="text-lg font-medium mb-4">Détail des ventes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500">Article</th>
                <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500">Quantité</th>
                <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500">Prix unitaire</th>
                <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(soldItems).length > 0 ? (
                Object.entries(soldItems).map(([name, data]) => (
                  <tr key={name} className="border-b">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{data.count}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{data.price.toFixed(2)} €</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{data.revenue.toFixed(2)} €</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500">Aucune vente pour cette période</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailySalesScreen;

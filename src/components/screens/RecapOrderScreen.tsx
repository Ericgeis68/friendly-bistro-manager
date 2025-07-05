import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { MenuItem } from '../../types/restaurant';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../ui/alert-dialog';

interface RecapOrderScreenProps {
  tableNumber: string;
  order: {
    drinks: MenuItem[];
    meals: MenuItem[];
  };
  handleSubmitOrder: () => void;
  setCurrentScreen: (screen: 'category' | 'splitPayment') => void;
}

const RecapOrderScreen: React.FC<RecapOrderScreenProps> = ({
  tableNumber,
  order,
  handleSubmitOrder,
  setCurrentScreen
}) => {
  const [amountReceived, setAmountReceived] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { drinks = [], meals = [] } = order;
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Grouper les articles manuellement pour préserver les commentaires
  const groupDrinksWithComments = (drinks: MenuItem[]) => {
    const grouped: { [key: string]: MenuItem } = {};
    
    drinks.forEach(drink => {
      // Créer une clé unique basée sur le nom et le commentaire
      const key = drink.comment ? `${drink.name}-${drink.comment}` : drink.name;
      
      if (grouped[key]) {
        grouped[key].quantity = (grouped[key].quantity || 1) + (drink.quantity || 1);
      } else {
        grouped[key] = { ...drink };
      }
    });
    
    return Object.values(grouped);
  };

  const groupMealsWithComments = (meals: MenuItem[]) => {
    const grouped: { [key: string]: MenuItem } = {};
    
    meals.forEach(meal => {
      // Créer une clé unique basée sur le nom, la cuisson et le commentaire
      const cookingPart = meal.cooking ? `-${meal.cooking}` : '';
      const commentPart = meal.comment ? `-${meal.comment}` : '';
      const key = `${meal.name}${cookingPart}${commentPart}`;
      
      if (grouped[key]) {
        grouped[key].quantity = (grouped[key].quantity || 1) + (meal.quantity || 1);
      } else {
        grouped[key] = { ...meal };
      }
    });
    
    return Object.values(grouped);
  };

  const groupedDrinks = groupDrinksWithComments(drinks);
  const groupedMeals = groupMealsWithComments(meals);

  const drinkTotal = drinks.reduce((sum, item) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);
  
  const mealTotal = meals.reduce((sum, item) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);
  
  const totalAmount = drinkTotal + mealTotal;
  const change = amountReceived ? parseFloat(amountReceived) - totalAmount : 0;

  const hasItemsToSubmit = drinks.length > 0 || meals.length > 0;

  const onSubmitOrder = () => {
    console.log("Submit order button clicked");
    console.log("Has items to submit:", hasItemsToSubmit);
    if (hasItemsToSubmit) {
      setConfirmDialogOpen(true);
    }
  };

  const confirmOrder = () => {
    console.log("Calling handleSubmitOrder");
    handleSubmitOrder();
    setConfirmDialogOpen(false);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="bg-blue-500 p-4 text-white flex items-center">
        <button onClick={() => setCurrentScreen('category')} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Addition</h1>
          <div className="text-sm">Table {tableNumber}</div>
        </div>
      </div>

      <div className={`flex-1 overflow-auto`}>
        <ScrollArea className="h-full">
          <div className="p-4">
            {groupedDrinks.length > 0 && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 mb-4`}>
                <h2 className={`font-bold mb-2 text-lg border-b pb-2 ${isDarkMode ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>Boissons</h2>
                {groupedDrinks.map((item, index) => (
                  <div key={index} className={`mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}> x{item.quantity || 1}</span>
                      </div>
                      <span>{((item.price * (item.quantity || 1))).toFixed(2)} €</span>
                    </div>
                    {item.comment && (
                      <div className={`text-sm italic mt-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        "{item.comment}"
                      </div>
                    )}
                  </div>
                ))}
                <div className={`text-right border-t pt-2 mt-2 ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>
                  Sous-total boissons: {drinkTotal.toFixed(2)} €
                </div>
              </div>
            )}
            {groupedMeals.length > 0 && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 mb-4`}>
                <h2 className={`font-bold mb-2 text-lg border-b pb-2 ${isDarkMode ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>Repas</h2>
                {groupedMeals.map((item, index) => (
                  <div key={index} className={`mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}> x{item.quantity || 1}</span>
                        {item.cooking && <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}> ({item.cooking})</span>}
                      </div>
                      <span>{(item.price * (item.quantity || 1)).toFixed(2)} €</span>
                    </div>
                    {item.comment && (
                      <div className={`text-sm italic mt-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        "{item.comment}"
                      </div>
                    )}
                  </div>
                ))}
                <div className={`text-right border-t pt-2 mt-2 ${isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>
                  Sous-total repas: {mealTotal.toFixed(2)} €
                </div>
              </div>
            )}
            
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 mb-4`}>
              <div className={`flex justify-between mb-4 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <span>Total</span>
                <span>{totalAmount.toFixed(2)} €</span>
              </div>
              <div className="mb-4">
                <Input
                  type="number"
                  placeholder="Somme reçue"
                  className={`w-full mb-2 h-12 text-lg px-3 rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`}
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                />
                {amountReceived && <div className={`text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Rendu: {change.toFixed(2)} €
                </div>}
              </div>
              
              <Button
                onClick={() => setCurrentScreen('splitPayment')}
                className={`w-full h-12 text-lg mb-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 hover:bg-gray-500'} text-white rounded-md`}
                variant="default"
              >
                Paiement séparé
              </Button>
              <Button
                onClick={onSubmitOrder}
                disabled={!hasItemsToSubmit}
                className={`w-full h-12 text-lg ${!hasItemsToSubmit ? 'bg-gray-400' : isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md`}
                variant="default"
              >
                Valider la commande
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la commande</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir valider cette commande?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmOrder}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecapOrderScreen;

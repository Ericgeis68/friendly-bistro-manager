import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import type { MenuItem } from '../../types/restaurant';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';

interface DrinkMenuScreenProps {
  tableNumber: string;
  drinksMenu: MenuItem[];
  setCurrentScreen: (screen: 'category') => void;
  setOrder: (order: any) => void;
  order?: { drinks?: MenuItem[]; meals?: MenuItem[] };
}

const DrinkMenuScreen: React.FC<DrinkMenuScreenProps> = ({
  tableNumber,
  drinksMenu,
  setCurrentScreen,
  setOrder,
  order
}) => {
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedDrinkIdForComment, setSelectedDrinkIdForComment] = useState<number | null>(null);
  const [currentComment, setCurrentComment] = useState('');
  
  // Local states to manage selected drinks
  const [normalDrinksQuantities, setNormalDrinksQuantities] = useState<Map<number, number>>(new Map());
  const [commentedDrinks, setCommentedDrinks] = useState<MenuItem[]>([]);
  
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Initialize local states from existing order when component mounts or order changes
  useEffect(() => {
    console.log("DrinkMenuScreen: useEffect - order prop:", order); // ADDED LOG
    const newNormalQuantities = new Map<number, number>();
    const newCommentedDrinks: MenuItem[] = [];

    if (order && order.drinks) {
      order.drinks.forEach(drink => {
        if (drink.comment) {
          newCommentedDrinks.push(drink);
        } else {
          const currentQuantity = newNormalQuantities.get(drink.id) || 0;
          newNormalQuantities.set(drink.id, currentQuantity + (drink.quantity || 1));
        }
      });
    }
    setNormalDrinksQuantities(newNormalQuantities);
    setCommentedDrinks(newCommentedDrinks);
  }, [order]);
  
  const updateQuantity = (id: number, increment: number) => {
    setNormalDrinksQuantities(prev => {
      const newMap = new Map(prev);
      const currentQuantity = newMap.get(id) || 0;
      const updatedQuantity = Math.max(0, currentQuantity + increment);
      if (updatedQuantity > 0) {
        newMap.set(id, updatedQuantity);
      } else {
        newMap.delete(id);
      }
      return newMap;
    });
  };

  const handleCommentClick = (drinkId: number) => {
    setSelectedDrinkIdForComment(drinkId);
    setCurrentComment('');
    setShowCommentDialog(true);
  };

  const saveComment = () => {
    if (selectedDrinkIdForComment && currentComment.trim()) {
      const drink = drinksMenu.find(d => d.id === selectedDrinkIdForComment);
      if (drink) {
        const commentedDrink: MenuItem = {
          ...drink,
          id: Date.now() + Math.random(), // Nouvelle ID unique pour les articles commentés
          quantity: 1,
          comment: currentComment.trim()
        };
        setCommentedDrinks(prev => [...prev, commentedDrink]);
      }
    }
    setShowCommentDialog(false);
    setSelectedDrinkIdForComment(null);
    setCurrentComment('');
  };

  const removeCommentedDrink = (indexToRemove: number) => {
    setCommentedDrinks(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Calculer la quantité totale pour chaque boisson (normale + avec commentaires)
  const getTotalQuantityForDrink = (drinkId: number) => {
    const normalQuantity = normalDrinksQuantities.get(drinkId) || 0;
    const drinkName = drinksMenu.find(d => d.id === drinkId)?.name;
    const commentQuantity = commentedDrinks.filter(d => d.name === drinkName).length;
    return normalQuantity + commentQuantity;
  };

  const handleValidate = () => {
    const allOrderedDrinks: MenuItem[] = [];
    
    // Ajouter les boissons normales (avec quantité > 0)
    normalDrinksQuantities.forEach((quantity, id) => {
      const drink = drinksMenu.find(d => d.id === id);
      if (drink) {
        for (let i = 0; i < quantity; i++) {
          allOrderedDrinks.push({
            ...drink,
            quantity: 1, // Each item is 1 unit
            comment: undefined
          });
        }
      }
    });
    
    // Ajouter les boissons avec commentaires
    commentedDrinks.forEach(drink => {
      allOrderedDrinks.push(drink);
    });
    
    console.log("DrinkMenuScreen: Validating drinks order with all items:", allOrderedDrinks); // ADDED LOG
    
    if (allOrderedDrinks.length === 0) {
      setOrder(prev => ({ ...prev, drinks: [] })); // Clear drinks if none selected
      setCurrentScreen('category');
      return;
    }
    
    setOrder(prev => ({ ...prev, drinks: allOrderedDrinks }));
    setCurrentScreen('category');
  };

  const totalAmount = drinksMenu.reduce((sum, drink) => 
    sum + (drink.price * (normalDrinksQuantities.get(drink.id) || 0)), 0
  ) + commentedDrinks.reduce((sum, drink) => sum + drink.price, 0);

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="bg-blue-500 p-4 text-white flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => setCurrentScreen('category')} className="mr-2">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Boissons</h1>
            <div className="text-sm">Table {tableNumber}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {drinksMenu.map(drink => (
          <div key={drink.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mb-3 shadow`}>
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{drink.name}</div>
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{drink.price.toFixed(2)} €</div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCommentClick(drink.id)}
                  className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'} flex items-center justify-center`}
                >
                  <MessageSquare size={16} />
                </button>
                <button
                  onClick={() => updateQuantity(drink.id, -1)}
                  className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-500'} flex items-center justify-center text-xl font-medium`}
                >
                  -
                </button>
                <span className={`w-6 text-center text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {getTotalQuantityForDrink(drink.id)}
                </span>
                <button
                  onClick={() => updateQuantity(drink.id, 1)}
                  className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-500'} flex items-center justify-center text-xl font-medium`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}

        {commentedDrinks.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mb-3 shadow`}>
            <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Avec commentaires:</h3>
            {commentedDrinks.map((drink, index) => (
              <div key={index} className="flex justify-between items-center mb-2">
                <div className="flex-1">
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{drink.name}</div>
                  <div className={`text-sm italic ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        "{drink.comment}"
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{drink.price.toFixed(2)} €</div>
                </div>
                <button
                  onClick={() => removeCommentedDrink(index)}
                  className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-500'} flex items-center justify-center text-lg font-medium`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un commentaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Ex: sans glace, avec citron, etc."
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
              Annuler
            </Button>
            <Button onClick={saveComment} disabled={!currentComment.trim()}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`flex justify-between mb-4 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          <span>Total</span>
          <span>{totalAmount.toFixed(2)} €</span>
        </div>
        <button
          onClick={handleValidate}
          className={`w-full h-12 text-lg ${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md`}
        >
          Valider la commande
        </button>
      </div>
    </div>
  );
};

export default DrinkMenuScreen;

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import type { MenuItem } from '../../types/restaurant';
import MealItem from '../ui/MealItem';
import CookingDialog from '../ui/CookingDialog';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { DEFAULT_COOKING_OPTIONS } from '../../utils/itemGrouping';

interface MealMenuScreenProps {
  tableNumber: string;
  mealsMenu: MenuItem[];
  setCurrentScreen: (screen: 'category') => void;
  setOrder: (order: any) => void;
  order?: { drinks?: MenuItem[]; meals?: MenuItem[] };
}

const MealMenuScreen: React.FC<MealMenuScreenProps> = ({
  tableNumber,
  mealsMenu,
  setCurrentScreen,
  setOrder,
  order
}) => {
  const [selectedMealIdForCooking, setSelectedMealIdForCooking] = useState<number | null>(null);
  const [showCookingDialog, setShowCookingDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showCookingCommentDialog, setShowCookingCommentDialog] = useState(false);
  const [selectedMealIdForComment, setSelectedMealIdForComment] = useState<number | null>(null);
  const [currentComment, setCurrentComment] = useState('');
  const [pendingCooking, setPendingCooking] = useState<string>('');
  
  // Local states to manage selected meals
  const [normalMealsQuantities, setNormalMealsQuantities] = useState<Map<number, number>>(new Map());
  const [cookedMeals, setCookedMeals] = useState<MenuItem[]>([]); // Meals with cooking option, no comment
  const [commentedMeals, setCommentedMeals] = useState<MenuItem[]>([]); // Meals with comments (can also have cooking)

  const [showRemoveCookingDialog, setShowRemoveCookingDialog] = useState(false);
  const [selectedMealToRemoveId, setSelectedMealToRemoveId] = useState<number | null>(null);
  const [cookingOptions, setCookingOptions] = useState<string[]>(() => {
    const savedOptions = localStorage.getItem('cookingOptions');
    return savedOptions ? JSON.parse(savedOptions) : DEFAULT_COOKING_OPTIONS;
  });
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Initialize local states from existing order when component mounts or order changes
  useEffect(() => {
    console.log("MealMenuScreen: useEffect - order prop:", order); // ADDED LOG
    const newNormalQuantities = new Map<number, number>();
    const newCookedMeals: MenuItem[] = [];
    const newCommentedMeals: MenuItem[] = [];

    if (order && order.meals) {
      order.meals.forEach(meal => {
        if (meal.comment) {
          newCommentedMeals.push(meal);
        } else if (meal.cooking) {
          newCookedMeals.push(meal);
        } else {
          const currentQuantity = newNormalQuantities.get(meal.id) || 0;
          newNormalQuantities.set(meal.id, currentQuantity + (meal.quantity || 1));
        }
      });
    }
    setNormalMealsQuantities(newNormalQuantities);
    setCookedMeals(newCookedMeals);
    setCommentedMeals(newCommentedMeals);
  }, [order]);

  // Calculer la quantité totale pour chaque repas (normale + avec cuisson + avec commentaires)
  const getTotalQuantityForMeal = (mealId: number) => {
    const normalQuantity = normalMealsQuantities.get(mealId) || 0;
    const mealName = mealsMenu.find(m => m.id === mealId)?.name;
    const cookingQuantity = cookedMeals.filter(m => m.name === mealName).length;
    const commentQuantity = commentedMeals.filter(m => m.name === mealName).length;
    return normalQuantity + cookingQuantity + commentQuantity;
  };

  const updateQuantity = (id: number, increment: number) => {
    const mealItem = mealsMenu.find(meal => meal.id === id);
    
    console.log("Updating quantity for meal:", mealItem, "increment:", increment);
    
    if (increment > 0 && mealItem?.needsCooking) {
      console.log("Opening cooking dialog for meal:", mealItem);
      setSelectedMealIdForCooking(id);
      setShowCookingDialog(true);
      return;
    }
    
    if (increment < 0) {
      const mealName = mealItem?.name;
      const hasCookedItems = cookedMeals.some(meal => meal.name === mealName);
      const hasCommentedItems = commentedMeals.some(meal => meal.name === mealName);
      const hasNormalItems = (normalMealsQuantities.get(id) || 0) > 0;

      if (mealItem?.needsCooking && (hasCookedItems || hasCommentedItems)) {
        console.log("Opening remove cooking/comment dialog for meal:", mealItem);
        setSelectedMealToRemoveId(id);
        setShowRemoveCookingDialog(true);
        return;
      } else if (hasNormalItems) {
        setNormalMealsQuantities(prev => {
          const newMap = new Map(prev);
          const currentQuantity = newMap.get(id) || 0;
          const updatedQuantity = Math.max(0, currentQuantity - 1);
          if (updatedQuantity > 0) {
            newMap.set(id, updatedQuantity);
          } else {
            newMap.delete(id);
          }
          return newMap;
        });
      }
    } else if (increment > 0 && !mealItem?.needsCooking) {
      setNormalMealsQuantities(prev => {
        const newMap = new Map(prev);
        const currentQuantity = newMap.get(id) || 0;
        newMap.set(id, currentQuantity + 1);
        return newMap;
      });
    }
  };

  const handleCookingChoice = (cooking: string) => {
    if (!selectedMealIdForCooking) return;

    const mealToUpdate = mealsMenu.find(meal => meal.id === selectedMealIdForCooking);
    if (mealToUpdate) {
      if (!cookingOptions.includes(cooking)) {
        const newOptions = [...cookingOptions, cooking];
        setCookingOptions(newOptions);
        localStorage.setItem('cookingOptions', JSON.stringify(newOptions));
      }

      setCookedMeals(prev => [...prev, {...mealToUpdate, quantity: 1, cooking}]);
    }

    setShowCookingDialog(false);
    setSelectedMealIdForCooking(null);
  };

  const handleRemoveSpecificItem = (itemToRemove: MenuItem) => {
    if (itemToRemove.comment) {
      setCommentedMeals(prev => {
        const index = prev.findIndex(m => m.id === itemToRemove.id);
        if (index > -1) {
          const newMeals = [...prev];
          newMeals.splice(index, 1);
          return newMeals;
        }
        return prev;
      });
    } else if (itemToRemove.cooking) {
      setCookedMeals(prev => {
        const index = prev.findIndex(m => m.id === itemToRemove.id);
        if (index > -1) {
          const newMeals = [...prev];
          newMeals.splice(index, 1);
          return newMeals;
        }
        return prev;
      });
    } else {
      // This case should ideally be handled by normal quantity decrement
      setNormalMealsQuantities(prev => {
        const newMap = new Map(prev);
        const currentQuantity = newMap.get(itemToRemove.id) || 0;
        const updatedQuantity = Math.max(0, currentQuantity - 1);
        if (updatedQuantity > 0) {
          newMap.set(itemToRemove.id, updatedQuantity);
        } else {
          newMap.delete(itemToRemove.id);
        }
        return newMap;
      });
    }
  };

  const handleCommentClick = (mealId: number) => {
    const mealItem = mealsMenu.find(meal => meal.id === mealId);
    
    if (mealItem?.needsCooking) {
      setSelectedMealIdForComment(mealId);
      setCurrentComment('');
      setShowCookingCommentDialog(true);
    } else {
      setSelectedMealIdForComment(mealId);
      setCurrentComment('');
      setShowCommentDialog(true);
    }
  };

  const handleCookingForComment = (cooking: string) => {
    setPendingCooking(cooking);
    setShowCookingCommentDialog(false);
    setShowCommentDialog(true);
  };

  const saveComment = () => {
    if (selectedMealIdForComment && currentComment.trim()) {
      const meal = mealsMenu.find(m => m.id === selectedMealIdForComment);
      if (meal) {
        const commentedMeal: MenuItem = {
          ...meal,
          id: Date.now() + Math.random(), // Unique ID for commented items
          quantity: 1,
          comment: currentComment.trim(),
          cooking: pendingCooking || undefined
        };
        setCommentedMeals(prev => [...prev, commentedMeal]);
        
        if (pendingCooking && !cookingOptions.includes(pendingCooking)) {
          const newOptions = [...cookingOptions, pendingCooking];
          setCookingOptions(newOptions);
          localStorage.setItem('cookingOptions', JSON.stringify(newOptions));
        }
      }
    }
    setShowCommentDialog(false);
    setSelectedMealIdForComment(null);
    setCurrentComment('');
    setPendingCooking('');
  };

  const removeCommentedMeal = (indexToRemove: number) => {
    setCommentedMeals(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleValidate = () => {
    const allOrderedMeals: MenuItem[] = [];
    
    // Add normal meals (without cooking or comments)
    normalMealsQuantities.forEach((quantity, id) => {
      const meal = mealsMenu.find(m => m.id === id);
      if (meal) {
        for (let i = 0; i < quantity; i++) {
          allOrderedMeals.push({
            ...meal,
            quantity: 1,
            comment: undefined,
            cooking: undefined
          });
        }
      }
    });
    
    // Add meals with cooking options
    cookedMeals.forEach(meal => {
      allOrderedMeals.push(meal);
    });
    
    // Add meals with comments
    commentedMeals.forEach(meal => {
      allOrderedMeals.push(meal);
    });
    
    console.log("MealMenuScreen: Validating meals order with all items:", allOrderedMeals); // ADDED LOG
    
    if (allOrderedMeals.length === 0) {
      setOrder(prev => ({ ...prev, meals: [] })); // Clear meals if none selected
      setCurrentScreen('category');
      return;
    }

    setOrder(prev => ({
      ...prev,
      meals: allOrderedMeals
    }));
    setCurrentScreen('category');
  };

  const totalAmount = mealsMenu.reduce((sum, meal) => 
    sum + (meal.price * (normalMealsQuantities.get(meal.id) || 0)), 0
  ) + cookedMeals.reduce((sum, meal) => 
    sum + (meal.price * (meal.quantity || 0)), 0
  ) + commentedMeals.reduce((sum, meal) => sum + meal.price, 0);

  const itemsToRemoveOptions = selectedMealToRemoveId 
    ? [
        ...cookedMeals.filter(meal => meal.id === selectedMealToRemoveId).map(meal => ({
          label: `${meal.name} (${meal.cooking})`,
          item: meal
        })),
        ...commentedMeals.filter(meal => mealsMenu.find(original => original.id === selectedMealToRemoveId && original.name === meal.name)).map(meal => ({
          label: `${meal.name} ${meal.cooking ? `(${meal.cooking})` : ''} ("${meal.comment}")`,
          item: meal
        }))
      ]
    : [];

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="bg-blue-500 p-4 text-white flex items-center">
        <button onClick={() => setCurrentScreen('category')} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Repas</h1>
          <div className="text-sm">Table {tableNumber}</div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {mealsMenu.map(meal => (
          <div key={meal.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mb-3 shadow`}>
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{meal.name}</div>
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{meal.price.toFixed(2)} €</div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCommentClick(meal.id)}
                  className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'} flex items-center justify-center`}
                >
                  <MessageSquare size={16} />
                </button>
                <button
                  onClick={() => updateQuantity(meal.id, -1)}
                  className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-500'} flex items-center justify-center text-xl font-medium`}
                >
                  -
                </button>
                <span className={`w-6 text-center text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {getTotalQuantityForMeal(meal.id)}
                </span>
                <button
                  onClick={() => updateQuantity(meal.id, 1)}
                  className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-500'} flex items-center justify-center text-xl font-medium`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}

        {cookedMeals.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mb-3 shadow`}>
            <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Avec cuisson:</h3>
            {cookedMeals.map((meal, index) => (
              <div key={meal.id} className="flex justify-between items-center mb-2">
                <div className="flex-1">
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {meal.name} ({meal.cooking})
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{meal.price.toFixed(2)} €</div>
                </div>
                <button
                  onClick={() => handleRemoveSpecificItem(meal)}
                  className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-500'} flex items-center justify-center text-lg font-medium`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {commentedMeals.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mb-3 shadow`}>
            <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Avec commentaires:</h3>
            {commentedMeals.map((meal, index) => (
              <div key={meal.id} className="flex justify-between items-center mb-2">
                <div className="flex-1">
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {meal.name} {meal.cooking && `(${meal.cooking})`}
                  </div>
                  <div className={`text-sm italic ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    "{meal.comment}"
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{meal.price.toFixed(2)} €</div>
                </div>
                <button
                  onClick={() => removeCommentedMeal(index)}
                  className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-500'} flex items-center justify-center text-lg font-medium`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCookingDialog && selectedMealIdForCooking && (
        <CookingDialog
          title="Choisir la cuisson"
          options={cookingOptions}
          onSelect={handleCookingChoice}
          allowCustom={true}
        />
      )}

      {showCookingCommentDialog && selectedMealIdForComment && (
        <CookingDialog
          title="Choisir la cuisson pour le commentaire"
          options={cookingOptions}
          onSelect={handleCookingForComment}
          allowCustom={true}
        />
      )}

      {showRemoveCookingDialog && itemsToRemoveOptions.length > 0 && (
        <CookingDialog
          title="Choisir l'élément à retirer"
          options={itemsToRemoveOptions.map(opt => opt.label)}
          onSelect={(label) => {
            const selectedOption = itemsToRemoveOptions.find(opt => opt.label === label);
            if (selectedOption) {
              handleRemoveSpecificItem(selectedOption.item);
            }
            setShowRemoveCookingDialog(false);
            setSelectedMealToRemoveId(null);
          }}
          allowCustom={false}
        />
      )}

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un commentaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {pendingCooking && (
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Cuisson: {pendingCooking}
              </div>
            )}
            <Textarea
              placeholder="Ex: sans oignons, sauce à part, bien cuit, etc."
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCommentDialog(false);
              setPendingCooking('');
            }}>
              Annuler
            </Button>
            <Button onClick={saveComment} disabled={!currentComment.trim()}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-t-gray-200'}`}>
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

export default MealMenuScreen;

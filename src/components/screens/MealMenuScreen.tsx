import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { MenuItem } from '../../types/restaurant';
import MealItem from '../ui/MealItem';
import CookingDialog from '../ui/CookingDialog';
import { DEFAULT_COOKING_OPTIONS } from '../../utils/itemGrouping';

interface MealMenuScreenProps {
  tableNumber: string;
  mealsMenu: MenuItem[];
  setMealsMenu: (meals: MenuItem[]) => void;
  tempMeals: MenuItem[];
  setTempMeals: (meals: MenuItem[]) => void;
  setCurrentScreen: (screen: 'category') => void;
  setOrder: (order: any) => void;
}

const MealMenuScreen: React.FC<MealMenuScreenProps> = ({
  tableNumber,
  mealsMenu,
  setMealsMenu,
  tempMeals,
  setTempMeals,
  setCurrentScreen,
  setOrder
}) => {
  const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
  const [showCookingDialog, setShowCookingDialog] = useState(false);
  const [localMealsMenu, setLocalMealsMenu] = useState(() => 
    mealsMenu.map(meal => ({ ...meal, quantity: meal.quantity || 0 }))
  );
  const [localTempMeals, setLocalTempMeals] = useState<MenuItem[]>(() => 
    tempMeals.map(meal => ({ ...meal, quantity: meal.quantity || 0 }))
  );
  const [showRemoveCookingDialog, setShowRemoveCookingDialog] = useState(false);
  const [selectedMealToRemove, setSelectedMealToRemove] = useState<number | null>(null);
  const [cookingOptions, setCookingOptions] = useState<string[]>(() => {
    const savedOptions = localStorage.getItem('cookingOptions');
    return savedOptions ? JSON.parse(savedOptions) : DEFAULT_COOKING_OPTIONS;
  });
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    setLocalMealsMenu(mealsMenu.map(meal => ({ ...meal, quantity: meal.quantity || 0 })));
    setLocalTempMeals(tempMeals.map(meal => ({ ...meal, quantity: meal.quantity || 0 })));
  }, [mealsMenu, tempMeals]);

  const updateQuantity = (id: number, increment: number) => {
    const mealItem = localMealsMenu.find(meal => meal.id === id);
    
    console.log("Updating quantity for meal:", mealItem, "increment:", increment);
    
    if (increment > 0 && mealItem?.needsCooking) {
      console.log("Opening cooking dialog for meal:", mealItem);
      setSelectedMeal(id);
      setShowCookingDialog(true);
      return;
    }
    
    if (increment < 0 && mealItem?.needsCooking) {
      const hasCookingOptions = localTempMeals.some(meal => 
        meal.id === id && meal.cooking
      );
      
      if (hasCookingOptions) {
        console.log("Opening remove cooking dialog for meal:", mealItem);
        setSelectedMealToRemove(id);
        setShowRemoveCookingDialog(true);
        return;
      }
    }

    const updatedMeals = localMealsMenu.map(meal => {
      if (meal.id === id) {
        return { ...meal, quantity: Math.max(0, (meal.quantity || 0) + increment) };
      }
      return meal;
    });
    setLocalMealsMenu(updatedMeals);
  };

  const handleCookingChoice = (cooking: string) => {
    if (!selectedMeal) return;

    const mealToUpdate = localMealsMenu.find(meal => meal.id === selectedMeal);
    if (mealToUpdate) {
      if (!cookingOptions.includes(cooking)) {
        const newOptions = [...cookingOptions, cooking];
        setCookingOptions(newOptions);
        localStorage.setItem('cookingOptions', JSON.stringify(newOptions));
      }

      setLocalTempMeals([...localTempMeals, {...mealToUpdate, quantity: 1, cooking}]);
      
      setLocalMealsMenu(localMealsMenu.map(meal => {
        if (meal.id === selectedMeal) {
          return {...meal, quantity: (meal.quantity || 0) + 1};
        }
        return meal;
      }));
    }

    setShowCookingDialog(false);
    setSelectedMeal(null);
  };

  const handleRemoveCookingChoice = (cooking: string) => {
    if (!selectedMealToRemove) return;
    
    const mealToRemove = localMealsMenu.find(meal => meal.id === selectedMealToRemove);
    if (mealToRemove) {
      const tempMealsIndex = localTempMeals.findIndex(meal => 
        meal.id === selectedMealToRemove && meal.cooking === cooking
      );
      
      if(tempMealsIndex !== -1) {
        const newTempMeals = [...localTempMeals];
        newTempMeals.splice(tempMealsIndex, 1);
        setLocalTempMeals(newTempMeals);
        
        setLocalMealsMenu(localMealsMenu.map(meal => {
          if (meal.id === selectedMealToRemove) {
            return { ...meal, quantity: Math.max(0, (meal.quantity || 0) - 1) };
          }
          return meal;
        }));
      }
    }

    setShowRemoveCookingDialog(false);
    setSelectedMealToRemove(null);
  };

  const handleValidate = () => {
    const orderedMeals = localMealsMenu.filter(m => 
      (m.quantity || 0) > 0 && !m.needsCooking
    );
    
    setOrder(prev => ({
      ...prev,
      meals: [...orderedMeals, ...localTempMeals]
    }));
    setMealsMenu(localMealsMenu);
    setTempMeals(localTempMeals);
    setCurrentScreen('category');
  };

  const totalAmount = localMealsMenu.reduce((sum, meal) => {
    if (meal.needsCooking) {
      return sum;
    }
    return sum + (meal.price * (meal.quantity || 0));
  }, 0) + localTempMeals.reduce((sum, meal) => 
    sum + (meal.price * (meal.quantity || 0)), 0
  );

  const allCookingOptions = selectedMealToRemove 
    ? localTempMeals
        .filter(meal => meal.id === selectedMealToRemove)
        .map(meal => meal.cooking || '')
        .filter(Boolean)
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
        {localMealsMenu.map(meal => (
          <MealItem
            key={meal.id}
            meal={{...meal, quantity: meal.quantity || 0}}
            onQuantityChange={updateQuantity}
          />
        ))}
      </div>

      {showCookingDialog && selectedMeal && (
        <CookingDialog
          title="Choisir la cuisson"
          options={cookingOptions}
          onSelect={handleCookingChoice}
          allowCustom={true}
        />
      )}

      {showRemoveCookingDialog && allCookingOptions.length > 0 && (
        <CookingDialog
          title="Choisir la cuisson à retirer"
          options={allCookingOptions}
          onSelect={handleRemoveCookingChoice}
          allowCustom={false}
        />
      )}

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


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
    // Load cooking options from localStorage or use defaults
    const savedOptions = localStorage.getItem('cookingOptions');
    return savedOptions ? JSON.parse(savedOptions) : DEFAULT_COOKING_OPTIONS;
  });

  useEffect(() => {
    // Initialize with proper quantities to avoid NaN issues
    setLocalMealsMenu(mealsMenu.map(meal => ({ ...meal, quantity: meal.quantity || 0 })));
    setLocalTempMeals(tempMeals.map(meal => ({ ...meal, quantity: meal.quantity || 0 })));
  }, [mealsMenu, tempMeals]);

  const updateQuantity = (id: number, increment: number) => {
    if (increment > 0 && (id === 1 || id === 2)) {
      setSelectedMeal(id);
      setShowCookingDialog(true);
      return;
    }
    
    if (increment < 0 && (id === 1 || id === 2)) {
      setSelectedMealToRemove(id);
      setShowRemoveCookingDialog(true);
      return;
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
      // Save custom cooking option if it's not in the default list
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
        meal.name === mealToRemove.name && meal.cooking === cooking
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
    // Filtrer les plats avec une quantité positive mais exclure les entrecôtes de la liste principale
    // (car elles sont déjà dans tempMeals avec leurs cuissons)
    const orderedMeals = localMealsMenu.filter(m => 
      (m.quantity || 0) > 0 && (m.id !== 1 && m.id !== 2)
    );
    
    setOrder(prev => ({
      ...prev,
      meals: [...orderedMeals, ...localTempMeals]
    }));
    setMealsMenu(localMealsMenu);
    setTempMeals(localTempMeals);
    setCurrentScreen('category');
  };

  // Calculer correctement le total
  const totalAmount = localMealsMenu.reduce((sum, meal) => {
    // Ne pas compter les entrecôtes dans localMealsMenu pour éviter le double comptage
    if (meal.id === 1 || meal.id === 2) {
      return sum;
    }
    return sum + (meal.price * (meal.quantity || 0));
  }, 0) + localTempMeals.reduce((sum, meal) => 
    sum + (meal.price * (meal.quantity || 0)), 0
  );

  const allCookingOptions = [...new Set(localTempMeals
    .filter(meal => (selectedMealToRemove === 1 || selectedMealToRemove === 2) && 
      meal.name === (selectedMealToRemove === 1 ? 'Entrecôte' : 'Entrecôte spécial'))
    .map(meal => meal.cooking))];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
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

      {showCookingDialog && (
        <CookingDialog
          title="Choisir la cuisson"
          options={cookingOptions}
          onSelect={handleCookingChoice}
          allowCustom={true}
        />
      )}

      {showRemoveCookingDialog && (
        <CookingDialog
          title="Choisir la cuisson à retirer"
          options={allCookingOptions}
          onSelect={handleRemoveCookingChoice}
          allowCustom={false}
        />
      )}

      <div className="p-4 bg-white border-t">
        <div className="flex justify-between mb-4 text-lg font-medium text-gray-800">
          <span>Total</span>
          <span>{totalAmount.toFixed(2)} €</span>
        </div>
        <button
          onClick={handleValidate}
          className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          Valider la commande
        </button>
      </div>
    </div>
  );
};

export default MealMenuScreen;

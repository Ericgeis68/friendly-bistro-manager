import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { MenuItem } from '../../types/restaurant';

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
  const [localMealsMenu, setLocalMealsMenu] = useState([...mealsMenu]);
  const [localTempMeals, setLocalTempMeals] = useState<MenuItem[]>([...tempMeals]);
  const cookingOptions = ['BLEU', 'SAIGNANT', 'A POINT', 'CUIT', 'BIEN CUIT'];
  const [showRemoveCookingDialog, setShowRemoveCookingDialog] = useState(false);
  const [selectedMealToRemove, setSelectedMealToRemove] = useState<number | null>(null);

  const updateQuantity = (id: number, increment: number) => {
    if (increment > 0 && (id === 1 || id === 2)) {
      setSelectedMeal(id);
      setShowCookingDialog(true);
      return;
    }
    if(increment < 0 && (id === 1 || id === 2)) {
      setSelectedMealToRemove(id);
      setShowRemoveCookingDialog(true);
      return;
    }

    const updatedMeals = localMealsMenu.map(meal => {
      if (meal.id === id) {
        return { ...meal, quantity: Math.max(0, meal.quantity + increment) };
      }
      return meal;
    });
    setLocalMealsMenu(updatedMeals);
  };

  const handleCookingChoice = (cooking: string) => {
    if (!selectedMeal) return;

    const mealToUpdate = localMealsMenu.find(meal => meal.id === selectedMeal);
    if(mealToUpdate) {
      const newTempMeals = [...localTempMeals, {...mealToUpdate, quantity: 1, cooking}]
      setLocalTempMeals(newTempMeals)
      const updatedMeals = localMealsMenu.map(meal => {
        if (meal.id === selectedMeal) {
          return {...meal, quantity: meal.quantity + 1};
        }
        return meal;
      });

      setLocalMealsMenu(updatedMeals)
    }

    setShowCookingDialog(false);
    setSelectedMeal(null);
  };

  const handleRemoveCookingChoice = (cooking: string) => {
    if (!selectedMealToRemove) return;
    const mealToRemove = localMealsMenu.find(meal => meal.id === selectedMealToRemove);
    if (mealToRemove) {
      const tempMealsIndex = localTempMeals.findIndex(meal => meal.name === mealToRemove.name && meal.cooking === cooking)
      if(tempMealsIndex !== -1) {
        const newTempMeals = [...localTempMeals];
        newTempMeals.splice(tempMealsIndex, 1);
        setLocalTempMeals(newTempMeals);
        const updatedMeals = localMealsMenu.map(meal => {
          if (meal.id === selectedMealToRemove) {
            return { ...meal, quantity: Math.max(0, meal.quantity - 1) };
          }
          return meal;
        });

        setLocalMealsMenu(updatedMeals);
      }
    }

    setShowRemoveCookingDialog(false);
    setSelectedMealToRemove(null);
  };

  const handleValidate = () => {
    const orderedMeals = localMealsMenu.filter(m => m.quantity > 0 && (m.id !== 1 && m.id !==2));
    setOrder(prev => ({
      ...prev,
      meals: [...orderedMeals, ...localTempMeals]
    }));
    setMealsMenu(localMealsMenu);
    setTempMeals(localTempMeals);
    setCurrentScreen('category');
  };

  const allCookingOptions = [...new Set(localTempMeals
    .filter(meal => (selectedMealToRemove === 1 || selectedMealToRemove === 2) && 
      meal.name === (selectedMealToRemove === 1 ? 'Entrecôte' : 'Entrecôte spécial'))
    .map(meal => meal.cooking))];

  const totalAmount = localMealsMenu.reduce((sum, meal) => sum + (meal.price * meal.quantity), 0) +
                      localTempMeals.reduce((sum, meal) => sum + (meal.price * meal.quantity), 0);

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
          <div key={meal.id} className="bg-white rounded-xl p-4 mb-3 shadow">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-lg text-gray-800">{meal.name}</div>
                <div className="text-gray-600">{meal.price.toFixed(2)} €</div>
                {meal.cooking && (
                  <div className="text-blue-500 text-sm mt-1">({meal.cooking})</div>
                )}
              </div>
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => updateQuantity(meal.id, -1)}
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-medium"
                >
                  -
                </button>
                <span className="w-6 text-center text-lg text-gray-800">{meal.quantity}</span>
                <button
                  onClick={() => updateQuantity(meal.id, 1)}
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-medium"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCookingDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Choisir la cuisson</h2>
            <div className="space-y-2">
              {cookingOptions.map((option) => (
                <button
                  key={option}
                  className="w-full p-2 text-left hover:bg-gray-100 rounded"
                  onClick={() => handleCookingChoice(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showRemoveCookingDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Choisir la cuisson à retirer</h2>
            <div className="space-y-2">
              {allCookingOptions.map((option) => (
                <button
                  key={option}
                  className="w-full p-2 text-left hover:bg-gray-100 rounded"
                  onClick={() => handleRemoveCookingChoice(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
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

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import type { MenuItem } from '../../types/restaurant';
import { Button } from "../ui/button";

interface SplitPaymentScreenProps {
  tableNumber: string;
  order: {
    drinks: MenuItem[];
    meals: MenuItem[];
  };
  setCurrentScreen: (screen: 'recap') => void;
}

const SplitPaymentScreen: React.FC<SplitPaymentScreenProps> = ({
  tableNumber,
  order,
  setCurrentScreen
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'equal' | 'items'>('equal');
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [personPayments, setPersonPayments] = useState<{ [key: string]: { meals: MenuItem[]; drinks: MenuItem[]; amount: number; change: number } }>({});
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [isValidPayment, setIsValidPayment] = useState(false);
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [amountReceived, setAmountReceived] = useState('');
  const [availableMeals, setAvailableMeals] = useState<MenuItem[]>([]);
  const [availableDrinks, setAvailableDrinks] = useState<MenuItem[]>([]);
  const [personQuantities, setPersonQuantities] = useState<{ [personId: string]: { [itemId: number]: number } }>({});
  const [equalPaymentAmountReceived, setEqualPaymentAmountReceived] = useState('');

  // Group similar items together
  const groupSimilarItems = (items: MenuItem[]): MenuItem[] => {
    const groupedMap = new Map<string, MenuItem>();
    
    items.forEach(item => {
      const key = `${item.name}-${item.price}`;
      if (groupedMap.has(key)) {
        const existingItem = groupedMap.get(key)!;
        existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
      } else {
        groupedMap.set(key, { ...item });
      }
    });
    
    return Array.from(groupedMap.values());
  };

  const { 
    drinks: initialDrinks = [], 
    meals: initialMeals = [] 
  } = order;

  const drinkTotal = initialDrinks.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const mealTotal = initialMeals.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalAmount = drinkTotal + mealTotal;

  const amountPerPerson = paymentMethod === 'equal' && numberOfPeople > 0 ? totalAmount / numberOfPeople : 0;
  const equalPaymentChange = parseFloat(equalPaymentAmountReceived) - amountPerPerson;

  useEffect(() => {
    setRemainingBalance(totalAmount);
    // Group similar items when initializing
    setAvailableMeals(groupSimilarItems([...initialMeals]));
    setAvailableDrinks(groupSimilarItems([...initialDrinks]));
  }, [totalAmount, initialMeals, initialDrinks]);

  useEffect(() => {
    if (paymentMethod === 'equal') {
      setIsValidPayment(amountPerPerson * numberOfPeople === totalAmount);
      setRemainingBalance(totalAmount - (amountPerPerson * numberOfPeople));
    } else {
      let totalPaid = 0;
      Object.entries(personPayments).forEach(([personId]) => {
        totalPaid += calculatePersonTotal(personId);
      });
      setIsValidPayment(remainingBalance === 0);
      setRemainingBalance(totalAmount - totalPaid);
    }
  }, [paymentMethod, numberOfPeople, personPayments, totalAmount, amountPerPerson]);

  const calculatePersonTotal = (personId: string) => {
    let personTotal = 0;
    const personQuantitiesMap = personQuantities[personId] || {};
    
    availableDrinks.forEach(drink => {
      const quantity = personQuantitiesMap[drink.id] || 0;
      personTotal += drink.price * quantity;
    });
    
    availableMeals.forEach(meal => {
      const quantity = personQuantitiesMap[meal.id] || 0;
      personTotal += meal.price * quantity;
    });
    
    return personTotal;
  };

  const generatePersonIds = (count: number) => {
    const ids = [];
    for (let i = 1; i <= count; i++) {
      ids.push(i.toString());
    }
    return ids;
  };

  const personIds = generatePersonIds(numberOfPeople);

  const addPerson = () => {
    setNumberOfPeople(prev => prev + 1);
  };

  const removePerson = () => {
    if (numberOfPeople > 1) {
      setNumberOfPeople(prev => prev - 1);
    }
  };

  const handleAmountChange = (personId: string, amount: string) => {
    const numericAmount = parseFloat(amount) || 0;
    const personTotal = calculatePersonTotal(personId);
    setAmountReceived(amount);
    
    setPersonPayments(prev => {
      const person = prev[personId] || { meals: [], drinks: [], amount: 0, change: 0 };
      return { 
        ...prev, 
        [personId]: { 
          ...person, 
          amount: numericAmount,
          change: numericAmount - personTotal
        } 
      };
    });
  };

  const currentPersonId = personIds[currentPersonIndex];
  
  // Determine if the current person has selected any items
  const hasSelectedItems = () => {
    const personQuantitiesMap = personQuantities[currentPersonId] || {};
    return Object.values(personQuantitiesMap).some(quantity => quantity > 0);
  };
  
  const currentPersonTotal = calculatePersonTotal(currentPersonId);
  const currentChange = (parseFloat(amountReceived) || 0) - currentPersonTotal;

  const handleNextPerson = () => {
    // First update the person's payments
    const updatedDrinks: MenuItem[] = [];
    const updatedMeals: MenuItem[] = [];
    
    const personQuantitiesMap = personQuantities[currentPersonId] || {};
    
    availableDrinks.forEach(drink => {
      const quantity = personQuantitiesMap[drink.id] || 0;
      if (quantity > 0) {
        updatedDrinks.push({...drink, quantity});
      }
    });
    
    availableMeals.forEach(meal => {
      const quantity = personQuantitiesMap[meal.id] || 0;
      if (quantity > 0) {
        updatedMeals.push({...meal, quantity});
      }
    });
    
    // Update this person's payments
    setPersonPayments(prev => {
      const amount = parseFloat(amountReceived) || 0;
      return {
        ...prev,
        [currentPersonId]: {
          drinks: updatedDrinks,
          meals: updatedMeals,
          amount: amount,
          change: amount - currentPersonTotal
        }
      };
    });
    
    // Update remaining quantities
    setAvailableDrinks(prevDrinks => {
      return prevDrinks.map(drink => {
        const personQuantity = personQuantitiesMap[drink.id] || 0;
        return { 
          ...drink, 
          quantity: Math.max(0, (drink.quantity || 0) - personQuantity) 
        };
      }).filter(drink => (drink.quantity || 0) > 0);
    });

    setAvailableMeals(prevMeals => {
      return prevMeals.map(meal => {
        const personQuantity = personQuantitiesMap[meal.id] || 0;
        return { 
          ...meal, 
          quantity: Math.max(0, (meal.quantity || 0) - personQuantity) 
        };
      }).filter(meal => (meal.quantity || 0) > 0);
    });
    
    // Update remaining balance
    setRemainingBalance(prevBalance => {
      let newPersonTotal = 0;
      updatedDrinks.forEach(drink => {
        newPersonTotal += drink.price * (drink.quantity || 0);
      });
      updatedMeals.forEach(meal => {
        newPersonTotal += meal.price * (meal.quantity || 0);
      });
      return prevBalance - newPersonTotal;
    });

    // Reset amount received for next person
    setAmountReceived('');

    // Move to the next person if available
    if (currentPersonIndex < numberOfPeople - 1) {
      setCurrentPersonIndex(prev => prev + 1);
    }
  };

  const getRemainingQuantity = (item: MenuItem): number => {
    return item.quantity || 0;
  };

  const updateItemQuantityForPerson = (personId: string, item: MenuItem, type: 'meal' | 'drink', quantityChange: number) => {
    const personQuantitiesMap = personQuantities[personId] || {};
    const currentQuantity = personQuantitiesMap[item.id] || 0;
    const remainingQuantity = getRemainingQuantity(item);
    
    // Validate the new quantity
    const newQuantity = Math.max(0, currentQuantity + quantityChange);
    if (newQuantity > remainingQuantity && quantityChange > 0) {
      return; // Don't allow increasing beyond the remaining quantity
    }

    // Update the quantity for this person
    setPersonQuantities(prev => {
      const personData = {...(prev[personId] || {})};
      personData[item.id] = newQuantity;
      return { ...prev, [personId]: personData };
    });
    
    // Update the person's payment info
    setPersonPayments(prev => {
      const person = prev[personId] || { meals: [], drinks: [], amount: 0, change: 0 };
      
      return { ...prev, [personId]: person };
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-500 p-4 text-white flex items-center shadow-md">
        <button onClick={() => setCurrentScreen('recap')} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Paiement Séparé</h1>
        <div className="ml-auto text-sm">Table {tableNumber}</div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <h2 className="font-bold mb-4 text-lg text-gray-800">Méthode de Paiement</h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center bg-blue-50 p-3 rounded-lg cursor-pointer transition-colors hover:bg-blue-100 flex-1">
              <input
                type="radio"
                value="equal"
                checked={paymentMethod === 'equal'}
                onChange={() => setPaymentMethod('equal')}
                className="mr-2 accent-blue-500"
              />
              <span className="text-gray-700">Part égale par personne</span>
            </label>
            <label className="flex items-center bg-blue-50 p-3 rounded-lg cursor-pointer transition-colors hover:bg-blue-100 flex-1">
              <input
                type="radio"
                value="items"
                checked={paymentMethod === 'items'}
                onChange={() => setPaymentMethod('items')}
                className="mr-2 accent-blue-500"
              />
              <span className="text-gray-700">Sélection par personne</span>
            </label>
          </div>
        </div>

        {paymentMethod === 'equal' && (
          <div className="bg-white rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
            <h2 className="font-bold mb-4 text-lg text-gray-800">Partage équitable</h2>
            <div className="mb-4 flex items-center">
              <label className="block text-gray-700 text-sm font-medium mr-2">Nombre de personnes</label>
              <button 
                onClick={removePerson} 
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-l-md p-2 h-12 w-12 flex items-center justify-center transition-colors"
              >
                -
              </button>
              <input
                type="number"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
                className="w-20 h-12 text-lg px-3 text-center border-y border-gray-300 text-gray-800"
              />
              <button 
                onClick={addPerson} 
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-r-md p-2 h-12 w-12 flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
            <div className="text-lg font-medium text-gray-800 bg-blue-50 p-4 rounded-lg mb-4">
              Montant par personne: <span className="text-blue-600">{amountPerPerson.toFixed(2)} €</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Montant reçu</label>
                <input
                  type="number"
                  value={equalPaymentAmountReceived}
                  onChange={(e) => setEqualPaymentAmountReceived(e.target.value)}
                  className="w-full h-12 text-lg px-3 rounded-md border border-gray-300 text-gray-800"
                  placeholder="0.00"
                />
              </div>
              {equalPaymentAmountReceived && (
                <div className="text-lg font-medium text-gray-800 bg-green-50 p-4 rounded-lg">
                  Monnaie à rendre: <span className="text-green-600">{equalPaymentChange > 0 ? equalPaymentChange.toFixed(2) : '0.00'} €</span>
                </div>
              )}
            </div>
          </div>
        )}

        {paymentMethod === 'items' && (
          <div className="bg-white rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
            <h2 className="font-bold mb-4 text-lg text-gray-800">Paiement par article</h2>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <h3 className="text-xl font-medium mb-2 text-blue-800">Personne {currentPersonIndex + 1}</h3>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-medium mb-2 text-gray-700 border-b pb-1">Boissons</h4>
              {availableDrinks.map(drink => {
                const remaining = getRemainingQuantity(drink);
                const personQuantitiesMap = personQuantities[currentPersonId] || {};
                const personQuantity = personQuantitiesMap[drink.id] || 0;
                
                return (
                  <div key={`drink-${drink.id}`} className="flex items-center justify-between mb-2 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{drink.name}</span>
                      <span className="text-gray-500 text-sm ml-2">({drink.price.toFixed(2)} €)</span>
                    </div>
                    <div className="flex items-center">
                      <button 
                        onClick={() => updateItemQuantityForPerson(currentPersonId, drink, 'drink', -1)}
                        disabled={personQuantity === 0}
                        className={`rounded-l-md px-4 py-2 ${
                          personQuantity === 0 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                        } text-xl transition-colors`}
                      >
                        -
                      </button>
                      <span className="mx-2 min-w-[30px] text-center text-blue-600 font-bold">{personQuantity}</span>
                      <button 
                        onClick={() => updateItemQuantityForPerson(currentPersonId, drink, 'drink', 1)}
                        disabled={personQuantity >= remaining}
                        className={`rounded-r-md px-4 py-2 ${
                          personQuantity >= remaining 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                        } text-xl transition-colors`}
                      >
                        +
                      </button>
                      <span className={`ml-3 text-sm ${remaining === 0 ? 'text-green-500' : 'text-gray-500'}`}>
                        ({remaining} restant)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-medium mb-2 text-gray-700 border-b pb-1">Repas</h4>
              {availableMeals.map(meal => {
                const remaining = getRemainingQuantity(meal);
                const personQuantitiesMap = personQuantities[currentPersonId] || {};
                const personQuantity = personQuantitiesMap[meal.id] || 0;
                
                return (
                  <div key={`meal-${meal.id}`} className="flex items-center justify-between mb-2 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{meal.name}</span>
                      <span className="text-gray-500 text-sm ml-2">({meal.price.toFixed(2)} €)</span>
                      {meal.cooking && <span className="text-gray-500 text-sm ml-1">({meal.cooking})</span>}
                    </div>
                    <div className="flex items-center">
                      <button 
                        onClick={() => updateItemQuantityForPerson(currentPersonId, meal, 'meal', -1)}
                        disabled={personQuantity === 0}
                        className={`rounded-l-md px-4 py-2 ${
                          personQuantity === 0 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                        } text-xl transition-colors`}
                      >
                        -
                      </button>
                      <span className="mx-2 min-w-[30px] text-center text-blue-600 font-bold">{personQuantity}</span>
                      <button 
                        onClick={() => updateItemQuantityForPerson(currentPersonId, meal, 'meal', 1)}
                        disabled={personQuantity >= remaining}
                        className={`rounded-r-md px-4 py-2 ${
                          personQuantity >= remaining 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                        } text-xl transition-colors`}
                      >
                        +
                      </button>
                      <span className={`ml-3 text-sm ${remaining === 0 ? 'text-green-500' : 'text-gray-500'}`}>
                        ({remaining} restant)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow-inner">
              <div className="font-bold text-lg mb-4 text-gray-800">
                Total pour cette personne: <span className="text-blue-600">{currentPersonTotal.toFixed(2)} €</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Montant versé</label>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => handleAmountChange(currentPersonId, e.target.value)}
                    className="w-full h-12 text-lg px-3 rounded-md border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Monnaie à rendre</label>
                  <div className="w-full h-12 text-lg px-3 py-2 rounded-md bg-gray-100 text-blue-700 border border-gray-200 font-bold flex items-center">
                    {currentChange > 0 ? currentChange.toFixed(2) : '0.00'} €
                  </div>
                </div>
              </div>
            </div>
            
            <button
              disabled={!hasSelectedItems()}
              onClick={handleNextPerson}
              className={`w-full h-12 text-lg text-white rounded-md mt-4 flex items-center justify-center gap-2 ${
                hasSelectedItems() 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              <span>Suivant</span>
              <ArrowLeft className="transform rotate-180" size={18} />
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
          <div className="flex justify-between mb-4 text-xl font-bold text-gray-800">
            <span>Total</span>
            <span className="text-blue-600">{totalAmount.toFixed(2)} €</span>
          </div>
          <div className="text-lg font-medium text-gray-700 mb-4 p-3 bg-blue-50 rounded-lg">
            Montant restant à payer: <span className={remainingBalance === 0 ? "text-green-500" : "text-red-500"}>
              {remainingBalance.toFixed(2)} €
            </span>
          </div>
          <button
            disabled={remainingBalance !== 0}
            onClick={() => setCurrentScreen('recap')}
            className={`w-full h-12 text-lg text-white rounded-md flex items-center justify-center gap-2 ${
              remainingBalance === 0 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-gray-400 cursor-not-allowed'
            } transition-colors`}
          >
            <Check size={18} />
            <span>Valider le paiement</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitPaymentScreen;

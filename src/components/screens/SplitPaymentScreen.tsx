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
  const [paymentMethod, setPaymentMethod] = useState<'equal' | 'items'>('items');
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [personPayments, setPersonPayments] = useState<{ [key: string]: { meals: MenuItem[]; drinks: MenuItem[]; amount: number; change: number } }>({});
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [isValidPayment, setIsValidPayment] = useState(false);
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [amountReceived, setAmountReceived] = useState('');
  const [availableMeals, setAvailableMeals] = useState<MenuItem[]>([]);
  const [availableDrinks, setAvailableDrinks] = useState<MenuItem[]>([]);
  const [personDrinkQuantities, setPersonDrinkQuantities] = useState<{ [personId: string]: { [itemId: number]: number } }>({});
  const [personMealQuantities, setPersonMealQuantities] = useState<{ [personId: string]: { [itemId: number]: number } }>({});
  const [equalPaymentAmountReceived, setEqualPaymentAmountReceived] = useState('');
  const [equalPaymentsByPerson, setEqualPaymentsByPerson] = useState<{ [personId: string]: { paid: boolean; amount: number; amountReceived: string; change: number } }>({});

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

  const drinkTotal = initialDrinks.reduce((sum, item) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);

  const mealTotal = initialMeals.reduce((sum, item) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);

  const totalAmount = drinkTotal + mealTotal;

  const amountPerPerson = paymentMethod === 'equal' && numberOfPeople > 0 ? totalAmount / numberOfPeople : 0;

  useEffect(() => {
    if (paymentMethod === 'equal') {
      const initialPayments: { [personId: string]: { paid: boolean; amount: number; amountReceived: string; change: number } } = {};

      for (let i = 1; i <= numberOfPeople; i++) {
        initialPayments[i.toString()] = {
          paid: false,
          amount: amountPerPerson,
          amountReceived: '',
          change: 0
        };
      }

      setEqualPaymentsByPerson(initialPayments);
    }
  }, [paymentMethod, numberOfPeople, amountPerPerson]);

  useEffect(() => {
    setRemainingBalance(totalAmount);
    setAvailableMeals(groupSimilarItems([...initialMeals]));
    setAvailableDrinks(groupSimilarItems([...initialDrinks]));
  }, [totalAmount, initialMeals, initialDrinks]);

  useEffect(() => {
    if (paymentMethod === 'equal') {
      let totalPaid = 0;
      Object.values(equalPaymentsByPerson).forEach(personPayment => {
        if (personPayment.paid) {
          totalPaid += personPayment.amount;
        }
      });

      setRemainingBalance(totalAmount - totalPaid);
      setIsValidPayment(Math.abs(totalAmount - totalPaid) < 0.01);
    } else {
      // For item-based payment, don't update the remaining balance here
      // It will be updated in handleNextPerson
      setIsValidPayment(Math.abs(remainingBalance) < 0.01);
    }
  }, [paymentMethod, equalPaymentsByPerson, totalAmount]);

  const calculatePersonTotal = (personId: string) => {
    let personTotal = 0;

    const personDrinkQuantitiesMap = personDrinkQuantities[personId] || {};
    availableDrinks.forEach(drink => {
      const quantity = personDrinkQuantitiesMap[drink.id] || 0;
      personTotal += drink.price * quantity;
    });

    const personMealQuantitiesMap = personMealQuantities[personId] || {};
    availableMeals.forEach(meal => {
      const quantity = personMealQuantitiesMap[meal.id] || 0;
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

  // Modify the handleAmountChange function to not update the remaining balance
  const handleAmountChange = (personId: string, amount: string) => {
    const numericAmount = parseFloat(amount) || 0;
    const personTotal = calculatePersonTotal(personId);
    setAmountReceived(amount);

    // Only update the local state, don't update the remaining balance yet
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

  const handleEqualPaymentAmountChange = (personId: string, amount: string) => {
    const numericAmount = parseFloat(amount) || 0;

    setEqualPaymentsByPerson(prev => {
      return {
        ...prev,
        [personId]: {
          ...prev[personId],
          amountReceived: amount,
          change: numericAmount - amountPerPerson
        }
      };
    });
  };

  const handleEqualPaymentComplete = (personId: string) => {
    setEqualPaymentsByPerson(prev => {
      return {
        ...prev,
        [personId]: {
          ...prev[personId],
          paid: true
        }
      };
    });

    const nextUnpaidPersonId = personIds.find(id => {
      return !equalPaymentsByPerson[id]?.paid && id !== personId;
    });

    if (nextUnpaidPersonId) {
      setCurrentPersonIndex(parseInt(nextUnpaidPersonId) - 1);
    }
  };

  const currentPersonId = personIds[currentPersonIndex];

  const hasSelectedItems = () => {
    const drinkQuantitiesMap = personDrinkQuantities[currentPersonId] || {};
    const mealQuantitiesMap = personMealQuantities[currentPersonId] || {};

    return Object.values(drinkQuantitiesMap).some(quantity => quantity > 0) ||
      Object.values(mealQuantitiesMap).some(quantity => quantity > 0);
  };

  const currentPersonTotal = calculatePersonTotal(currentPersonId);
  const currentChange = (parseFloat(amountReceived) || 0) - currentPersonTotal;

  const handleNextPerson = () => {
    const updatedDrinks: MenuItem[] = [];
    const updatedMeals: MenuItem[] = [];

    const personDrinkQuantitiesMap = personDrinkQuantities[currentPersonId] || {};
    availableDrinks.forEach(drink => {
      const quantity = personDrinkQuantitiesMap[drink.id] || 0;
      if (quantity > 0) {
        updatedDrinks.push({ ...drink, quantity });
      }
    });

    const personMealQuantitiesMap = personMealQuantities[currentPersonId] || {};
    availableMeals.forEach(meal => {
      const quantity = personMealQuantitiesMap[meal.id] || 0;
      if (quantity > 0) {
        updatedMeals.push({ ...meal, quantity });
      }
    });

    // Calculate the total for this person
    const personTotal = currentPersonTotal;

    // Update person payments
    setPersonPayments(prev => {
      const amount = parseFloat(amountReceived) || 0;
      return {
        ...prev,
        [currentPersonId]: {
          drinks: updatedDrinks,
          meals: updatedMeals,
          amount: amount,
          change: amount - personTotal
        }
      };
    });

    // Update available items by removing selected quantities
    setAvailableDrinks(prevDrinks => {
      return prevDrinks.map(drink => {
        const personQuantity = personDrinkQuantitiesMap[drink.id] || 0;
        return {
          ...drink,
          quantity: Math.max(0, (drink.quantity || 0) - personQuantity)
        };
      }).filter(drink => (drink.quantity || 0) > 0);
    });

    setAvailableMeals(prevMeals => {
      return prevMeals.map(meal => {
        const personQuantity = personMealQuantitiesMap[meal.id] || 0;
        return {
          ...meal,
          quantity: Math.max(0, (meal.quantity || 0) - personQuantity)
        };
      }).filter(meal => (meal.quantity || 0) > 0);
    });

    // Update remaining balance only when clicking "Next Person"
    setRemainingBalance(prevBalance => prevBalance - personTotal);

    // Reset for next person
    setAmountReceived('');
    setPersonDrinkQuantities(prev => ({
      ...prev,
      [currentPersonId]: {}
    }));
    setPersonMealQuantities(prev => ({
      ...prev,
      [currentPersonId]: {}
    }));

    // Move to next person
    if (currentPersonIndex < numberOfPeople - 1) {
      setCurrentPersonIndex(prev => prev + 1);
    }
  };

  const getRemainingQuantity = (item: MenuItem): number => {
    return item.quantity || 0;
  };

  const updateDrinkQuantityForPerson = (personId: string, drink: MenuItem, quantityChange: number) => {
    const personQuantitiesMap = personDrinkQuantities[personId] || {};
    const currentQuantity = personQuantitiesMap[drink.id] || 0;
    const remainingQuantity = getRemainingQuantity(drink);

    const newQuantity = Math.max(0, currentQuantity + quantityChange);
    if (newQuantity > remainingQuantity && quantityChange > 0) {
      return;
    }

    setPersonDrinkQuantities(prev => {
      const personData = { ...(prev[personId] || {}) };
      personData[drink.id] = newQuantity;
      return { ...prev, [personId]: personData };
    });
  };

  const updateMealQuantityForPerson = (personId: string, meal: MenuItem, quantityChange: number) => {
    const personQuantitiesMap = personMealQuantities[personId] || {};
    const currentQuantity = personQuantitiesMap[meal.id] || 0;
    const remainingQuantity = getRemainingQuantity(meal);

    const newQuantity = Math.max(0, currentQuantity + quantityChange);
    if (newQuantity > remainingQuantity && quantityChange > 0) {
      return;
    }

    setPersonMealQuantities(prev => {
      const personData = { ...(prev[personId] || {}) };
      personData[meal.id] = newQuantity;
      return { ...prev, [personId]: personData };
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

            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <h3 className="text-xl font-medium mb-2 text-blue-800">
                Personne {currentPersonIndex + 1}
                {equalPaymentsByPerson[currentPersonId]?.paid &&
                  <span className="ml-2 text-green-600 text-sm">(Payé)</span>
                }
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Montant reçu</label>
                <input
                  type="number"
                  value={equalPaymentsByPerson[currentPersonId]?.amountReceived || ''}
                  onChange={(e) => handleEqualPaymentAmountChange(currentPersonId, e.target.value)}
                  disabled={equalPaymentsByPerson[currentPersonId]?.paid}
                  className="w-full h-12 text-lg px-3 rounded-md border border-gray-300 text-gray-800"
                  placeholder="0.00"
                />
              </div>
              {equalPaymentsByPerson[currentPersonId]?.amountReceived && (
                <div className="text-lg font-medium text-gray-800 bg-green-50 p-4 rounded-lg">
                  Monnaie à rendre: <span className="text-green-600">
                    {equalPaymentsByPerson[currentPersonId]?.change > 0
                      ? equalPaymentsByPerson[currentPersonId]?.change.toFixed(2)
                      : '0.00'} €
                  </span>
                </div>
              )}

              <button
                onClick={() => handleEqualPaymentComplete(currentPersonId)}
                disabled={!equalPaymentsByPerson[currentPersonId]?.amountReceived || equalPaymentsByPerson[currentPersonId]?.paid}
                className={`w-full h-12 text-lg text-white rounded-md flex items-center justify-center gap-2 ${
                  !equalPaymentsByPerson[currentPersonId]?.amountReceived || equalPaymentsByPerson[currentPersonId]?.paid
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                } transition-colors`}
              >
                <Check size={18} />
                <span>Personne suivante</span>
              </button>
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
                const personQuantitiesMap = personDrinkQuantities[currentPersonId] || {};
                const personQuantity = personQuantitiesMap[drink.id] || 0;

                return (
                  <div key={`drink-${drink.id}`} className="flex items-center justify-between mb-2 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex-1 flex flex-col">
                      <span className="font-medium">{drink.name}</span>
                      <span className="text-gray-500 text-sm">({drink.price.toFixed(2)} €)</span>
                    </div>
                    <div className="flex items-center h-full justify-end">
                      <div className="flex items-center h-full">
                        <button
                          onClick={() => updateDrinkQuantityForPerson(currentPersonId, drink, -1)}
                          disabled={personQuantity === 0}
                          className={`rounded-l-md px-3 py-2 ${
                            personQuantity === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          } text-xl transition-colors`}
                        >
                          -
                        </button>
                        <span className="mx-1 min-w-[30px] text-center text-blue-600 font-bold">{personQuantity}</span>
                        <button
                          onClick={() => updateDrinkQuantityForPerson(currentPersonId, drink, 1)}
                          disabled={personQuantity >= remaining}
                          className={`rounded-r-md px-3 py-2 ${
                            personQuantity >= remaining
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          } text-xl transition-colors`}
                        >
                          +
                        </button>
                      </div>
                      <span className={`ml-3 text-sm ${remaining === 0 ? 'text-green-500' : 'text-gray-500'}`}>
                        ({remaining})
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
                const personQuantitiesMap = personMealQuantities[currentPersonId] || {};
                const personQuantity = personQuantitiesMap[meal.id] || 0;

                return (
                  <div key={`meal-${meal.id}`} className="flex items-center justify-between mb-2 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex-1 flex flex-col">
                      <span className="font-medium">{meal.name}</span>
                      <span className="text-gray-500 text-sm">({meal.price.toFixed(2)} €)</span>
                      {meal.cooking && <span className="text-gray-500 text-sm">({meal.cooking})</span>}
                    </div>
                    <div className="flex items-center h-full justify-end">
                      <div className="flex items-center h-full">
                        <button
                          onClick={() => updateMealQuantityForPerson(currentPersonId, meal, -1)}
                          disabled={personQuantity === 0}
                          className={`rounded-l-md px-3 py-2 ${
                            personQuantity === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          } text-xl transition-colors`}
                        >
                          -
                        </button>
                        <span className="mx-1 min-w-[30px] text-center text-blue-600 font-bold">{personQuantity}</span>
                        <button
                          onClick={() => updateMealQuantityForPerson(currentPersonId, meal, 1)}
                          disabled={personQuantity >= remaining}
                          className={`rounded-r-md px-3 py-2 ${
                            personQuantity >= remaining
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          } text-xl transition-colors`}
                        >
                          +
                        </button>
                      </div>
                      <span className={`ml-3 text-sm ${remaining === 0 ? 'text-green-500' : 'text-gray-500'}`}>
                        ({remaining})
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
              <span>Personne suivante</span>
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

import React, { useState } from 'react';
import { Beer, UtensilsCrossed, FileText, ArrowLeft } from 'lucide-react';

type MenuItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cooking?: string;
};

type Order = {
  drinks: MenuItem[];
  meals: MenuItem[];
};

const RestaurantApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'waitress' | 'table' | 'category' | 'boissons' | 'repas' | 'recap' | 'cuisine'>('login');
  const [loggedInUser, setLoggedInUser] = useState<'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [order, setOrder] = useState<Order>({
    drinks: [],
    meals: []
  });
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [drinksMenu, setDrinksMenu] = useState<MenuItem[]>([
      { id: 1, name: 'Bière', price: 4.50, quantity: 0 },
      { id: 2, name: 'Coca', price: 3.50, quantity: 0 },
      { id: 3, name: 'Eau', price: 2.00, quantity: 0 },
      { id: 4, name: 'Vin Rouge', price: 5.50, quantity: 0 }
  ]);
  const [mealsMenu, setMealsMenu] = useState<MenuItem[]>([
    { id: 1, name: 'Entrecôte', price: 18.50, quantity: 0 },
    { id: 2, name: 'Entrecôte spécial', price: 22.50, quantity: 0 },
    { id: 3, name: 'Frites', price: 4.00, quantity: 0 },
    { id: 4, name: 'Saucisse blanche frite', price: 12.50, quantity: 0 },
    { id: 5, name: 'Merguez pain', price: 8.50, quantity: 0 }
]);
  const [tempMeals, setTempMeals] = useState<MenuItem[]>([]);

  const handleLogin = (user: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine') => {
    setLoggedInUser(user);
    if (user === 'cuisine') {
      setCurrentScreen('cuisine');
    } else {
      setCurrentScreen('waitress');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setCurrentScreen('login');
    setTableNumber('');
    setOrder({drinks: [], meals: []});
    setPendingOrders([]);
    setCompletedOrders([]);
      setDrinksMenu([
          { id: 1, name: 'Bière', price: 4.50, quantity: 0 },
          { id: 2, name: 'Coca', price: 3.50, quantity: 0 },
          { id: 3, name: 'Eau', price: 2.00, quantity: 0 },
          { id: 4, name: 'Vin Rouge', price: 5.50, quantity: 0 }
      ]);
    setMealsMenu([
        { id: 1, name: 'Entrecôte', price: 18.50, quantity: 0 },
        { id: 2, name: 'Entrecôte spécial', price: 22.50, quantity: 0 },
        { id: 3, name: 'Frites', price: 4.00, quantity: 0 },
        { id: 4, name: 'Saucisse blanche frite', price: 12.50, quantity: 0 },
        { id: 5, name: 'Merguez pain', price: 8.50, quantity: 0 }
    ]);
    setTempMeals([])
  };

  // Login Component
  const LoginScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Bienvenue</h2>
                <button
                    onClick={() => handleLogin('Celine')}
                    className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-md mb-4"
                >
                    Celine
                </button>
                <button
                    onClick={() => handleLogin('Audrey')}
                    className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-md mb-4"
                >
                    Audrey
                </button>
                <button
                    onClick={() => handleLogin('Stephanie')}
                    className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-md mb-4"
                >
                    Stephanie
                </button>
                <button
                    onClick={() => handleLogin('cuisine')}
                    className="w-full h-12 text-lg bg-gray-400 hover:bg-gray-500 text-white rounded-md"
                >
                    Cuisine
                </button>
            </div>
        </div>
    );
  };

  const WaitressScreen: React.FC = () => {

    const handleNewOrder = () => {
      setCurrentScreen('table');
    }
    const handlePendingOrder = () => {
        setCurrentScreen('cuisine');
    }
    const handleCompletedOrder = () => {
        setCurrentScreen('cuisine');
    }

    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white p-4 flex justify-between items-center">
          <div className="text-lg font-medium text-gray-800">Bonjour {loggedInUser}</div>
          <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
        </div>

        <div className="p-4 space-y-4">
          <button
            onClick={handleNewOrder}
            className="w-full bg-blue-500 p-6 rounded-2xl shadow flex flex-col items-center active:bg-blue-600"
          >
            <span className="text-lg text-white">Nouvelle commande</span>
          </button>

           <button
            onClick={handlePendingOrder}
            className="w-full bg-white p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50"
          >

            <span className="text-lg text-gray-800">Commande en cours</span>
          </button>

           <button
            onClick={handleCompletedOrder}
            className="w-full bg-white p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50"
          >

            <span className="text-lg text-gray-800">Commande terminé</span>
          </button>
        </div>
      </div>
    );
  };

   const CuisineScreen: React.FC = () => {

    return (
        <div className="min-h-screen bg-gray-100">
          <div className="bg-white p-4 flex justify-between items-center">
          <div className="text-lg font-medium text-gray-800">Bonjour Cuisine</div>
          <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
        </div>
             <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Commandes en cours</h2>
                {pendingOrders.map((order, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 shadow mb-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Commande #{index + 1}</h3>
                  {order.drinks.length > 0 && (
                    <>
                      <h4 className="text-md font-medium mb-1 text-gray-800">Boissons:</h4>
                      <ul>
                      {order.drinks.map(drink => (
                        <li key={drink.id} className="flex justify-between text-gray-800">
                          <span>{drink.name} x{drink.quantity}</span>
                          <span>{(drink.price * drink.quantity).toFixed(2)} €</span>
                        </li>
                        ))}
                      </ul>
                    </>
                    )}
                  {order.meals.length > 0 && (
                    <>
                        <h4 className="text-md font-medium mb-1 mt-2 text-gray-800">Repas:</h4>
                      <ul>
                        {order.meals.map(meal => (
                          <li key={meal.id} className="flex justify-between text-gray-800">
                            <span>{meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}</span>
                            <span>{(meal.price * meal.quantity).toFixed(2)} €</span>
                          </li>
                         ))}
                      </ul>
                    </>
                  )}
                  <div className="flex justify-end mt-4">
                    <button onClick={() => {
                       setCompletedOrders([...completedOrders, order]);
                       setPendingOrders(pendingOrders.filter((_, i) => i !== index));
                    }}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
                      Terminer
                    </button>
                 </div>
                </div>
              ))}
            </div>

               <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Commandes terminées</h2>
             {completedOrders.map((order, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 shadow mb-4">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Commande #{index + 1}</h3>
                  {order.drinks.length > 0 && (
                    <>
                      <h4 className="text-md font-medium mb-1 text-gray-800">Boissons:</h4>
                      <ul>
                      {order.drinks.map(drink => (
                        <li key={drink.id} className="flex justify-between text-gray-800">
                          <span>{drink.name} x{drink.quantity}</span>
                          <span>{(drink.price * drink.quantity).toFixed(2)} €</span>
                        </li>
                        ))}
                      </ul>
                    </>
                    )}
                  {order.meals.length > 0 && (
                    <>
                        <h4 className="text-md font-medium mb-1 mt-2 text-gray-800">Repas:</h4>
                      <ul>
                        {order.meals.map(meal => (
                          <li key={meal.id} className="flex justify-between text-gray-800">
                            <span>{meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}</span>
                            <span>{(meal.price * meal.quantity).toFixed(2)} €</span>
                          </li>
                         ))}
                      </ul>
                    </>
                  )}
                </div>
              ))}
            </div>
        </div>
    );
  };

  // TableInput Component
  const TableInput: React.FC = () => {
    const [localTableNumber, setLocalTableNumber] = useState('');

    const handleSubmit = () => {
      if (!localTableNumber || parseInt(localTableNumber) <= 0) {
        return;
      }
      setTableNumber(localTableNumber);
      setCurrentScreen('category');
    };

    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white p-4 flex justify-between items-center">
          <div className="text-lg font-medium text-gray-800">Numéro de table</div>
          <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
        </div>

        <div className="p-4">
          <div className="bg-white rounded-2xl p-6 shadow">
            <input
              type="number"
              placeholder="Entrez le numéro"
              className="w-full mb-4 h-12 text-lg px-3 rounded-md border border-gray-300 text-gray-800"
              value={localTableNumber}
              onChange={(e) => setLocalTableNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Valider
            </button>
          </div>
        </div>
      </div>
    );
  };

  // CategoryMenu Component
  const CategoryMenu: React.FC = () => {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white p-4 flex justify-between items-center">
          <div className="text-lg font-medium text-gray-800">Table {tableNumber}</div>
            <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
        </div>

        <div className="p-4 space-y-4">
          <button
            onClick={() => setCurrentScreen('boissons')}
            className="w-full bg-white p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50"
          >
            <Beer size={48} className="mb-3 text-blue-500" />
            <span className="text-lg text-gray-800">Boissons</span>
          </button>

          <button
            onClick={() => setCurrentScreen('repas')}
            className="w-full bg-white p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50"
          >
            <UtensilsCrossed size={48} className="mb-3 text-blue-500" />
            <span className="text-lg text-gray-800">Repas</span>
          </button>

          <button
            onClick={() => setCurrentScreen('recap')}
            className="w-full bg-white p-6 rounded-2xl shadow flex flex-col items-center active:bg-gray-50"
          >
            <FileText size={48} className="mb-3 text-blue-500" />
            <span className="text-lg text-gray-800">Récapitulatif</span>
          </button>
        </div>
      </div>
    );
  };

  // DrinkMenu Component
  const DrinkMenu: React.FC = () => {

    const updateQuantity = (id: number, increment: number) => {
        const updatedDrinks = drinksMenu.map(drink => {
            if (drink.id === id) {
                return {...drink, quantity: Math.max(0, drink.quantity + increment)};
            }
            return drink;
        });
        setDrinksMenu(updatedDrinks);
    };

     const handleValidate = () => {
        const orderedDrinks = drinksMenu.filter(d => d.quantity > 0);
        if (orderedDrinks.length === 0) {
            return;
        }
         setOrder(prev => ({ ...prev, drinks: orderedDrinks }));
         setCurrentScreen('category');
    };

    const totalAmount = drinksMenu.reduce((sum, drink) => sum + (drink.price * drink.quantity), 0);

    return (
      <div className="h-screen flex flex-col bg-gray-100">
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
            <div key={drink.id} className="bg-white rounded-xl p-4 mb-3 shadow">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-lg text-gray-800">{drink.name}</div>
                  <div className="text-gray-600">{drink.price.toFixed(2)} €</div>
                </div>
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => updateQuantity(drink.id, -1)}
                    className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-medium"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-lg text-gray-800">{drink.quantity}</span>
                  <button
                    onClick={() => updateQuantity(drink.id, 1)}
                    className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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

  // MealMenu Component
   const MealMenu: React.FC = () => {
    const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
    const [showCookingDialog, setShowCookingDialog] = useState(false);
    const [localMealsMenu, setLocalMealsMenu] = useState([...mealsMenu]);
    const [localTempMeals, setLocalTempMeals] = useState<MenuItem[]>([...tempMeals]);
    const cookingOptions = ['BLEU', 'SAIGNANT', 'A POINT', 'CUIT', 'BIEN CUIT'];
    const [showRemoveCookingDialog, setShowRemoveCookingDialog] = useState(false);
    const [selectedMealToRemove, setSelectedMealToRemove] = useState<number | null>(null);
     const [selectedCookingToRemove, setSelectedCookingToRemove] = useState<string | null>(null);


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
         if (mealToRemove){

          const tempMealsIndex = localTempMeals.findIndex(meal => meal.name === mealToRemove.name && meal.cooking === cooking)
           if(tempMealsIndex !== -1){
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
             setSelectedCookingToRemove(null);

     };


        const handleValidate = () => {
          const orderedMeals = localMealsMenu.filter(m => m.quantity > 0 && (m.id !== 1 && m.id !==2));
            setOrder(prev => ({
              ...prev,
              meals: [...orderedMeals, ...localTempMeals]
                }));
             setMealsMenu(localMealsMenu)
            setTempMeals(localTempMeals)
           setCurrentScreen('category');
        };

    const allCookingOptions = [...new Set(localTempMeals.filter(meal => (selectedMealToRemove === 1 || selectedMealToRemove === 2 ) && meal.name === (selectedMealToRemove === 1 ? 'Entrecôte' : 'Entrecôte spécial')).map(meal => meal.cooking)) ] ;


    const totalAmount = localMealsMenu.reduce((sum, meal) => sum + (meal.price * meal.quantity), 0) +
                        localTempMeals.reduce((sum, meal) => sum + (meal.price * meal.quantity), 0)

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


  // RecapOrder Component
    const RecapOrder: React.FC = () => {
        const { drinks = [], meals = [] } = order;
        const [amountReceived, setAmountReceived] = useState('');


        const drinkTotal = drinks.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const mealTotal = meals.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalAmount = drinkTotal + mealTotal;
        const change = amountReceived ? parseFloat(amountReceived) - totalAmount : 0;

      const handleSubmitOrder = () => {
        if (meals.length === 0 && drinks.length === 0) {
            return;
        }
        setPendingOrders([...pendingOrders, order]);
          setDrinksMenu([
              { id: 1, name: 'Bière', price: 4.50, quantity: 0 },
              { id: 2, name: 'Coca', price: 3.50, quantity: 0 },
              { id: 3, name: 'Eau', price: 2.00, quantity: 0 },
              { id: 4, name: 'Vin Rouge', price: 5.50, quantity: 0 }
          ]);
        setMealsMenu([
          { id: 1, name: 'Entrecôte', price: 18.50, quantity: 0 },
          { id: 2, name: 'Entrecôte spécial', price: 22.50, quantity: 0 },
          { id: 3, name: 'Frites', price: 4.00, quantity: 0 },
          { id: 4, name: 'Saucisse blanche frite', price: 12.50, quantity: 0 },
          { id: 5, name: 'Merguez pain', price: 8.50, quantity: 0 }
      ]);
         setTempMeals([]);
        setOrder({ drinks: [], meals: [] });
        setCurrentScreen('waitress');
    };
    const groupedMeals = meals.reduce((acc, meal) => {
        const key = `${meal.name}-${meal.cooking || 'none'}`;
        if (acc[key]) {
            acc[key].quantity += meal.quantity;
        } else {
            acc[key] = { ...meal };
        }
        return acc;
    }, {} as { [key: string]: MenuItem });


        return (
            <div className="h-screen flex flex-col bg-gray-100">
                <div className="bg-blue-500 p-4 text-white flex items-center">
                    <button onClick={() => setCurrentScreen('category')} className="mr-2">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Addition</h1>
                        <div className="text-sm">Table {tableNumber}</div>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-auto">
                    {drinks.length > 0 && (
                        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                            <h2 className="font-bold mb-2 text-lg border-b pb-2 text-gray-800">Boissons</h2>
                            {drinks.map(item => (
                                <div key={item.id} className="flex justify-between mb-2 text-gray-800">
                                    <div>
                                        <span className="font-medium">{item.name}</span>
                                        <span className="text-gray-600 text-sm"> x{item.quantity}</span>
                                    </div>
                                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                                </div>
                            ))}
                            <div className="text-right text-gray-600 border-t pt-2 mt-2">
                                Sous-total boissons: {drinkTotal.toFixed(2)} €
                            </div>
                        </div>
                    )}
                    {Object.values(groupedMeals).length > 0 && (
                        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                            <h2 className="font-bold mb-2 text-lg border-b pb-2 text-gray-800">Repas</h2>
                            {Object.values(groupedMeals).map(item => (
                                <div key={item.id} className="flex justify-between mb-2 text-gray-800">
                                    <div>
                                        <span className="font-medium">{item.name}</span>
                                          <span className="text-gray-600 text-sm"> x{item.quantity}</span>
                                        {item.cooking && <span className="text-gray-600 text-sm"> ({item.cooking})</span>}
                                    </div>
                                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                                </div>
                            ))}
                            <div className="text-right text-gray-600 border-t pt-2 mt-2">
                                Sous-total repas: {mealTotal.toFixed(2)} €
                            </div>
                        </div>
                    )}


                </div>
                <div className="p-4 bg-white border-t">
                    <div className="flex justify-between mb-4 text-lg font-medium text-gray-800">
                        <span>Total</span>
                        <span>{totalAmount.toFixed(2)} €</span>
                    </div>
                      <div className="mb-4">
                            <input
                                type="number"
                                placeholder="Somme reçue"
                                className="w-full mb-2 h-12 text-lg px-3 rounded-md border border-gray-300 text-gray-800"
                                value={amountReceived}
                                onChange={(e) => setAmountReceived(e.target.value)}
                            />
                           {amountReceived &&  <div className="text-right text-gray-600">
                                Rendu: {change.toFixed(2)} €
                            </div>}
                        </div>
                    <button
                        onClick={handleSubmitOrder}
                        className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                    >
                        Valider la commande
                    </button>
                </div>
            </div>
        );
    };


  if(currentScreen === 'login'){
     return <LoginScreen />;
    }

  if (currentScreen === 'waitress') {
    return <WaitressScreen />;
  }

  if (currentScreen === 'table') {
    return <TableInput />;
  }

  if (currentScreen === 'category') {
    return <CategoryMenu />;
  }

  if (currentScreen === 'boissons') {
    return <DrinkMenu />;
  }

  if (currentScreen === 'repas') {
    return <MealMenu />;
  }

  if (currentScreen === 'recap') {
      return <RecapOrder />;
    }

  if (currentScreen === 'cuisine'){
     return <CuisineScreen />;
    }

  return null;
};

export default RestaurantApp;

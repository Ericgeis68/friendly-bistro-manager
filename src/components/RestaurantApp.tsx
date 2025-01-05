import React, { useState } from 'react';
import { MenuItem, Order, ScreenType } from './types';
import WaitressScreen from './screens/WaitressScreen';
import TableInput from './screens/TableInput';
import CategoryMenu from './screens/CategoryMenu';
import DrinkMenu from './screens/DrinkMenu';
import MealMenu from './screens/MealMenu';
import RecapOrder from './screens/RecapOrder';
import CuisineScreen from './screens/CuisineScreen';
import PendingOrdersScreen from './screens/PendingOrdersScreen';
import CompletedOrdersScreen from './screens/CompletedOrdersScreen';

const RestaurantApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
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
    setTempMeals([]);
  };

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

  if (currentScreen === 'login') {
    return <LoginScreen />;
  }

  if (currentScreen === 'waitress') {
    return (
      <WaitressScreen
        loggedInUser={loggedInUser}
        handleLogout={handleLogout}
        setCurrentScreen={setCurrentScreen}
        pendingOrders={pendingOrders}
        completedOrders={completedOrders}
      />
    );
  }

  if (currentScreen === 'pending') {
    return (
      <PendingOrdersScreen
        setCurrentScreen={setCurrentScreen}
        pendingOrders={pendingOrders}
      />
    );
  }

  if (currentScreen === 'completed') {
    return (
      <CompletedOrdersScreen
        setCurrentScreen={setCurrentScreen}
        completedOrders={completedOrders}
      />
    );
  }

  if (currentScreen === 'table') {
    return (
      <TableInput
        setTableNumber={setTableNumber}
        setCurrentScreen={setCurrentScreen}
        handleLogout={handleLogout}
      />
    );
  }

  if (currentScreen === 'category') {
    return (
      <CategoryMenu
        tableNumber={tableNumber}
        setCurrentScreen={setCurrentScreen}
        handleLogout={handleLogout}
      />
    );
  }

  if (currentScreen === 'boissons') {
    return (
      <DrinkMenu
        setCurrentScreen={setCurrentScreen}
        drinksMenu={drinksMenu}
        setDrinksMenu={setDrinksMenu}
        order={order}
        setOrder={setOrder}
        tableNumber={tableNumber}
        handleLogout={handleLogout}
      />
    );
  }

  if (currentScreen === 'repas') {
    return (
      <MealMenu
        setCurrentScreen={setCurrentScreen}
        mealsMenu={mealsMenu}
        setMealsMenu={setMealsMenu}
        order={order}
        setOrder={setOrder}
        tableNumber={tableNumber}
        handleLogout={handleLogout}
      />
    );
  }

  if (currentScreen === 'recap') {
    return (
      <RecapOrder
        setCurrentScreen={setCurrentScreen}
        order={order}
        tableNumber={tableNumber}
        handleLogout={handleLogout}
        setPendingOrders={setPendingOrders}
        pendingOrders={pendingOrders}
      />
    );
  }

  if (currentScreen === 'cuisine') {
    return (
      <CuisineScreen
        pendingOrders={pendingOrders}
        completedOrders={completedOrders}
        setPendingOrders={setPendingOrders}
        setCompletedOrders={setCompletedOrders}
        handleLogout={handleLogout}
      />
    );
  }

  return null;
};

export default RestaurantApp;
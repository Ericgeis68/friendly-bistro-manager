import React, { useState } from 'react';
import { Beer, UtensilsCrossed, FileText, ArrowLeft, ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';
import type { MenuItem, Order, ScreenType } from '../types/restaurant';
import CuisineScreen from './screens/CuisineScreen';
import AdminScreen from './screens/AdminScreen';
import LoginScreen from './screens/LoginScreen';
import WaitressOrdersScreen from './screens/WaitressOrdersScreen';
import TableInput from './screens/TableInput';
import CategoryMenu from './screens/CategoryMenu';
import DrinkMenu from './screens/DrinkMenu';
import MealMenu from './screens/MealMenu';
import RecapOrder from './screens/RecapOrder';

const RestaurantApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [loggedInUser, setLoggedInUser] = useState<'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin' | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [order, setOrder] = useState<Omit<Order, 'waitress'>>({
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

  const handleLogin = (user: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin') => {
    setLoggedInUser(user);
    if (user === 'cuisine') {
      setCurrentScreen('cuisine');
    } else if (user === 'admin') {
      setCurrentScreen('admin');
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

  const handleCompleteOrder = (orderToComplete: Order) => {
    setPendingOrders(prev => prev.filter(order => 
      !(order.waitress === orderToComplete.waitress && order.table === orderToComplete.table)
    ));
    setCompletedOrders(prev => [...prev, orderToComplete]);
  };

  const handleSubmitOrder = () => {
    if (order.meals.length === 0 && order.drinks.length === 0) {
      return;
    }
    
    const newOrder = { 
      waitress: loggedInUser!, 
      meals: [...order.meals],
      drinks: [...order.drinks],
      table: tableNumber
    };

    setPendingOrders(prev => [...prev, newOrder]);

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
    setTableNumber('');
    setCurrentScreen('waitress');
  };

  if(currentScreen === 'login'){
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentScreen === 'waitress') {
    return (
      <WaitressOrdersScreen
        pendingOrders={pendingOrders}
        completedOrders={completedOrders}
        loggedInUser={loggedInUser!}
        onCompleteOrder={handleCompleteOrder}
        onNewOrder={() => setCurrentScreen('table')}
        onLogout={handleLogout}
      />
    );
  }

  if (currentScreen === 'table') {
    return (
      <TableInput
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  if (currentScreen === 'category') {
    return <CategoryMenu setCurrentScreen={setCurrentScreen} />;
  }

  if (currentScreen === 'boissons') {
    return (
      <DrinkMenu
        drinksMenu={drinksMenu}
        setDrinksMenu={setDrinksMenu}
        order={order}
        setOrder={setOrder}
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  if (currentScreen === 'repas') {
    return (
      <MealMenu
        mealsMenu={mealsMenu}
        setMealsMenu={setMealsMenu}
        order={order}
        setOrder={setOrder}
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  if (currentScreen === 'recap') {
    return (
      <RecapOrder
        order={order}
        tableNumber={tableNumber}
        handleSubmitOrder={handleSubmitOrder}
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  if (currentScreen === 'cuisine'){
    return (
      <CuisineScreen 
        pendingOrders={pendingOrders}
        completedOrders={completedOrders}
        setPendingOrders={setPendingOrders}
        setCompletedOrders={setCompletedOrders}
        onLogout={handleLogout}
      />
    );
  }

  if (currentScreen === 'admin') {
    return <AdminScreen />;
  }

  return null;
};

export default RestaurantApp;

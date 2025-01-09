import React, { useState } from 'react';
import type { MenuItem, Order, ScreenType } from '../types/restaurant';
import CuisineScreen from './screens/CuisineScreen';
import AdminScreen from './screens/AdminScreen';
import LoginScreen from './screens/LoginScreen';
import PendingOrdersScreen from './screens/PendingOrdersScreen';
import WaitressHomeScreen from './screens/WaitressHomeScreen';
import TableInputScreen from './screens/TableInputScreen';
import CategoryMenuScreen from './screens/CategoryMenuScreen';
import DrinkMenuScreen from './screens/DrinkMenuScreen';
import MealMenuScreen from './screens/MealMenuScreen';
import RecapOrderScreen from './screens/RecapOrderScreen';
import { generateOrderId } from '../utils/orderUtils';

const RestaurantApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [loggedInUser, setLoggedInUser] = useState<'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin' | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  const [order, setOrder] = useState<Omit<Order, 'waitress' | 'id' | 'status' | 'createdAt'>>({
    table: '',
    drinks: [],
    meals: []
  });
  const [pendingOrders, setPendingOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('pendingOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [completedOrders, setCompletedOrders] = useState<Order[]>(() => {
    const savedCompletedOrders = localStorage.getItem('completedOrders');
    return savedCompletedOrders ? JSON.parse(savedCompletedOrders) : [];
  });
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

  // Sauvegarder les commandes quand elles changent
  React.useEffect(() => {
    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
  }, [pendingOrders]);

  React.useEffect(() => {
    localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
  }, [completedOrders]);

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
    setOrder({
      table: '',
      drinks: [],
      meals: []
    });
    setDrinksMenu([
      { id: 1, name: 'Bière', price: 4.50, quantity: 0 },
      { id: 2, name: 'Coca', price: 3.50, quantity: 0 },
      { id: 3, name: 'Eau', price: 2.00, quantity: 0 },
      { id: 4, name: 'Vin Rouge', price: 5.50, quantity: 0 }
    ]);
    setMeals

Menu([
      { id: 1, name: 'Entrecôte', price: 18.50, quantity: 0 },
      { id: 2, name: 'Entrecôte spécial', price: 22.50, quantity: 0 },
      { id: 3, name: 'Frites', price: 4.00, quantity: 0 },
      { id: 4, name: 'Saucisse blanche frite', price: 12.50, quantity: 0 },
      { id: 5, name: 'Merguez pain', price: 8.50, quantity: 0 }
    ]);
    setTempMeals([]);
  };

  const handleSubmitOrder = () => {
    if (order.meals.length === 0 && order.drinks.length === 0) {
      return;
    }
    
    const newOrder: Order = { 
      id: generateOrderId(),
      waitress: loggedInUser!, 
      meals: [...order.meals],
      drinks: [...order.drinks],
      table: tableNumber,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setPendingOrders(prev => [...prev, newOrder]);

    // Reset states
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
    setOrder({
      table: '',
      drinks: [],
      meals: []
    });
    setTableNumber('');
    setCurrentScreen('waitress');
  };

  const handleOrderComplete = (completedOrder: Order) => {
    setPendingOrders(prev => prev.filter(order => 
      order.id !== completedOrder.id
    ));
    
    const orderToComplete = {
      ...completedOrder,
      status: 'completed' as const
    };
    
    setCompletedOrders(prev => [...prev, orderToComplete]);
  };

  const handleOrderCancel = (cancelledOrder: Order) => {
    setPendingOrders(prev => prev.filter(order => order.id !== cancelledOrder.id));
    setCompletedOrders(prev => [...prev, { ...cancelledOrder, status: 'cancelled' }]);
  };

  if(currentScreen === 'login'){
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentScreen === 'waitress') {
    if (showPendingOrders) {
      return <PendingOrdersScreen 
        orders={pendingOrders.filter(order => order.waitress === loggedInUser)}
        onBack={() => setShowPendingOrders(false)}
        onOrderComplete={handleOrderComplete}
        onOrderCancel={handleOrderCancel}
      />;
    }
    return <WaitressHomeScreen 
      loggedInUser={loggedInUser!}
      handleLogout={handleLogout}
      handleNewOrder={() => setCurrentScreen('table')}
      setShowPendingOrders={setShowPendingOrders}
    />;
  }

  if (currentScreen === 'table') {
    return <TableInputScreen 
      handleLogout={handleLogout}
      setTableNumber={setTableNumber}
      setCurrentScreen={setCurrentScreen}
    />;
  }

  if (currentScreen === 'category') {
    return <CategoryMenuScreen 
      tableNumber={tableNumber}
      handleLogout={handleLogout}
      setCurrentScreen={setCurrentScreen}
    />;
  }

  if (currentScreen === 'boissons') {
    return <DrinkMenuScreen 
      tableNumber={tableNumber}
      drinksMenu={drinksMenu}
      setDrinksMenu={setDrinksMenu}
      setCurrentScreen={setCurrentScreen}
      setOrder={setOrder}
    />;
  }

  if (currentScreen === 'repas') {
    return <MealMenuScreen 
      tableNumber={tableNumber}
      mealsMenu={mealsMenu}
      setMealsMenu={setMealsMenu}
      tempMeals={tempMeals}
      setTempMeals={setTempMeals}
      setCurrentScreen={setCurrentScreen}
      setOrder={setOrder}
    />;
  }

  if (currentScreen === 'recap') {
    return <RecapOrderScreen 
      tableNumber={tableNumber}
      order={order}
      handleSubmitOrder={handleSubmitOrder}
      setCurrentScreen={setCurrentScreen}
    />;
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
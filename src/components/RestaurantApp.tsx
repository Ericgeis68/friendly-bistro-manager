import React, { useState } from 'react';
import type { MenuItem, Order, ScreenType } from '../types/restaurant';
import CuisineScreen from './screens/CuisineScreen';
import AdminScreen from './screens/AdminScreen';
import LoginScreen from './screens/LoginScreen';
import PendingOrdersScreen from './screens/PendingOrdersScreen';
import CompletedOrdersScreen from './screens/CompletedOrdersScreen';
import WaitressHomeScreen from './screens/WaitressHomeScreen';
import TableInputScreen from './screens/TableInputScreen';
import CategoryMenuScreen from './screens/CategoryMenuScreen';
import DrinkMenuScreen from './screens/DrinkMenuScreen';
import MealMenuScreen from './screens/MealMenuScreen';
import RecapOrderScreen from './screens/RecapOrderScreen';
import { generateOrderId } from '../utils/orderUtils';
import { toast } from "@/hooks/use-toast";
import { useOrderManagement } from '../hooks/useOrderManagement';
import { useMenuManagement } from '../hooks/useMenuManagement';

const RestaurantApp: React.FC = () => {
  // Effacer les commandes terminées au démarrage
  localStorage.removeItem('completedOrders');
  
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [loggedInUser, setLoggedInUser] = useState<'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin' | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  const [showCompletedOrders, setShowCompletedOrders] = useState(false);
  const [order, setOrder] = useState<Omit<Order, 'waitress' | 'id' | 'status' | 'createdAt'>>({
    table: '',
    drinks: [],
    meals: []
  });
  const [tempMeals, setTempMeals] = useState<MenuItem[]>([]);

  const {
    pendingOrders,
    setPendingOrders,
    completedOrders,
    setCompletedOrders,
    pendingNotifications,
    setPendingNotifications,
    handleOrderReady,
    handleOrderComplete,
    handleOrderCancel
  } = useOrderManagement();

  const {
    drinksMenu,
    setDrinksMenu,
    mealsMenu,
    setMealsMenu
  } = useMenuManagement();

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
    setDrinksMenu(prevDrinksMenu => prevDrinksMenu.map(drink => ({ ...drink, quantity: 0 })));
    setMealsMenu(prevMealsMenu => prevMealsMenu.map(meal => ({ ...meal, quantity: 0 })));
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
    toast({
      title: "Commande envoyée",
      description: `La commande pour la table ${tableNumber} a été envoyée en cuisine.`,
    });

    setDrinksMenu(prevDrinksMenu => prevDrinksMenu.map(drink => ({ ...drink, quantity: 0 })));
    setMealsMenu(prevMealsMenu => prevMealsMenu.map(meal => ({ ...meal, quantity: 0 })));
    setTempMeals([]);
    setOrder({
      table: '',
      drinks: [],
      meals: []
    });
    setTableNumber('');
    setCurrentScreen('waitress');
  };

  const handleNotificationAcknowledge = (orderId: string) => {
    setPendingNotifications(prev => prev.filter(order => order.id !== orderId));
    setShowPendingOrders(true);
  };

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentScreen === 'waitress') {
    if (showCompletedOrders) {
      return (
        <CompletedOrdersScreen
          orders={completedOrders.filter(order => 
            order.waitress === loggedInUser && order.status === 'completed'
          )}
          onBack={() => setShowCompletedOrders(false)}
        />
      );
    }
    
    if (showPendingOrders) {
      return (
        <PendingOrdersScreen
          orders={pendingOrders.filter(order => order.waitress === loggedInUser)}
          onBack={() => setShowPendingOrders(false)}
          onOrderComplete={handleOrderComplete}
          onOrderCancel={handleOrderCancel}
        />
      );
    }

    return (
      <WaitressHomeScreen
        loggedInUser={loggedInUser!}
        handleLogout={handleLogout}
        handleNewOrder={() => setCurrentScreen('table')}
        setShowPendingOrders={setShowPendingOrders}
        setShowCompletedOrders={setShowCompletedOrders}
        pendingNotifications={pendingNotifications.filter(order => order.waitress === loggedInUser)}
        onNotificationAcknowledge={handleNotificationAcknowledge}
      />
    );
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
        onOrderReady={handleOrderReady}
      />
    );
  }

  if (currentScreen === 'admin') {
    return <AdminScreen />;
  }

  return null;
};

export default RestaurantApp;
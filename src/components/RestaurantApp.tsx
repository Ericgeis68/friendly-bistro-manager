
import React, { useState } from 'react';
import type { MenuItem, Order, ScreenType } from '../types/restaurant';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { useMenuManagement } from '../hooks/useMenuManagement';
import { useScreenManagement } from '../hooks/useScreenManagement';
import { useOrderHandlers } from '../hooks/useOrderHandlers';
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
import SplitPaymentScreen from './screens/SplitPaymentScreen';

const RestaurantApp: React.FC = () => {
  // Remove this line as we want to persist completed orders
  // localStorage.removeItem('completedOrders');
  
  const [tableNumber, setTableNumber] = useState('');
  const [tableComment, setTableComment] = useState('');
  const [order, setOrder] = useState<Omit<Order, 'waitress' | 'id' | 'status' | 'createdAt'>>({
    table: '',
    drinks: [],
    meals: []
  });
  const [tempMeals, setTempMeals] = useState<MenuItem[]>([]);

  const {
    currentScreen,
    setCurrentScreen,
    loggedInUser,
    setLoggedInUser,
    showPendingOrders,
    setShowPendingOrders,
    showCompletedOrders,
    setShowCompletedOrders
  } = useScreenManagement();

  const {
    pendingOrders,
    setPendingOrders,
    completedOrders,
    setCompletedOrders,
    pendingNotifications,
    setPendingNotifications,
    handleOrderReady,
    handleOrderComplete,
    handleOrderCancel,
    handleDrinksComplete
  } = useOrderManagement();

  const {
    drinksMenu,
    setDrinksMenu,
    mealsMenu,
    setMealsMenu
  } = useMenuManagement();

  const {
    handleLogin,
    handleLogout,
    handleSubmitOrder,
    handleNotificationAcknowledge,
    handleOrderCompleteWithType,
    handleOrderCancelWithType
  } = useOrderHandlers({
    loggedInUser: loggedInUser || '',
    setLoggedInUser,
    setCurrentScreen,
    tableNumber,
    tableComment,
    order: order as Order,
    setOrder,
    setTableNumber,
    setTableComment,
    setDrinksMenu,
    setMealsMenu,
    setTempMeals,
    setPendingOrders,
    setPendingNotifications,
    pendingOrders,
    handleOrderComplete,
    handleOrderCancel,
    handleDrinksComplete,
    setCompletedOrders,
    completedOrders
  });

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentScreen === 'waitress') {
    if (showCompletedOrders) {
      return (
        <CompletedOrdersScreen
          orders={completedOrders.filter(order => 
            order.waitress === loggedInUser
          )}
          onBack={() => setShowCompletedOrders(false)}
          userRole="waitress"
        />
      );
    }
    
    if (showPendingOrders) {
      pendingNotifications
        .filter(order => order.waitress === loggedInUser)
        .forEach(order => handleNotificationAcknowledge(order.id));
      
      return (
        <PendingOrdersScreen
          orders={pendingOrders.filter(order => order.waitress === loggedInUser)}
          onBack={() => setShowPendingOrders(false)}
          onOrderComplete={handleOrderCompleteWithType}
          onOrderCancel={handleOrderCancelWithType}
          setPendingOrders={setPendingOrders}
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
      setTableComment={setTableComment}
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
      setCurrentScreen={(screen) => setCurrentScreen(screen as ScreenType)}
    />;
  }

  if (currentScreen === 'splitPayment') {
    return <SplitPaymentScreen 
      tableNumber={tableNumber}
      order={order}
      setCurrentScreen={(screen) => setCurrentScreen(screen as ScreenType)}
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
    return <AdminScreen 
      onLogout={handleLogout}
      setLoggedInUser={(user) => {
        if (typeof user === 'string') {
          setLoggedInUser(user as any);
        }
      }}
      setCurrentScreen={setCurrentScreen}
    />;
  }

  return null;
};

export default RestaurantApp;

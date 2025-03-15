
import React, { useState } from 'react';
import type { MenuItem, Order, ScreenType } from '../types/restaurant';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { useMenuManagement } from '../hooks/useMenuManagement';
import { useScreenManagement } from '../hooks/useScreenManagement';
import { useOrderHandlers } from '../hooks/useOrderHandlers';
import ScreenRenderer from './screens/ScreenRenderer';

const RestaurantApp: React.FC = () => {
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

  const typedSetLoggedInUser = (user: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin' | null) => {
    setLoggedInUser(user);
  };

  const typedSetCurrentScreen = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  const {
    handleLogin,
    handleLogout,
    handleSubmitOrder,
    handleNotificationAcknowledge,
    handleOrderCompleteWithType,
    handleOrderCancelWithType
  } = useOrderHandlers({
    loggedInUser,
    setLoggedInUser: typedSetLoggedInUser,
    setCurrentScreen: typedSetCurrentScreen,
    tableNumber,
    tableComment,
    order,
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
    setCompletedOrders
  });

  const handlers = {
    setCurrentScreen: typedSetCurrentScreen,
    handleLogout,
    handleSubmitOrder,
    handleNotificationAcknowledge,
    handleOrderCompleteWithType,
    handleOrderCancelWithType,
    setLoggedInUser: typedSetLoggedInUser,
    setTableNumber,
    setTableComment,
    setOrder,
    setDrinksMenu,
    setMealsMenu,
    setTempMeals,
    setPendingOrders,
    setShowPendingOrders,
    setShowCompletedOrders,
    handleOrderReady,
    setCompletedOrders,
    handleLogin
  };

  return (
    <ScreenRenderer
      currentScreen={currentScreen}
      loggedInUser={loggedInUser}
      pendingOrders={pendingOrders}
      completedOrders={completedOrders}
      pendingNotifications={pendingNotifications}
      tableNumber={tableNumber}
      tableComment={tableComment}
      drinksMenu={drinksMenu}
      mealsMenu={mealsMenu}
      tempMeals={tempMeals}
      order={order}
      showPendingOrders={showPendingOrders}
      showCompletedOrders={showCompletedOrders}
      handlers={handlers}
    />
  );
};

export default RestaurantApp;

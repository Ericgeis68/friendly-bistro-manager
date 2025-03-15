
import React from 'react';
import type { MenuItem, Order, ScreenType } from '../../types/restaurant';
import CuisineScreen from './CuisineScreen';
import AdminScreen from './AdminScreen';
import LoginScreen from './LoginScreen';
import PendingOrdersScreen from './PendingOrdersScreen';
import CompletedOrdersScreen from './CompletedOrdersScreen';
import WaitressHomeScreen from './WaitressHomeScreen';
import TableInputScreen from './TableInputScreen';
import CategoryMenuScreen from './CategoryMenuScreen';
import DrinkMenuScreen from './DrinkMenuScreen';
import MealMenuScreen from './MealMenuScreen';
import RecapOrderScreen from './RecapOrderScreen';
import SplitPaymentScreen from './SplitPaymentScreen';

interface ScreenRendererProps {
  currentScreen: ScreenType;
  loggedInUser: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin' | null;
  pendingOrders: Order[];
  completedOrders: Order[];
  pendingNotifications: Order[];
  tableNumber: string;
  tableComment: string;
  drinksMenu: MenuItem[];
  mealsMenu: MenuItem[];
  tempMeals: MenuItem[];
  order: Omit<Order, 'waitress' | 'id' | 'status' | 'createdAt'>;
  showPendingOrders: boolean;
  showCompletedOrders: boolean;
  handlers: {
    setCurrentScreen: (screen: ScreenType) => void;
    handleLogout: () => void;
    handleSubmitOrder: () => void;
    handleNotificationAcknowledge: (orderId: string) => void;
    handleOrderCompleteWithType: (order: Order, type: 'both' | 'drinks' | 'meals') => void;
    handleOrderCancelWithType: (order: Order, type: 'both' | 'drinks' | 'meals') => void;
    setLoggedInUser: (user: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin' | null) => void;
    setTableNumber: (tableNumber: string) => void;
    setTableComment: (tableComment: string) => void;
    setOrder: React.Dispatch<React.SetStateAction<Omit<Order, 'waitress' | 'id' | 'status' | 'createdAt'>>>;
    setDrinksMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    setMealsMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    setTempMeals: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    setShowPendingOrders: React.Dispatch<React.SetStateAction<boolean>>;
    setShowCompletedOrders: React.Dispatch<React.SetStateAction<boolean>>;
    handleOrderReady: (order: Order) => void;
  };
}

const ScreenRenderer: React.FC<ScreenRendererProps> = ({
  currentScreen,
  loggedInUser,
  pendingOrders,
  completedOrders,
  pendingNotifications,
  tableNumber,
  tableComment,
  drinksMenu,
  mealsMenu,
  tempMeals,
  order,
  showPendingOrders,
  showCompletedOrders,
  handlers
}) => {
  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handlers.handleLogin} />;
  }

  if (currentScreen === 'waitress') {
    if (showCompletedOrders) {
      return (
        <CompletedOrdersScreen
          orders={completedOrders.filter(order => 
            order.waitress === loggedInUser
          )}
          onBack={() => handlers.setShowCompletedOrders(false)}
          userRole="waitress"
        />
      );
    }
    
    if (showPendingOrders) {
      pendingNotifications
        .filter(order => order.waitress === loggedInUser)
        .forEach(order => handlers.handleNotificationAcknowledge(order.id));
      
      return (
        <PendingOrdersScreen
          orders={pendingOrders.filter(order => order.waitress === loggedInUser)}
          onBack={() => handlers.setShowPendingOrders(false)}
          onOrderComplete={handlers.handleOrderCompleteWithType}
          onOrderCancel={handlers.handleOrderCancelWithType}
          setPendingOrders={handlers.setPendingOrders}
        />
      );
    }

    return (
      <WaitressHomeScreen
        loggedInUser={loggedInUser!}
        handleLogout={handlers.handleLogout}
        handleNewOrder={() => handlers.setCurrentScreen('table')}
        setShowPendingOrders={handlers.setShowPendingOrders}
        setShowCompletedOrders={handlers.setShowCompletedOrders}
        pendingNotifications={pendingNotifications.filter(order => order.waitress === loggedInUser)}
        onNotificationAcknowledge={handlers.handleNotificationAcknowledge}
        pendingOrders={pendingOrders.filter(order => order.waitress === loggedInUser)}
        onOrderComplete={handlers.handleOrderCompleteWithType}
      />
    );
  }

  if (currentScreen === 'table') {
    return <TableInputScreen 
      handleLogout={handlers.handleLogout}
      setTableNumber={handlers.setTableNumber}
      setTableComment={handlers.setTableComment}
      setCurrentScreen={handlers.setCurrentScreen}
    />;
  }

  if (currentScreen === 'category') {
    return <CategoryMenuScreen 
      tableNumber={tableNumber}
      handleLogout={handlers.handleLogout}
      setCurrentScreen={handlers.setCurrentScreen}
    />;
  }

  if (currentScreen === 'boissons') {
    return <DrinkMenuScreen 
      tableNumber={tableNumber}
      drinksMenu={drinksMenu}
      setDrinksMenu={handlers.setDrinksMenu}
      setCurrentScreen={handlers.setCurrentScreen}
      setOrder={handlers.setOrder}
    />;
  }

  if (currentScreen === 'repas') {
    return <MealMenuScreen 
      tableNumber={tableNumber}
      mealsMenu={mealsMenu}
      setMealsMenu={handlers.setMealsMenu}
      tempMeals={tempMeals}
      setTempMeals={handlers.setTempMeals}
      setCurrentScreen={handlers.setCurrentScreen}
      setOrder={handlers.setOrder}
    />;
  }

  if (currentScreen === 'recap') {
    return <RecapOrderScreen 
      tableNumber={tableNumber}
      order={order}
      handleSubmitOrder={handlers.handleSubmitOrder}
      setCurrentScreen={handlers.setCurrentScreen}
    />;
  }

  if (currentScreen === 'splitPayment') {
    return <SplitPaymentScreen 
      tableNumber={tableNumber}
      order={order}
      setCurrentScreen={handlers.setCurrentScreen}
    />;
  }

  if (currentScreen === 'cuisine'){
    return (
      <CuisineScreen 
        pendingOrders={pendingOrders}
        completedOrders={completedOrders}
        setPendingOrders={handlers.setPendingOrders}
        setCompletedOrders={handlers.setCompletedOrders}
        onLogout={handlers.handleLogout}
        onOrderReady={handlers.handleOrderReady}
      />
    );
  }

  if (currentScreen === 'admin') {
    return <AdminScreen 
      onLogout={handlers.handleLogout}
      setLoggedInUser={handlers.setLoggedInUser}
      setCurrentScreen={handlers.setCurrentScreen}
    />;
  }

  return null;
};

export default ScreenRenderer;

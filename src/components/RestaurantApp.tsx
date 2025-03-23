import * as React from 'react';
import { useState, useEffect } from 'react';
import type { MenuItem, Order, ScreenType, UserRole } from '../types/restaurant';
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
import { DEFAULT_COOKING_OPTIONS } from '../utils/itemGrouping';
import { onValue, ref } from 'firebase/database';
import { cookingOptionsRef, database } from '../utils/firebase';

const WaitressScreens = ({
  loggedInUser,
  showCompletedOrders,
  showPendingOrders,
  completedOrders,
  pendingOrders,
  pendingNotifications,
  handleLogout,
  setCurrentScreen,
  setShowPendingOrders,
  setShowCompletedOrders,
  handleNotificationAcknowledge,
  handleOrderCompleteWithType,
  handleOrderCancelWithType,
  setPendingOrders,
  darkMode,
  toggleDarkMode
}: {
  loggedInUser: UserRole;
  showCompletedOrders: boolean;
  showPendingOrders: boolean;
  completedOrders: Order[];
  pendingOrders: Order[];
  pendingNotifications: Order[];
  handleLogout: () => void;
  setCurrentScreen: (screen: ScreenType) => void;
  setShowPendingOrders: (show: boolean) => void;
  setShowCompletedOrders: (show: boolean) => void;
  handleNotificationAcknowledge: (id: string) => void;
  handleOrderCompleteWithType: (order: Order, type: 'drinks' | 'meals' | 'both') => void;
  handleOrderCancelWithType: (order: Order, type: 'drinks' | 'meals' | 'all') => void;
  setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  darkMode: boolean;
  toggleDarkMode: () => void;
}) => {
  useEffect(() => {
    if (showPendingOrders) {
      pendingNotifications
        .filter(order => order.waitress === loggedInUser)
        .forEach(order => handleNotificationAcknowledge(order.id));
    }
  }, [showPendingOrders, pendingNotifications, loggedInUser, handleNotificationAcknowledge]);

  console.log("WaitressScreens - pendingOrders:", pendingOrders.length);
  console.log("WaitressScreens - filtered orders:", pendingOrders.filter(order => order.waitress === loggedInUser).length);

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
    const filteredOrders = pendingOrders.filter(order => order.waitress === loggedInUser);
    console.log("Showing pending orders screen with:", filteredOrders.length, "orders");
    
    return (
      <PendingOrdersScreen
        orders={filteredOrders}
        onBack={() => setShowPendingOrders(false)}
        onOrderComplete={(order, type) => {
          console.log("Order complete called with type:", type);
          handleOrderCompleteWithType(order, type);
        }}
        onOrderCancel={handleOrderCancelWithType}
        setPendingOrders={setPendingOrders}
      />
    );
  }

  return (
    <WaitressHomeScreen
      loggedInUser={loggedInUser}
      handleLogout={handleLogout}
      handleNewOrder={() => setCurrentScreen('table')}
      setShowPendingOrders={setShowPendingOrders}
      setShowCompletedOrders={setShowCompletedOrders}
      pendingNotifications={pendingNotifications.filter(order => order.waitress === loggedInUser)}
      onNotificationAcknowledge={handleNotificationAcknowledge}
      pendingOrders={pendingOrders.filter(order => order.waitress === loggedInUser)}
      onOrderComplete={handleOrderCompleteWithType}
      onOrderCancel={handleOrderCancelWithType}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    />
  );
};

const RestaurantApp: React.FC = () => {
  const [tableNumber, setTableNumber] = useState('');
  const [tableComment, setTableComment] = useState('');
  const [order, setOrder] = useState<Omit<Order, 'waitress' | 'id' | 'status' | 'createdAt'>>({
    table: '',
    drinks: [],
    meals: []
  });
  const [tempMeals, setTempMeals] = useState<MenuItem[]>([]);
  const [cookingOptions, setCookingOptions] = useState<string[]>(DEFAULT_COOKING_OPTIONS);

  useEffect(() => {
    const unsubscribe = onValue(cookingOptionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCookingOptions(data);
      } else {
        const savedOptions = localStorage.getItem('cookingOptions');
        if (savedOptions) {
          try {
            const parsedOptions = JSON.parse(savedOptions);
            setCookingOptions(parsedOptions);
          } catch (e) {
            console.error("Error parsing cookingOptions from localStorage:", e);
            setCookingOptions(DEFAULT_COOKING_OPTIONS);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const {
    currentScreen,
    setCurrentScreen,
    loggedInUser,
    setLoggedInUser,
    showPendingOrders,
    setShowPendingOrders,
    showCompletedOrders,
    setShowCompletedOrders,
    darkMode,
    toggleDarkMode
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

  const handleSetLoggedInUser = (user: string | null) => {
    if (user === null) {
      setLoggedInUser(null);
    } else {
      setLoggedInUser(user as UserRole);
    }
  };

  const {
    handleLogin,
    handleLogout,
    handleSubmitOrder,
    handleNotificationAcknowledge,
    handleOrderCompleteWithType,
    handleOrderCancelWithType
  } = useOrderHandlers({
    loggedInUser: loggedInUser || '',
    setLoggedInUser: handleSetLoggedInUser,
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
    setCompletedOrders
  });

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentScreen === 'waitress' && loggedInUser) {
    return (
      <WaitressScreens
        loggedInUser={loggedInUser}
        showCompletedOrders={showCompletedOrders}
        showPendingOrders={showPendingOrders}
        completedOrders={completedOrders}
        pendingOrders={pendingOrders}
        pendingNotifications={pendingNotifications}
        handleLogout={handleLogout}
        setCurrentScreen={setCurrentScreen}
        setShowPendingOrders={setShowPendingOrders}
        setShowCompletedOrders={setShowCompletedOrders}
        handleNotificationAcknowledge={handleNotificationAcknowledge}
        handleOrderCompleteWithType={handleOrderCompleteWithType}
        handleOrderCancelWithType={handleOrderCancelWithType}
        setPendingOrders={setPendingOrders}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  const screenMap: Record<ScreenType, React.ReactNode> = {
    login: null,
    waitress: null,
    table: (
      <TableInputScreen 
        handleLogout={handleLogout}
        setTableNumber={setTableNumber}
        setTableComment={setTableComment}
        setCurrentScreen={setCurrentScreen}
      />
    ),
    category: (
      <CategoryMenuScreen 
        tableNumber={tableNumber}
        handleLogout={handleLogout}
        setCurrentScreen={setCurrentScreen}
      />
    ),
    boissons: (
      <DrinkMenuScreen 
        tableNumber={tableNumber}
        drinksMenu={drinksMenu}
        setDrinksMenu={setDrinksMenu}
        setCurrentScreen={setCurrentScreen}
        setOrder={setOrder}
      />
    ),
    repas: (
      <MealMenuScreen 
        tableNumber={tableNumber}
        mealsMenu={mealsMenu}
        setMealsMenu={setMealsMenu}
        tempMeals={tempMeals}
        setTempMeals={setTempMeals}
        setCurrentScreen={setCurrentScreen}
        setOrder={setOrder}
      />
    ),
    recap: (
      <RecapOrderScreen 
        tableNumber={tableNumber}
        order={order}
        handleSubmitOrder={handleSubmitOrder}
        setCurrentScreen={setCurrentScreen}
      />
    ),
    splitPayment: (
      <SplitPaymentScreen 
        tableNumber={tableNumber}
        order={order}
        setCurrentScreen={setCurrentScreen}
      />
    ),
    cuisine: (
      <CuisineScreen 
        pendingOrders={pendingOrders}
        completedOrders={completedOrders}
        setPendingOrders={setPendingOrders}
        setCompletedOrders={setCompletedOrders}
        onLogout={handleLogout}
        onOrderReady={handleOrderReady}
      />
    ),
    admin: (
      <AdminScreen 
        onLogout={handleLogout}
        setLoggedInUser={handleSetLoggedInUser}
        setCurrentScreen={(screen: ScreenType) => setCurrentScreen(screen)}
        cookingOptions={cookingOptions}
        setCookingOptions={setCookingOptions}
      />
    )
  };

  return screenMap[currentScreen] || null;
};

export default RestaurantApp;

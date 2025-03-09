import { useState } from 'react';
import type { ScreenType } from '../types/restaurant';

export const useScreenManagement = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [loggedInUser, setLoggedInUser] = useState<'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin' | null>(null);
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  const [showCompletedOrders, setShowCompletedOrders] = useState(false);

  return {
    currentScreen,
    setCurrentScreen,
    loggedInUser,
    setLoggedInUser,
    showPendingOrders,
    setShowPendingOrders,
    showCompletedOrders,
    setShowCompletedOrders
  };
};

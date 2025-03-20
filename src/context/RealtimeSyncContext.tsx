
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Order } from '../types/restaurant';
import { toast } from "@/hooks/use-toast";

interface RealtimeSyncContextType {
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  isInitialized: boolean;
}

const RealtimeSyncContext = createContext<RealtimeSyncContextType | undefined>(undefined);

export const RealtimeSyncProvider: React.FC<{ 
  children: ReactNode,
  pendingOrders: Order[],
  setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  completedOrders: Order[],
  setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>
}> = ({ 
  children, 
  pendingOrders,
  setPendingOrders,
  completedOrders,
  setCompletedOrders
}) => {
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Check network status on mount
  useEffect(() => {
    const handleOnline = () => {
      if (isOfflineMode) {
        toast({
          title: "Online",
          description: "Network connection restored. Click to synchronize.",
          action: {
            label: "Sync Now",
            onClick: () => toggleOfflineMode()
          }
        });
      }
    };

    const handleOffline = () => {
      setIsOfflineMode(true);
      toast({
        title: "Offline",
        description: "Network connection lost. Working in offline mode."
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initialized after first render
    setIsInitialized(true);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOfflineMode]);
  
  const toggleOfflineMode = () => {
    setIsOfflineMode(prev => {
      const newMode = !prev;
      
      if (newMode) {
        // Switching to offline mode - save current state
        localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        toast({
          title: "Offline Mode Activated",
          description: "Changes will be saved locally but not synced with the server."
        });
      } else {
        // Switching to online mode - trigger sync notification
        toast({
          title: "Online Mode Activated",
          description: "Application is now connected to the server."
        });
      }
      
      return newMode;
    });
  };

  return (
    <RealtimeSyncContext.Provider
      value={{
        isOfflineMode,
        toggleOfflineMode,
        isInitialized
      }}
    >
      {children}
    </RealtimeSyncContext.Provider>
  );
};

export const useRealtimeSync = () => {
  const context = useContext(RealtimeSyncContext);
  if (context === undefined) {
    throw new Error('useRealtimeSync must be used within a RealtimeSyncProvider');
  }
  return context;
};

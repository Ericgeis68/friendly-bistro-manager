
import { useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue, off, DatabaseReference } from "firebase/database";
import { toast } from "@/hooks/use-toast";

interface UseFirebaseRealtimeProps {
  path: string;
  onValueChange: (data: any) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

export const useFirebaseRealtime = ({
  path,
  onValueChange,
  onError,
  disabled = false
}: UseFirebaseRealtimeProps) => {
  const dbRefState = useRef<DatabaseReference | null>(null);
  const lastDataRef = useRef<any>(null);

  useEffect(() => {
    if (disabled) {
      console.log(`Firebase realtime listener disabled for ${path}`);
      return;
    }

    console.log(`Setting up Firebase realtime listener for ${path}`);
    const dbRef = ref(db, path);
    dbRefState.current = dbRef;
    
    try {
      // Listen for real-time changes
      const unsubscribe = onValue(
        dbRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log(`Data received for ${path}:`, Object.keys(data).length, "items");
            
            // Compare with last data to prevent unnecessary updates
            const dataString = JSON.stringify(data);
            const lastDataString = JSON.stringify(lastDataRef.current);
            
            if (dataString !== lastDataString) {
              lastDataRef.current = data;
              onValueChange(data);
            } else {
              console.log(`No changes in data for ${path}`);
            }
          } else {
            console.log(`No data available for ${path}`);
            onValueChange(null);
          }
        },
        (error) => {
          console.error(`Error listening to ${path}:`, error);
          if (onError) onError(error);
          
          toast({
            title: "Connection Lost",
            description: "Real-time connection lost. The application is working in offline mode.",
            variant: "destructive"
          });
        }
      );

      // Cleanup subscription when component unmounts
      return () => {
        console.log(`Cleaning up Firebase realtime listener for ${path}`);
        if (dbRefState.current) {
          off(dbRefState.current);
        }
      };
    } catch (error) {
      console.error(`Error setting up Firebase listener for ${path}:`, error);
      if (onError) onError(error);
      return () => {};
    }
  }, [path, onValueChange, onError, disabled]);
};

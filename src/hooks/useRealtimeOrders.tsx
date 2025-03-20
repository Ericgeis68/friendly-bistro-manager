
import { useEffect } from 'react';
import { useFirebaseRealtime } from './useFirebaseRealtime';
import { toast } from "@/hooks/use-toast";
import type { Order, MenuItem } from '../types/restaurant';
import { db } from '../lib/firebase';
import { ref, get } from "firebase/database";
import { useRealtimeSync } from '../context/RealtimeSyncContext';

interface UseRealtimeOrdersProps {
  setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export const useRealtimeOrders = ({
  setPendingOrders,
  setCompletedOrders
}: UseRealtimeOrdersProps) => {
  const { isOfflineMode } = useRealtimeSync();

  // Function to process orders data from Firebase
  const processOrdersData = async (ordersData: any) => {
    try {
      if (!ordersData) {
        console.log("No orders data to process");
        return;
      }
      
      console.log("Processing orders data:", Object.keys(ordersData).length, "orders");
      const pendingOrdersArray: Order[] = [];
      const completedOrdersArray: Order[] = [];
      
      // Process each order sequentially
      for (const orderId in ordersData) {
        const orderData = ordersData[orderId];
        
        if (!orderData) {
          console.log(`Order ${orderId} has no data, skipping`);
          continue;
        }
        
        try {
          // Fetch order items
          const orderItemsRef = ref(db, `order_items/${orderId}`);
          const itemsSnapshot = await get(orderItemsRef);
          
          if (!itemsSnapshot.exists()) {
            console.log(`No items found for order ${orderId}`);
            continue;
          }
          
          const orderItems = itemsSnapshot.val();
          
          // Process drinks and meals
          const drinks: MenuItem[] = [];
          const meals: MenuItem[] = [];
          
          if (orderItems) {
            Object.values(orderItems).forEach((item: any) => {
              if (!item) return;
              
              const menuItem: MenuItem = {
                id: item.menu_item_id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                cooking: item.cooking
              };
              
              if (item.type === 'drink') {
                drinks.push(menuItem);
              } else if (item.type === 'meal') {
                meals.push(menuItem);
              }
            });
          }
          
          // Create Order object
          const order: Order = {
            id: orderId,
            table: orderData.table || 'Unknown',
            tableComment: orderData.table_comment,
            waitress: orderData.waitress || 'Unknown',
            drinks: drinks,
            meals: meals,
            status: orderData.status as "pending" | "ready" | "delivered" | "cancelled",
            drinksStatus: orderData.drinks_status as "pending" | "ready" | "delivered" | undefined,
            mealsStatus: orderData.meals_status as "pending" | "ready" | "delivered" | undefined,
            createdAt: orderData.created_at || Date.now()
          };
          
          // Add to appropriate array based on status
          if (order.status === 'pending' || order.status === 'ready') {
            pendingOrdersArray.push(order);
          } else if (order.status === 'delivered' || order.status === 'cancelled') {
            completedOrdersArray.push(order);
          }
        } catch (error) {
          console.error(`Error processing order ${orderId}:`, error);
        }
      }
      
      console.log(`Processed ${pendingOrdersArray.length} pending orders and ${completedOrdersArray.length} completed orders`);
      
      // Update state with all processed orders
      setPendingOrders(pendingOrdersArray);
      setCompletedOrders(completedOrdersArray);
      
    } catch (error) {
      console.error("Error processing orders data:", error);
      toast({
        title: "Error",
        description: "Failed to process orders data",
        variant: "destructive"
      });
    }
  };

  // Use the Firebase realtime hook
  useFirebaseRealtime({
    path: 'orders',
    onValueChange: processOrdersData,
    onError: (error) => {
      console.error("Firebase realtime error:", error);
      toast({
        title: "Connection Error",
        description: "Connection to database lost. Working in offline mode.",
        variant: "destructive"
      });
    },
    disabled: isOfflineMode
  });
};

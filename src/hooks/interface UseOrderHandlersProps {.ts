interface UseOrderHandlersProps {
  // ... existing props ...
  completedOrders: Order[];
  setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}
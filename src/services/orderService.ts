import type { Order } from '../types/restaurant';

class OrderService {
  private static instance: OrderService;
  private wsConnection: WebSocket | null = null;
  private readonly LOCAL_STORAGE_KEY = 'restaurant_orders';

  private constructor() {
    this.initWebSocket();
    this.loadFromLocalStorage();
  }

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  private initWebSocket() {
    try {
      this.wsConnection = new WebSocket('ws://localhost:8080');
      
      this.wsConnection.onopen = () => {
        console.log('Connected to order server');
      };

      this.wsConnection.onmessage = (event) => {
        const order = JSON.parse(event.data);
        this.handleNewOrder(order);
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket server:', error);
    }
  }

  private handleNewOrder(order: Order) {
    // Implémenter la logique de mise à jour de l'interface
    const event = new CustomEvent('newOrder', { detail: order });
    window.dispatchEvent(event);
  }

  public sendOrder(order: Order) {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(order));
    } else {
      console.error('WebSocket is not connected');
    }
    this.saveToLocalStorage(order);
  }

  private saveToLocalStorage(order: Order) {
    try {
      const orders = this.getOrdersFromStorage();
      orders.push(order);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private loadFromLocalStorage() {
    try {
      const orders = this.getOrdersFromStorage();
      return orders;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return [];
    }
  }

  private getOrdersFromStorage(): Order[] {
    const ordersJson = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    return ordersJson ? JSON.parse(ordersJson) : [];
  }
}

export const orderService = OrderService.getInstance();
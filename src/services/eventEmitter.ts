
/**
 * Simple event emitter implementation for the sync service
 */
export class EventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  // Add event listener
  public addEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  // Remove event listener
  public removeEventListener(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners of an event
  protected notifyListeners(event: string, data: any): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event) || [];
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener`, error);
        }
      });
    }
  }
}

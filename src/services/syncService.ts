
import { io, Socket } from 'socket.io-client';
import { toast } from "@/hooks/use-toast";
import type { Order } from '../types/restaurant';
import { SyncMode, SyncStatus, ConnectionInfo, SyncServiceStatus, SyncEventData } from './types/syncTypes';
import { EventEmitter } from './eventEmitter';

class SyncService extends EventEmitter {
  private socket: Socket | null = null;
  private server: any = null;
  private mode: SyncMode = 'standalone';
  private status: SyncStatus = 'disconnected';
  private serverAddress: string = '';
  private deviceName: string = '';
  private connectedDevices: ConnectionInfo[] = [];
  private serverPort: number = 3000;

  constructor() {
    super();
    // Generate a unique device name if not set
    this.deviceName = localStorage.getItem('deviceName') || `Device-${Math.floor(Math.random() * 10000)}`;
    localStorage.setItem('deviceName', this.deviceName);
  }

  // Start the server mode
  public startServer(): Promise<boolean> {
    if (this.mode === 'server') {
      return Promise.resolve(true); // Already in server mode
    }

    // We're using a simple approach with socket.io-client for the demo
    // In a real implementation, you would use a proper server like Express with Socket.IO
    return new Promise((resolve) => {
      try {
        // For demo purposes, we're simulating a server
        this.mode = 'server';
        this.status = 'connected';
        this.connectedDevices = [{
          id: 'self',
          name: this.deviceName,
          timestamp: Date.now()
        }];
        
        // Store server mode in localStorage
        this._saveStateToLocalStorage();
        
        this._notifyStatusChange();
        
        toast({
          title: "Serveur activé",
          description: `Cet appareil fonctionne maintenant comme serveur central.`,
        });
        
        resolve(true);
      } catch (error) {
        console.error('Failed to start server', error);
        this.mode = 'standalone';
        this.status = 'error';
        
        this._notifyStatusChange(error);
        
        toast({
          title: "Erreur serveur",
          description: `Impossible de démarrer le serveur: ${error}`,
          variant: "destructive"
        });
        
        resolve(false);
      }
    });
  }

  // Connect to a server as a client
  public connectToServer(serverAddress: string): Promise<boolean> {
    if (this.mode === 'client' && this.status === 'connected' && this.serverAddress === serverAddress) {
      return Promise.resolve(true); // Already connected to this server
    }

    // Disconnect from any existing connection
    this.disconnect();

    return new Promise((resolve) => {
      try {
        // Connect to the server
        this.socket = io(`http://${serverAddress}:${this.serverPort}`);
        this.serverAddress = serverAddress;
        this.mode = 'client';
        this.status = 'connecting';
        
        this._notifyStatusChange();

        this.socket.on('connect', () => {
          this.status = 'connected';
          
          // Send device info to server
          this.socket.emit('register', { 
            name: this.deviceName,
            timestamp: Date.now()
          });
          
          // Store client mode in localStorage
          this._saveStateToLocalStorage();
          
          this._notifyStatusChange();
          
          toast({
            title: "Connecté au serveur",
            description: `Connecté au serveur ${serverAddress}`,
          });
          
          resolve(true);
        });

        this._setupSocketEventListeners(resolve);

      } catch (error) {
        console.error('Failed to connect to server', error);
        this.mode = 'standalone';
        this.status = 'error';
        
        this._notifyStatusChange(error);
        
        toast({
          title: "Erreur de connexion",
          description: `Impossible de se connecter au serveur: ${error}`,
          variant: "destructive"
        });
        
        resolve(false);
      }
    });
  }

  // Set up socket event listeners
  private _setupSocketEventListeners(resolvePromise: (value: boolean) => void): void {
    if (!this.socket) return;
    
    this.socket.on('disconnect', () => {
      this.status = 'disconnected';
      this._notifyStatusChange();
      
      toast({
        title: "Déconnecté",
        description: "Déconnecté du serveur",
        variant: "destructive"
      });
    });

    this.socket.on('connect_error', (error) => {
      this.status = 'error';
      this._notifyStatusChange(error);
      
      toast({
        title: "Erreur de connexion",
        description: `Impossible de se connecter au serveur: ${error.message}`,
        variant: "destructive"
      });
      
      resolvePromise(false);
    });

    // Listen for order updates
    this.socket.on('orderUpdate', (data) => {
      this.notifyListeners('orderUpdate', data);
    });

    // Listen for connected devices updates
    this.socket.on('devicesUpdate', (devices) => {
      this.connectedDevices = devices;
      this.notifyListeners('devicesUpdate', devices);
    });
  }

  // Save state to localStorage
  private _saveStateToLocalStorage(): void {
    if (this.mode === 'server') {
      localStorage.setItem('syncMode', 'server');
      localStorage.setItem('serverAddress', window.location.hostname);
    } else if (this.mode === 'client') {
      localStorage.setItem('syncMode', 'client');
      localStorage.setItem('serverAddress', this.serverAddress);
    }
  }

  // Notify status change
  private _notifyStatusChange(error?: any): void {
    const data: SyncEventData = { 
      mode: this.mode, 
      status: this.status
    };
    
    if (this.serverAddress) {
      data.serverAddress = this.serverAddress;
    }
    
    if (this.connectedDevices.length > 0) {
      data.devices = this.connectedDevices;
    }
    
    if (error) {
      data.error = error;
    }
    
    this.notifyListeners('statusChange', data);
  }

  // Disconnect from server or stop being a server
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    if (this.server) {
      // Close server if it's running
      this.server = null;
    }

    this.mode = 'standalone';
    this.status = 'disconnected';
    this.connectedDevices = [];
    
    // Clear stored mode
    localStorage.removeItem('syncMode');
    localStorage.removeItem('serverAddress');
    
    this._notifyStatusChange();
    
    toast({
      title: "Déconnecté",
      description: "Mode autonome activé.",
    });
  }

  // Sync orders with other devices
  public syncOrders(pendingOrders: Order[], completedOrders: Order[]): void {
    if (this.mode === 'server') {
      // Server broadcasts to all clients
      // In a real implementation, this would use the actual server to broadcast
      this.notifyListeners('orderUpdate', { pendingOrders, completedOrders });
    } else if (this.mode === 'client' && this.socket && this.status === 'connected') {
      // Client sends to server
      this.socket.emit('orderUpdate', { pendingOrders, completedOrders });
    }
  }

  // Get current status
  public getStatus(): SyncServiceStatus {
    return {
      mode: this.mode,
      status: this.status,
      serverAddress: this.serverAddress,
      deviceName: this.deviceName,
      connectedDevices: this.connectedDevices
    };
  }

  // Set device name
  public setDeviceName(name: string): void {
    this.deviceName = name;
    localStorage.setItem('deviceName', name);
    
    // Update server if connected
    if (this.mode === 'client' && this.socket && this.status === 'connected') {
      this.socket.emit('updateName', { name });
    }
  }

  // Try to restore previous connection state on initialization
  public restorePreviousState(): void {
    const previousMode = localStorage.getItem('syncMode') as SyncMode | null;
    const serverAddress = localStorage.getItem('serverAddress') || '';
    
    if (previousMode === 'server') {
      this.startServer();
    } else if (previousMode === 'client' && serverAddress) {
      this.connectToServer(serverAddress);
    }
  }

  // Get connected devices count
  public getConnectedDevicesCount(): number {
    return this.connectedDevices.length;
  }
}

// Export a singleton instance
export const syncService = new SyncService();


// Types for synchronization
export type SyncMode = 'server' | 'client' | 'standalone';
export type SyncStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

// Interface for connection events
export interface ConnectionInfo {
  id: string;
  name?: string;
  timestamp: number;
}

export interface SyncServiceStatus {
  mode: SyncMode;
  status: SyncStatus;
  serverAddress: string;
  deviceName: string;
  connectedDevices: ConnectionInfo[];
}

export interface SyncEventData {
  mode?: SyncMode;
  status?: SyncStatus;
  serverAddress?: string;
  devices?: ConnectionInfo[];
  error?: any;
}

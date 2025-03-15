
import { useState, useEffect } from 'react';
import { syncService, SyncMode, SyncStatus, ConnectionInfo } from '../services/syncService';
import type { Order } from '../types/restaurant';

export const useSyncService = () => {
  const [syncMode, setSyncMode] = useState<SyncMode>(syncService.getStatus().mode);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncService.getStatus().status);
  const [serverAddress, setServerAddress] = useState<string>(syncService.getStatus().serverAddress);
  const [deviceName, setDeviceName] = useState<string>(syncService.getStatus().deviceName);
  const [connectedDevices, setConnectedDevices] = useState<ConnectionInfo[]>(syncService.getStatus().connectedDevices);

  // Synchronize orders
  const syncOrders = (pendingOrders: Order[], completedOrders: Order[]) => {
    syncService.syncOrders(pendingOrders, completedOrders);
  };

  // Start server
  const startServer = async () => {
    const success = await syncService.startServer();
    return success;
  };

  // Connect to server
  const connectToServer = async (address: string) => {
    const success = await syncService.connectToServer(address);
    return success;
  };

  // Disconnect
  const disconnect = () => {
    syncService.disconnect();
  };

  // Set device name
  const setDeviceNameSync = (name: string) => {
    syncService.setDeviceName(name);
    setDeviceName(name);
  };

  // Effect to listen for status changes
  useEffect(() => {
    const handleStatusChange = (data: any) => {
      setSyncMode(data.mode);
      setSyncStatus(data.status);
      if (data.serverAddress) {
        setServerAddress(data.serverAddress);
      }
      if (data.devices) {
        setConnectedDevices(data.devices);
      }
    };

    const handleDevicesUpdate = (devices: ConnectionInfo[]) => {
      setConnectedDevices(devices);
    };

    // Subscribe to status changes
    syncService.addEventListener('statusChange', handleStatusChange);
    syncService.addEventListener('devicesUpdate', handleDevicesUpdate);

    // Restore previous state from localStorage
    syncService.restorePreviousState();

    // Cleanup
    return () => {
      syncService.removeEventListener('statusChange', handleStatusChange);
      syncService.removeEventListener('devicesUpdate', handleDevicesUpdate);
    };
  }, []);

  return {
    syncMode,
    syncStatus,
    serverAddress,
    deviceName,
    connectedDevices,
    syncOrders,
    startServer,
    connectToServer,
    disconnect,
    setDeviceName: setDeviceNameSync,
    connectedDevicesCount: connectedDevices.length
  };
};

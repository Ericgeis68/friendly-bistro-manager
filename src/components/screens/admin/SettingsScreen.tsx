
import React, { useEffect } from 'react';
import { useSyncService } from '@/hooks/useSyncService';
import DeviceNameSection from './settings/DeviceNameSection';
import SyncStatusSection from './settings/SyncStatusSection';
import SyncActionsSection from './settings/SyncActionsSection';
import DangerZoneSection from './settings/DangerZoneSection';

interface SettingsScreenProps {
  serverIp: string;
  setServerIp: (ip: string) => void;
  connectedDevices: number;
  setConnectedDevices: (num: number) => void;
  resetApplication: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  setConnectedDevices, 
  resetApplication 
}) => {
  const {
    syncMode,
    syncStatus,
    serverAddress,
    deviceName,
    connectedDevices: syncConnectedDevices,
    startServer,
    connectToServer,
    disconnect,
    setDeviceName
  } = useSyncService();

  // Set the connected devices count from sync service
  useEffect(() => {
    setConnectedDevices(syncConnectedDevices.length);
  }, [syncConnectedDevices, setConnectedDevices]);

  return (
    <div className="p-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Paramètres</h2>
      <div className="bg-white rounded-xl p-6 shadow max-w-xl">
        {/* Nom de l'appareil */}
        <DeviceNameSection 
          deviceName={deviceName} 
          setDeviceName={setDeviceName} 
        />

        {/* Synchronisation */}
        <div className="mb-6">
          <h3 className="text-gray-700 text-sm font-medium mb-2">Synchronisation des appareils</h3>
          
          <SyncStatusSection 
            syncMode={syncMode}
            syncStatus={syncStatus}
            serverAddress={serverAddress}
            connectedDevices={syncConnectedDevices}
          />

          {/* Actions de synchronisation */}
          <SyncActionsSection 
            syncMode={syncMode}
            startServer={startServer}
            connectToServer={connectToServer}
            disconnect={disconnect}
          />
        </div>

        {/* Version de l'application */}
        <div className="mb-4">
          <h3 className="text-gray-700 text-sm font-medium mb-2">Version de l'application</h3>
          <p className="text-lg">1.0.0</p>
        </div>
        
        {/* Danger Zone */}
        <DangerZoneSection resetApplication={resetApplication} />
      </div>
    </div>
  );
};

export default SettingsScreen;

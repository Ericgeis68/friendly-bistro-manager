
import React from 'react';
import { Wifi, Cloud, WifiOff, Users, Server, Smartphone, AlertCircle } from 'lucide-react';
import { useSyncService } from '@/hooks/useSyncService';

interface SyncStatusSectionProps {
  showDetails?: boolean;
}

const SyncStatusSection: React.FC<SyncStatusSectionProps> = ({ showDetails = false }) => {
  const { 
    syncMode, 
    syncStatus, 
    connectedDevicesCount, 
    connectedDevices,
    deviceRole,
    error, 
    startSync 
  } = useSyncService();

  const getStatusColor = () => {
    if (syncStatus === 'connected') return 'text-green-500';
    if (syncStatus === 'connecting') return 'text-yellow-500';
    if (syncStatus === 'error') return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-700 text-sm font-medium">Synchronisation</h3>
        <div className={`flex items-center text-xs px-2 py-1 rounded ${
          syncMode === 'firebase' 
            ? 'bg-blue-100 text-blue-800' 
            : syncMode === 'local-wifi'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {syncMode === 'firebase' && <Cloud size={14} className="mr-1" />}
          {syncMode === 'local-wifi' && (
            deviceRole === 'server' 
              ? <Server size={14} className="mr-1" />
              : <Wifi size={14} className="mr-1" />
          )}
          {syncMode === 'standalone' && <WifiOff size={14} className="mr-1" />}
          <span>
            {syncMode === 'firebase' && 'Firebase'}
            {syncMode === 'local-wifi' && (deviceRole === 'server' ? 'Serveur WiFi' : 'Client WiFi')}
            {syncMode === 'standalone' && 'Autonome'}
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <span className="text-sm">Statut:</span>
            <div className={`ml-2 flex items-center ${getStatusColor()}`}>
              {syncStatus === 'connected' && <span className="text-sm">Connecté</span>}
              {syncStatus === 'connecting' && <span className="text-sm">Connexion en cours...</span>}
              {syncStatus === 'disconnected' && <span className="text-sm">Déconnecté</span>}
              {syncStatus === 'error' && <span className="text-sm">Erreur</span>}
            </div>
          </div>

          {connectedDevicesCount > 0 && (
            <div>
              <div className="flex items-center mb-1">
                <span className="text-sm">Appareils connectés:</span>
                <div className="ml-2 flex items-center">
                  <Users size={14} className="mr-1" />
                  <span className="text-sm">{connectedDevicesCount}</span>
                </div>
              </div>
              
              <div className="pl-2 space-y-1 text-xs">
                {connectedDevices.map(device => (
                  <div key={device.id} className="flex items-center py-1 px-2 bg-gray-50 rounded">
                    {device.role === 'server' ? (
                      <Server size={12} className="mr-1 text-blue-600" />
                    ) : (
                      <Smartphone size={12} className="mr-1 text-green-600" />
                    )}
                    <span>{device.name}</span>
                    {device.role === 'server' && (
                      <span className="ml-1 px-1 bg-blue-100 text-blue-800 rounded text-[10px]">
                        Serveur
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {syncStatus === 'error' && error && (
            <div className="flex items-start text-red-600">
              <AlertCircle size={14} className="mr-1 mt-0.5 flex-shrink-0" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {syncMode !== 'standalone' && syncStatus !== 'connected' && syncStatus !== 'connecting' && (
            <button 
              onClick={startSync}
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
            >
              Reconnexion
            </button>
          )}

          {syncMode === 'standalone' && (
            <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
              <p>Pour activer la synchronisation, allez dans Paramètres.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncStatusSection;

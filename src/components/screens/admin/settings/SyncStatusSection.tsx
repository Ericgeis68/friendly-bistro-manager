
import React from 'react';
import { SyncMode, SyncStatus, ConnectionInfo } from '@/services/types/syncTypes';

interface SyncStatusSectionProps {
  syncMode: SyncMode;
  syncStatus: SyncStatus;
  serverAddress: string;
  connectedDevices: ConnectionInfo[];
}

const SyncStatusSection: React.FC<SyncStatusSectionProps> = ({
  syncMode,
  syncStatus,
  serverAddress,
  connectedDevices
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <div className="flex items-center mb-2">
        <div className={`w-3 h-3 rounded-full mr-2 ${
          syncStatus === 'connected' ? 'bg-green-500' : 
          syncStatus === 'connecting' ? 'bg-yellow-500' : 
          syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
        }`}></div>
        <p className="text-sm font-medium">
          {syncMode === 'server' ? 'Mode serveur' : 
           syncMode === 'client' ? 'Mode client' : 'Mode autonome'}
          {syncStatus === 'connected' ? ' (Connecté)' : 
           syncStatus === 'connecting' ? ' (Connexion...)' : 
           syncStatus === 'error' ? ' (Erreur)' : ' (Déconnecté)'}
        </p>
      </div>
      
      {syncMode === 'server' && (
        <div className="text-sm mb-2">
          <p>Adresse du serveur: <span className="font-mono">{serverAddress || window.location.hostname}</span></p>
          <p>Appareils connectés: {connectedDevices.length}</p>
        </div>
      )}
      
      {syncMode === 'client' && syncStatus === 'connected' && (
        <div className="text-sm mb-2">
          <p>Connecté à: <span className="font-mono">{serverAddress}</span></p>
        </div>
      )}
    </div>
  );
};

export default SyncStatusSection;


import React from 'react';
import { ArrowLeft, Wifi, Server, WifiOff, Users } from 'lucide-react';
import { useSyncService } from '@/hooks/useSyncService';

interface HeaderProps {
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
  const { syncMode, syncStatus, connectedDevicesCount } = useSyncService();

  return (
    <div className="bg-green-500 p-4 text-white flex items-center justify-between">
      <div className="flex items-center">
        <button onClick={onBack} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Commandes en cours</h1>
      </div>
      <div className="flex items-center">
        {syncMode === 'server' && (
          <div className="flex items-center text-xs bg-green-600 px-2 py-1 rounded">
            <Server size={16} className="mr-1" />
            <span>Serveur</span>
            {connectedDevicesCount > 0 && (
              <div className="ml-1 flex items-center">
                <Users size={14} className="mr-1" />
                <span>{connectedDevicesCount}</span>
              </div>
            )}
          </div>
        )}
        {syncMode === 'client' && syncStatus === 'connected' && (
          <div className="flex items-center text-xs bg-blue-600 px-2 py-1 rounded">
            <Wifi size={16} className="mr-1" />
            <span>Connecté</span>
          </div>
        )}
        {syncMode === 'client' && syncStatus !== 'connected' && (
          <div className="flex items-center text-xs bg-red-600 px-2 py-1 rounded">
            <WifiOff size={16} className="mr-1" />
            <span>Déconnecté</span>
          </div>
        )}
        {syncMode === 'standalone' && (
          <div className="flex items-center text-xs bg-gray-600 px-2 py-1 rounded">
            <WifiOff size={16} className="mr-1" />
            <span>Autonome</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;

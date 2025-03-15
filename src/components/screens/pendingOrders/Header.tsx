
import React from 'react';
import { ArrowLeft, Wifi, Cloud, WifiOff, Users, Server, Smartphone } from 'lucide-react';
import { useSyncService } from '@/hooks/useSyncService';

interface HeaderProps {
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
  const { syncMode, syncStatus, connectedDevicesCount, deviceRole } = useSyncService();

  return (
    <div className="bg-green-500 p-4 text-white flex items-center justify-between">
      <div className="flex items-center">
        <button onClick={onBack} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Commandes en cours</h1>
      </div>
      
      <div className="flex items-center">
        {syncMode === 'firebase' && (
          <div className={`flex items-center text-xs ${
            syncStatus === 'connected' ? 'bg-blue-600' : 
            syncStatus === 'connecting' ? 'bg-yellow-600' : 
            'bg-red-600'
          } px-2 py-1 rounded`}>
            <Cloud size={16} className="mr-1" />
            <span>
              {syncStatus === 'connected' ? 'Firebase' : 
               syncStatus === 'connecting' ? 'Connexion...' : 
               'Hors ligne'}
            </span>
            {connectedDevicesCount > 0 && (
              <div className="ml-1 flex items-center">
                <Users size={14} className="mr-1" />
                <span>{connectedDevicesCount}</span>
              </div>
            )}
          </div>
        )}
        
        {syncMode === 'local-wifi' && (
          <div className={`flex items-center text-xs ${
            syncStatus === 'connected' ? 'bg-green-600' : 
            syncStatus === 'connecting' ? 'bg-yellow-600' : 
            'bg-red-600'
          } px-2 py-1 rounded`}>
            {deviceRole === 'server' ? (
              <Server size={16} className="mr-1" />
            ) : (
              <Wifi size={16} className="mr-1" />
            )}
            <span>
              {syncStatus === 'connected' 
                ? (deviceRole === 'server' ? 'Serveur WiFi' : 'Client WiFi') 
                : syncStatus === 'connecting' 
                  ? 'Connexion...' 
                  : 'Déconnecté'}
            </span>
            {connectedDevicesCount > 0 && (
              <div className="ml-1 flex items-center">
                <Users size={14} className="mr-1" />
                <span>{connectedDevicesCount}</span>
              </div>
            )}
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


import React from 'react';
import { Trash2, Server, Wifi, Cloud, WifiOff, Smartphone, Users, RefreshCw } from 'lucide-react';
import { useSyncService } from '@/hooks/useSyncService';
import type { SyncMode, DeviceRole } from '@/hooks/useSyncService';

interface SettingsScreenProps {
  resetApplication: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ resetApplication }) => {
  const { 
    syncMode, 
    setSyncMode,
    syncStatus, 
    serverIp, 
    setServerIp, 
    connectedDevicesCount,
    connectedDevices,
    deviceRole,
    setDeviceRole,
    deviceName,
    setDeviceName,
    error,
    startSync,
    stopSync,
    resetSync
  } = useSyncService();

  const handleSyncModeChange = (mode: SyncMode) => {
    setSyncMode(mode);
  };

  const handleDeviceRoleChange = (role: DeviceRole) => {
    setDeviceRole(role);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Paramètres</h2>
      <div className="bg-white rounded-xl p-6 shadow max-w-xl">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Synchronisation</h3>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Mode actuel: </span>
              <div className="ml-2 flex items-center">
                {syncMode === 'firebase' && (
                  <span className="flex items-center text-blue-700 text-sm">
                    <Cloud size={16} className="mr-1" /> Firebase
                  </span>
                )}
                {syncMode === 'local-wifi' && (
                  <span className="flex items-center text-green-700 text-sm">
                    {deviceRole === 'server' ? (
                      <><Server size={16} className="mr-1" /> Serveur WiFi Local</>
                    ) : (
                      <><Wifi size={16} className="mr-1" /> Client WiFi Local</>
                    )}
                  </span>
                )}
                {syncMode === 'standalone' && (
                  <span className="flex items-center text-gray-700 text-sm">
                    <WifiOff size={16} className="mr-1" /> Mode Autonome
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Statut: </span>
              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                syncStatus === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : syncStatus === 'connecting' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : syncStatus === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
              }`}>
                {syncStatus === 'connected' && 'Connecté'}
                {syncStatus === 'connecting' && 'Connexion en cours...'}
                {syncStatus === 'disconnected' && 'Déconnecté'}
                {syncStatus === 'error' && 'Erreur de connexion'}
              </span>
            </div>

            {syncMode !== 'standalone' && (
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Nom de cet appareil: </span>
                <span className="ml-2 text-sm">{deviceName}</span>
              </div>
            )}

            {syncMode !== 'standalone' && connectedDevicesCount > 0 && (
              <div>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Appareils connectés: </span>
                  <span className="ml-2 text-sm flex items-center">
                    <Users size={14} className="mr-1" /> {connectedDevicesCount}
                  </span>
                </div>
                
                <div className="mt-2 pl-2 space-y-1">
                  {connectedDevices.map(device => (
                    <div key={device.id} className="flex items-center text-xs py-1 px-2 bg-gray-100 rounded">
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

            {error && (
              <div className="text-red-600 text-sm mt-2">
                Erreur: {error}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-y-2">
              <label className="block text-gray-700 text-sm font-medium">Mode de synchronisation</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSyncModeChange('firebase')}
                  className={`p-2 rounded flex flex-col items-center justify-center text-sm ${
                    syncMode === 'firebase' 
                      ? 'bg-blue-100 border-2 border-blue-500 text-blue-700' 
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Cloud size={24} className="mb-1" />
                  <span>Firebase</span>
                </button>
                <button
                  onClick={() => handleSyncModeChange('local-wifi')}
                  className={`p-2 rounded flex flex-col items-center justify-center text-sm ${
                    syncMode === 'local-wifi' 
                      ? 'bg-green-100 border-2 border-green-500 text-green-700' 
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Wifi size={24} className="mb-1" />
                  <span>WiFi Local</span>
                </button>
                <button
                  onClick={() => handleSyncModeChange('standalone')}
                  className={`p-2 rounded flex flex-col items-center justify-center text-sm ${
                    syncMode === 'standalone' 
                      ? 'bg-gray-200 border-2 border-gray-500 text-gray-700' 
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <WifiOff size={24} className="mb-1" />
                  <span>Autonome</span>
                </button>
              </div>
            </div>

            {syncMode === 'local-wifi' && (
              <div className="mb-4 space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Rôle de cet appareil</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDeviceRoleChange('server')}
                      className={`p-3 rounded flex items-center text-sm ${
                        deviceRole === 'server' 
                          ? 'bg-blue-100 border-2 border-blue-500 text-blue-700' 
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Server size={20} className="mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Serveur</div>
                        <div className="text-xs">Cet appareil héberge les données</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeviceRoleChange('client')}
                      className={`p-3 rounded flex items-center text-sm ${
                        deviceRole === 'client' 
                          ? 'bg-green-100 border-2 border-green-500 text-green-700' 
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Smartphone size={20} className="mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Client</div>
                        <div className="text-xs">Se connecte à un serveur</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Nom de cet appareil
                  </label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={e => setDeviceName(e.target.value)}
                    className="w-full border rounded-md h-12 px-3"
                    placeholder="Tablette Salle"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ce nom sera visible par les autres appareils du réseau
                  </p>
                </div>

                {deviceRole === 'client' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Adresse IP du serveur
                    </label>
                    <input
                      type="text"
                      value={serverIp}
                      onChange={e => setServerIp(e.target.value)}
                      className="w-full border rounded-md h-12 px-3"
                      placeholder="192.168.1.1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Entrez l'adresse IP de l'appareil serveur sur votre réseau local
                    </p>
                  </div>
                )}

                {deviceRole === 'server' && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <div className="flex items-start">
                      <Server size={16} className="mr-2 mt-0.5 text-blue-700" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">Mode Serveur</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Les autres appareils doivent être configurés comme clients et utiliser 
                          l'adresse IP de cet appareil pour se connecter. Vérifiez l'adresse IP de cet 
                          appareil dans les paramètres réseau.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {syncMode === 'firebase' && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                <div className="flex items-start">
                  <Cloud size={16} className="mr-2 mt-0.5 text-blue-700" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Mode Firebase (Cloud)</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Tous les appareils se synchronisent via Internet avec Firebase.
                      Une connexion Internet est requise pour ce mode.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={startSync}
                disabled={syncStatus === 'connected' || syncMode === 'standalone' || (syncMode === 'local-wifi' && deviceRole === 'none')}
                className={`px-4 py-2 rounded-md text-white ${
                  syncStatus === 'connected' || syncMode === 'standalone' || (syncMode === 'local-wifi' && deviceRole === 'none')
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Démarrer la synchronisation
              </button>
              <button
                onClick={stopSync}
                disabled={syncStatus === 'disconnected'}
                className={`px-4 py-2 rounded-md text-white ${
                  syncStatus === 'disconnected'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Arrêter la synchronisation
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-gray-700 text-sm font-medium mb-2">Version de l'application</h3>
          <p className="text-lg">1.0.0</p>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <h3 className="text-red-600 text-lg font-medium mb-3">Zone dangereuse</h3>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-md border border-red-200">
              <p className="text-sm text-red-700 mb-2">
                Attention : Cette action va supprimer toutes les commandes en cours et terminées. 
                Les menus et options de cuisson seront conservés.
              </p>
              <button
                onClick={resetApplication}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md py-3 flex items-center justify-center"
              >
                <Trash2 size={20} className="mr-2" />
                Réinitialiser l'application
              </button>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
              <p className="text-sm text-orange-700 mb-2">
                Attention : Cette action va réinitialiser tous les paramètres de synchronisation.
              </p>
              <button
                onClick={resetSync}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-md py-3 flex items-center justify-center"
              >
                <RefreshCw size={20} className="mr-2" />
                Réinitialiser la synchronisation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;

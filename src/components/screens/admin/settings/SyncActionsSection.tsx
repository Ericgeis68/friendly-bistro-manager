
import React, { useState } from 'react';
import { Server, Wifi, X, RefreshCw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { SyncMode } from '@/services/types/syncTypes';

interface SyncActionsSectionProps {
  syncMode: SyncMode;
  startServer: () => Promise<boolean>;
  connectToServer: (address: string) => Promise<boolean>;
  disconnect: () => void;
}

const SyncActionsSection: React.FC<SyncActionsSectionProps> = ({
  syncMode,
  startServer,
  connectToServer,
  disconnect
}) => {
  const [tempServerAddress, setTempServerAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle server start
  const handleStartServer = async () => {
    await startServer();
  };

  // Handle client connection
  const handleConnectToServer = async () => {
    if (!tempServerAddress) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse IP valide.",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    const success = await connectToServer(tempServerAddress);
    setIsConnecting(false);
    
    if (success) {
      setTempServerAddress('');
    }
  };

  return (
    <div className="space-y-3">
      {syncMode === 'standalone' && (
        <>
          <button
            onClick={handleStartServer}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-3 flex items-center justify-center"
          >
            <Server size={20} className="mr-2" />
            Activer le mode serveur
          </button>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Se connecter à un serveur existant
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tempServerAddress}
                onChange={e => setTempServerAddress(e.target.value)}
                placeholder="Adresse IP du serveur"
                className="flex-1 border rounded-md h-12 px-3"
              />
              <button
                onClick={handleConnectToServer}
                disabled={isConnecting}
                className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 flex items-center justify-center disabled:opacity-50"
              >
                {isConnecting ? <RefreshCw size={20} className="animate-spin" /> : <Wifi size={20} />}
              </button>
            </div>
          </div>
        </>
      )}
      
      {(syncMode === 'server' || syncMode === 'client') && (
        <button
          onClick={disconnect}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-md py-3 flex items-center justify-center"
        >
          <X size={20} className="mr-2" />
          Désactiver la synchronisation
        </button>
      )}
    </div>
  );
};

export default SyncActionsSection;

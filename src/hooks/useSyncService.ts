
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

export type SyncMode = 'standalone' | 'firebase' | 'local-wifi';
export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type DeviceRole = 'server' | 'client' | 'none';

interface ConnectedDevice {
  id: string;
  name: string;
  role: DeviceRole;
  lastSeen: number;
}

interface UseSyncServiceReturn {
  syncMode: SyncMode;
  syncStatus: SyncStatus;
  serverIp: string;
  setServerIp: (ip: string) => void;
  setSyncMode: (mode: SyncMode) => void;
  connectedDevicesCount: number;
  connectedDevices: ConnectedDevice[];
  deviceRole: DeviceRole;
  setDeviceRole: (role: DeviceRole) => void;
  deviceName: string;
  setDeviceName: (name: string) => void;
  error: string | null;
  startSync: () => void;
  stopSync: () => void;
  resetSync: () => void;
}

// Generate a unique device ID if none exists
const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Cette fonction sera utilisée pour simuler la synchronisation
// Dans une implémentation complète, elle serait remplacée par la vraie logique de synchronisation
const useSyncService = (): UseSyncServiceReturn => {
  const [syncMode, setSyncMode] = useState<SyncMode>(() => {
    const savedMode = localStorage.getItem('syncMode');
    return (savedMode as SyncMode) || 'standalone';
  });
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('disconnected');
  const [serverIp, setServerIp] = useState(() => {
    return localStorage.getItem('serverIp') || '192.168.1.1';
  });
  const [deviceRole, setDeviceRole] = useState<DeviceRole>(() => {
    return (localStorage.getItem('deviceRole') as DeviceRole) || 'none';
  });
  const [deviceName, setDeviceName] = useState(() => {
    return localStorage.getItem('deviceName') || `Appareil ${Math.floor(Math.random() * 1000)}`;
  });
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Computed property for connected devices count
  const connectedDevicesCount = connectedDevices.length;

  // Persister les paramètres dans localStorage
  useEffect(() => {
    localStorage.setItem('syncMode', syncMode);
  }, [syncMode]);

  useEffect(() => {
    localStorage.setItem('serverIp', serverIp);
  }, [serverIp]);

  useEffect(() => {
    localStorage.setItem('deviceRole', deviceRole);
  }, [deviceRole]);

  useEffect(() => {
    localStorage.setItem('deviceName', deviceName);
  }, [deviceName]);

  // Simulation de la connexion/déconnexion
  useEffect(() => {
    if (syncMode === 'standalone') {
      setSyncStatus('disconnected');
      setConnectedDevices([]);
      setError(null);
      return;
    }
    
    // Réinitialiser l'état lors du changement de mode
    setSyncStatus('connecting');
    setError(null);
    
    // Simulation d'une tentative de connexion
    const timeout = setTimeout(() => {
      // Pour la démonstration, simulons une connexion réussie pour Firebase
      // et un échec aléatoire pour WiFi local
      if (syncMode === 'firebase') {
        setSyncStatus('connected');
        // Simuler des appareils connectés
        const simulatedDevices: ConnectedDevice[] = [
          {
            id: getDeviceId(),
            name: deviceName,
            role: deviceRole,
            lastSeen: Date.now()
          }
        ];
        
        // Add some fake devices
        if (Math.random() > 0.3) {
          simulatedDevices.push({
            id: 'device_fake_1',
            name: 'Tablette Accueil',
            role: 'client',
            lastSeen: Date.now()
          });
        }
        
        if (Math.random() > 0.5) {
          simulatedDevices.push({
            id: 'device_fake_2',
            name: 'Tablette Cuisine',
            role: 'client',
            lastSeen: Date.now()
          });
        }
        
        setConnectedDevices(simulatedDevices);
        
        toast({
          title: "Synchronisation Firebase activée",
          description: "Connexion au cloud établie avec succès.",
        });
      } else if (syncMode === 'local-wifi') {
        // Simuler une connexion réussie ou échouée de manière aléatoire
        const success = Math.random() > 0.3; // 70% de chance de succès
        
        if (success) {
          setSyncStatus('connected');
          
          // Simuler des appareils connectés pour le WiFi local
          const simulatedDevices: ConnectedDevice[] = [
            {
              id: getDeviceId(),
              name: deviceName,
              role: deviceRole,
              lastSeen: Date.now()
            }
          ];
          
          // If server, add some fake client devices
          if (deviceRole === 'server') {
            if (Math.random() > 0.3) {
              simulatedDevices.push({
                id: 'device_fake_3',
                name: 'Tablette Service',
                role: 'client',
                lastSeen: Date.now()
              });
            }
          } 
          // If client, add a fake server
          else if (deviceRole === 'client') {
            simulatedDevices.push({
              id: 'device_fake_server',
              name: 'Serveur Principal',
              role: 'server',
              lastSeen: Date.now()
            });
          }
          
          setConnectedDevices(simulatedDevices);
          
          toast({
            title: "Synchronisation WiFi local activée",
            description: deviceRole === 'server' 
              ? "Serveur WiFi démarré, en attente de clients." 
              : `Connexion établie avec ${serverIp}`,
          });
        } else {
          setSyncStatus('error');
          setError(deviceRole === 'server' 
            ? "Impossible de démarrer le serveur WiFi local" 
            : `Impossible de se connecter à ${serverIp}`);
          setConnectedDevices([]);
          toast({
            title: "Erreur de synchronisation",
            description: deviceRole === 'server' 
              ? "Impossible de démarrer le serveur WiFi local" 
              : `Impossible de se connecter à ${serverIp}`,
            variant: "destructive",
          });
        }
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [syncMode, serverIp, deviceRole, deviceName]);

  const startSync = () => {
    if (syncMode === 'standalone') {
      toast({
        title: "Mode autonome",
        description: "Activez Firebase ou WiFi local pour synchroniser.",
      });
      return;
    }
    
    if (syncMode === 'local-wifi' && deviceRole === 'none') {
      toast({
        title: "Rôle non défini",
        description: "Veuillez choisir si cet appareil est un serveur ou un client.",
        variant: "destructive",
      });
      return;
    }
    
    setSyncStatus('connecting');
    // La logique de connexion est déjà gérée par l'useEffect ci-dessus
  };

  const stopSync = () => {
    if (syncStatus === 'disconnected') return;
    
    setSyncStatus('disconnected');
    setConnectedDevices([]);
    
    toast({
      title: "Synchronisation désactivée",
      description: "L'application fonctionne maintenant en mode autonome.",
    });
  };

  const resetSync = () => {
    stopSync();
    setSyncMode('standalone');
    setServerIp('192.168.1.1');
    setDeviceRole('none');
    setDeviceName(`Appareil ${Math.floor(Math.random() * 1000)}`);
    setError(null);
    
    toast({
      title: "Paramètres de synchronisation réinitialisés",
      description: "Tous les paramètres ont été remis à zéro.",
    });
  };

  return {
    syncMode,
    syncStatus,
    serverIp,
    setServerIp,
    setSyncMode,
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
  };
};

export { useSyncService };

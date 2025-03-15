
import React, { useState } from 'react';
import { Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";

interface DeviceNameSectionProps {
  deviceName: string;
  setDeviceName: (name: string) => void;
}

const DeviceNameSection: React.FC<DeviceNameSectionProps> = ({ 
  deviceName, 
  setDeviceName 
}) => {
  const [editingName, setEditingName] = useState(false);
  const [tempDeviceName, setTempDeviceName] = useState(deviceName);

  // Handle device name change
  const handleSaveDeviceName = () => {
    if (tempDeviceName.trim()) {
      setDeviceName(tempDeviceName);
      setEditingName(false);
      toast({
        title: "Nom modifié",
        description: `L'appareil est maintenant nommé "${tempDeviceName}".`,
      });
    } else {
      toast({
        title: "Erreur",
        description: "Le nom de l'appareil ne peut pas être vide.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEditName = () => {
    setTempDeviceName(deviceName);
    setEditingName(false);
  };

  return (
    <div className="mb-6">
      <h3 className="text-gray-700 text-sm font-medium mb-2">Nom de l'appareil</h3>
      {editingName ? (
        <div className="flex space-x-2">
          <input
            type="text"
            value={tempDeviceName}
            onChange={e => setTempDeviceName(e.target.value)}
            className="flex-1 border rounded-md h-10 px-3"
            placeholder="Nom de l'appareil"
          />
          <Button 
            onClick={handleSaveDeviceName} 
            size="sm" 
            className="bg-green-500 hover:bg-green-600"
          >
            <Check size={18} />
          </Button>
          <Button 
            onClick={handleCancelEditName} 
            size="sm" 
            variant="outline"
          >
            <X size={18} />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-lg">{deviceName}</p>
          <Button 
            onClick={() => {
              setTempDeviceName(deviceName);
              setEditingName(true);
            }} 
            size="sm" 
            variant="outline"
          >
            <Edit size={18} className="mr-2" /> Modifier
          </Button>
        </div>
      )}
    </div>
  );
};

export default DeviceNameSection;

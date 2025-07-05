import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { supabaseHelpers } from '../../../utils/supabase';
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SettingsScreenProps {
  serverIp: string;
  setServerIp: (ip: string) => void;
  connectedDevices: number;
  setConnectedDevices: (num: number) => void;
  resetApplication: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  serverIp, 
  setServerIp, 
  connectedDevices, 
  setConnectedDevices, 
  resetApplication 
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleResetInitiate = () => {
    setShowConfirmDialog(true);
  };

  const handleResetCancel = () => {
    setShowConfirmDialog(false);
  };

  const handleResetConfirm = async () => {
    setShowConfirmDialog(false);
    setIsResetting(true);
    try {
      console.log("Suppression des commandes en cours...");
      
      await supabaseHelpers.resetAllData();
      
      toast({
        title: "Application réinitialisée",
        description: "Toutes les commandes ont été supprimées. Les menus et options de cuisson ont été conservés.",
      });
      
      // Call the provided resetApplication function to update local state
      resetApplication();
    } catch (error) {
      console.error("Error resetting application:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réinitialisation de l'application.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Paramètres</h2>
      <div className="bg-white rounded-xl p-6 shadow max-w-xl">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Adresse IP du serveur</label>
          <input
            type="text"
            value={serverIp}
            onChange={e => setServerIp(e.target.value)}
            className="w-full border rounded-md h-12 px-3"
          />
        </div>
        <div className="mb-4">
          <h3 className="text-gray-700 text-sm font-medium mb-2">Appareils connectés</h3>
          <p className="text-lg">{connectedDevices}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-gray-700 text-sm font-medium mb-2">Version de l'application</h3>
          <p className="text-lg">1.0.0</p>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <h3 className="text-red-600 text-lg font-medium mb-3">Zone dangereuse</h3>
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
            <p className="text-sm text-red-700">
              Attention : Cette action va supprimer toutes les commandes en cours et terminées. 
              Les menus et options de cuisson seront conservés.
            </p>
          </div>
          <button
            onClick={handleResetInitiate}
            disabled={isResetting}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md py-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={20} className="mr-2" />
            {isResetting ? "Réinitialisation en cours..." : "Réinitialiser l'application"}
          </button>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la réinitialisation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir réinitialiser l'application ? Cette action supprimera TOUTES les commandes en cours et terminées de tous les appareils et ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleResetCancel}>Annuler</Button>
            <Button variant="destructive" onClick={handleResetConfirm}>Réinitialiser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsScreen;

import React, { useState, useEffect } from 'react';
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
import { Switch } from "@/components/ui/switch"; // Import Switch component
import { Label } from "@/components/ui/label"; // Import Label component
import { useRestaurant } from '../../../context/RestaurantContext'; // Import useRestaurant
import { isLocalBackupSupported } from '../../../utils/localBackup';

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
  const { 
    localBackupEnabled,
    localBackupMealsEnabled,
    localBackupDrinksEnabled,
    saveLocalBackupSetting,
    saveLocalBackupMealsSetting,
    saveLocalBackupDrinksSetting,
    localBackupListening,
    setLocalBackupListening
  } = useRestaurant(); // Get settings from context

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

  const handleLocalBackupToggle = async (checked: boolean) => {
    await saveLocalBackupSetting(checked);
    
    if (checked) {
      // When enabling global backup, also enable both detailed options
      await saveLocalBackupMealsSetting(true);
      await saveLocalBackupDrinksSetting(true);
    } else {
      // When disabling global backup, also disable both detailed options
      await saveLocalBackupMealsSetting(false);
      await saveLocalBackupDrinksSetting(false);
    }
  };

  const handleLocalBackupMealsToggle = async (checked: boolean) => {
    await saveLocalBackupMealsSetting(checked);
  };

  const handleLocalBackupDrinksToggle = async (checked: boolean) => {
    await saveLocalBackupDrinksSetting(checked);
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Paramètres</h2>
      <div className="bg-white rounded-xl p-6 shadow max-w-xl">
        {/* The server IP input is removed as per user request */}
        {/*
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Adresse IP du serveur</label>
          <input
            type="text"
            value={serverIp}
            onChange={e => setServerIp(e.target.value)}
            className="w-full border rounded-md h-12 px-3"
          />
        </div>
        */}
        <div className="mb-4">
          <h3 className="text-gray-700 text-sm font-medium mb-2">Appareils connectés</h3>
          <p className="text-lg">{connectedDevices}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-gray-700 text-sm font-medium mb-2">Version de l'application</h3>
          <p className="text-lg">1.0.0</p>
        </div>


        {/* Local Backup Setting */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-gray-700 text-lg font-medium mb-3">Sauvegarde locale</h3>
          
          {/* Service d'écoute pour sauvegarde locale */}
          <div className="flex items-center justify-between space-x-2 mb-6 p-3 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex flex-col">
              <Label htmlFor="local-backup-listening" className="text-sm font-medium text-blue-700">
                Service d'écoute sauvegarde locale
              </Label>
              <p className="text-xs text-blue-600 mt-1">
                {localBackupListening ? "Actif - Écoute les nouvelles commandes" : "En pause - Aucune sauvegarde automatique"}
              </p>
            </div>
            <Switch
              id="local-backup-listening"
              checked={localBackupListening}
              onCheckedChange={setLocalBackupListening}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2 mb-4">
            <div className="flex flex-col">
              <Label htmlFor="local-backup" className="text-sm font-medium">
                Sauvegarde automatique (toutes commandes)
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                {isLocalBackupSupported() 
                  ? "Télécharge un fichier de sauvegarde pour chaque commande validée"
                  : "Non supporté par ce navigateur"
                }
              </p>
            </div>
            <Switch
              id="local-backup"
              checked={localBackupEnabled}
              onCheckedChange={handleLocalBackupToggle}
              disabled={!isLocalBackupSupported()}
            />
          </div>

          <div className="flex items-center justify-between space-x-2 mb-4">
            <div className="flex flex-col">
              <Label htmlFor="local-backup-meals" className="text-sm font-medium">
                Sauvegarde automatique repas uniquement
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                {isLocalBackupSupported() 
                  ? "Télécharge seulement les commandes de repas"
                  : "Non supporté par ce navigateur"
                }
              </p>
            </div>
            <Switch
              id="local-backup-meals"
              checked={localBackupMealsEnabled}
              onCheckedChange={handleLocalBackupMealsToggle}
              disabled={!isLocalBackupSupported()}
            />
          </div>

          <div className="flex items-center justify-between space-x-2 mb-4">
            <div className="flex flex-col">
              <Label htmlFor="local-backup-drinks" className="text-sm font-medium">
                Sauvegarde automatique boissons uniquement
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                {isLocalBackupSupported() 
                  ? "Télécharge seulement les commandes de boissons"
                  : "Non supporté par ce navigateur"
                }
              </p>
            </div>
            <Switch
              id="local-backup-drinks"
              checked={localBackupDrinksEnabled}
              onCheckedChange={handleLocalBackupDrinksToggle}
              disabled={!isLocalBackupSupported()}
            />
          </div>
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

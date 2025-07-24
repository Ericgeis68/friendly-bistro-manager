import React, { useState } from 'react';
import { useRestaurant } from '../../../context/RestaurantContext';
import { Switch } from '../../ui/switch';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from '@/hooks/use-toast';

const FloorPlanSettingsScreen: React.FC = () => {
  const { floorPlanSettings, saveFloorPlanSettings } = useRestaurant();
  const [localSettings, setLocalSettings] = useState(floorPlanSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveFloorPlanSettings(localSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(floorPlanSettings);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Paramètres du plan de salle
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Contrôlez la visibilité des options de plan de salle pour les serveuses
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Sélecteur de salle
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Permet aux serveuses de choisir entre différentes salles dans le TableInputScreen
                </p>
              </div>
              <Switch
                checked={localSettings.showRoomSelector}
                onCheckedChange={(checked) =>
                  setLocalSettings(prev => ({ ...prev, showRoomSelector: checked }))
                }
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Affichage du plan de salle
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Affiche le plan de salle visuel avec les tables dans le TableInputScreen
                  </p>
                </div>
                <Switch
                  checked={localSettings.showFloorPlan}
                  onCheckedChange={(checked) =>
                    setLocalSettings(prev => ({ ...prev, showFloorPlan: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Information importante
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc list-inside space-y-1">
                  <li>Si vous désactivez le sélecteur de salle, les serveuses ne pourront pas choisir entre différentes salles</li>
                  <li>Si vous désactivez l'affichage du plan, les serveuses ne verront pas le plan visuel mais pourront toujours saisir le numéro de table</li>
                  <li>L'affichage de la salle dans le récapitulatif de commande dépend de l'activation de ces options</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {hasChanges && (
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setLocalSettings(floorPlanSettings)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorPlanSettingsScreen;

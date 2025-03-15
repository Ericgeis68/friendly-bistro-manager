
import React from 'react';
import { Trash2 } from 'lucide-react';

interface DangerZoneSectionProps {
  resetApplication: () => void;
}

const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({ resetApplication }) => {
  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-red-600 text-lg font-medium mb-3">Zone dangereuse</h3>
      <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
        <p className="text-sm text-red-700">
          Attention : Cette action va supprimer toutes les commandes en cours et terminées. 
          Les menus et options de cuisson seront conservés.
        </p>
      </div>
      <button
        onClick={resetApplication}
        className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md py-3 flex items-center justify-center"
      >
        <Trash2 size={20} className="mr-2" />
        Réinitialiser l'application
      </button>
    </div>
  );
};

export default DangerZoneSection;

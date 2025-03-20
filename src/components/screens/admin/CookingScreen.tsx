import React from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';

interface CookingScreenProps {
  cookingOptions: string[];
  handleAddCookingOption: () => void;
  handleEditCookingOption: (option: string) => void;
  handleDeleteCookingOption: (option: string) => void;
}

const CookingScreen: React.FC<CookingScreenProps> = ({
  cookingOptions,
  handleAddCookingOption,
  handleEditCookingOption,
  handleDeleteCookingOption
}) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Gestion des Cuissons</h2>
        <button onClick={handleAddCookingOption} className="bg-blue-500 hover:bg-blue-600 text-white rounded-md p-2">
          <Plus size={20} className="mr-1" />
          Ajouter
        </button>
      </div>
      <div className="bg-white rounded-xl p-4 shadow">
        {cookingOptions.length > 0 ? (
          <div className="space-y-2">
            {cookingOptions.map((option) => (
              <div key={option} className="flex justify-between items-center p-3 border-b">
                <div className="font-medium">{option}</div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditCookingOption(option)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-md p-2"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteCookingOption(option)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-md p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Aucune option de cuisson disponible.
          </div>
        )}
      </div>
    </div>
  );
};

export default CookingScreen;

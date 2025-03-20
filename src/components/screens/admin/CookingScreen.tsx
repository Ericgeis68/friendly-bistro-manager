
import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';

// Update props interface to match what's being passed from AdminScreen
export interface CookingScreenProps {
  cookingOptions: string[];
  onAddOption: () => void;
  onEditOption: (option: string) => void;
  onDeleteOption: (option: string) => void;
}

const CookingScreen: React.FC<CookingScreenProps> = ({ 
  cookingOptions, 
  onAddOption, 
  onEditOption, 
  onDeleteOption 
}) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Options de cuisson</h1>
        <Button onClick={onAddOption} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {cookingOptions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucune option de cuisson disponible
          </div>
        ) : (
          <ul className="divide-y">
            {cookingOptions.map((option, index) => (
              <li key={index} className="p-4 flex justify-between items-center">
                <span>{option}</span>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onEditOption(option)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => onDeleteOption(option)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CookingScreen;

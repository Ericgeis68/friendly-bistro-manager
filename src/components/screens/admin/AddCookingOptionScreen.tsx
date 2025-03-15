
import React from 'react';
import { X } from 'lucide-react';

interface AddCookingOptionScreenProps {
  editCookingOption: string;
  newCookingOption: string;
  setNewCookingOption: (option: string) => void;
  handleSaveCookingOption: () => void;
  handleCancelCookingEdit: () => void;
}

const AddCookingOptionScreen: React.FC<AddCookingOptionScreenProps> = ({
  editCookingOption,
  newCookingOption,
  setNewCookingOption,
  handleSaveCookingOption,
  handleCancelCookingEdit
}) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">
          {editCookingOption ? 'Modifier la Cuisson' : 'Ajouter une Cuisson'}
        </h2>
        <button onClick={handleCancelCookingEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md p-2">
          <X size={20}/>
        </button>
      </div>
      <div className="bg-white rounded-xl p-6 shadow max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Nom de la cuisson</label>
          <input
            type="text"
            value={newCookingOption}
            onChange={e => setNewCookingOption(e.target.value)}
            className="w-full border rounded-md h-12 px-3"
            placeholder="Ex: BLEU, SAIGNANT, etc."
          />
          <p className="text-gray-500 text-xs mt-1">
            Le nom sera converti en majuscules.
          </p>
        </div>
        <button 
          onClick={handleSaveCookingOption} 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md h-12 text-lg"
          disabled={!newCookingOption.trim()}
        >
          {editCookingOption ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
};

export default AddCookingOptionScreen;

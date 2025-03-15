
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface CookingDialogProps {
  onSelect: (cooking: string) => void;
  options: string[];
  title: string;
  allowCustom?: boolean;
}

const CookingDialog: React.FC<CookingDialogProps> = ({ 
  onSelect, 
  options, 
  title,
  allowCustom = true 
}) => {
  const [customCooking, setCustomCooking] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCustomSubmit = () => {
    if (customCooking.trim()) {
      onSelect(customCooking.trim().toUpperCase());
      setCustomCooking('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4 text-gray-800">{title}</h2>
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option}
              className="w-full p-2 text-left hover:bg-gray-100 rounded"
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          ))}
          
          {allowCustom && !showCustomInput && (
            <button
              className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center text-blue-500"
              onClick={() => setShowCustomInput(true)}
            >
              <Plus size={18} className="mr-2" />
              Ajouter une cuisson personnalisée
            </button>
          )}
          
          {allowCustom && showCustomInput && (
            <div className="mt-4 space-y-2">
              <input
                type="text"
                value={customCooking}
                onChange={(e) => setCustomCooking(e.target.value)}
                placeholder="Entrez une cuisson personnalisée"
                className="w-full p-2 border rounded"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCustomSubmit}
                  className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  disabled={!customCooking.trim()}
                >
                  Ajouter
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomCooking('');
                  }}
                  className="flex-1 bg-gray-200 p-2 rounded hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookingDialog;

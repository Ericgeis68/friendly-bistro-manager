import React from 'react';

interface CookingDialogProps {
  onSelect: (cooking: string) => void;
  options: string[];
  title: string;
}

const CookingDialog: React.FC<CookingDialogProps> = ({ onSelect, options, title }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
        </div>
      </div>
    </div>
  );
};

export default CookingDialog;
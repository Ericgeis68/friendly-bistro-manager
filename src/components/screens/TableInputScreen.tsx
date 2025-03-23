
import React, { useState } from 'react';
import { Textarea } from "../ui/textarea";

interface TableInputScreenProps {
  handleLogout: () => void;
  setTableNumber: (table: string) => void;
  setTableComment: (comment: string) => void;
  setCurrentScreen: (screen: 'category') => void;
}

const TableInputScreen: React.FC<TableInputScreenProps> = ({
  handleLogout,
  setTableNumber,
  setTableComment,
  setCurrentScreen
}) => {
  const [localTableNumber, setLocalTableNumber] = useState('');
  const [localTableComment, setLocalTableComment] = useState('');
  const isDarkMode = document.documentElement.classList.contains('dark');

  const handleSubmit = () => {
    if (!localTableNumber || parseInt(localTableNumber) <= 0) {
      return;
    }
    setTableNumber(localTableNumber);
    setTableComment(localTableComment);
    setCurrentScreen('category');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`p-4 flex justify-between items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Numéro de table</div>
        <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
      </div>

      <div className="p-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow space-y-4`}>
          <input
            type="number"
            placeholder="Entrez le numéro"
            className={`w-full h-12 text-lg px-3 rounded-md border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800'}`}
            value={localTableNumber}
            onChange={(e) => setLocalTableNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Textarea
            placeholder="Commentaire sur la table (optionnel)"
            className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white text-gray-800'}`}
            value={localTableComment}
            onChange={(e) => setLocalTableComment(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableInputScreen;

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

  const handleSubmit = () => {
    if (!localTableNumber || parseInt(localTableNumber) <= 0) {
      return;
    }
    setTableNumber(localTableNumber);
    setTableComment(localTableComment);
    setCurrentScreen('category');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="text-lg font-medium text-gray-800">Numéro de table</div>
        <div onClick={handleLogout} className="text-blue-500 cursor-pointer">Déconnexion</div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-2xl p-6 shadow space-y-4">
          <input
            type="number"
            placeholder="Entrez le numéro"
            className="w-full h-12 text-lg px-3 rounded-md border border-gray-300 text-gray-800"
            value={localTableNumber}
            onChange={(e) => setLocalTableNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Textarea
            placeholder="Commentaire sur la table (optionnel)"
            className="w-full text-gray-800"
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
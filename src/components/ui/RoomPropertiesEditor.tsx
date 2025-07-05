import React, { useState } from 'react';
import { FloorPlan } from '../../types/floorPlan';
import { X, Save } from 'lucide-react';

interface RoomPropertiesEditorProps {
  floorPlan: FloorPlan;
  onSave: (updates: Partial<FloorPlan>) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

const RoomPropertiesEditor: React.FC<RoomPropertiesEditorProps> = ({
  floorPlan,
  onSave,
  onClose,
  isDarkMode
}) => {
  const [name, setName] = useState(floorPlan.name);
  const [width, setWidth] = useState(floorPlan.roomSize.width);
  const [height, setHeight] = useState(floorPlan.roomSize.height);
  const [gridSize, setGridSize] = useState(floorPlan.gridSize || 50); // Default to 50cm

  const handleSave = () => {
    onSave({
      name,
      roomSize: { width, height },
      gridSize
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg p-6 w-96 max-w-full mx-4`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Propriétés de la salle</h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-md hover:bg-gray-200 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom de la salle</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Largeur (cm)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min="200"
                max="2000"
                className={`w-full px-3 py-2 border rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hauteur (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min="200"
                max="2000"
                className={`w-full px-3 py-2 border rounded-md ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Taille de la grille (cm)</label>
            <select
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              <option value={50}>50cm</option>
              <option value={100}>100cm (1m)</option>
              <option value={150}>150cm (1.5m)</option>
              <option value={200}>200cm (2m)</option>
              <option value={250}>250cm (2.5m)</option>
              <option value={300}>300cm (3m)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <Save size={16} />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomPropertiesEditor;

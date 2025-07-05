import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { FloorPlanElement } from '../../types/floorPlan';

interface ElementPropertiesEditorProps {
  element: FloorPlanElement;
  onSave: (updates: Partial<FloorPlanElement>) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

const ElementPropertiesEditor: React.FC<ElementPropertiesEditorProps> = ({
  element,
  onSave,
  onClose,
  isDarkMode
}) => {
  const [properties, setProperties] = useState<Partial<FloorPlanElement>>(element);

  useEffect(() => {
    setProperties(element);
  }, [element]);

  const handleSave = () => {
    onSave(properties);
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setProperties(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setProperties(prev => ({
      ...prev,
      size: {
        ...prev.size!,
        [dimension]: Math.max(10, numValue)
      }
    }));
  };

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setProperties(prev => ({
      ...prev,
      position: {
        ...prev.position!,
        [axis]: Math.max(0, numValue)
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg p-6 w-96 max-w-90vw max-h-90vh overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Propriétés de l'élément</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Position */}
          <div>
            <label className="block text-sm font-medium mb-2">Position (cm)</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">X (cm)</label>
                <input
                  type="number"
                  value={properties.position?.x || 0}
                  onChange={(e) => handlePositionChange('x', e.target.value)}
                  className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Y (cm)</label>
                <input
                  type="number"
                  value={properties.position?.y || 0}
                  onChange={(e) => handlePositionChange('y', e.target.value)}
                  className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Taille */}
          <div>
            <label className="block text-sm font-medium mb-2">Taille (cm)</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Largeur (cm)</label>
                <input
                  type="number"
                  value={properties.size?.width || 200}
                  onChange={(e) => handleSizeChange('width', e.target.value)}
                  min="10"
                  className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hauteur (cm)</label>
                <input
                  type="number"
                  value={properties.size?.height || 80}
                  onChange={(e) => handleSizeChange('height', e.target.value)}
                  min="10"
                  className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          {/* Propriétés spécifiques */}
          {element.type === 'table' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Numéro de table</label>
                <input
                  type="text"
                  value={(properties as any).number || ''}
                  onChange={(e) => handleChange('number', e.target.value)}
                  className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nombre de places</label>
                <input
                  type="number"
                  value={(properties as any).seats || 4}
                  onChange={(e) => handleChange('seats', parseInt(e.target.value) || 4)}
                  min="1"
                  max="12"
                  className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Forme</label>
                <select
                  value={(properties as any).shape || 'rectangle'}
                  onChange={(e) => handleChange('shape', e.target.value)}
                  className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="rectangle">Rectangulaire</option>
                </select>
              </div>
            </>
          )}

          {(element.type === 'bar' || element.type === 'pillar' || element.type === 'stage' || element.type === 'wall' || element.type === 'dancefloor') && (
            <div>
              <label className="block text-sm font-medium mb-2">Nom</label>
              <input
                type="text"
                value={(properties as any).name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
          )}

          {element.type === 'wall' && (
            <div>
              <label className="block text-sm font-medium mb-2">Épaisseur (cm)</label>
              <input
                type="number"
                value={(properties as any).thickness || 10}
                onChange={(e) => handleChange('thickness', parseInt(e.target.value) || 10)}
                min="5"
                max="50"
                className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
          )}

          {element.type === 'pillar' && (
            <div>
              <label className="block text-sm font-medium mb-2">Forme</label>
              <select
                value={(properties as any).shape || 'round'}
                onChange={(e) => handleChange('shape', e.target.value)}
                className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              >
                <option value="round">Rond</option>
                <option value="square">Carré</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Save size={16} />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElementPropertiesEditor;

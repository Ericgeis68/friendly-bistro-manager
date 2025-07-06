
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
  
  // États séparés pour les valeurs d'affichage des champs de saisie
  const [widthDisplay, setWidthDisplay] = useState(element.size?.width?.toString() || '');
  const [heightDisplay, setHeightDisplay] = useState(element.size?.height?.toString() || '');
  const [xDisplay, setXDisplay] = useState(element.position?.x?.toString() || '');
  const [yDisplay, setYDisplay] = useState(element.position?.y?.toString() || '');

  useEffect(() => {
    setProperties(element);
    setWidthDisplay(element.size?.width?.toString() || '');
    setHeightDisplay(element.size?.height?.toString() || '');
    setXDisplay(element.position?.x?.toString() || '');
    setYDisplay(element.position?.y?.toString() || '');
  }, [element]);

  const handleChange = (field: string, value: any) => {
    setProperties(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: string) => {
    // Mettre à jour l'affichage immédiatement
    if (dimension === 'width') {
      setWidthDisplay(value);
    } else {
      setHeightDisplay(value);
    }

    // Si le champ est vide, ne pas mettre à jour les propriétés pour l'instant
    if (value === '') {
      return;
    }
    
    // Convertir en nombre et valider
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 10) {
      setProperties(prev => ({
        ...prev,
        size: {
          ...prev.size!,
          [dimension]: numValue
        }
      }));
    }
  };

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    // Mettre à jour l'affichage immédiatement
    if (axis === 'x') {
      setXDisplay(value);
    } else {
      setYDisplay(value);
    }

    // Si le champ est vide, ne pas mettre à jour les propriétés pour l'instant
    if (value === '') {
      return;
    }
    
    // Convertir en nombre et valider
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setProperties(prev => ({
        ...prev,
        position: {
          ...prev.position!,
          [axis]: numValue
        }
      }));
    }
  };

  // Fonction pour valider et corriger les valeurs avant la sauvegarde
  const validateAndSave = () => {
    const validatedProperties = { ...properties };
    
    // Valider et corriger la taille
    if (validatedProperties.size) {
      // Utiliser les valeurs d'affichage pour la validation finale
      const finalWidth = widthDisplay === '' ? 20 : parseInt(widthDisplay);
      const finalHeight = heightDisplay === '' ? 20 : parseInt(heightDisplay);
      
      validatedProperties.size.width = isNaN(finalWidth) || finalWidth < 10 ? 20 : finalWidth;
      validatedProperties.size.height = isNaN(finalHeight) || finalHeight < 10 ? 20 : finalHeight;
    }
    
    // Valider et corriger la position
    if (validatedProperties.position) {
      // Utiliser les valeurs d'affichage pour la validation finale
      const finalX = xDisplay === '' ? 0 : parseInt(xDisplay);
      const finalY = yDisplay === '' ? 0 : parseInt(yDisplay);
      
      validatedProperties.position.x = isNaN(finalX) || finalX < 0 ? 0 : finalX;
      validatedProperties.position.y = isNaN(finalY) || finalY < 0 ? 0 : finalY;
    }
    
    onSave(validatedProperties);
    onClose();
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
                  type="text"
                  value={xDisplay}
                  onChange={(e) => handlePositionChange('x', e.target.value)}
                  placeholder="0"
                  className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Y (cm)</label>
                <input
                  type="text"
                  value={yDisplay}
                  onChange={(e) => handlePositionChange('y', e.target.value)}
                  placeholder="0"
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
                  type="text"
                  value={widthDisplay}
                  onChange={(e) => handleSizeChange('width', e.target.value)}
                  placeholder="200"
                  className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hauteur (cm)</label>
                <input
                  type="text"
                  value={heightDisplay}
                  onChange={(e) => handleSizeChange('height', e.target.value)}
                  placeholder="150"
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
            onClick={validateAndSave}
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

import React from 'react';
import { Plus, Table, Coffee, Circle, Music, Minus, Square } from 'lucide-react';
import { ElementType } from '../../types/floorPlan';

interface FloorPlanToolbarProps {
  onAddElement: (type: ElementType) => void;
  selectedTool: ElementType | null;
  setSelectedTool: (tool: ElementType | null) => void;
  isDarkMode: boolean;
}

const FloorPlanToolbar: React.FC<FloorPlanToolbarProps> = ({
  onAddElement,
  selectedTool,
  setSelectedTool,
  isDarkMode
}) => {
  const tools = [
    { type: 'table' as ElementType, icon: Table, label: 'Table', color: 'bg-blue-500' },
    { type: 'bar' as ElementType, icon: Coffee, label: 'Bar', color: 'bg-orange-500' },
    { type: 'pillar' as ElementType, icon: Circle, label: 'Poteau', color: 'bg-gray-500' },
    { type: 'stage' as ElementType, icon: Music, label: 'Scène', color: 'bg-purple-500' },
    { type: 'wall' as ElementType, icon: Minus, label: 'Mur', color: 'bg-red-500' },
    { type: 'dancefloor' as ElementType, icon: Square, label: 'Piste', color: 'bg-green-500' }
  ];

  const handleToolClick = (type: ElementType) => {
    if (selectedTool === type) {
      setSelectedTool(null);
    } else {
      setSelectedTool(type);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`w-full text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Outils d'édition
      </h3>
      {tools.map(({ type, icon: Icon, label, color }) => (
        <button
          key={type}
          onClick={() => handleToolClick(type)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedTool === type
              ? `${color} text-white shadow-lg scale-105`
              : isDarkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}
      {selectedTool && (
        <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} w-full mt-2`}>
          Cliquez sur le plan pour ajouter un(e) {tools.find(t => t.type === selectedTool)?.label?.toLowerCase()}
        </div>
      )}
    </div>
  );
};

export default FloorPlanToolbar;

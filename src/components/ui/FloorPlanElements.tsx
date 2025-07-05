import React from 'react';
import { FloorPlanElement, Position, Size } from '../../types/floorPlan';
import { RotateCw } from 'lucide-react';

interface FloorPlanElementsProps {
  elements: FloorPlanElement[];
  selectedElement: string | null;
  onElementClick: (id: string) => void;
  onElementDoubleClick: (id: string) => void;
  onElementMouseDown: (id: string, e: React.MouseEvent) => void;
  onResizeMouseDown: (id: string, direction: string, e: React.MouseEvent) => void;
  onRotateMouseDown: (id: string, e: React.MouseEvent) => void;
  isDarkMode: boolean;
  tablesWithOrders?: string[];
  selectedTable?: string;
  scale?: number;
}

// Composant pour les poignées de redimensionnement
const ResizeHandle: React.FC<{ direction: string; onMouseDown: (e: React.MouseEvent) => void; isDarkMode: boolean; scale: number }> = ({ direction, onMouseDown, isDarkMode, scale }) => {
  const handleSize = Math.max(10, 10 / scale); // Taille minimum de 10px même avec échelle
  const style: React.CSSProperties = {
    position: 'absolute',
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    background: isDarkMode ? '#38bdf8' : '#38bdf8',
    border: `1px solid ${isDarkMode ? '#171717' : '#FFFFFF'}`,
    borderRadius: '2px',
    zIndex: 20,
  };

  const offset = handleSize / 2;

  switch (direction) {
    case 'nw': style.top = `-${offset}px`; style.left = `-${offset}px`; style.cursor = 'nwse-resize'; break;
    case 'n': style.top = `-${offset}px`; style.left = `calc(50% - ${offset}px)`; style.cursor = 'ns-resize'; break;
    case 'ne': style.top = `-${offset}px`; style.right = `-${offset}px`; style.cursor = 'nesw-resize'; break;
    case 'e': style.top = `calc(50% - ${offset}px)`; style.right = `-${offset}px`; style.cursor = 'ew-resize'; break;
    case 'se': style.bottom = `-${offset}px`; style.right = `-${offset}px`; style.cursor = 'nwse-resize'; break;
    case 's': style.bottom = `-${offset}px`; style.left = `calc(50% - ${offset}px)`; style.cursor = 'ns-resize'; break;
    case 'sw': style.bottom = `-${offset}px`; style.left = `-${offset}px`; style.cursor = 'nesw-resize'; break;
    case 'w': style.top = `calc(50% - ${offset}px)`; style.left = `-${offset}px`; style.cursor = 'ew-resize'; break;
  }

  return <div className="resize-handle" style={style} onMouseDown={onMouseDown} />;
};

// Nouveau composant pour la poignée de rotation
const RotationHandle: React.FC<{ onMouseDown: (e: React.MouseEvent) => void; isDarkMode: boolean; scale: number }> = ({ onMouseDown, isDarkMode, scale }) => {
  const handleSize = Math.max(20, 20 / scale);
  const iconSize = Math.max(12, 12 / scale);
  
  const style: React.CSSProperties = {
    position: 'absolute',
    bottom: `-${handleSize + 5}px`,
    left: `calc(50% - ${handleSize / 2}px)`,
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    background: isDarkMode ? '#f472b6' : '#f472b6',
    border: `1px solid ${isDarkMode ? '#171717' : '#FFFFFF'}`,
    borderRadius: '50%',
    cursor: 'grab',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 5px ${isDarkMode ? 'rgba(244, 114, 182, 0.5)' : 'rgba(244, 114, 182, 0.7)'}`
  };
  
  return (
    <div className="rotation-handle" style={style} onMouseDown={onMouseDown}>
      <RotateCw size={iconSize} className={isDarkMode ? 'text-white' : 'text-gray-800'} />
    </div>
  );
};

const FloorPlanElements: React.FC<FloorPlanElementsProps> = ({
  elements,
  selectedElement,
  onElementClick,
  onElementDoubleClick,
  onElementMouseDown,
  onResizeMouseDown,
  onRotateMouseDown,
  isDarkMode,
  tablesWithOrders = [],
  selectedTable,
  scale = 1
}) => {
  const getElementStyle = (element: FloorPlanElement) => {
    const isSelected = selectedElement === element.id;
    let baseStyle = 'absolute cursor-pointer transition-all duration-200 border-2 flex items-center justify-center font-bold text-xs ';
    
    // Styles spécifiques par type d'élément
    switch (element.type) {
      case 'table':
        const tableElement = element as any;
        const isTableSelected = selectedTable === tableElement.number;
        const hasOrders = tablesWithOrders.includes(tableElement.number);
        
        if (isTableSelected) {
          baseStyle += isDarkMode 
            ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/50' 
            : 'bg-blue-500 border-blue-300 text-white shadow-lg shadow-blue-500/50';
        } else if (hasOrders) {
          baseStyle += isDarkMode 
            ? 'bg-yellow-600 border-yellow-400 text-white hover:bg-yellow-500' 
            : 'bg-yellow-400 border-yellow-300 text-gray-800 hover:bg-yellow-300';
        } else if (isSelected) {
          baseStyle += 'bg-green-500 border-green-300 text-white shadow-lg';
        } else {
          baseStyle += isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
            : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50';
        }
        
        // Toutes les tables sont maintenant rectangulaires
        baseStyle += ' rounded-lg';
        break;
        
      case 'bar':
        baseStyle += isSelected 
          ? 'bg-orange-600 border-orange-400 text-white shadow-lg'
          : isDarkMode
          ? 'bg-orange-700 border-orange-600 text-white hover:bg-orange-600'
          : 'bg-orange-500 border-orange-400 text-white hover:bg-orange-400';
        baseStyle += ' rounded-lg';
        break;
        
      case 'pillar':
        const pillarElement = element as any;
        baseStyle += isSelected 
          ? 'bg-gray-600 border-gray-400 text-white shadow-lg'
          : isDarkMode
          ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
          : 'bg-gray-400 border-gray-300 text-white hover:bg-gray-300';
        
        if (pillarElement.shape === 'round') {
          baseStyle += ' rounded-full';
        } else {
          baseStyle += ' rounded-lg';
        }
        break;
        
      case 'stage':
        baseStyle += isSelected 
          ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
          : isDarkMode
          ? 'bg-purple-700 border-purple-600 text-white hover:bg-purple-600'
          : 'bg-purple-500 border-purple-400 text-white hover:bg-purple-400';
        baseStyle += ' rounded-lg';
        break;
        
      case 'wall':
        baseStyle += isSelected 
          ? 'bg-red-600 border-red-400 text-white shadow-lg'
          : isDarkMode
          ? 'bg-red-700 border-red-600 text-white hover:bg-red-600'
          : 'bg-red-500 border-red-400 text-white hover:bg-red-400';
        baseStyle += ' rounded-sm';
        break;
        
      case 'dancefloor':
        baseStyle += isSelected 
          ? 'bg-green-600 border-green-400 text-white shadow-lg'
          : isDarkMode
          ? 'bg-green-700 border-green-600 text-white hover:bg-green-600'
          : 'bg-green-500 border-green-400 text-white hover:bg-green-400';
        baseStyle += ' rounded-lg';
        break;
    }
    
    if (isSelected) {
      baseStyle += ' scale-105 z-10';
    }
    
    return baseStyle;
  };

  // Nouvelle fonction pour obtenir le contenu de l'élément
  const getElementContent = (element: FloorPlanElement) => {
    switch (element.type) {
      case 'table':
        return (element as any).number;
      case 'bar':
      case 'pillar':
      case 'stage':
      case 'dancefloor':
      case 'wall':
        return (element as any).name;
      default:
        return '';
    }
  };

  return (
    <>
      {elements.map((element) => {
        const isSelected = selectedElement === element.id;
        return (
          <div
            key={element.id}
            className={getElementStyle(element)}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
              fontSize: Math.max(10, 12 / scale) + 'px' // Ajuster la taille de police selon l'échelle
            }}
            onClick={() => onElementClick(element.id)}
            onDoubleClick={() => onElementDoubleClick(element.id)}
            onMouseDown={(e) => onElementMouseDown(element.id, e)}
          >
            {getElementContent(element)}
            {isSelected && (
              <>
                <ResizeHandle direction="nw" onMouseDown={(e) => onResizeMouseDown(element.id, 'nw', e)} isDarkMode={isDarkMode} scale={scale} />
                <ResizeHandle direction="n" onMouseDown={(e) => onResizeMouseDown(element.id, 'n', e)} isDarkMode={isDarkMode} scale={scale} />
                <ResizeHandle direction="ne" onMouseDown={(e) => onResizeMouseDown(element.id, 'ne', e)} isDarkMode={isDarkMode} scale={scale} />
                <ResizeHandle direction="e" onMouseDown={(e) => onResizeMouseDown(element.id, 'e', e)} isDarkMode={isDarkMode} scale={scale} />
                <ResizeHandle direction="se" onMouseDown={(e) => onResizeMouseDown(element.id, 'se', e)} isDarkMode={isDarkMode} scale={scale} />
                <ResizeHandle direction="s" onMouseDown={(e) => onResizeMouseDown(element.id, 's', e)} isDarkMode={isDarkMode} scale={scale} />
                <ResizeHandle direction="sw" onMouseDown={(e) => onResizeMouseDown(element.id, 'sw', e)} isDarkMode={isDarkMode} scale={scale} />
                <ResizeHandle direction="w" onMouseDown={(e) => onResizeMouseDown(element.id, 'w', e)} isDarkMode={isDarkMode} scale={scale} />
                <RotationHandle onMouseDown={(e) => onRotateMouseDown(element.id, e)} isDarkMode={isDarkMode} scale={scale} />
              </>
            )}
          </div>
        );
      })}
    </>
  );
};

export default FloorPlanElements;

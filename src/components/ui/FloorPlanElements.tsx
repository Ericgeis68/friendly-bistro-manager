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
  pixelsPerCm?: number;
}

// Composant pour les poignées de redimensionnement avec rotation
const ResizeHandle: React.FC<{ 
  direction: string; 
  onMouseDown: (e: React.MouseEvent) => void; 
  isDarkMode: boolean; 
  scale: number;
  rotation: number;
}> = ({ direction, onMouseDown, isDarkMode, scale, rotation }) => {
  const handleSize = Math.max(10, 10 / scale);
  
  // Calculer la position de base selon la direction
  const getBasePosition = (dir: string) => {
    const offset = handleSize / 2;
    switch (dir) {
      case 'nw': return { top: -offset, left: -offset };
      case 'n': return { top: -offset, left: `calc(50% - ${offset}px)` };
      case 'ne': return { top: -offset, right: -offset };
      case 'e': return { top: `calc(50% - ${offset}px)`, right: -offset };
      case 'se': return { bottom: -offset, right: -offset };
      case 's': return { bottom: -offset, left: `calc(50% - ${offset}px)` };
      case 'sw': return { bottom: -offset, left: -offset };
      case 'w': return { top: `calc(50% - ${offset}px)`, left: -offset };
      default: return { top: 0, left: 0 };
    }
  };

  // Calculer le curseur selon la direction et la rotation
  const getCursor = (dir: string, rot: number) => {
    // Normaliser la rotation entre 0 et 360
    const normalizedRotation = ((rot % 360) + 360) % 360;
    
    // Mapping des curseurs de base
    const baseCursors: { [key: string]: string } = {
      'nw': 'nwse-resize',
      'n': 'ns-resize',
      'ne': 'nesw-resize',
      'e': 'ew-resize',
      'se': 'nwse-resize',
      's': 'ns-resize',
      'sw': 'nesw-resize',
      'w': 'ew-resize'
    };

    // Calculer le nombre de quarts de tour (chaque 45°)
    const eighthTurns = Math.round(normalizedRotation / 45) % 8;
    
    // Mapping des curseurs selon la rotation
    const cursorMappings = [
      // 0° (pas de rotation)
      { nw: 'nwse-resize', n: 'ns-resize', ne: 'nesw-resize', e: 'ew-resize', se: 'nwse-resize', s: 'ns-resize', sw: 'nesw-resize', w: 'ew-resize' },
      // 45°
      { nw: 'ns-resize', n: 'nesw-resize', ne: 'ew-resize', e: 'nwse-resize', se: 'ns-resize', s: 'nesw-resize', sw: 'ew-resize', w: 'nwse-resize' },
      // 90°
      { nw: 'nesw-resize', n: 'ew-resize', ne: 'nwse-resize', e: 'ns-resize', se: 'nesw-resize', s: 'ew-resize', sw: 'nwse-resize', w: 'ns-resize' },
      // 135°
      { nw: 'ew-resize', n: 'nwse-resize', ne: 'ns-resize', e: 'nesw-resize', se: 'ew-resize', s: 'nwse-resize', sw: 'ns-resize', w: 'nesw-resize' },
      // 180°
      { nw: 'nwse-resize', n: 'ns-resize', ne: 'nesw-resize', e: 'ew-resize', se: 'nwse-resize', s: 'ns-resize', sw: 'nesw-resize', w: 'ew-resize' },
      // 225°
      { nw: 'ns-resize', n: 'nesw-resize', ne: 'ew-resize', e: 'nwse-resize', se: 'ns-resize', s: 'nesw-resize', sw: 'ew-resize', w: 'nwse-resize' },
      // 270°
      { nw: 'nesw-resize', n: 'ew-resize', ne: 'nwse-resize', e: 'ns-resize', se: 'nesw-resize', s: 'ew-resize', sw: 'nwse-resize', w: 'ns-resize' },
      // 315°
      { nw: 'ew-resize', n: 'nwse-resize', ne: 'ns-resize', e: 'nesw-resize', se: 'ew-resize', s: 'nwse-resize', sw: 'ns-resize', w: 'nesw-resize' }
    ];
    
    const mapping = cursorMappings[eighthTurns];
    return mapping[dir as keyof typeof mapping] || baseCursors[dir];
  };

  const basePosition = getBasePosition(direction);
  const cursor = getCursor(direction, rotation);

  const style: React.CSSProperties = {
    position: 'absolute',
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    background: isDarkMode ? '#38bdf8' : '#38bdf8',
    border: `1px solid ${isDarkMode ? '#171717' : '#FFFFFF'}`,
    borderRadius: '2px',
    zIndex: 20,
    cursor,
    ...basePosition
  };

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
  scale = 1,
  pixelsPerCm = 0.5
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
        const rotation = element.rotation || 0;
        
        return (
          <div
            key={element.id}
            className={getElementStyle(element)}
            style={{
              left: element.position.x * pixelsPerCm,
              top: element.position.y * pixelsPerCm,
              width: element.size.width * pixelsPerCm,
              height: element.size.height * pixelsPerCm,
              transform: rotation ? `rotate(${rotation}deg)` : undefined,
              fontSize: Math.max(8, 10 / scale) + 'px'
            }}
            onClick={() => onElementClick(element.id)}
            onDoubleClick={() => onElementDoubleClick(element.id)}
            onMouseDown={(e) => onElementMouseDown(element.id, e)}
          >
            {getElementContent(element)}
            {isSelected && (
              <>
                <ResizeHandle 
                  direction="nw" 
                  onMouseDown={(e) => onResizeMouseDown(element.id, 'nw', e)} 
                  isDarkMode={isDarkMode} 
                  scale={scale}
                  rotation={rotation}
                />
                <ResizeHandle 
                  direction="n" 
                  onMouseDown={(e) => onResizeMouseDown(element.id, 'n', e)} 
                  isDarkMode={isDarkMode} 
                  scale={scale}
                  rotation={rotation}
                />
                <ResizeHandle 
                  direction="ne" 
                  onMouseDown={(e) => onResizeMouseDown(element.id, 'ne', e)} 
                  isDarkMode={isDarkMode} 
                  scale={scale}
                  rotation={rotation}
                />
                <ResizeHandle 
                  direction="e" 
                  onMouseDown={(e) => onResizeMouseDown(element.id, 'e', e)} 
                  isDarkMode={isDarkMode} 
                  scale={scale}
                  rotation={rotation}
                />
                <ResizeHandle 
                  direction="se" 
                  onMouseDown={(e) => onResizeMouseDown(element.id, 'se', e)} 
                  isDarkMode={isDarkMode} 
                  scale={scale}
                  rotation={rotation}
                />
                <ResizeHandle 
                  direction="s" 
                  onMouseDown={(e) => onResizeMouseDown(element.id, 's', e)} 
                  isDarkMode={isDarkMode} 
                  scale={scale}
                  rotation={rotation}
                />
                <ResizeHandle 
                  direction="sw" 
                  onMouseDown={(e) => onResizeMouseDown(element.id, 'sw', e)} 
                  isDarkMode={isDarkMode} 
                  scale={scale}
                  rotation={rotation}
                />
                <ResizeHandle 
                  direction="w" 
                  onMouseDown={(e) => onResizeMouseDown(element.id, 'w', e)} 
                  isDarkMode={isDarkMode} 
                  scale={scale}
                  rotation={rotation}
                />
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

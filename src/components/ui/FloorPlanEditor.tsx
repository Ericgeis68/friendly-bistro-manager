import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFloorPlan } from '../../hooks/useFloorPlan';
import FloorPlanToolbar from './FloorPlanToolbar';
import FloorPlanElements from './FloorPlanElements';
import FloorPlanGrid from './FloorPlanGrid';
import ElementPropertiesEditor from './ElementPropertiesEditor';
import RoomPropertiesEditor from './RoomPropertiesEditor';
import { ElementType, Position, Size } from '../../types/floorPlan';
import { Edit, Trash2, Save, Settings } from 'lucide-react';

interface FloorPlanEditorProps {
  onSave?: (floorPlan: any) => void;
  initialPlan?: any;
  isDarkMode: boolean;
  tablesWithOrders?: string[];
  selectedTable?: string;
  onTableSelect?: (tableNumber: string) => void;
  readOnly?: boolean;
}

const FloorPlanEditor: React.FC<FloorPlanEditorProps> = ({
  onSave,
  initialPlan,
  isDarkMode,
  tablesWithOrders = [],
  selectedTable,
  onTableSelect,
  readOnly = false
}) => {
  const {
    floorPlan,
    selectedElement,
    setSelectedElement,
    addElement,
    updateElement,
    deleteElement,
    moveElement,
    updateFloorPlan,
    isDragging,
    setIsDragging,
    dragOffset,
    setDragOffset
  } = useFloorPlan(initialPlan);

  const [selectedTool, setSelectedTool] = useState<ElementType | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [showRoomProperties, setShowRoomProperties] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null); // New ref for the outer container with padding

  // États pour le redimensionnement
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [initialElementState, setInitialElementState] = useState<{
    id: string;
    position: Position;
    size: Size;
  } | null>(null);
  const [initialMousePos, setInitialMousePos] = useState<Position>({ x: 0, y: 0 });

  // Nouveaux états pour la rotation
  const [isRotating, setIsRotating] = useState(false);
  const [initialElementRotation, setInitialElementRotation] = useState<number>(0);
  const [initialMouseAngle, setInitialMouseAngle] = useState<number>(0);

  // État pour gérer l'échelle responsive
  const [scale, setScale] = useState(1);

  // Calculer l'échelle pour l'affichage responsive
  useEffect(() => {
    const updateScale = () => {
      if (canvasRef.current && canvasContainerRef.current) {
        // Use canvasContainerRef to get the width of the div with padding
        // Removed -32 as p-4 is now removed from the container
        const containerWidth = canvasContainerRef.current.clientWidth; 
        
        let newScale;
        if (readOnly) {
          // Pour la serveuse (mode lecture seule), prendre toute la largeur
          // Assurez-vous que l'échelle prend également en compte la hauteur pour éviter un étirement vertical excessif
          const containerHeight = canvasContainerRef.current.clientHeight; // Tenir compte également du padding en hauteur
          const scaleX = containerWidth / floorPlan.roomSize.width;
          const scaleY = containerHeight / floorPlan.roomSize.height;
          newScale = Math.min(scaleX, scaleY); // S'adapter à la fois en largeur et en hauteur
        } else {
          // Pour l'administrateur (mode édition), garder la contrainte de taille
          const containerHeight = Math.min(500, window.innerHeight * 0.6);
          const scaleX = containerWidth / floorPlan.roomSize.width;
          const scaleY = containerHeight / floorPlan.roomSize.height;
          newScale = Math.min(scaleX, scaleY, 1); // Ne pas agrandir au-delà de 1
        }
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [floorPlan.roomSize, readOnly]);

  // Attacher les écouteurs d'événements de souris globaux pour le déplacement, le redimensionnement et la rotation
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (readOnly) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (isDragging && selectedElement && dragOffset) {
        const newX = (e.clientX - rect.left) / scale - dragOffset.x;
        const newY = (e.clientY - rect.top) / scale - dragOffset.y;
        moveElement(selectedElement, { x: newX, y: newY });
      } else if (isResizing && selectedElement && resizeDirection && initialElementState && initialMousePos) {
        const deltaX = (e.clientX - initialMousePos.x) / scale;
        const deltaY = (e.clientY - initialMousePos.y) / scale;

        let newWidth = initialElementState.size.width;
        let newHeight = initialElementState.size.height;
        let newX = initialElementState.position.x;
        let newY = initialElementState.position.y;

        // Taille minimale pour éviter que les éléments ne disparaissent
        const MIN_SIZE = 10;

        switch (resizeDirection) {
          case 'n':
            newHeight = Math.max(MIN_SIZE, initialElementState.size.height - deltaY);
            newY = initialElementState.position.y + (initialElementState.size.height - newHeight);
            break;
          case 'ne':
            newHeight = Math.max(MIN_SIZE, initialElementState.size.height - deltaY);
            newY = initialElementState.position.y + (initialElementState.size.height - newHeight);
            newWidth = Math.max(MIN_SIZE, initialElementState.size.width + deltaX);
            break;
          case 'e':
            newWidth = Math.max(MIN_SIZE, initialElementState.size.width + deltaX);
            break;
          case 'se':
            newWidth = Math.max(MIN_SIZE, initialElementState.size.width + deltaX);
            newHeight = Math.max(MIN_SIZE, initialElementState.size.height + deltaY);
            break;
          case 's':
            newHeight = Math.max(MIN_SIZE, initialElementState.size.height + deltaY);
            break;
          case 'sw':
            newWidth = Math.max(MIN_SIZE, initialElementState.size.width - deltaX);
            newX = initialElementState.position.x + (initialElementState.size.width - newWidth);
            newHeight = Math.max(MIN_SIZE, initialElementState.size.height + deltaY);
            break;
          case 'w':
            newWidth = Math.max(MIN_SIZE, initialElementState.size.width - deltaX);
            newX = initialElementState.position.x + (initialElementState.size.width - newWidth);
            break;
          case 'nw':
            newWidth = Math.max(MIN_SIZE, initialElementState.size.width - deltaX);
            newX = initialElementState.position.x + (initialElementState.size.width - newWidth);
            newHeight = Math.max(MIN_SIZE, initialElementState.size.height - deltaY);
            newY = initialElementState.position.y + (initialElementState.size.height - newHeight);
            break;
        }
        updateElement(selectedElement, { position: { x: newX, y: newY }, size: { width: newWidth, height: newHeight } });
      } else if (isRotating && selectedElement && initialElementRotation !== undefined && initialMouseAngle !== undefined) {
        const element = floorPlan.elements.find(el => el.id === selectedElement);
        if (!element || !canvasRef.current) return;

        const elementCenterX = element.position.x + element.size.width / 2;
        const elementCenterY = element.position.y + element.size.height / 2;

        const currentMouseX = (e.clientX - rect.left) / scale;
        const currentMouseY = (e.clientY - rect.top) / scale;

        const angleRad = Math.atan2(currentMouseY - elementCenterY, currentMouseX - elementCenterX);
        const currentMouseAngleDeg = angleRad * (180 / Math.PI);

        const rotationDelta = currentMouseAngleDeg - initialMouseAngle;
        let newRotation = initialElementRotation + rotationDelta;

        // Snap to 15-degree increments for easier alignment
        newRotation = Math.round(newRotation / 15) * 15;

        updateElement(selectedElement, { rotation: newRotation });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
      }
      if (isResizing) {
        setIsResizing(false);
        setResizeDirection(null);
        setInitialElementState(null);
        setInitialMousePos({ x: 0, y: 0 });
      }
      if (isRotating) {
        setIsRotating(false);
        setInitialElementRotation(0);
        setInitialMouseAngle(0);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, selectedElement, dragOffset, moveElement, setIsDragging, setDragOffset,
      isResizing, resizeDirection, initialElementState, initialMousePos, updateElement, readOnly,
      isRotating, initialElementRotation, initialMouseAngle, floorPlan.elements, scale]);

  const handleToolSelect = (type: ElementType) => {
    setSelectedTool(type);
  };

  // Renommé de handleCanvasClick à handleCanvasMouseDown et logique ajustée
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (selectedTool) {
      addElement(selectedTool, { x, y });
      setSelectedTool(null);
    } else {
      // Désélectionner uniquement si le clic a eu lieu directement sur le canevas (pas sur un élément enfant)
      if (e.target === canvasRef.current) {
        setSelectedElement(null);
      }
    }
  };

  const handleElementClick = (id: string) => {
    const element = floorPlan.elements.find(e => e.id === id);
    if (element?.type === 'table' && onTableSelect) {
      onTableSelect((element as any).number);
    }
    
    if (!readOnly) {
      setSelectedElement(id);
    }
  };

  const handleElementDoubleClick = (id: string) => {
    if (!readOnly) {
      setSelectedElement(id);
      setShowProperties(true);
    }
  };

  // Gestionnaire pour le clic de souris sur un élément (début du glisser-déposer)
  const handleElementMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    if (readOnly) return;
    
    e.stopPropagation();
    setSelectedElement(id);
    setIsDragging(true);

    const element = floorPlan.elements.find(el => el.id === id);
    if (element) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale
      });
    }
  }, [readOnly, setSelectedElement, setIsDragging, setDragOffset, floorPlan.elements, scale]);

  // Gestionnaire pour le clic de souris sur une poignée de redimensionnement
  const handleResizeMouseDown = useCallback((id: string, direction: string, e: React.MouseEvent) => {
    if (readOnly) return;

    e.stopPropagation();
    setSelectedElement(id);
    setIsResizing(true);
    setResizeDirection(direction);

    const element = floorPlan.elements.find(el => el.id === id);
    if (element) {
      setInitialElementState({
        id: element.id,
        position: { ...element.position },
        size: { ...element.size }
      });
      setInitialMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [readOnly, setSelectedElement, setIsResizing, setResizeDirection, setInitialElementState, setInitialMousePos, floorPlan.elements]);

  // Nouveau gestionnaire pour le clic de souris sur la poignée de rotation
  const handleRotateMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    setSelectedElement(id);
    setIsRotating(true);

    const element = floorPlan.elements.find(el => el.id === id);
    if (element && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const elementCenterX = element.position.x + element.size.width / 2;
        const elementCenterY = element.position.y + element.size.height / 2;

        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;

        const angleRad = Math.atan2(mouseY - elementCenterY, mouseX - elementCenterX);
        const initialAngleDeg = angleRad * (180 / Math.PI);

        setInitialMouseAngle(initialAngleDeg);
        setInitialElementRotation(element.rotation || 0);
    }
  }, [readOnly, setSelectedElement, setIsRotating, floorPlan.elements, scale]);

  const handleDelete = () => {
    if (selectedElement && !readOnly) {
      deleteElement(selectedElement);
    }
  };

  const handleSave = () => {
    if (onSave) {
      console.log("Save button clicked, calling onSave with:", floorPlan);
      onSave(floorPlan);
    }
  };

  const handlePropertiesSave = (updates: any) => {
    if (selectedElement) {
      updateElement(selectedElement, updates);
    }
  };

  const handleRoomPropertiesSave = (updates: any) => {
    updateFloorPlan(updates);
  };

  const selectedElementData = selectedElement 
    ? floorPlan.elements.find(e => e.id === selectedElement)
    : null;

  return (
    <div className="space-y-4">
      {!readOnly && (
        <>
          <FloorPlanToolbar
            onAddElement={handleToolSelect}
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            isDarkMode={isDarkMode}
          />
          
          <div className={`flex gap-2 p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <button
              onClick={() => setShowRoomProperties(true)}
              className="flex items-center gap-2 px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              <Settings size={16} />
              Propriétés de la salle
            </button>
            
            {selectedElement && (
              <>
                <button
                  onClick={() => setShowProperties(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Edit size={16} />
                  Propriétés
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </>
            )}
          </div>
        </>
      )}

      <div
        ref={canvasContainerRef} // Attach the new ref here
        // Removed p-4 from this div to allow it to take full width
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg border-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <h3 className={`text-lg font-semibold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {floorPlan.name}
        </h3>
        
        <div className="flex justify-center">
          <div
            ref={canvasRef}
            className="relative border-2 border-dashed border-gray-400 bg-white overflow-hidden"
            style={{ 
              width: floorPlan.roomSize.width * scale, 
              height: floorPlan.roomSize.height * scale,
              cursor: selectedTool ? 'crosshair' : (isDragging || isResizing || isRotating ? 'grabbing' : 'default'),
              maxWidth: '100%'
            }}
            onMouseDown={handleCanvasMouseDown}
          >
            {!readOnly && ( // Condition pour afficher le quadrillage uniquement en mode non-lecture seule
              <FloorPlanGrid
                roomSize={floorPlan.roomSize}
                gridSize={floorPlan.gridSize || 100}
                scale={scale}
                isDarkMode={isDarkMode}
              />
            )}
            
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative', zIndex: 2 }}>
              <FloorPlanElements
                elements={floorPlan.elements}
                selectedElement={selectedElement}
                onElementClick={handleElementClick}
                onElementDoubleClick={handleElementDoubleClick}
                onElementMouseDown={handleElementMouseDown}
                onResizeMouseDown={handleResizeMouseDown}
                onRotateMouseDown={handleRotateMouseDown}
                isDarkMode={isDarkMode}
                tablesWithOrders={tablesWithOrders}
                selectedTable={selectedTable}
                scale={scale}
              />
            </div>
          </div>
        </div>
        
        {!readOnly && onSave && (
          <div className="mt-4 text-center">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <Save size={16} />
              Sauvegarder le plan
            </button>
          </div>
        )}
      </div>

      {showProperties && selectedElementData && !readOnly && (
        <ElementPropertiesEditor
          element={selectedElementData}
          onSave={handlePropertiesSave}
          onClose={() => setShowProperties(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {showRoomProperties && !readOnly && (
        <RoomPropertiesEditor
          floorPlan={floorPlan}
          onSave={handleRoomPropertiesSave}
          onClose={() => setShowRoomProperties(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default FloorPlanEditor;

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFloorPlan } from '../../hooks/useFloorPlan';
import FloorPlanToolbar from './FloorPlanToolbar';
import FloorPlanElements from './FloorPlanElements';
import FloorPlanGrid from './FloorPlanGrid';
import ElementPropertiesEditor from './ElementPropertiesEditor';
import RoomPropertiesEditor from './RoomPropertiesEditor';
import { ElementType, Position, Size, FloorPlan } from '../../types/floorPlan';
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
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // États pour le redimensionnement
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [initialElementState, setInitialElementState] = useState<{
    id: string;
    position: Position;
    size: Size;
    rotation?: number;
  } | null>(null);
  const [initialMousePos, setInitialMousePos] = useState<Position>({ x: 0, y: 0 });

  // Nouveaux états pour la rotation
  const [isRotating, setIsRotating] = useState(false);
  const [initialElementRotation, setInitialElementRotation] = useState<number>(0);
  const [initialMouseAngle, setInitialMouseAngle] = useState<number>(0);

  // État pour gérer l'échelle responsive
  const [scale, setScale] = useState(1);

  // CONSTANTES POUR L'ÉCHELLE - TOUT EN CENTIMÈTRES
  const PIXELS_PER_CM = 0.5; // 1 cm = 0.5 pixels pour l'affichage

  // Toutes les valeurs sont en centimètres dans la base de données
  const getRoomSizeInCm = () => {
    return {
      width: floorPlan.roomSize.width,
      height: floorPlan.roomSize.height
    };
  };

  const getGridSizeInCm = () => {
    return floorPlan.gridSize || 100; // Par défaut 100cm = 1m
  };

  // Calculer l'échelle pour l'affichage responsive
  useEffect(() => {
    const updateScale = () => {
      if (canvasRef.current && canvasContainerRef.current) {
        const containerWidth = canvasContainerRef.current.clientWidth;
        const containerHeight = canvasContainerRef.current.clientHeight;
        
        const roomSizeInCm = getRoomSizeInCm();
        
        // Calculer la taille nécessaire en pixels
        const requiredWidth = roomSizeInCm.width * PIXELS_PER_CM;
        const requiredHeight = roomSizeInCm.height * PIXELS_PER_CM;
        
        // Marges pour les labels et l'interface
        const marginWidth = readOnly ? 40 : 120;
        const marginHeight = readOnly ? 40 : 160;
        
        const availableWidth = containerWidth - marginWidth;
        const availableHeight = containerHeight - marginHeight;
        
        // Calculer l'échelle pour que le plan tienne dans le conteneur
        const scaleX = availableWidth / requiredWidth;
        const scaleY = availableHeight / requiredHeight;
        
        // Prendre la plus petite échelle pour que tout tienne
        let newScale = Math.min(scaleX, scaleY);
        
        // Limiter l'échelle entre 0.3 et 2
        newScale = Math.max(0.3, Math.min(2, newScale));
        
        console.log("Scale calculation:", {
          roomSizeInCm,
          requiredWidth,
          requiredHeight,
          availableWidth,
          availableHeight,
          scaleX,
          scaleY,
          newScale
        });
        
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [floorPlan.roomSize, floorPlan.gridSize, readOnly]);

  // Fonction pour convertir les coordonnées d'écran en coordonnées canvas (en cm)
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    return {
      x: (screenX - rect.left) / (scale * PIXELS_PER_CM),
      y: (screenY - rect.top) / (scale * PIXELS_PER_CM)
    };
  }, [scale, PIXELS_PER_CM]);

  // Fonction pour transformer la direction de redimensionnement selon la rotation
  const transformResizeDirection = useCallback((direction: string, rotation: number) => {
    // Normaliser la rotation entre 0 et 360
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    
    // Calculer le nombre de quarts de tour (chaque 90°)
    const quarterTurns = Math.round(normalizedRotation / 90) % 4;
    
    // Mapping des directions selon les quarts de tour
    const directionMappings = [
      // 0° (pas de rotation)
      { n: 'n', ne: 'ne', e: 'e', se: 'se', s: 's', sw: 'sw', w: 'w', nw: 'nw' },
      // 90° (rotation horaire)
      { n: 'e', ne: 'se', e: 's', se: 'sw', s: 'w', sw: 'nw', w: 'n', nw: 'ne' },
      // 180° (rotation de 180°)
      { n: 's', ne: 'sw', e: 'w', se: 'nw', s: 'n', sw: 'ne', w: 'e', nw: 'se' },
      // 270° (rotation anti-horaire)
      { n: 'w', ne: 'nw', e: 'n', se: 'ne', s: 'e', sw: 'se', w: 's', nw: 'sw' }
    ];
    
    const mapping = directionMappings[quarterTurns];
    return mapping[direction as keyof typeof mapping] || direction;
  }, []);

  // Fonction pour appliquer la transformation inverse de rotation aux deltas
  const applyInverseRotationToDeltas = useCallback((deltaX: number, deltaY: number, rotation: number) => {
    // Convertir la rotation en radians et l'inverser
    const radians = (-rotation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    return {
      x: deltaX * cos - deltaY * sin,
      y: deltaX * sin + deltaY * cos
    };
  }, []);

  // Attacher les écouteurs d'événements de souris globaux
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (readOnly) return;

      const mousePos = screenToCanvas(e.clientX, e.clientY);

      if (isDragging && selectedElement && dragOffset) {
        // Calculer la nouvelle position de l'élément en soustrayant l'offset de glissement
        const newX = mousePos.x - dragOffset.x;
        const newY = mousePos.y - dragOffset.y;
        
        // Utiliser une grille plus fine pour permettre le positionnement entre les lignes
        const gridSize = getGridSizeInCm();
        const fineGridSize = gridSize / 4; // Grille 4 fois plus fine
        
        const snappedX = Math.round(newX / fineGridSize) * fineGridSize;
        const snappedY = Math.round(newY / fineGridSize) * fineGridSize;
        
        moveElement(selectedElement, { x: snappedX, y: snappedY });
      } else if (isResizing && selectedElement && resizeDirection && initialElementState && initialMousePos) {
        const element = floorPlan.elements.find(el => el.id === selectedElement);
        if (!element) return;

        // Calculer les deltas de souris en coordonnées d'écran
        const deltaXScreen = e.clientX - initialMousePos.x;
        const deltaYScreen = e.clientY - initialMousePos.y;
        
        // Convertir en coordonnées canvas
        const deltaXCanvas = deltaXScreen / (scale * PIXELS_PER_CM);
        const deltaYCanvas = deltaYScreen / (scale * PIXELS_PER_CM);

        // CORRECTION CRITIQUE : Appliquer la transformation inverse de rotation aux deltas
        const rotation = element.rotation || 0;
        const transformedDeltas = applyInverseRotationToDeltas(deltaXCanvas, deltaYCanvas, rotation);

        let newWidth = initialElementState.size.width;
        let newHeight = initialElementState.size.height;
        let newX = initialElementState.position.x;
        let newY = initialElementState.position.y;

        // Taille minimale en centimètres
        const MIN_SIZE = 20;

        console.log("Resizing with rotation:", {
          originalDirection: resizeDirection,
          rotation,
          originalDeltas: { deltaXCanvas, deltaYCanvas },
          transformedDeltas,
          originalSize: initialElementState.size
        });

        // Utiliser la direction originale avec les deltas transformés
        switch (resizeDirection) {
          case 'n':
            newHeight = Math.max(MIN_SIZE, initialElementState.size.height - transformedDeltas.y);
            newY = initialElementState.position.y + transformedDeltas.y;
            if (newHeight <= MIN_SIZE) {
              newHeight = MIN_SIZE;
              newY = initialElementState.position.y + initialElementState.size.height - MIN_SIZE;
            }
            break;
          case 'ne':
            newHeight = Math.max(MIN_SIZE, initialElementState.size.height - transformedDeltas.y);
            newY = initialElementState.position.y + transformedDeltas.y;
            newWidth = Math.max(MIN_SIZE, initialElementState.size.width + transformedDeltas.x);
            if (newHeight <= MIN_SIZE) {
              newHeight = MIN_SIZE;
              newY = initialElementState.position.y + initialElementState.size.height - MIN_SIZE;
            }
            break;
          case 'e':
            newWidth = Math.max(MIN_SIZE, initialElementState.size.width + transformedDeltas.x);
            break;
          case 'se':
            newWidth = Math.max(MIN_SIZE, initialElementState.size.width + transformedDeltas.x);
            newHeight = Math.max(MIN_SIZE, initialElementState.size.height + transformedDeltas.y);
            break;
          case 's':
            newHeight = Math.max(MIN_SIZE, initialElementState.size.height + transformedDeltas.y);
            break;
          case 'sw':
            newWidth = Math.max(MIN_SIZE, initialElementState.size.width - transformedDeltas.x);
            newX = initialElementState.position.x + transformedDeltas.x;
            newHeight = Math.max(MIN_SIZE, initialElementState.size.height + transformedDeltas.y);
            if (newWidth <= MIN_SIZE) {
              newWidth = MIN_SIZE;
              newX = initialElementState.position.x + initialElementState.size.width - MIN_SIZE;
            }
            break;
          case 'w':
            newWidth = Math.max(MIN_SIZE, initialElementState.size.width - transformedDeltas.x);
            newX = initialElementState.position.x + transformedDeltas.x;
            if (newWidth <= MIN_SIZE) {
              newWidth = MIN_SIZE;
              newX = initialElementState.position.x + initialElementState.size.width - MIN_SIZE;
            }
            break;
          case 'nw':
            newWidth = Math.max(MIN_SIZE, initialElementState.size.width - transformedDeltas.x);
            newX = initialElementState.position.x + transformedDeltas.x;
            newHeight = Math.max(MIN_SIZE, initialElementState.size.height - transformedDeltas.y);
            newY = initialElementState.position.y + transformedDeltas.y;
            if (newWidth <= MIN_SIZE) {
              newWidth = MIN_SIZE;
              newX = initialElementState.position.x + initialElementState.size.width - MIN_SIZE;
            }
            if (newHeight <= MIN_SIZE) {
              newHeight = MIN_SIZE;
              newY = initialElementState.position.y + initialElementState.size.height - MIN_SIZE;
            }
            break;
        }
        
        updateElement(selectedElement, { 
          position: { x: newX, y: newY }, 
          size: { width: newWidth, height: newHeight } 
        });
      } else if (isRotating && selectedElement && initialElementRotation !== undefined && initialMouseAngle !== undefined) {
        const element = floorPlan.elements.find(el => el.id === selectedElement);
        if (!element) return;

        const elementCenterX = element.position.x + element.size.width / 2;
        const elementCenterY = element.position.y + element.size.height / 2;

        const angleRad = Math.atan2(mousePos.y - elementCenterY, mousePos.x - elementCenterX);
        const currentMouseAngleDeg = angleRad * (180 / Math.PI);

        const rotationDelta = currentMouseAngleDeg - initialMouseAngle;
        let newRotation = initialElementRotation + rotationDelta;

        // Snap to 15-degree increments
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
        console.log("Stopping resize");
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
      isRotating, initialElementRotation, initialMouseAngle, floorPlan.elements, scale, PIXELS_PER_CM,
      screenToCanvas, applyInverseRotationToDeltas, getGridSizeInCm, transformResizeDirection]);

  const handleToolSelect = (type: ElementType) => {
    setSelectedTool(type);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    
    const mousePos = screenToCanvas(e.clientX, e.clientY);

    if (selectedTool) {
      // Utiliser une grille plus fine pour le placement initial
      const gridSize = getGridSizeInCm();
      const fineGridSize = gridSize / 4; // Grille 4 fois plus fine
      
      const snappedX = Math.round(mousePos.x / fineGridSize) * fineGridSize;
      const snappedY = Math.round(mousePos.y / fineGridSize) * fineGridSize;
      
      addElement(selectedTool, { x: snappedX, y: snappedY });
      setSelectedTool(null);
    } else {
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

  const handleElementMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    if (readOnly) return;
    
    e.stopPropagation();
    setSelectedElement(id);
    setIsDragging(true);

    const element = floorPlan.elements.find(el => el.id === id);
    if (element) {
      const mousePos = screenToCanvas(e.clientX, e.clientY);
      
      // Calculer dragOffset: la différence entre la position de la souris et le coin supérieur gauche de l'élément
      setDragOffset({
        x: mousePos.x - element.position.x,
        y: mousePos.y - element.position.y
      });
    }
  }, [readOnly, setSelectedElement, setIsDragging, setDragOffset, floorPlan.elements, screenToCanvas]);

  const handleResizeMouseDown = useCallback((id: string, direction: string, e: React.MouseEvent) => {
    if (readOnly) return;

    e.stopPropagation();
    console.log("Starting resize:", direction);
    setSelectedElement(id);
    setIsResizing(true);
    setResizeDirection(direction);

    const element = floorPlan.elements.find(el => el.id === id);
    if (element) {
      setInitialElementState({
        id: element.id,
        position: { ...element.position },
        size: { ...element.size },
        rotation: element.rotation || 0
      });
      // Stocker la position initiale de la souris en coordonnées d'écran
      setInitialMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [readOnly, setSelectedElement, setIsResizing, setResizeDirection, setInitialElementState, setInitialMousePos, floorPlan.elements]);

  const handleRotateMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    setSelectedElement(id);
    setIsRotating(true);

    const element = floorPlan.elements.find(el => el.id === id);
    if (element) {
        const elementCenterX = element.position.x + element.size.width / 2;
        const elementCenterY = element.position.y + element.size.height / 2;

        const mousePos = screenToCanvas(e.clientX, e.clientY);

        const angleRad = Math.atan2(mousePos.y - elementCenterY, mousePos.x - elementCenterX);
        const initialAngleDeg = angleRad * (180 / Math.PI);

        setInitialMouseAngle(initialAngleDeg);
        setInitialElementRotation(element.rotation || 0);
    }
  }, [readOnly, setSelectedElement, setIsRotating, floorPlan.elements, screenToCanvas]);

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

  const handleRoomPropertiesSave = (updates: Partial<FloorPlan>) => {
    // Tout est en centimètres
    updateFloorPlan(updates);
  };

  const selectedElementData = selectedElement 
    ? floorPlan.elements.find(e => e.id === selectedElement)
    : null;

  // Calculer les dimensions d'affichage en pixels
  const roomSizeInCm = getRoomSizeInCm();
  const gridSizeInCm = getGridSizeInCm();
  
  const displayWidth = roomSizeInCm.width * PIXELS_PER_CM * scale;
  const displayHeight = roomSizeInCm.height * PIXELS_PER_CM * scale;

  // Dimensions en mètres pour l'affichage
  const widthInMeters = (roomSizeInCm.width / 100).toFixed(1);
  const heightInMeters = (roomSizeInCm.height / 100).toFixed(1);

  // Calculer le nombre de carreaux - EXACT
  const numberOfGridSquaresWidth = Math.round(roomSizeInCm.width / gridSizeInCm);
  const numberOfGridSquaresHeight = Math.round(roomSizeInCm.height / gridSizeInCm);

  // Vérification de cohérence
  const isGridConsistent = (
    Math.abs(numberOfGridSquaresWidth * gridSizeInCm - roomSizeInCm.width) < 1 &&
    Math.abs(numberOfGridSquaresHeight * gridSizeInCm - roomSizeInCm.height) < 1
  );

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

          {/* Informations de débogage - AMÉLIORÉES */}
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} text-sm`}>
            <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div>
                <strong>Salle:</strong> {widthInMeters}m × {heightInMeters}m | 
                <strong> Grille:</strong> {(gridSizeInCm/100).toFixed(1)}m | 
                <strong> Carreaux:</strong> {numberOfGridSquaresWidth} × {numberOfGridSquaresHeight}
              </div>
              <div>
                <strong>Échelle:</strong> {(scale * 100).toFixed(0)}% | 
                <strong> Pixels/cm:</strong> {PIXELS_PER_CM} | 
                <strong> Cohérence grille:</strong> {isGridConsistent ? '✓' : '✗'}
              </div>
              {!isGridConsistent && (
                <div className="text-red-500 font-medium">
                  ⚠️ Attention: La grille n'est pas cohérente avec les dimensions de la salle
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Container for canvas and dimension labels */}
      <div
        ref={canvasContainerRef}
        className={`relative p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg border-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <h3 className={`text-lg font-semibold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {floorPlan.name}
        </h3>
        
        <div className="flex justify-center">
          {/* Dimension Labels */}
          {!readOnly && (
            <>
              <div 
                className={`absolute top-1/2 left-0 px-2 py-1 text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                style={{ 
                  writingMode: 'vertical-rl', 
                  textOrientation: 'mixed', 
                  height: displayHeight,
                  transform: 'translate(calc(-100% - 8px), -50%)'
                }}
              >
                {heightInMeters} m
              </div>
              <div 
                className={`absolute top-0 left-1/2 px-2 py-1 text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                style={{ 
                  width: displayWidth,
                  transform: 'translate(-50%, calc(-100% - 8px))'
                }}
              >
                {widthInMeters} m
              </div>
            </>
          )}

          {/* The main canvas area */}
          <div
            ref={canvasRef}
            className="relative border-2 border-dashed border-gray-400 bg-white overflow-hidden"
            style={{ 
              width: displayWidth, 
              height: displayHeight,
              cursor: selectedTool ? 'crosshair' : (isDragging || isResizing || isRotating ? 'grabbing' : 'default'),
              maxWidth: '100%',
              minWidth: '200px',
              minHeight: '150px'
            }}
            onMouseDown={handleCanvasMouseDown}
          >
            {/* Scaled container for Grid and Elements */}
            <div style={{ 
              transform: `scale(${scale})`, 
              transformOrigin: 'top left', 
              position: 'relative', 
              width: roomSizeInCm.width * PIXELS_PER_CM, 
              height: roomSizeInCm.height * PIXELS_PER_CM,
              zIndex: 2 
            }}>
              
              {/* Grid */}
              {!readOnly && (
                <FloorPlanGrid
                  roomSize={{
                    width: roomSizeInCm.width * PIXELS_PER_CM,
                    height: roomSizeInCm.height * PIXELS_PER_CM
                  }}
                  gridSize={gridSizeInCm * PIXELS_PER_CM}
                  scale={1}
                  isDarkMode={isDarkMode}
                />
              )}

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
                scale={1}
                pixelsPerCm={PIXELS_PER_CM}
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

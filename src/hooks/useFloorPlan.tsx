import { useState, useCallback } from 'react';
import { FloorPlan, FloorPlanElement, ElementType, Position, Size } from '../types/floorPlan';

export const useFloorPlan = (initialPlan?: FloorPlan) => {
  const [floorPlan, setFloorPlan] = useState<FloorPlan>(
    initialPlan || {
      id: 'default',
      name: 'Plan de salle',
      elements: [],
      roomSize: { width: 1000, height: 800 }, // 10m x 8m en cm
      gridSize: 100 // 100cm = 1m
    }
  );
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  // Fonction pour aligner sur la grille en centimètres - MODIFIÉE pour grille plus fine
  const snapToGrid = useCallback((position: Position, gridSize: number): Position => {
    // Utiliser une grille 4 fois plus fine pour permettre un positionnement précis
    const fineGridSize = gridSize / 4;
    
    return {
      x: Math.round(position.x / fineGridSize) * fineGridSize,
      y: Math.round(position.y / fineGridSize) * fineGridSize
    };
  }, []);

  const addElement = useCallback((type: ElementType, position: Position) => {
    const gridSize = floorPlan.gridSize || 100;
    const snappedPosition = snapToGrid(position, gridSize);
    const id = `${type}_${Date.now()}`;
    let newElement: FloorPlanElement;

    switch (type) {
      case 'table':
        newElement = {
          id,
          type: 'table',
          position: snappedPosition,
          size: { width: 200, height: 80 }, // 200cm x 80cm
          number: String(floorPlan.elements.filter(e => e.type === 'table').length + 1),
          seats: 4,
          shape: 'rectangle'
        };
        break;
      case 'bar':
        newElement = {
          id,
          type: 'bar',
          position: snappedPosition,
          size: { width: 300, height: 60 }, // 300cm x 60cm
          name: 'Bar'
        };
        break;
      case 'pillar':
        newElement = {
          id,
          type: 'pillar',
          position: snappedPosition,
          size: { width: 40, height: 40 }, // 40cm x 40cm
          name: 'Poteau',
          shape: 'round'
        };
        break;
      case 'stage':
        newElement = {
          id,
          type: 'stage',
          position: snappedPosition,
          size: { width: 200, height: 150 }, // 200cm x 150cm
          name: 'Scène'
        };
        break;
      case 'wall':
        newElement = {
          id,
          type: 'wall',
          position: snappedPosition,
          size: { width: 200, height: 20 }, // 200cm x 20cm
          name: 'Mur',
          thickness: 20
        };
        break;
      case 'dancefloor':
        newElement = {
          id,
          type: 'dancefloor',
          position: snappedPosition,
          size: { width: 300, height: 300 }, // 300cm x 300cm
          name: 'Piste de danse'
        };
        break;
      default:
        return;
    }

    setFloorPlan(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  }, [floorPlan.elements, floorPlan.gridSize, snapToGrid]);

  const updateElement = useCallback((id: string, updates: Partial<FloorPlanElement>) => {
    setFloorPlan(prev => ({
      ...prev,
      elements: prev.elements.map(element =>
        element.id === id ? { ...element, ...updates } as FloorPlanElement : element
      )
    }));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setFloorPlan(prev => ({
      ...prev,
      elements: prev.elements.filter(element => element.id !== id)
    }));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  const moveElement = useCallback((id: string, newPosition: Position) => {
    // Ne pas appliquer de snap automatique lors du déplacement
    // Le snap est déjà appliqué dans FloorPlanEditor
    updateElement(id, { position: newPosition });
  }, [updateElement]);

  const updateFloorPlan = useCallback((updates: Partial<FloorPlan>) => {
    setFloorPlan(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  return {
    floorPlan,
    setFloorPlan,
    selectedElement,
    setSelectedElement,
    isDragging,
    setIsDragging,
    dragOffset,
    setDragOffset,
    addElement,
    updateElement,
    deleteElement,
    moveElement,
    updateFloorPlan,
    snapToGrid
  };
};

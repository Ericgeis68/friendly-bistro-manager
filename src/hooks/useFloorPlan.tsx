
import { useState, useCallback } from 'react';
import { FloorPlan, FloorPlanElement, ElementType, Position, Size } from '../types/floorPlan';

export const useFloorPlan = (initialPlan?: FloorPlan) => {
  const [floorPlan, setFloorPlan] = useState<FloorPlan>(
    initialPlan || {
      id: 'default',
      name: 'Plan de salle',
      elements: [],
      roomSize: { width: 1400, height: 1000 }, // 14m x 10m en cm
      gridSize: 100 // 100cm = 1m
    }
  );
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  // Fonction pour aligner sur la grille
  const snapToGrid = useCallback((position: Position, gridSize: number): Position => {
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
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
          size: { width: 200, height: 80 }, // Taille standard 200cm x 80cm
          number: String(floorPlan.elements.filter(e => e.type === 'table').length + 1),
          seats: 4,
          shape: 'rectangle' // Toujours rectangulaire pour correspondre à TableInputScreen
        };
        break;
      case 'bar':
        newElement = {
          id,
          type: 'bar',
          position: snappedPosition,
          size: { width: 120, height: 40 },
          name: 'Bar'
        };
        break;
      case 'pillar':
        newElement = {
          id,
          type: 'pillar',
          position: snappedPosition,
          size: { width: 20, height: 20 },
          name: 'Poteau',
          shape: 'round'
        };
        break;
      case 'stage':
        newElement = {
          id,
          type: 'stage',
          position: snappedPosition,
          size: { width: 120, height: 80 }, // Peut servir pour représenter la cuisine
          name: 'Scène/Cuisine'
        };
        break;
      case 'wall':
        newElement = {
          id,
          type: 'wall',
          position: snappedPosition,
          size: { width: 100, height: 20 },
          name: 'Mur',
          thickness: 20
        };
        break;
      case 'dancefloor':
        newElement = {
          id,
          type: 'dancefloor',
          position: snappedPosition,
          size: { width: 100, height: 100 },
          name: 'Zone libre'
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
    const gridSize = floorPlan.gridSize || 100;
    const snappedPosition = snapToGrid(newPosition, gridSize);
    updateElement(id, { position: snappedPosition });
  }, [updateElement, floorPlan.gridSize, snapToGrid]);

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

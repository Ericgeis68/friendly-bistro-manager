export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseElement {
  id: string;
  position: Position;
  size: Size;
  rotation?: number;
}

export interface TableElement extends BaseElement {
  type: 'table';
  number: string;
  seats: number;
  shape: 'rectangle' | 'round'; // Permettre les deux formes
}

export interface BarElement extends BaseElement {
  type: 'bar';
  name: string;
}

export interface PillarElement extends BaseElement {
  type: 'pillar';
  name: string;
  shape: 'round' | 'square';
}

export interface StageElement extends BaseElement {
  type: 'stage';
  name: string;
}

export interface WallElement extends BaseElement {
  type: 'wall';
  name: string;
  thickness: number;
}

export interface DanceFloorElement extends BaseElement {
  type: 'dancefloor';
  name: string;
}

export type FloorPlanElement = 
  | TableElement 
  | BarElement 
  | PillarElement 
  | StageElement 
  | WallElement 
  | DanceFloorElement;

export interface FloorPlan {
  id: string;
  name: string;
  elements: FloorPlanElement[];
  roomSize: Size;
  gridSize?: number; // Nouvelle propriété pour la taille de la grille
}

export type ElementType = FloorPlanElement['type'];

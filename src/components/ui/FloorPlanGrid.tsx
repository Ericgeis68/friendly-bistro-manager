import React from 'react';
import { Size } from '../../types/floorPlan';

interface FloorPlanGridProps {
  roomSize: Size;
  gridSize: number;
  scale: number;
  isDarkMode: boolean;
}

const FloorPlanGrid: React.FC<FloorPlanGridProps> = ({
  roomSize,
  gridSize,
  scale,
  isDarkMode
}) => {
  const gridLines = [];
  const scaledGridSize = gridSize * scale;
  const scaledWidth = roomSize.width * scale;
  const scaledHeight = roomSize.height * scale;

  // Lignes verticales
  for (let x = 0; x <= roomSize.width; x += gridSize) {
    gridLines.push(
      <line
        key={`v-${x}`}
        x1={x * scale}
        y1={0}
        x2={x * scale}
        y2={scaledHeight}
        stroke={isDarkMode ? '#374151' : '#e5e7eb'}
        strokeWidth={x % (gridSize * 5) === 0 ? 2 : 1}
        opacity={x % (gridSize * 5) === 0 ? 0.9 : 0.7}
      />
    );
  }

  // Lignes horizontales
  for (let y = 0; y <= roomSize.height; y += gridSize) {
    gridLines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y * scale}
        x2={scaledWidth}
        y2={y * scale}
        stroke={isDarkMode ? '#374151' : '#e5e7eb'}
        strokeWidth={y % (gridSize * 5) === 0 ? 2 : 1}
        opacity={y % (gridSize * 5) === 0 ? 0.9 : 0.7}
      />
    );
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={scaledWidth}
      height={scaledHeight}
      style={{ zIndex: 1 }}
    >
      {gridLines}
    </svg>
  );
};

export default FloorPlanGrid;

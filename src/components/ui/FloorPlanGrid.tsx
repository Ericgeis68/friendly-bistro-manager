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
  
  // Calcul avec grille plus fine pour permettre positionnement entre les lignes principales
  const fineGridSize = gridSize / 4; // Grille 4 fois plus fine
  
  const numVerticalLines = Math.floor(roomSize.width / fineGridSize) + 1;
  const numHorizontalLines = Math.floor(roomSize.height / fineGridSize) + 1;

  console.log("Grid calculation:", {
    roomWidth: roomSize.width,
    roomHeight: roomSize.height,
    gridSize,
    fineGridSize,
    numVerticalLines,
    numHorizontalLines,
    expectedVertical: roomSize.width / fineGridSize,
    expectedHorizontal: roomSize.height / fineGridSize
  });

  // Lignes verticales avec grille fine
  for (let i = 0; i < numVerticalLines; i++) {
    const x = i * fineGridSize;
    if (x <= roomSize.width) {
      // Ligne principale tous les 4 intervalles de grille fine (= gridSize original)
      const isMainLine = (i % 4 === 0);
      // Ligne de section tous les 40 intervalles (= 10 * gridSize original)
      const isSectionLine = (i % 40 === 0);
      
      let strokeWidth = 0.5;
      let opacity = 0.2;
      
      if (isSectionLine) {
        strokeWidth = 2;
        opacity = 0.9;
      } else if (isMainLine) {
        strokeWidth = 1;
        opacity = 0.6;
      }
      
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={roomSize.height}
          stroke={isDarkMode ? '#374151' : '#e5e7eb'}
          strokeWidth={strokeWidth}
          opacity={opacity}
        />
      );
    }
  }

  // Lignes horizontales avec grille fine
  for (let i = 0; i < numHorizontalLines; i++) {
    const y = i * fineGridSize;
    if (y <= roomSize.height) {
      // Ligne principale tous les 4 intervalles de grille fine (= gridSize original)
      const isMainLine = (i % 4 === 0);
      // Ligne de section tous les 40 intervalles (= 10 * gridSize original)
      const isSectionLine = (i % 40 === 0);
      
      let strokeWidth = 0.5;
      let opacity = 0.2;
      
      if (isSectionLine) {
        strokeWidth = 2;
        opacity = 0.9;
      } else if (isMainLine) {
        strokeWidth = 1;
        opacity = 0.6;
      }
      
      gridLines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={roomSize.width}
          y2={y}
          stroke={isDarkMode ? '#374151' : '#e5e7eb'}
          strokeWidth={strokeWidth}
          opacity={opacity}
        />
      );
    }
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={roomSize.width}
      height={roomSize.height}
      style={{ zIndex: 1 }}
    >
      {gridLines}
      
      {/* Labels pour les mesures - seulement sur les lignes de section */}
      {scale > 0.2 && (
        <>
          {/* Labels horizontaux - tous les 40 intervalles de grille fine */}
          {Array.from({ length: numVerticalLines }, (_, i) => {
            const x = i * fineGridSize;
            const meters = (x / gridSize); // Nombre de carreaux de grille principale
            
            // Afficher un label tous les 40 intervalles de grille fine
            const shouldShowLabel = (i % 40 === 0 && i > 0);
            
            if (x <= roomSize.width && shouldShowLabel) {
              return (
                <text
                  key={`label-h-${i}`}
                  x={x}
                  y={15}
                  fontSize={Math.max(10, 12 / scale)}
                  fill={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  textAnchor="middle"
                  className="select-none"
                >
                  {meters}m
                </text>
              );
            }
            return null;
          })}
          
          {/* Labels verticaux - tous les 40 intervalles de grille fine */}
          {Array.from({ length: numHorizontalLines }, (_, i) => {
            const y = i * fineGridSize;
            const meters = (y / gridSize); // Nombre de carreaux de grille principale
            
            const shouldShowLabel = (i % 40 === 0 && i > 0);
            
            if (y <= roomSize.height && shouldShowLabel) {
              return (
                <text
                  key={`label-v-${i}`}
                  x={15}
                  y={y + 4}
                  fontSize={Math.max(10, 12 / scale)}
                  fill={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  textAnchor="start"
                  className="select-none"
                >
                  {meters}m
                </text>
              );
            }
            return null;
          })}
        </>
      )}
    </svg>
  );
};

export default FloorPlanGrid;

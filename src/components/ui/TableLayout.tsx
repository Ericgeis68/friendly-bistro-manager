import React, { useState, useEffect } from 'react';
import FloorPlanEditor from './FloorPlanEditor';
import { supabaseHelpers } from '../../utils/supabase';
import { FloorPlan } from '../../types/floorPlan';

interface TableLayoutProps {
  selectedTable: string;
  onTableSelect: (tableNumber: string) => void;
  tablesWithOrders: string[];
  isDarkMode: boolean;
}

const TableLayout: React.FC<TableLayoutProps> = ({
  selectedTable,
  onTableSelect,
  tablesWithOrders,
  isDarkMode
}) => {
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFloorPlan = async () => {
      try {
        setLoading(true);
        // Charger le plan de salle principal depuis la base de données
        let loadedPlan = await supabaseHelpers.getFloorPlan('main_floor_plan');

        if (!loadedPlan) {
          // Si aucun plan n'existe, utiliser un plan par défaut
          loadedPlan = {
            id: 'main_floor_plan',
            name: 'Plan de la salle',
            roomSize: { width: 420, height: 420 },
            elements: [
              // Tables par défaut
              { id: 'table_1', type: 'table', position: { x: 50, y: 50 }, size: { width: 40, height: 40 }, number: '1', seats: 4, shape: 'round' },
              { id: 'table_2', type: 'table', position: { x: 180, y: 50 }, size: { width: 40, height: 40 }, number: '2', seats: 4, shape: 'round' },
              { id: 'table_3', type: 'table', position: { x: 310, y: 50 }, size: { width: 35, height: 35 }, number: '3', seats: 2, shape: 'round' },
              { id: 'table_4', type: 'table', position: { x: 50, y: 130 }, size: { width: 50, height: 50 }, number: '4', seats: 6, shape: 'round' },
              { id: 'table_5', type: 'table', position: { x: 180, y: 130 }, size: { width: 40, height: 40 }, number: '5', seats: 4, shape: 'round' },
              { id: 'table_6', type: 'table', position: { x: 310, y: 130 }, size: { width: 40, height: 40 }, number: '6', seats: 4, shape: 'round' },
              { id: 'table_7', type: 'table', position: { x: 50, y: 220 }, size: { width: 35, height: 35 }, number: '7', seats: 2, shape: 'round' },
              { id: 'table_8', type: 'table', position: { x: 180, y: 220 }, size: { width: 40, height: 40 }, number: '8', seats: 4, shape: 'round' },
              { id: 'table_9', type: 'table', position: { x: 310, y: 220 }, size: { width: 50, height: 50 }, number: '9', seats: 6, shape: 'round' },
              { id: 'table_10', type: 'table', position: { x: 115, y: 320 }, size: { width: 60, height: 60 }, number: '10', seats: 8, shape: 'round' },
              { id: 'table_11', type: 'table', position: { x: 245, y: 320 }, size: { width: 60, height: 60 }, number: '11', seats: 8, shape: 'round' },
              
              // Autres éléments par défaut
              { id: 'bar_1', type: 'bar', position: { x: 150, y: 10 }, size: { width: 120, height: 20 }, name: 'Bar' },
              { id: 'pillar_1', type: 'pillar', position: { x: 20, y: 100 }, size: { width: 15, height: 15 }, name: 'P1', shape: 'round' },
              { id: 'pillar_2', type: 'pillar', position: { x: 380, y: 100 }, size: { width: 15, height: 15 }, name: 'P2', shape: 'round' },
              { id: 'stage_1', type: 'stage', position: { x: 20, y: 350 }, size: { width: 80, height: 40 }, name: 'Scène' },
              { id: 'wall_1', type: 'wall', position: { x: 10, y: 400 }, size: { width: 400, height: 8 }, name: 'Mur Sud', thickness: 8 },
              { id: 'wall_2', type: 'wall', position: { x: 0, y: 10 }, size: { width: 8, height: 390 }, name: 'Mur Ouest', thickness: 8 },
              { id: 'wall_3', type: 'wall', position: { x: 412, y: 10 }, size: { width: 8, height: 390 }, name: 'Mur Est', thickness: 8 },
              { id: 'dancefloor_1', type: 'dancefloor', position: { x: 320, y: 350 }, size: { width: 80, height: 60 }, name: 'Piste' }
            ]
          };
          // Sauvegarder le plan par défaut
          await supabaseHelpers.upsertFloorPlan(loadedPlan);
        }
        setFloorPlan(loadedPlan);
      } catch (error) {
        console.error("Erreur lors du chargement du plan de salle:", error);
        // En cas d'erreur, utiliser un plan minimal
        setFloorPlan({
          id: 'default',
          name: 'Plan de la salle',
          roomSize: { width: 420, height: 420 },
          elements: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadFloorPlan();
  }, []);

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-32 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Chargement du plan de salle...
      </div>
    );
  }

  if (!floorPlan) {
    return (
      <div className={`flex justify-center items-center h-32 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Aucun plan de salle disponible
      </div>
    );
  }

  return (
    <div>
      <FloorPlanEditor
        initialPlan={floorPlan}
        isDarkMode={isDarkMode}
        tablesWithOrders={tablesWithOrders}
        selectedTable={selectedTable}
        onTableSelect={onTableSelect}
        readOnly={true}
      />
      
      {/* Légende */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded border-2 mr-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Table libre</span>
        </div>
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded border-2 mr-2 ${isDarkMode ? 'bg-yellow-600 border-yellow-400' : 'bg-yellow-400 border-yellow-300'}`}></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Commande en cours</span>
        </div>
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded border-2 mr-2 ${isDarkMode ? 'bg-blue-600 border-blue-400' : 'bg-blue-500 border-blue-300'}`}></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Sélectionnée</span>
        </div>
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full mr-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-400 border-gray-300'} border-2`}></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Poteau</span>
        </div>
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded mr-2 ${isDarkMode ? 'bg-orange-700 border-orange-600' : 'bg-orange-500 border-orange-400'} border-2`}></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Bar</span>
        </div>
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded mr-2 ${isDarkMode ? 'bg-purple-700 border-purple-600' : 'bg-purple-500 border-purple-400'} border-2`}></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Scène</span>
        </div>
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded mr-2 ${isDarkMode ? 'bg-red-700 border-red-600' : 'bg-red-500 border-red-400'} border-2`}></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Mur</span>
        </div>
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded mr-2 ${isDarkMode ? 'bg-green-700 border-green-600' : 'bg-green-500 border-green-400'} border-2`}></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Piste de danse</span>
        </div>
      </div>
    </div>
  );
};

export default TableLayout;

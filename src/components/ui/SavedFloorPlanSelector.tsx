
import React, { useState, useEffect } from 'react';
import { FloorPlan } from '../../types/floorPlan';
import { supabaseHelpers } from '../../utils/supabase';
import FloorPlanEditor from './FloorPlanEditor';

interface SavedFloorPlanSelectorProps {
  selectedTable: string;
  onTableSelect: (tableNumber: string) => void;
  tablesWithOrders: string[];
  isDarkMode: boolean;
}

const SavedFloorPlanSelector: React.FC<SavedFloorPlanSelectorProps> = ({
  selectedTable,
  onTableSelect,
  tablesWithOrders,
  isDarkMode
}) => {
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFloorPlans = async () => {
      try {
        setLoading(true);
        
        // Récupérer tous les plans depuis la base de données
        const { data, error } = await supabaseHelpers.supabase
          .from('floor_plans')
          .select('*')
          .order('created_at');
        
        if (error) throw error;
        
        const validPlans = data?.map(plan => ({
          id: plan.id,
          name: plan.name,
          roomSize: plan.room_size,
          elements: plan.elements
        })) || [];
        
        setFloorPlans(validPlans);
        if (validPlans.length > 0) {
          setSelectedPlanId(validPlans[0].id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des plans:", error);
        setFloorPlans([]);
      } finally {
        setLoading(false);
      }
    };

    loadFloorPlans();
  }, []);

  const currentPlan = floorPlans.find(plan => plan.id === selectedPlanId);

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-32 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Chargement des plans de salle...
      </div>
    );
  }

  if (floorPlans.length === 0) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow text-center`}>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Aucun plan de salle disponible. Veuillez en créer un dans l'interface d'administration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sélecteur de salle */}
      {floorPlans.length > 1 && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 shadow`}>
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Choisir une salle
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {floorPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200
                  ${selectedPlanId === plan.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <div className="font-medium">{plan.name}</div>
                <div className="text-sm opacity-75">
                  {plan.elements.filter(e => e.type === 'table').length} tables
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Plan de salle */}
      {currentPlan && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 shadow`}>
          <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {currentPlan.name}
          </h3>
          <FloorPlanEditor
            initialPlan={currentPlan}
            isDarkMode={isDarkMode}
            tablesWithOrders={tablesWithOrders}
            selectedTable={selectedTable}
            onTableSelect={onTableSelect}
            readOnly={true}
          />
        </div>
      )}

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
      </div>
    </div>
  );
};

export default SavedFloorPlanSelector;

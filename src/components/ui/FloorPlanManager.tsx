
import React, { useState, useEffect } from 'react';
import FloorPlanEditor from './FloorPlanEditor';
import { FloorPlan } from '../../types/floorPlan';
import { supabaseHelpers } from '../../utils/supabase';
import { Plus, Edit3, Trash2, Copy } from 'lucide-react';

interface FloorPlanManagerProps {
  isDarkMode: boolean;
  onSave?: (plans: FloorPlan[]) => void;
}

const FloorPlanManager: React.FC<FloorPlanManagerProps> = ({
  isDarkMode,
  onSave
}) => {
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger tous les plans depuis la base de données
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
        
        if (validPlans.length === 0) {
          // Si aucun plan n'existe, créer un plan par défaut
          const defaultPlan = {
            id: 'main_floor_plan',
            name: 'Plan principal',
            roomSize: { width: 800, height: 600 },
            elements: []
          };
          await supabaseHelpers.upsertFloorPlan(defaultPlan);
          setFloorPlans([defaultPlan]);
          setSelectedPlan(defaultPlan.id);
        } else {
          setFloorPlans(validPlans);
          setSelectedPlan(validPlans[0].id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des plans:", error);
        // Plan de secours
        const defaultPlan = {
          id: 'main_floor_plan',
          name: 'Plan principal',
          roomSize: { width: 800, height: 600 },
          elements: []
        };
        setFloorPlans([defaultPlan]);
        setSelectedPlan(defaultPlan.id);
      } finally {
        setLoading(false);
      }
    };

    loadFloorPlans();
  }, []);
  
  const handleSavePlan = async (updatedPlan: FloorPlan) => {
    try {
      await supabaseHelpers.upsertFloorPlan(updatedPlan);
      
      setFloorPlans(prev => 
        prev.map(plan => 
          plan.id === updatedPlan.id ? updatedPlan : plan
        )
      );
      
      if (onSave) {
        const updated = floorPlans.map(plan => 
          plan.id === updatedPlan.id ? updatedPlan : plan
        );
        onSave(updated);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde du plan");
    }
  };

  const addNewPlan = async () => {
    const newPlan: FloorPlan = {
      id: `plan_${Date.now()}`,
      name: `Nouvelle salle ${floorPlans.length + 1}`,
      roomSize: { width: 800, height: 600 },
      elements: []
    };
    
    try {
      await supabaseHelpers.upsertFloorPlan(newPlan);
      setFloorPlans(prev => [...prev, newPlan]);
      setSelectedPlan(newPlan.id);
    } catch (error) {
      console.error("Erreur lors de la création du plan:", error);
      alert("Erreur lors de la création du nouveau plan");
    }
  };

  const duplicatePlan = async (planId: string) => {
    const originalPlan = floorPlans.find(plan => plan.id === planId);
    if (!originalPlan) return;
    
    const duplicatedPlan: FloorPlan = {
      ...originalPlan,
      id: `${originalPlan.id}_copy_${Date.now()}`,
      name: `${originalPlan.name} (Copie)`,
      elements: originalPlan.elements.map(element => ({
        ...element,
        id: `${element.id}_copy_${Date.now()}`
      }))
    };
    
    try {
      await supabaseHelpers.upsertFloorPlan(duplicatedPlan);
      setFloorPlans(prev => [...prev, duplicatedPlan]);
      setSelectedPlan(duplicatedPlan.id);
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
      alert("Erreur lors de la duplication du plan");
    }
  };

  const deletePlan = async (planId: string) => {
    if (floorPlans.length <= 1) {
      alert("Vous devez garder au moins un plan de salle.");
      return;
    }
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce plan de salle ?")) {
      return;
    }
    
    try {
      const { error } = await supabaseHelpers.supabase
        .from('floor_plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;
      
      setFloorPlans(prev => prev.filter(plan => plan.id !== planId));
      
      if (selectedPlan === planId) {
        const remainingPlan = floorPlans.find(plan => plan.id !== planId);
        setSelectedPlan(remainingPlan?.id || floorPlans[0].id);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du plan");
    }
  };


  const currentPlan = floorPlans.find(plan => plan.id === selectedPlan);

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Chargement des plans...
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} min-h-screen p-4`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Gestionnaire de plans de salle
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  isEditing 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Edit3 size={16} />
                {isEditing ? 'Mode visualisation' : 'Mode édition'}
              </button>
            </div>
          </div>

          {/* Sélecteur de salle */}
          <div className="flex flex-wrap gap-2 mb-4">
            {floorPlans.map((plan) => (
              <div key={plan.id} className="flex items-center">
                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`px-4 py-2 rounded-l-md transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {plan.name}
                </button>
                {isEditing && (
                  <div className="flex">
                    <button
                      onClick={() => duplicatePlan(plan.id)}
                      className="px-2 py-2 bg-green-500 text-white hover:bg-green-600"
                      title="Dupliquer"
                    >
                      <Copy size={14} />
                    </button>
                    {floorPlans.length > 1 && (
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="px-2 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {isEditing && (
              <button
                onClick={addNewPlan}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
              >
                <Plus size={16} />
                Nouvelle salle
              </button>
            )}
          </div>

        </div>

        {/* Éditeur de plan */}
        {currentPlan && (
          <FloorPlanEditor
            key={currentPlan.id}
            initialPlan={currentPlan}
            isDarkMode={isDarkMode}
            onSave={handleSavePlan}
            readOnly={!isEditing}
          />
        )}
      </div>
    </div>
  );
};

export default FloorPlanManager;

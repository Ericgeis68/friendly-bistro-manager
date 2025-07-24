import React, { useState, useEffect } from 'react';
import FloorPlanEditor from './FloorPlanEditor';
import { FloorPlan } from '../../types/floorPlan';
import { supabaseHelpers } from '../../utils/supabase';
import { Plus, Edit3, Trash2, Copy, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const [editingPlanName, setEditingPlanName] = useState<string | null>(null);
  const [tempPlanName, setTempPlanName] = useState('');

  // Charger tous les plans depuis la base de données
  useEffect(() => {
    const loadFloorPlans = async () => {
      try {
        setLoading(true);
        console.log("Loading floor plans from Supabase...");
        
        // Récupérer tous les plans depuis la base de données
        const { data, error } = await supabaseHelpers.supabase
          .from('floor_plans')
          .select('*')
          .order('created_at');
        
        if (error) {
          console.error("Error loading floor plans:", error);
          throw error;
        }
        
        console.log("Raw floor plans data:", data);
        
        const validPlans = data?.map(plan => ({
          id: plan.id,
          name: plan.name,
          roomSize: plan.room_size,
          elements: plan.elements,
          gridSize: plan.grid_size || 100
        })) || [];
        
        console.log("Processed floor plans:", validPlans);
        
        if (validPlans.length === 0) {
          // Si aucun plan n'existe, créer un plan par défaut
          const defaultPlan = {
            id: 'main_floor_plan',
            name: 'Plan principal',
            roomSize: { width: 1000, height: 800 },
            elements: [],
            gridSize: 100
          };
          console.log("Creating default plan:", defaultPlan);
          await supabaseHelpers.upsertFloorPlan(defaultPlan);
          setFloorPlans([defaultPlan]);
          setSelectedPlan(defaultPlan.id);
        } else {
          setFloorPlans(validPlans);
          setSelectedPlan(validPlans[0].id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des plans:", error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les plans de salle depuis Supabase",
          variant: "destructive",
        });
        // Plan de secours
        const defaultPlan = {
          id: 'main_floor_plan',
          name: 'Plan principal',
          roomSize: { width: 1000, height: 800 },
          elements: [],
          gridSize: 100
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
      console.log("Saving floor plan:", updatedPlan);
      
      // CORRECTION CRITIQUE : Assurer que gridSize est inclus
      const planToSave = {
        ...updatedPlan,
        gridSize: updatedPlan.gridSize || 100
      };
      
      await supabaseHelpers.upsertFloorPlan(planToSave);
      console.log("Floor plan saved successfully");
      
      setFloorPlans(prev => 
        prev.map(plan => 
          plan.id === updatedPlan.id ? planToSave : plan
        )
      );
      
      if (onSave) {
        const updated = floorPlans.map(plan => 
          plan.id === updatedPlan.id ? planToSave : plan
        );
        onSave(updated);
      }
      
      toast({
        title: "Plan sauvegardé",
        description: "Le plan de salle a été sauvegardé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder le plan dans Supabase",
        variant: "destructive",
      });
    }
  };

  const addNewPlan = async () => {
    const newPlan: FloorPlan = {
      id: `plan_${Date.now()}`,
      name: `Nouvelle salle ${floorPlans.length + 1}`,
      roomSize: { width: 1000, height: 800 },
      elements: [],
      gridSize: 100
    };
    
    try {
      console.log("Creating new plan:", newPlan);
      await supabaseHelpers.upsertFloorPlan(newPlan);
      setFloorPlans(prev => [...prev, newPlan]);
      setSelectedPlan(newPlan.id);
      
      // Démarrer l'édition du nom immédiatement
      setEditingPlanName(newPlan.id);
      setTempPlanName(newPlan.name);
      
      toast({
        title: "Nouveau plan créé",
        description: "Un nouveau plan de salle a été créé",
      });
    } catch (error) {
      console.error("Erreur lors de la création du plan:", error);
      toast({
        title: "Erreur de création",
        description: "Impossible de créer le nouveau plan",
        variant: "destructive",
      });
    }
  };

  const startEditingPlanName = (planId: string, currentName: string) => {
    setEditingPlanName(planId);
    setTempPlanName(currentName);
  };

  const savePlanName = async (planId: string) => {
    if (!tempPlanName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la salle ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    try {
      const planToUpdate = floorPlans.find(plan => plan.id === planId);
      if (!planToUpdate) return;

      const updatedPlan = {
        ...planToUpdate,
        name: tempPlanName.trim()
      };

      await supabaseHelpers.upsertFloorPlan(updatedPlan);
      
      setFloorPlans(prev => 
        prev.map(plan => 
          plan.id === planId ? updatedPlan : plan
        )
      );

      setEditingPlanName(null);
      setTempPlanName('');

      toast({
        title: "Nom modifié",
        description: "Le nom de la salle a été modifié avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la modification du nom:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le nom de la salle",
        variant: "destructive",
      });
    }
  };

  const cancelEditingPlanName = () => {
    setEditingPlanName(null);
    setTempPlanName('');
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
      console.log("Duplicating plan:", duplicatedPlan);
      await supabaseHelpers.upsertFloorPlan(duplicatedPlan);
      setFloorPlans(prev => [...prev, duplicatedPlan]);
      setSelectedPlan(duplicatedPlan.id);
      toast({
        title: "Plan dupliqué",
        description: "Le plan a été dupliqué avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
      toast({
        title: "Erreur de duplication",
        description: "Impossible de dupliquer le plan",
        variant: "destructive",
      });
    }
  };

  const deletePlan = async (planId: string) => {
    if (floorPlans.length <= 1) {
      toast({
        title: "Suppression impossible",
        description: "Vous devez garder au moins un plan de salle.",
        variant: "destructive",
      });
      return;
    }
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce plan de salle ?")) {
      return;
    }
    
    try {
      console.log("Deleting plan:", planId);
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
      
      toast({
        title: "Plan supprimé",
        description: "Le plan de salle a été supprimé",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer le plan",
        variant: "destructive",
      });
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
                <div className="flex items-center">
                  {editingPlanName === plan.id ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={tempPlanName}
                        onChange={(e) => setTempPlanName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            savePlanName(plan.id);
                          } else if (e.key === 'Escape') {
                            cancelEditingPlanName();
                          }
                        }}
                        className={`px-3 py-2 rounded-l-md border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-800'
                        }`}
                        autoFocus
                      />
                      <button
                        onClick={() => savePlanName(plan.id)}
                        className="px-2 py-2 bg-green-500 text-white hover:bg-green-600"
                        title="Sauvegarder"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditingPlanName}
                        className="px-2 py-2 bg-gray-500 text-white hover:bg-gray-600"
                        title="Annuler"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
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
                  )}
                </div>
                {isEditing && editingPlanName !== plan.id && (
                  <div className="flex">
                    <button
                      onClick={() => startEditingPlanName(plan.id, plan.name)}
                      className="px-2 py-2 bg-blue-500 text-white hover:bg-blue-600"
                      title="Modifier le nom"
                    >
                      <Edit size={14} />
                    </button>
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

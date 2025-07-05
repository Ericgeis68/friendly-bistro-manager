import React, { useState, useEffect } from 'react';
import FloorPlanEditor from '../components/ui/FloorPlanEditor';
import { supabaseHelpers } from '../utils/supabase';
import { FloorPlan } from '../types/floorPlan';

const AdminPage: React.FC = () => {
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDarkMode = true; // Ou récupérez cet état de votre thème global

  useEffect(() => {
    const loadFloorPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        // Tente de charger le plan de salle principal
        let loadedPlan = await supabaseHelpers.getFloorPlan('main_floor_plan');

        if (!loadedPlan) {
          // Si aucun plan n'existe, initialiser un plan par défaut
          console.log("No floor plan found, initializing default.");
          loadedPlan = {
            id: 'main_floor_plan', // Utiliser un ID fixe pour le plan principal
            name: 'Plan de salle principal',
            elements: [],
            roomSize: { width: 1400, height: 1000 }, // 14m x 10m en cm
            gridSize: 100 // 100cm = 1m
          };
          // Sauvegarder le plan par défaut pour qu'il existe dans la DB
          await supabaseHelpers.upsertFloorPlan(loadedPlan);
        }
        setFloorPlan(loadedPlan);
      } catch (err) {
        console.error("Failed to load floor plan:", err);
        setError("Erreur lors du chargement du plan de salle.");
      } finally {
        setLoading(false);
      }
    };

    loadFloorPlan();
  }, []);

  const handleSaveFloorPlan = async (updatedPlan: FloorPlan) => {
    console.log("handleSaveFloorPlan called with:", updatedPlan); // Log added
    try {
      await supabaseHelpers.upsertFloorPlan(updatedPlan);
      setFloorPlan(updatedPlan); // Mettre à jour l'état local après sauvegarde
      console.log('Floor plan saved successfully!'); // Log added
      alert('Plan de salle sauvegardé avec succès !');
    } catch (err) {
      console.error("Error saving floor plan:", err); // Log added
      alert('Erreur lors de la sauvegarde du plan de salle.');
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
        Chargement du plan de salle...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center h-screen ${isDarkMode ? 'bg-gray-900 text-red-400' : 'bg-gray-100 text-red-600'}`}>
        Erreur: {error}
      </div>
    );
  }

  if (!floorPlan) {
    return (
      <div className={`flex justify-center items-center h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
        Aucun plan de salle disponible.
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <h1 className="text-3xl font-bold mb-6 text-center">Gestion du Plan de Salle</h1>
      <FloorPlanEditor
        initialPlan={floorPlan}
        onSave={handleSaveFloorPlan}
        isDarkMode={isDarkMode}
        readOnly={false} // L'admin peut éditer
      />
    </div>
  );
};

export default AdminPage;

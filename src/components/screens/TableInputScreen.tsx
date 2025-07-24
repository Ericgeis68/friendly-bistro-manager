import React, { useState, useEffect } from 'react';
import { Textarea } from "../ui/textarea";
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { supabaseHelpers } from '../../utils/supabase';
import { useRestaurant } from '../../context/RestaurantContext';
import SavedFloorPlanSelector from '../ui/SavedFloorPlanSelector';

interface TableInputScreenProps {
  handleLogout: () => void;
  setTableNumber: (table: string) => void;
  setTableComment: (comment: string) => void;
  setCurrentScreen: (screen: 'category' | 'waitress') => void;
}

const TableInputScreen: React.FC<TableInputScreenProps> = ({
  handleLogout,
  setTableNumber,
  setTableComment,
  setCurrentScreen,
}) => {
  const [localTableNumber, setLocalTableNumber] = useState('');
  const [localTableComment, setLocalTableComment] = useState('');
  const [existingOrders, setExistingOrders] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hasExistingOrders, setHasExistingOrders] = useState(false);
  const [tablesWithOrders, setTablesWithOrders] = useState<string[]>([]);
  const { floorPlanSettings, setSelectedRoom } = useRestaurant();
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Check for existing orders when table number changes
  useEffect(() => {
    const checkExistingOrders = async () => {
      if (!localTableNumber || parseInt(localTableNumber) <= 0) {
        setExistingOrders([]);
        setHasExistingOrders(false);
        return;
      }

      setIsChecking(true);
      try {
        const orders = await supabaseHelpers.getPendingOrders();
        // Filtrer uniquement les commandes en cours (pas terminées)
        const tableOrders = orders.filter((order: any) => 
          order.table_number === localTableNumber && 
          order.status !== 'delivered' && 
          order.status !== 'cancelled'
        );
        
        setExistingOrders(tableOrders);
        // Montrer l'avertissement s'il y a des commandes en cours
        setHasExistingOrders(tableOrders.length > 0);
      } catch (error) {
        console.error("Error checking existing orders:", error);
        setExistingOrders([]);
        setHasExistingOrders(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Debounce the check to avoid too many API calls
    const timer = setTimeout(checkExistingOrders, 500);
    return () => clearTimeout(timer);
  }, [localTableNumber]);

  // Load all tables with orders for the layout
  useEffect(() => {
    const loadTablesWithOrders = async () => {
      try {
        const orders = await supabaseHelpers.getPendingOrders();
        const activeTables = orders
          .filter((order: any) => order.status !== 'delivered' && order.status !== 'cancelled')
          .map((order: any) => order.table_number);
        
        // Remove duplicates
        setTablesWithOrders([...new Set(activeTables)]);
      } catch (error) {
        console.error("Error loading tables with orders:", error);
        setTablesWithOrders([]);
      }
    };

    loadTablesWithOrders();
  }, []);

  const handleSubmit = () => {
    if (!localTableNumber) return;
    if (hasExistingOrders && !localTableComment.trim()) return;
    
    setTableNumber(localTableNumber);
    setTableComment(localTableComment);
    setCurrentScreen('category');
  };

  const handleTableSelect = (tableNumber: string) => {
    setLocalTableNumber(tableNumber);
  };

  const canSubmit = localTableNumber && 
                   (!hasExistingOrders || localTableComment.trim()) && 
                   !isChecking;

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Header */}
      <div className="bg-blue-500 p-4 text-white flex justify-between items-center">
        <button onClick={() => setCurrentScreen('waitress')} className="p-2 rounded-md hover:bg-blue-600">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <div className="text-lg font-medium text-white">Sélection de table</div>
        <div onClick={handleLogout} className="text-blue-200 hover:text-white cursor-pointer">Déconnexion</div>
      </div>

      <div className="flex-1 p-4 overflow-auto space-y-4">
        {/* Saisie de table */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow space-y-4`}>
          <h3 className="text-lg font-medium">Sélection de table</h3>
          
          <input
            type="text"
            placeholder="Entrez le numéro de table"
            className={`w-full h-12 text-lg px-3 rounded-md border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800'}`}
            value={localTableNumber}
            onChange={(e) => setLocalTableNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && canSubmit && handleSubmit()}
          />

          {/* Avertissement pour commandes existantes */}
          {hasExistingOrders && !isChecking && (
            <div className={`p-4 rounded-lg border-2 ${isDarkMode ? 'bg-yellow-900 border-yellow-600 text-yellow-200' : 'bg-yellow-50 border-yellow-400 text-yellow-800'}`}>
              <div className="flex items-center mb-2">
                <AlertTriangle className="mr-2" size={20} />
                <span className="font-medium">Attention - Commandes en cours</span>
              </div>
              <p className="mb-2">
                Il existe déjà {existingOrders.length} commande(s) en cours pour la table {localTableNumber}.
              </p>
              <div className="text-sm space-y-1">
                {existingOrders.map((order: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>Serveuse: {order.waitress}</span>
                    <span>
                      {order.drinks?.length > 0 && "Boissons"} 
                      {order.drinks?.length > 0 && order.meals?.length > 0 && " + "}
                      {order.meals?.length > 0 && "Repas"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 font-medium">
                Vous devez ajouter un commentaire pour différencier cette nouvelle commande.
              </p>
            </div>
          )}

          <Textarea
            placeholder={hasExistingOrders ? 
              "Commentaire obligatoire pour différencier les commandes" : 
              "Commentaire sur la table (optionnel)"
            }
            className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white text-gray-800'} 
              ${hasExistingOrders ? 'border-yellow-400 border-2' : ''}`}
            value={localTableComment}
            onChange={(e) => setLocalTableComment(e.target.value)}
          />

          {hasExistingOrders && !localTableComment.trim() && (
            <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
              Le commentaire est obligatoire car des commandes en cours existent déjà pour cette table.
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full h-12 text-lg rounded-md transition-colors ${
              canSubmit 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Valider la sélection
          </button>
        </div>

        {/* Plans de salle sauvegardés - seulement si activé */}
        {(floorPlanSettings.showRoomSelector || floorPlanSettings.showFloorPlan) && (
          <SavedFloorPlanSelector
            selectedTable={localTableNumber}
            onTableSelect={handleTableSelect}
            tablesWithOrders={tablesWithOrders}
            isDarkMode={isDarkMode}
            showRoomSelector={floorPlanSettings.showRoomSelector}
            showFloorPlan={floorPlanSettings.showFloorPlan}
            onRoomSelect={setSelectedRoom}
          />
        )}
      </div>
    </div>
  );
};

export default TableInputScreen;

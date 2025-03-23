import React from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { MenuItems, MenuItem } from '../../../types/restaurant';
import { useRestaurant } from '../../../context/RestaurantContext';
import { toast } from "../../../hooks/use-toast";
import { ref, update } from 'firebase/database';
import { database } from '../../../utils/firebase';

interface EditMenuScreenProps {
  setCurrentScreenLocal: (screen: string) => void;
}

const EditMenuScreen: React.FC<EditMenuScreenProps> = ({ setCurrentScreenLocal }) => {
  const { menuItems, setMenuItems, saveMenuItemsToFirebase } = useRestaurant();

  const handleAddItem = (category: 'drinks' | 'meals') => {
    // Trouver le plus grand ID actuel pour ce type d'élément
    const items = category === 'drinks' ? menuItems.drinks : menuItems.meals;
    const maxId = items.length > 0 ? Math.max(...items.map(item => item.id)) : 0;
    
    // Rediriger vers l'écran d'ajout avec les informations nécessaires
    setCurrentScreenLocal('addMenuItem');
    
    // Stocker les informations pour l'écran d'ajout
    localStorage.setItem('editCategory', category);
    localStorage.setItem('nextId', String(maxId + 1));
  };

  const handleEditItem = (item: MenuItem, category: 'drinks' | 'meals') => {
    // Stocker l'élément à modifier et sa catégorie pour l'écran d'édition
    localStorage.setItem('editItem', JSON.stringify(item));
    localStorage.setItem('editCategory', category);
    
    // Rediriger vers l'écran d'édition
    setCurrentScreenLocal('editItem');
  };

  const handleDeleteItem = async (id: number, category: 'drinks' | 'meals') => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer cet élément ?`)) {
      // Créer une copie des éléments actuels
      const updatedMenuItems = { ...menuItems };
      
      // Filtrer les éléments pour retirer celui à supprimer
      updatedMenuItems[category] = updatedMenuItems[category].filter(item => item.id !== id);
      
      try {
        // Mettre à jour dans Firebase
        const menuRef = ref(database, 'menuItems');
        await update(menuRef, updatedMenuItems);
        
        // Mettre à jour l'état local
        setMenuItems(updatedMenuItems);
        
        toast({
          title: "Élément supprimé",
          description: "L'élément a été supprimé avec succès",
        });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast({
          title: "Erreur",
          
          description: "Une erreur est survenue lors de la suppression",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Modifier le Menu</h2>
        <button onClick={() => setCurrentScreenLocal('menu')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md p-2">
          <X size={20}/>
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg md:text-xl font-medium">Boissons</h3>
            <button onClick={() => handleAddItem('drinks')} className="bg-green-500 hover:bg-green-600 text-white rounded-md p-2">
              <Plus size={20}/>
            </button>
          </div>
          {menuItems.drinks && menuItems.drinks.length > 0 ? (
            menuItems.drinks.map(drink => (
              <div key={drink.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium text-lg">{drink.name}</div>
                  <div className="text-gray-600">{drink.price.toFixed(2)} €</div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEditItem(drink, 'drinks')} className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-md p-2">
                    <Edit size={20}/>
                  </button>
                  <button onClick={() => handleDeleteItem(drink.id, 'drinks')} className="bg-red-500 hover:bg-red-600 text-white rounded-md p-2">
                    <Trash2 size={20}/>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-4 shadow mb-2 text-gray-500">
              Aucune boisson disponible
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg md:text-xl font-medium">Repas</h3>
            <button onClick={() => handleAddItem('meals')} className="bg-green-500 hover:bg-green-600 text-white rounded-md p-2">
              <Plus size={20}/>
            </button>
          </div>
          {menuItems.meals && menuItems.meals.length > 0 ? (
            menuItems.meals.map(meal => (
              <div key={meal.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium text-lg">{meal.name}</div>
                  <div className="text-gray-600">{meal.price.toFixed(2)} €</div>
                  {meal.needsCooking && (
                    <div className="text-blue-500 text-sm">Demande cuisson</div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEditItem(meal, 'meals')} className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-md p-2">
                    <Edit size={20}/>
                  </button>
                  <button onClick={() => handleDeleteItem(meal.id, 'meals')} className="bg-red-500 hover:bg-red-600 text-white rounded-md p-2">
                    <Trash2 size={20}/>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-4 shadow mb-2 text-gray-500">
              Aucun repas disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditMenuScreen;
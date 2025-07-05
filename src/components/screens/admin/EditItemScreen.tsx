import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MenuItem } from '../../../types/restaurant';
import { useRestaurant } from '../../../context/RestaurantContext';
import { toast } from "../../../hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabaseHelpers } from '../../../utils/supabase';

interface EditItemScreenProps {
  handleCancelEdit: () => void;
}

const EditItemScreen: React.FC<EditItemScreenProps> = ({ handleCancelEdit }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [needsCooking, setNeedsCooking] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editCategory, setEditCategory] = useState<'drinks' | 'meals'>('meals');
  const { menuItems, setMenuItems } = useRestaurant();

  useEffect(() => {
    // Récupérer l'élément à modifier et sa catégorie du localStorage
    const itemJson = localStorage.getItem('editItem');
    const category = localStorage.getItem('editCategory') as 'drinks' | 'meals';
    
    if (itemJson) {
      try {
        const item = JSON.parse(itemJson);
        setEditItem(item);
        setName(item.name || '');
        setPrice(item.price?.toString() || '');
        setNeedsCooking(item.needsCooking || false);
      } catch (e) {
        console.error("Erreur lors du parsing de l'élément à modifier:", e);
      }
    }
    
    if (category) {
      setEditCategory(category);
    }
  }, []);

  const handleSubmit = async () => {
    if (!editItem || !name || !price) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      // Créer une copie du menu
      const updatedMenuItems = { ...menuItems };
      
      // Mettre à jour l'élément
      updatedMenuItems[editCategory] = updatedMenuItems[editCategory].map(item => {
        if (item.id === editItem.id) {
          return { 
            ...item, 
            name, 
            price: parseFloat(price),
            needsCooking: editCategory === 'meals' ? needsCooking : false
          };
        }
        return item;
      });
      
      // Mettre à jour dans Supabase
      await supabaseHelpers.updateMenuItems(updatedMenuItems);
      
      // Mettre à jour l'état local
      setMenuItems(updatedMenuItems);
      
      toast({
        title: "Élément modifié",
        description: "Les modifications ont été enregistrées avec succès",
      });

      // Nettoyer le localStorage et retourner au menu
      localStorage.removeItem('editItem');
      localStorage.removeItem('editCategory');
      handleCancelEdit();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">
          Modifier {editCategory === 'drinks' ? 'une boisson' : 'un repas'}
        </h2>
        <button onClick={handleCancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md p-2">
          <X size={20}/>
        </button>
      </div>
      <div className="bg-white rounded-xl p-6 shadow max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Nom</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border rounded-md h-12 px-3"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">Prix (€)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="w-full border rounded-md h-12 px-3"
          />
        </div>
        {editCategory === 'meals' && (
          <div className="mb-6 flex items-center space-x-2">
            <Switch 
              id="cooking-option" 
              checked={needsCooking}
              onCheckedChange={setNeedsCooking}
            />
            <Label htmlFor="cooking-option">
              Demander la cuisson lors de la commande
            </Label>
          </div>
        )}
        <button 
          onClick={handleSubmit} 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md h-12 text-lg"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
};

export default EditItemScreen;

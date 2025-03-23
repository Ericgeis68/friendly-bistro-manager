
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useRestaurant } from '../../../context/RestaurantContext';
import { toast } from "../../../hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AddMenuItemScreenProps {
  handleCancelEdit: () => void;
}

const AddMenuItemScreen: React.FC<AddMenuItemScreenProps> = ({ handleCancelEdit }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [needsCooking, setNeedsCooking] = useState(false);
  const { menuItems, setMenuItems, saveMenuItemsToFirebase } = useRestaurant();
  const [editCategory, setEditCategory] = useState<'drinks' | 'meals'>('meals');
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    // Récupérer la catégorie et l'ID suivant du localStorage
    const category = localStorage.getItem('editCategory') as 'drinks' | 'meals';
    const id = localStorage.getItem('nextId');
    
    if (category) {
      setEditCategory(category);
    }
    
    if (id) {
      setNextId(parseInt(id));
    }
  }, []);

  const handleSubmit = () => {
    if (!name || !price) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    // Créer un nouvel élément
    const newItem = {
      id: nextId,
      name,
      price: parseFloat(price),
      quantity: 0,
      needsCooking: needsCooking
    };

    // Mettre à jour le menu
    const updatedMenuItems = { ...menuItems };
    updatedMenuItems[editCategory] = [...updatedMenuItems[editCategory], newItem];
    
    // Sauvegarder le menu
    setMenuItems(updatedMenuItems);
    saveMenuItemsToFirebase();
    
    toast({
      title: "Élément ajouté",
      description: `${name} a été ajouté aux ${editCategory === 'drinks' ? 'boissons' : 'repas'}`,
    });

    // Nettoyer le localStorage et retourner au menu
    localStorage.removeItem('editCategory');
    localStorage.removeItem('nextId');
    handleCancelEdit();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">
          Ajouter {editCategory === 'drinks' ? 'une boisson' : 'un repas'}
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
        <button 
          onClick={handleSubmit} 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md h-12 text-lg"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
};

export default AddMenuItemScreen;

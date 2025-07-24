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
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([{ name: 'verre', price: '' }, { name: 'bouteille', price: '' }]);
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
        
        // Gérer les variantes pour les boissons
        if (item.variants && Array.isArray(item.variants)) {
          setHasVariants(true);
          setVariants(item.variants.map(v => ({ name: v.name, price: v.price.toString() })));
        }
      } catch (e) {
        console.error("Erreur lors du parsing de l'élément à modifier:", e);
      }
    }
    
    if (category) {
      setEditCategory(category);
    }
  }, []);

  const handleSubmit = async () => {
    // Vérifier si c'est une boisson avec variantes
    const isVariantDrink = editCategory === 'drinks' && hasVariants && variants.some(v => v.price.trim() !== '');
    
    if (!editItem || !name || (!price && !isVariantDrink)) {
      toast({
        title: "Erreur",
        description: isVariantDrink ? "Veuillez remplir le nom et au moins une variante" : "Veuillez remplir tous les champs",
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
          const updatedItem: any = { 
            ...item, 
            name, 
            needsCooking: editCategory === 'meals' ? needsCooking : false
          };
          
          // Gérer les variantes pour les boissons
          if (editCategory === 'drinks') {
            if (hasVariants) {
              const validVariants = variants.filter(v => v.price.trim() !== '').map(v => ({
                name: v.name,
                price: parseFloat(v.price)
              }));
              if (validVariants.length > 0) {
                updatedItem.variants = validVariants;
                // Pour les articles avec variantes, on met le prix à 0 ou on utilise le premier prix de variante
                updatedItem.price = 0;
              } else {
                updatedItem.price = parseFloat(price);
                delete updatedItem.variants;
              }
            } else {
              // Pas de variantes, utiliser le prix normal
              updatedItem.price = parseFloat(price);
              delete updatedItem.variants;
            }
          } else {
            // Pour les repas, toujours utiliser le prix normal
            updatedItem.price = parseFloat(price);
          }
          
          return updatedItem;
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
        {(!hasVariants || editCategory === 'meals') && (
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
        )}
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
        {editCategory === 'drinks' && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-4">
              <Switch 
                id="variants-option" 
                checked={hasVariants}
                onCheckedChange={setHasVariants}
              />
              <Label htmlFor="variants-option">
                Proposer des variantes (verre/bouteille)
              </Label>
            </div>
            {hasVariants && (
              <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-700">Variantes</h4>
                {variants.map((variant, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].name = e.target.value;
                        setVariants(newVariants);
                      }}
                      className="flex-1 border rounded-md h-10 px-3"
                      placeholder="Nom de la variante"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].price = e.target.value;
                        setVariants(newVariants);
                      }}
                      className="w-24 border rounded-md h-10 px-3"
                      placeholder="Prix"
                    />
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newVariants = variants.filter((_, i) => i !== index);
                          setVariants(newVariants);
                        }}
                        className="text-red-500 hover:text-red-600 px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setVariants([...variants, { name: '', price: '' }])}
                  className="text-blue-500 text-sm hover:text-blue-600"
                >
                  + Ajouter une variante
                </button>
              </div>
            )}
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

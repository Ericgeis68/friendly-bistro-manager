import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import type { MenuItem } from '../../types/restaurant';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import VariantSelectionDialog from '../ui/VariantSelectionDialog';

interface RemoveOption {
  label: string;
  item: MenuItem | { id: number; type: 'normal' };
}

interface DrinkMenuScreenProps {
  tableNumber: string;
  drinksMenu: MenuItem[];
  setCurrentScreen: (screen: 'category') => void;
  setOrder: (order: any) => void;
  order?: { drinks?: MenuItem[]; meals?: MenuItem[] };
}

const DrinkMenuScreen: React.FC<DrinkMenuScreenProps> = ({
  tableNumber,
  drinksMenu,
  setCurrentScreen,
  setOrder,
  order
}) => {
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedDrinkIdForComment, setSelectedDrinkIdForComment] = useState<number | null>(null);
  const [currentComment, setCurrentComment] = useState('');
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [selectedDrinkForVariant, setSelectedDrinkForVariant] = useState<MenuItem | null>(null);
  
  // Local states to manage selected drinks
  const [normalDrinksQuantities, setNormalDrinksQuantities] = useState<Map<number, number>>(new Map());
  const [variantDrinks, setVariantDrinks] = useState<MenuItem[]>([]); // Drinks with variants
  const [commentedDrinks, setCommentedDrinks] = useState<MenuItem[]>([]);
  const [showRemoveVariantDialog, setShowRemoveVariantDialog] = useState(false);
  const [selectedDrinkToRemoveId, setSelectedDrinkToRemoveId] = useState<number | null>(null);
  
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Initialize local states from existing order when component mounts or order changes
  useEffect(() => {
    console.log("DrinkMenuScreen: useEffect - order prop:", order);
    const newNormalQuantities = new Map<number, number>();
    const newVariantDrinks: MenuItem[] = [];
    const newCommentedDrinks: MenuItem[] = [];

    if (order && order.drinks) {
      order.drinks.forEach(drink => {
        if (drink.comment) {
          newCommentedDrinks.push(drink);
        } else if (drink.selectedVariant) {
          newVariantDrinks.push(drink);
        } else {
          const currentQuantity = newNormalQuantities.get(drink.id) || 0;
          newNormalQuantities.set(drink.id, currentQuantity + (drink.quantity || 1));
        }
      });
    }
    setNormalDrinksQuantities(newNormalQuantities);
    setVariantDrinks(newVariantDrinks);
    setCommentedDrinks(newCommentedDrinks);
  }, [order]);
  
  const updateQuantity = (id: number, increment: number) => {
    const drinkItem = drinksMenu.find(drink => drink.id === id);
    
    console.log("DrinkMenuScreen: updateQuantity", { id, increment, drinkItem, variants: drinkItem?.variants });
    
    if (increment > 0 && drinkItem?.variants && drinkItem.variants.length > 0) {
      // Open variant selection dialog for drinks with variants
      console.log("DrinkMenuScreen: Opening variant dialog for", drinkItem.name);
      setSelectedDrinkForVariant(drinkItem);
      setShowVariantDialog(true);
      return;
    }
    
    if (increment < 0) {
      const drinkName = drinkItem?.name;
      const hasVariantItems = variantDrinks.some(d => {
        const originalName = d.name.replace(/ \([^)]*\)$/, '');
        return originalName === drinkName;
      });
      const hasCommentedItems = commentedDrinks.some(d => {
        // Pour les items avec variante + commentaire, comparer le nom original
        if (d.selectedVariant) {
          const originalName = d.name.replace(/ \([^)]*\)$/, '');
          return originalName === drinkName;
        } else {
          // Pour les items avec commentaire seulement
          return d.name === drinkName;
        }
      });
      const hasNormalItems = (normalDrinksQuantities.get(id) || 0) > 0;

      // Si il y a plusieurs types d'items ou simplement des items avec variantes/commentaires, ouvrir le dialogue de sélection
      if (hasVariantItems || hasCommentedItems || (hasNormalItems && (hasVariantItems || hasCommentedItems))) {
        console.log("Opening remove variant/comment dialog for drink:", drinkItem);
        setSelectedDrinkToRemoveId(id);
        setShowRemoveVariantDialog(true);
        return;
      } else if (hasNormalItems) {
        setNormalDrinksQuantities(prev => {
          const newMap = new Map(prev);
          const currentQuantity = newMap.get(id) || 0;
          const updatedQuantity = Math.max(0, currentQuantity - 1);
          if (updatedQuantity > 0) {
            newMap.set(id, updatedQuantity);
          } else {
            newMap.delete(id);
          }
          return newMap;
        });
      }
    } else if (increment > 0 && (!drinkItem?.variants || drinkItem.variants.length === 0)) {
      setNormalDrinksQuantities(prev => {
        const newMap = new Map(prev);
        const currentQuantity = newMap.get(id) || 0;
        newMap.set(id, currentQuantity + 1);
        return newMap;
      });
    }
  };

  const handleCommentClick = (drinkId: number) => {
    setSelectedDrinkIdForComment(drinkId);
    setCurrentComment('');
    setShowCommentDialog(true);
  };

  const saveComment = () => {
    if (selectedDrinkIdForComment && currentComment.trim()) {
      const drink = drinksMenu.find(d => d.id === selectedDrinkIdForComment);
      if (drink) {
        // Si la boisson a des variantes, ouvrir le dialogue de sélection de variante
        if (drink.variants && drink.variants.length > 0) {
          setSelectedDrinkForVariant({
            ...drink,
            comment: currentComment.trim() // Stocker le commentaire temporairement
          });
          setShowVariantDialog(true);
        } else {
          // Sinon, ajouter directement la boisson avec commentaire
          const commentedDrink: MenuItem = {
            ...drink,
            id: Date.now() + Math.random(),
            quantity: 1,
            comment: currentComment.trim()
          };
          setCommentedDrinks(prev => [...prev, commentedDrink]);
        }
      }
    }
    setShowCommentDialog(false);
    setSelectedDrinkIdForComment(null);
    setCurrentComment('');
  };

  const handleVariantSelect = (variant: { name: string; price: number }) => {
    if (selectedDrinkForVariant) {
      const variantDrink: MenuItem = {
        ...selectedDrinkForVariant,
        id: Date.now() + Math.random(),
        name: `${selectedDrinkForVariant.name} (${variant.name})`,
        price: variant.price,
        quantity: 1,
        selectedVariant: variant.name,
        // Conserver le commentaire s'il y en a un
        comment: selectedDrinkForVariant.comment
      };
      
      // Ajouter à la liste appropriée selon s'il y a un commentaire ou non
      if (selectedDrinkForVariant.comment) {
        setCommentedDrinks(prev => [...prev, variantDrink]);
      } else {
        setVariantDrinks(prev => [...prev, variantDrink]);
      }
    }
    setShowVariantDialog(false);
    setSelectedDrinkForVariant(null);
  };

  const handleRemoveSpecificItem = (itemToRemove: MenuItem) => {
    if (itemToRemove.comment) {
      setCommentedDrinks(prev => {
        const index = prev.findIndex(d => d.id === itemToRemove.id);
        if (index > -1) {
          const newDrinks = [...prev];
          newDrinks.splice(index, 1);
          return newDrinks;
        }
        return prev;
      });
    } else if (itemToRemove.selectedVariant) {
      setVariantDrinks(prev => {
        const index = prev.findIndex(d => d.id === itemToRemove.id);
        if (index > -1) {
          const newDrinks = [...prev];
          newDrinks.splice(index, 1);
          return newDrinks;
        }
        return prev;
      });
    }
  };

  const removeCommentedDrink = (indexToRemove: number) => {
    setCommentedDrinks(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Calculer la quantité totale pour chaque boisson (normale + avec variantes + avec commentaires)
  const getTotalQuantityForDrink = (drinkId: number) => {
    const normalQuantity = normalDrinksQuantities.get(drinkId) || 0;
    const drinkName = drinksMenu.find(d => d.id === drinkId)?.name;
    
    // Compter les variantes en se basant sur le nom original de la boisson
    const variantQuantity = variantDrinks.filter(d => {
      // Retirer la partie "(variante)" du nom pour comparer
      const originalName = d.name.replace(/ \([^)]*\)$/, '');
      return originalName === drinkName;
    }).length;
    
    // Compter les commentaires (y compris ceux avec variantes qui sont dans commentedDrinks)
    const commentedQuantity = commentedDrinks.filter(d => {
      if (d.selectedVariant) {
        // Pour les items avec variante + commentaire, comparer le nom original
        const originalName = d.name.replace(/ \([^)]*\)$/, '');
        return originalName === drinkName;
      } else {
        // Pour les items avec commentaire seulement
        return d.name === drinkName;
      }
    }).length;
    
    return normalQuantity + variantQuantity + commentedQuantity;
  };

  const handleValidate = () => {
    const allOrderedDrinks: MenuItem[] = [];
    
    // Ajouter les boissons normales (avec quantité > 0)
    normalDrinksQuantities.forEach((quantity, id) => {
      const drink = drinksMenu.find(d => d.id === id);
      if (drink) {
        for (let i = 0; i < quantity; i++) {
          allOrderedDrinks.push({
            ...drink,
            quantity: 1, // Each item is 1 unit
            comment: undefined,
            selectedVariant: undefined
          });
        }
      }
    });
    
    // Ajouter les boissons avec variantes
    variantDrinks.forEach(drink => {
      allOrderedDrinks.push(drink);
    });
    
    // Ajouter les boissons avec commentaires
    commentedDrinks.forEach(drink => {
      allOrderedDrinks.push(drink);
    });
    
    console.log("DrinkMenuScreen: Validating drinks order with all items:", allOrderedDrinks);
    
    if (allOrderedDrinks.length === 0) {
      setOrder(prev => ({ ...prev, drinks: [] })); // Clear drinks if none selected
      setCurrentScreen('category');
      return;
    }
    
    setOrder(prev => ({ ...prev, drinks: allOrderedDrinks }));
    setCurrentScreen('category');
  };

  const totalAmount = drinksMenu.reduce((sum, drink) => 
    sum + (drink.price * (normalDrinksQuantities.get(drink.id) || 0)), 0
  ) + variantDrinks.reduce((sum, drink) => sum + drink.price, 0) + commentedDrinks.reduce((sum, drink) => sum + drink.price, 0);

  const itemsToRemoveOptions: RemoveOption[] = selectedDrinkToRemoveId 
    ? [
        // Items normaux (si ils existent)
        ...(normalDrinksQuantities.get(selectedDrinkToRemoveId) ? [{
          label: `${drinksMenu.find(d => d.id === selectedDrinkToRemoveId)?.name} (normal)`,
          item: { id: selectedDrinkToRemoveId, type: 'normal' as const }
        }] : []),
        // Items avec variantes SANS commentaires
        ...variantDrinks.filter(drink => {
          const originalName = drink.name.replace(/ \([^)]*\)$/, '');
          const originalDrink = drinksMenu.find(d => d.id === selectedDrinkToRemoveId);
          return originalDrink && originalName === originalDrink.name;
        }).map(drink => ({
          label: drink.name,
          item: drink
        })),
        // Items avec commentaires (avec ou sans variantes)
        ...commentedDrinks.filter(drink => {
          const originalDrink = drinksMenu.find(d => d.id === selectedDrinkToRemoveId);
          if (!originalDrink) return false;
          
          // Pour les items avec variante + commentaire, comparer le nom original
          if (drink.selectedVariant) {
            const originalName = drink.name.replace(/ \([^)]*\)$/, '');
            return originalName === originalDrink.name;
          } else {
            // Pour les items avec commentaire seulement
            return drink.name === originalDrink.name;
          }
        }).map(drink => ({
          label: `${drink.name} ("${drink.comment}")`,
          item: drink
        }))
      ]
    : [];

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="bg-blue-500 p-4 text-white flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => setCurrentScreen('category')} className="mr-2">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Boissons</h1>
            <div className="text-sm">Table {tableNumber}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {drinksMenu.map(drink => (
          <div key={drink.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mb-3 shadow`}>
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className={`font-medium text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{drink.name}</div>
                {drink.variants && drink.variants.length > 0 ? (
                  // Afficher les variantes sur des lignes séparées
                  drink.variants.map((variant, index) => (
                    <div key={index} className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                      {variant.name}: {variant.price.toFixed(2)} €
                    </div>
                  ))
                ) : (
                  // Afficher le prix simple s'il n'y a pas de variantes
                  <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{drink.price.toFixed(2)} €</div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCommentClick(drink.id)}
                  className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'} flex items-center justify-center`}
                >
                  <MessageSquare size={16} />
                </button>
                <button
                  onClick={() => updateQuantity(drink.id, -1)}
                  className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-500'} flex items-center justify-center text-xl font-medium`}
                >
                  -
                </button>
                <span className={`w-6 text-center text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {getTotalQuantityForDrink(drink.id)}
                </span>
                <button
                  onClick={() => updateQuantity(drink.id, 1)}
                  className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-500'} flex items-center justify-center text-xl font-medium`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un commentaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Ex: sans glace, avec citron, etc."
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
              Annuler
            </Button>
            <Button onClick={saveComment} disabled={!currentComment.trim()}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VariantSelectionDialog
        open={showVariantDialog}
        onOpenChange={setShowVariantDialog}
        drinkName={selectedDrinkForVariant?.name || ''}
        variants={selectedDrinkForVariant?.variants || []}
        onVariantSelect={handleVariantSelect}
      />

      {showRemoveVariantDialog && itemsToRemoveOptions.length > 0 && (
        <VariantSelectionDialog
          open={showRemoveVariantDialog}
          onOpenChange={(open) => {
            setShowRemoveVariantDialog(open);
            if (!open) setSelectedDrinkToRemoveId(null);
          }}
          drinkName="Choisir l'élément à retirer"
          variants={itemsToRemoveOptions.map(opt => {
            // Extraire le prix réel de l'item
            const item = opt.item as MenuItem;
            const price = item.selectedVariant 
              ? item.variants?.find(v => v.name === item.selectedVariant)?.price || 0
              : item.price || 0;
            return { name: opt.label, price };
          })}
          onVariantSelect={(variant) => {
            const selectedOption = itemsToRemoveOptions.find(opt => opt.label === variant.name);
            if (selectedOption) {
              if ('type' in selectedOption.item && selectedOption.item.type === 'normal') {
                // Retirer un item normal
                setNormalDrinksQuantities(prev => {
                  const newMap = new Map(prev);
                  const currentQuantity = newMap.get(selectedDrinkToRemoveId!) || 0;
                  const updatedQuantity = Math.max(0, currentQuantity - 1);
                  if (updatedQuantity > 0) {
                    newMap.set(selectedDrinkToRemoveId!, updatedQuantity);
                  } else {
                    newMap.delete(selectedDrinkToRemoveId!);
                  }
                  return newMap;
                });
              } else {
                handleRemoveSpecificItem(selectedOption.item as MenuItem);
              }
            }
            setShowRemoveVariantDialog(false);
            setSelectedDrinkToRemoveId(null);
          }}
        />
      )}

      <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`flex justify-between mb-4 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          <span>Total</span>
          <span>{totalAmount.toFixed(2)} €</span>
        </div>
        <button
          onClick={handleValidate}
          className={`w-full h-12 text-lg ${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md`}
        >
          Valider la commande
        </button>
      </div>
    </div>
  );
};

export default DrinkMenuScreen;

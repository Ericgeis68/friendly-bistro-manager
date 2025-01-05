import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { MenuItem, ScreenType, CookingType } from '../types';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface MealMenuProps {
  setCurrentScreen: (screen: ScreenType) => void;
  mealsMenu: MenuItem[];
  setMealsMenu: (menu: MenuItem[]) => void;
  order: { drinks: MenuItem[]; meals: MenuItem[] };
  setOrder: (order: { drinks: MenuItem[]; meals: MenuItem[] }) => void;
  tableNumber: string;
  handleLogout: () => void;
}

const MealMenu: React.FC<MealMenuProps> = ({
  setCurrentScreen,
  mealsMenu,
  setMealsMenu,
  order,
  setOrder,
  tableNumber,
  handleLogout,
}) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCooking, setSelectedCooking] = useState<CookingType>('À point');

  const updateQuantity = (itemId: number, increment: boolean) => {
    const updatedMenu = mealsMenu.map(item => {
      if (item.id === itemId) {
        const newQuantity = increment ? item.quantity + 1 : Math.max(0, item.quantity - 1);
        if (newQuantity === 1 && (item.name.includes('Entrecôte'))) {
          setSelectedItem(item);
        }
        return {
          ...item,
          quantity: newQuantity,
          cooking: newQuantity > 0 && item.name.includes('Entrecôte') ? selectedCooking : undefined,
        };
      }
      return item;
    });
    setMealsMenu(updatedMenu);

    const updatedMeals = updatedMenu.filter(item => item.quantity > 0);
    setOrder({ ...order, meals: updatedMeals });
  };

  const handleCookingConfirm = () => {
    if (selectedItem) {
      const updatedMenu = mealsMenu.map(item => {
        if (item.id === selectedItem.id) {
          return { ...item, cooking: selectedCooking };
        }
        return item;
      });
      setMealsMenu(updatedMenu);
      
      const updatedMeals = updatedMenu.filter(item => item.quantity > 0);
      setOrder({ ...order, meals: updatedMeals });
      setSelectedItem(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <ArrowLeft
            className="h-6 w-6 text-[#0EA5E9] cursor-pointer mr-4"
            onClick={() => setCurrentScreen('category')}
          />
          <div className="text-lg font-medium text-gray-800">Table {tableNumber}</div>
        </div>
        <div onClick={handleLogout} className="text-[#0EA5E9] cursor-pointer">
          Déconnexion
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Repas</h2>
        <div className="space-y-4">
          {mealsMenu.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-gray-600">{item.price.toFixed(2)} €</div>
                  {item.cooking && (
                    <div className="text-sm text-blue-600">Cuisson: {item.cooking}</div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => updateQuantity(item.id, false)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus className="h-6 w-6 text-[#0EA5E9]" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, true)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus className="h-6 w-6 text-[#0EA5E9]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Choisir la cuisson pour {selectedItem.name}</h3>
            <RadioGroup
              value={selectedCooking}
              onValueChange={(value) => setSelectedCooking(value as CookingType)}
              className="space-y-2"
            >
              {['Bleu', 'Saignant', 'À point', 'Bien cuit'].map((cooking) => (
                <div key={cooking} className="flex items-center space-x-2">
                  <RadioGroupItem value={cooking} id={cooking} />
                  <Label htmlFor={cooking}>{cooking}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleCookingConfirm} className="bg-[#0EA5E9]">
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealMenu;
import React from 'react';
import { Beer, UtensilsCrossed } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CategoryMenuProps {
  setCurrentScreen: (screen: 'boissons' | 'repas') => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ setCurrentScreen }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Button
          onClick={() => setCurrentScreen('boissons')}
          className="w-full h-32 text-xl flex flex-col items-center justify-center space-y-2"
        >
          <Beer size={32} />
          <span>Boissons</span>
        </Button>
        <Button
          onClick={() => setCurrentScreen('repas')}
          className="w-full h-32 text-xl flex flex-col items-center justify-center space-y-2"
        >
          <UtensilsCrossed size={32} />
          <span>Repas</span>
        </Button>
      </div>
    </div>
  );
};

export default CategoryMenu;
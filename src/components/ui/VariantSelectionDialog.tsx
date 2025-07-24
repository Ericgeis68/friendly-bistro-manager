import React from 'react';
import { Button } from './button';
import { Wine } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';

interface VariantSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drinkName: string;
  variants: { name: string; price: number }[];
  onVariantSelect: (variant: { name: string; price: number }) => void;
}

const VariantSelectionDialog: React.FC<VariantSelectionDialogProps> = ({
  open,
  onOpenChange,
  drinkName,
  variants,
  onVariantSelect
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className={isDarkMode ? 'text-white' : 'text-gray-800'}>
            {drinkName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Choisissez votre format :
          </p>
          {variants.map((variant, index) => (
            <Button
              key={index}
              onClick={() => {
                onVariantSelect(variant);
                onOpenChange(false);
              }}
              className={`w-full justify-between ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              variant="outline"
            >
              <span className="flex items-center gap-2">
                {variant.name.includes('verre') && <Wine className="w-4 h-4" />}
                {variant.name.includes('bouteille') && (
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M7 3h10v3l-3 3v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V9l-3-3V3z"/>
                    <path d="M7 6h10"/>
                  </svg>
                )}
                {variant.name}
              </span>
              <span className="font-medium">{variant.price.toFixed(2)} €</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VariantSelectionDialog;
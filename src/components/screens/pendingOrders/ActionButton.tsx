import React from 'react';
import { Trash2, CheckCircle } from 'lucide-react';
import { Order } from '../../../types/restaurant';
import { Button } from '../../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

interface ActionButtonProps {
  order: Order;
  type: 'drinks' | 'meals' | 'all';
  action?: 'cancel' | 'complete';
  className?: string;
  onComplete: (order: Order, type: 'drinks' | 'meals') => void;
  onCancel: (order: Order, type: 'drinks' | 'meals' | 'all') => void;
}

export const getActionButtonText = (order: Order, type: 'drinks' | 'meals' | 'all', action: 'cancel' | 'complete') => {
  if (type === 'drinks') {
    return action === 'complete' ? "Terminer boissons" : "Annuler boissons";
  }
  if (type === 'meals') {
    if (order.mealsStatus === 'ready') return "Terminer repas";
    return "Annuler repas";
  }
  return "Annuler commande";
};

export const getConfirmationText = (order: Order, type: 'drinks' | 'meals' | 'all', action: 'cancel' | 'complete') => {
  if (type === 'drinks') {
    return action === 'complete' 
      ? "Cette action marquera les boissons comme livrées."
      : "Cette action supprimera la commande de boissons.";
  }
  if (type === 'meals') {
    if (order.mealsStatus === 'ready') return "Cette action marquera les repas comme livrés.";
    return "Cette action supprimera la commande de repas.";
  }
  return "Cette action supprimera la commande complète définitivement.";
};

const ActionButton: React.FC<ActionButtonProps> = ({ 
  order, 
  type, 
  action = 'cancel', 
  className = '',
  onComplete,
  onCancel
}) => {
  // Skip rendering if it's a cancel button for ready meals
  if (type === 'meals' && order.mealsStatus === 'ready' && action === 'cancel') {
    return null;
  }

  const buttonText = getActionButtonText(order, type, action);
  const isCompleteAction = action === 'complete';
  const icon = isCompleteAction ? <CheckCircle className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />;

  const handleActionButtonClick = (order: Order, type: 'drinks' | 'meals' | 'all', action: 'cancel' | 'complete') => {
    if (action === 'complete') {
      onComplete(order, type as 'drinks' | 'meals');
    } else {
      onCancel(order, type);
    }
  };

  return (
    <AlertDialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button 
                variant={isCompleteAction ? "default" : "destructive"} 
                size="sm"
                className={className}
              >
                {icon}
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{buttonText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
          <AlertDialogDescription>
            {getConfirmationText(order, type, action)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => handleActionButtonClick(order, type, action)}>
            Confirmer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ActionButton;

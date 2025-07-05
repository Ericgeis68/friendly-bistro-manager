import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { supabaseHelpers } from '../../utils/supabase';

interface WaitressSelectionDialogProps {
  onCallWaitress: (waitress: string | 'all') => void;
  trigger?: React.ReactNode;
}

const WaitressSelectionDialog: React.FC<WaitressSelectionDialogProps> = ({
  onCallWaitress,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [waitresses, setWaitresses] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadWaitresses();
    }
  }, [open]);

  const loadWaitresses = async () => {
    try {
      setLoading(true);
      const data = await supabaseHelpers.getWaitresses();
      setWaitresses(data);
    } catch (error) {
      console.error('Erreur lors du chargement des serveuses:', error);
      setWaitresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (waitress: string | 'all') => {
    onCallWaitress(waitress);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="w-full text-left py-2 px-4 hover:bg-gray-100 flex items-center text-orange-600">
            <Bell className="mr-2" size={16} />
            Appeler les serveuses
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Appeler une serveuse</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Button
            onClick={() => handleCall('all')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={loading || waitresses.length === 0}
          >
            Appeler toutes les serveuses
          </Button>
          <div className="border-t pt-3">
            <p className="text-sm text-gray-600 mb-2">Ou appeler une serveuse spécifique :</p>
            {loading ? (
              <div className="text-center py-4">
                <span className="animate-pulse text-gray-500">Chargement...</span>
              </div>
            ) : waitresses.length === 0 ? (
              <div className="text-center py-4">
                <span className="text-gray-500">Aucune serveuse disponible</span>
              </div>
            ) : (
              waitresses.map((waitress) => (
                <Button
                  key={waitress.id}
                  onClick={() => handleCall(waitress.name)}
                  variant="outline"
                  className="w-full mb-2"
                >
                  {waitress.name}
                </Button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitressSelectionDialog;

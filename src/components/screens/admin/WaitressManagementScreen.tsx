import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { toast } from '../../../hooks/use-toast';
import { supabaseHelpers } from '../../../utils/supabase';

interface Waitress {
  id: string;
  name: string;
  created_at?: string;
}

interface WaitressManagementScreenProps {
  // Props if needed
}

const WaitressManagementScreen: React.FC<WaitressManagementScreenProps> = () => {
  const [waitresses, setWaitresses] = useState<Waitress[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWaitress, setSelectedWaitress] = useState<Waitress | null>(null);
  const [newWaitressName, setNewWaitressName] = useState('');
  const [editWaitressName, setEditWaitressName] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger les serveuses au démarrage
  useEffect(() => {
    loadWaitresses();
  }, []);

  const loadWaitresses = async () => {
    try {
      setLoading(true);
      const data = await supabaseHelpers.getWaitresses();
      setWaitresses(data);
    } catch (error) {
      console.error('Erreur lors du chargement des serveuses:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des serveuses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWaitress = async () => {
    if (!newWaitressName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom pour la serveuse",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si le nom existe déjà
    if (waitresses.some(w => w.name.toLowerCase() === newWaitressName.trim().toLowerCase())) {
      toast({
        title: "Erreur",
        description: "Une serveuse avec ce nom existe déjà",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await supabaseHelpers.createWaitress(newWaitressName.trim());
      await loadWaitresses();
      setNewWaitressName('');
      setShowAddDialog(false);
      
      toast({
        title: "Serveuse ajoutée",
        description: `${newWaitressName} a été ajoutée avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la serveuse:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la serveuse",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditWaitress = async () => {
    if (!selectedWaitress || !editWaitressName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom valide",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si le nouveau nom existe déjà (sauf pour la serveuse actuelle)
    if (waitresses.some(w => w.id !== selectedWaitress.id && w.name.toLowerCase() === editWaitressName.trim().toLowerCase())) {
      toast({
        title: "Erreur",
        description: "Une serveuse avec ce nom existe déjà",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await supabaseHelpers.updateWaitress(selectedWaitress.id, editWaitressName.trim());
      await loadWaitresses();
      setEditWaitressName('');
      setSelectedWaitress(null);
      setShowEditDialog(false);
      
      toast({
        title: "Serveuse modifiée",
        description: `Le nom a été modifié avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de la modification de la serveuse:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la serveuse",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWaitress = async () => {
    if (!selectedWaitress) return;

    try {
      setLoading(true);
      await supabaseHelpers.deleteWaitress(selectedWaitress.id);
      await loadWaitresses();
      setSelectedWaitress(null);
      setShowDeleteDialog(false);
      
      toast({
        title: "Serveuse supprimée",
        description: `${selectedWaitress.name} a été supprimée avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la serveuse:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la serveuse",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (waitress: Waitress) => {
    setSelectedWaitress(waitress);
    setEditWaitressName(waitress.name);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (waitress: Waitress) => {
    setSelectedWaitress(waitress);
    setShowDeleteDialog(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Serveuses</h1>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une serveuse
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Chargement...
          </div>
        ) : waitresses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucune serveuse enregistrée
          </div>
        ) : (
          <ul className="divide-y">
            {waitresses.map((waitress) => (
              <li key={waitress.id} className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="font-medium">{waitress.name}</span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => openEditDialog(waitress)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => openDeleteDialog(waitress)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dialog d'ajout */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle serveuse</DialogTitle>
            <DialogDescription>
              Saisissez le nom de la nouvelle serveuse. Elle pourra se connecter avec ce nom.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={newWaitressName}
                onChange={(e) => setNewWaitressName(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Marie"
                onKeyPress={(e) => e.key === 'Enter' && handleAddWaitress()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddWaitress} disabled={loading}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la serveuse</DialogTitle>
            <DialogDescription>
              Modifiez le nom de la serveuse.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nom
              </Label>
              <Input
                id="edit-name"
                value={editWaitressName}
                onChange={(e) => setEditWaitressName(e.target.value)}
                className="col-span-3"
                onKeyPress={(e) => e.key === 'Enter' && handleEditWaitress()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditWaitress} disabled={loading}>
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la serveuse</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedWaitress?.name} ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteWaitress} disabled={loading}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaitressManagementScreen;

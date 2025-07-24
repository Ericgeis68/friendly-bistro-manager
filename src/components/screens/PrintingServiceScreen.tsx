import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, Play, Pause, Settings, Activity } from 'lucide-react';
import { PrintingDashboard } from './printing/PrintingDashboard';
import { PrintQueue } from './printing/PrintQueue';
import { usePrintingService } from '@/hooks/usePrintingService';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch'; // Import Switch component
import { Label } from '@/components/ui/label'; // Import Label component
import { useRestaurant } from '@/context/RestaurantContext'; // Import useRestaurant for detailed print settings

interface PrintingServiceScreenProps {
  onBack: () => void;
}

export const PrintingServiceScreen: React.FC<PrintingServiceScreenProps> = ({ onBack }) => {
  const { toast } = useToast();
  const {
    isConnected,
    isListening,
    pendingOrders,
    printedOrders,
    lastPrintTime,
    errors,
    autoPrintEnabled, // Get autoPrintEnabled from hook
    startListening, // Keep for internal use if needed by hook, but not exposed via button
    stopListening,  // Keep for internal use if needed by hook, but not exposed via button
    printOrder,
    markAsPrinted,
    clearErrors,
    toggleAutoPrint // Get toggleAutoPrint from hook
  } = usePrintingService();

  // Enhanced toggle function that also controls detailed settings
  const handleGlobalToggle = async (enabled: boolean) => {
    await toggleAutoPrint(enabled);
    
    if (enabled) {
      // When enabling global auto-print, also enable both detailed options
      await saveAutoPrintMealsSetting(true);
      await saveAutoPrintDrinksSetting(true);
    } else {
      // When disabling global auto-print, also disable both detailed options
      await saveAutoPrintMealsSetting(false);
      await saveAutoPrintDrinksSetting(false);
    }
  };

  // Get detailed print settings from RestaurantContext
  const {
    autoPrintMealsEnabled,
    autoPrintDrinksEnabled,
    saveAutoPrintMealsSetting,
    saveAutoPrintDrinksSetting
  } = useRestaurant();

  const handleManualPrint = async (orderId: string) => {
    try {
      await printOrder(orderId);
      toast({
        title: "Impression envoyée",
        description: `Commande ${orderId} envoyée à l'imprimante`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'impression",
        description: "Impossible d'imprimer la commande",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Printer className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Service d'Impression Restaurant</CardTitle>
                  <p className="text-muted-foreground">
                    Impression automatique des commandes en temps réel
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={onBack}>
                Retour
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">
                  {isConnected ? 'Connecté à Supabase' : 'Déconnecté'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Activity className={`h-4 w-4 ${isListening ? 'text-green-500' : 'text-red-500'}`} />
                <span className="font-medium">
                  {isListening ? 'Écoute active' : 'En pause'}
                </span>
              </div>

              <Badge variant={isListening ? "default" : "secondary"}>
                {pendingOrders.length} commandes en attente
              </Badge>

              {lastPrintTime && (
                <span className="text-sm text-muted-foreground">
                  Dernière impression: {new Date(lastPrintTime).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-4">
              {/* Removed Start/Pause buttons as per user request */}
              {/*
              {isListening ? (
                <Button 
                  variant="outline" 
                  onClick={stopListening}
                  className="flex items-center gap-2"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              ) : (
                <Button 
                  onClick={startListening}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Démarrer
                </Button>
              )}
              */}

              {errors.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={clearErrors}
                  size="sm"
                >
                  Effacer erreurs ({errors.length})
                </Button>
              )}

              {/* Printing Configuration */}
              <div className="flex items-center gap-6 ml-auto">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-print-global"
                    checked={autoPrintEnabled}
                    onCheckedChange={handleGlobalToggle}
                  />
                  <Label htmlFor="auto-print-global" className="text-sm font-medium">
                    Impression automatique globale
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Printing Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration détaillée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col">
                  <Label htmlFor="auto-print-meals" className="text-sm font-medium">
                    Impression automatique repas uniquement
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Imprime seulement les commandes de repas
                  </p>
                </div>
                <Switch
                  id="auto-print-meals"
                  checked={autoPrintMealsEnabled}
                  onCheckedChange={saveAutoPrintMealsSetting}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col">
                  <Label htmlFor="auto-print-drinks" className="text-sm font-medium">
                    Impression automatique boissons uniquement
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Imprime seulement les commandes de boissons
                  </p>
                </div>
                <Switch
                  id="auto-print-drinks"
                  checked={autoPrintDrinksEnabled}
                  onCheckedChange={saveAutoPrintDrinksSetting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Layout Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration avancée du ticket</CardTitle>
            <p className="text-sm text-muted-foreground">
              Personnalisez chaque élément de votre ticket d'impression
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              {/* Restaurant Header Settings */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">En-tête du restaurant</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-name">Nom du restaurant</Label>
                    <input
                      id="restaurant-name"
                      type="text"
                      defaultValue={localStorage.getItem('print_restaurant_name') || "HOPLA'GEIS"}
                      onChange={(e) => localStorage.setItem('print_restaurant_name', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                      placeholder="Nom du restaurant"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="header-align">Alignement du titre</Label>
                    <select
                      id="header-align"
                      defaultValue={localStorage.getItem('print_header_align') || 'center'}
                      onChange={(e) => localStorage.setItem('print_header_align', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centré</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="header-size">Taille du titre</Label>
                    <select
                      id="header-size"
                      defaultValue={localStorage.getItem('print_header_size') || 'large'}
                      onChange={(e) => localStorage.setItem('print_header_size', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="small">Petit</option>
                      <option value="normal">Normal</option>
                      <option value="large">Grand</option>
                      <option value="extra-large">Très grand</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="header-bold"
                      defaultChecked={localStorage.getItem('print_header_bold') !== 'false'}
                      onCheckedChange={(checked) => localStorage.setItem('print_header_bold', checked.toString())}
                    />
                    <Label htmlFor="header-bold">Titre en gras</Label>
                  </div>
                </div>
              </div>

              {/* Order Info Settings */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Informations de commande</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="info-align">Alignement des infos</Label>
                    <select
                      id="info-align"
                      defaultValue={localStorage.getItem('print_info_align') || 'left'}
                      onChange={(e) => localStorage.setItem('print_info_align', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centré</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="info-size">Taille des infos</Label>
                    <select
                      id="info-size"
                      defaultValue={localStorage.getItem('print_info_size') || 'normal'}
                      onChange={(e) => localStorage.setItem('print_info_size', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="small">Petit</option>
                      <option value="normal">Normal</option>
                      <option value="large">Grand</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="info-bold"
                      defaultChecked={localStorage.getItem('print_info_bold') !== 'false'}
                      onCheckedChange={(checked) => localStorage.setItem('print_info_bold', checked.toString())}
                    />
                    <Label htmlFor="info-bold">Infos en gras</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-room"
                      defaultChecked={localStorage.getItem('print_show_room') !== 'false'}
                      onCheckedChange={(checked) => localStorage.setItem('print_show_room', checked.toString())}
                    />
                    <Label htmlFor="show-room">Afficher la salle</Label>
                  </div>
                </div>
              </div>

              {/* Items Section Settings */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Articles et sections</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="section-align">Alignement des sections</Label>
                    <select
                      id="section-align"
                      defaultValue={localStorage.getItem('print_section_align') || 'left'}
                      onChange={(e) => localStorage.setItem('print_section_align', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centré</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="section-size">Taille des titres de section</Label>
                    <select
                      id="section-size"
                      defaultValue={localStorage.getItem('print_section_size') || 'normal'}
                      onChange={(e) => localStorage.setItem('print_section_size', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="small">Petit</option>
                      <option value="normal">Normal</option>
                      <option value="large">Grand</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="items-size">Taille des articles</Label>
                    <select
                      id="items-size"
                      defaultValue={localStorage.getItem('print_items_size') || 'normal'}
                      onChange={(e) => localStorage.setItem('print_items_size', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="small">Petit</option>
                      <option value="normal">Normal</option>
                      <option value="large">Grand</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="section-bold"
                      defaultChecked={localStorage.getItem('print_section_bold') !== 'false'}
                      onCheckedChange={(checked) => localStorage.setItem('print_section_bold', checked.toString())}
                    />
                    <Label htmlFor="section-bold">Titres sections en gras</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-emojis"
                      defaultChecked={localStorage.getItem('print_show_emojis') !== 'false'}
                      onCheckedChange={(checked) => localStorage.setItem('print_show_emojis', checked.toString())}
                    />
                    <Label htmlFor="show-emojis">Afficher les émojis (🥤🍽️)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-comments"
                      defaultChecked={localStorage.getItem('print_show_comments') !== 'false'}
                      onCheckedChange={(checked) => localStorage.setItem('print_show_comments', checked.toString())}
                    />
                    <Label htmlFor="show-comments">Afficher les commentaires</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-cooking"
                      defaultChecked={localStorage.getItem('print_show_cooking') !== 'false'}
                      onCheckedChange={(checked) => localStorage.setItem('print_show_cooking', checked.toString())}
                    />
                    <Label htmlFor="show-cooking">Afficher les cuissons</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cooking-bold"
                      defaultChecked={localStorage.getItem('print_cooking_bold') !== 'false'}
                      onCheckedChange={(checked) => localStorage.setItem('print_cooking_bold', checked.toString())}
                    />
                    <Label htmlFor="cooking-bold">Cuissons en gras</Label>
                  </div>
                </div>
              </div>

              {/* Page Layout Settings */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Mise en page et format</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="page-width">Largeur de page</Label>
                    <select
                      id="page-width"
                      defaultValue={localStorage.getItem('printer_page_width') || '80mm'}
                      onChange={(e) => localStorage.setItem('printer_page_width', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="58mm">58mm (petit ticket)</option>
                      <option value="70mm">70mm</option>
                      <option value="80mm">80mm (standard)</option>
                      <option value="110mm">110mm</option>
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="page-height">Hauteur de page</Label>
                    <select
                      id="page-height"
                      defaultValue={localStorage.getItem('printer_page_height') || 'auto'}
                      onChange={(e) => localStorage.setItem('printer_page_height', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="auto">Automatique</option>
                      <option value="297mm">A4 hauteur</option>
                      <option value="279mm">Letter hauteur</option>
                      <option value="200mm">200mm</option>
                      <option value="150mm">150mm</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="page-margin">Marges</Label>
                    <select
                      id="page-margin"
                      defaultValue={localStorage.getItem('printer_margin') || '2mm'}
                      onChange={(e) => localStorage.setItem('printer_margin', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="0mm">Aucune marge</option>
                      <option value="1mm">1mm</option>
                      <option value="2mm">2mm (recommandé)</option>
                      <option value="3mm">3mm</option>
                      <option value="5mm">5mm</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="global-font-size">Taille de police globale</Label>
                    <select
                      id="global-font-size"
                      defaultValue={localStorage.getItem('printer_font_size') || '11px'}
                      onChange={(e) => localStorage.setItem('printer_font_size', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="8px">8px (très petit)</option>
                      <option value="9px">9px (petit)</option>
                      <option value="10px">10px</option>
                      <option value="11px">11px (recommandé)</option>
                      <option value="12px">12px</option>
                      <option value="14px">14px (grand)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="line-height">Espacement des lignes</Label>
                    <select
                      id="line-height"
                      defaultValue={localStorage.getItem('printer_line_height') || '1.3'}
                      onChange={(e) => localStorage.setItem('printer_line_height', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="1.0">Compact (1.0)</option>
                      <option value="1.2">Serré (1.2)</option>
                      <option value="1.3">Normal (1.3)</option>
                      <option value="1.5">Aéré (1.5)</option>
                      <option value="1.8">Très aéré (1.8)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="global-text-align">Alignement général du texte</Label>
                    <select
                      id="global-text-align"
                      defaultValue={localStorage.getItem('printer_text_align') || 'center'}
                      onChange={(e) => localStorage.setItem('printer_text_align', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centré</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Total Section Settings */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Section total</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total-align">Alignement du total</Label>
                    <select
                      id="total-align"
                      defaultValue={localStorage.getItem('print_total_align') || 'left'}
                      onChange={(e) => localStorage.setItem('print_total_align', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centré</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="total-size">Taille du total</Label>
                    <select
                      id="total-size"
                      defaultValue={localStorage.getItem('print_total_size') || 'large'}
                      onChange={(e) => localStorage.setItem('print_total_size', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="small">Petit</option>
                      <option value="normal">Normal</option>
                      <option value="large">Grand</option>
                      <option value="extra-large">Très grand</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="total-bold"
                      defaultChecked={localStorage.getItem('print_total_bold') !== 'false'}
                      onCheckedChange={(checked) => localStorage.setItem('print_total_bold', checked.toString())}
                    />
                    <Label htmlFor="total-bold">Total en gras</Label>
                  </div>
                </div>
              </div>

              {/* Footer Settings */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Pied de page</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer-text">Texte de remerciement</Label>
                    <input
                      id="footer-text"
                      type="text"
                      defaultValue={localStorage.getItem('print_footer_text') || 'Merci de votre visite!'}
                      onChange={(e) => localStorage.setItem('print_footer_text', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                      placeholder="Merci de votre visite!"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="footer-align">Alignement du pied</Label>
                    <select
                      id="footer-align"
                      defaultValue={localStorage.getItem('print_footer_align') || 'center'}
                      onChange={(e) => localStorage.setItem('print_footer_align', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centré</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-print-time"
                      defaultChecked={localStorage.getItem('print_show_print_time') !== 'false'}
                      onCheckedChange={(checked) => localStorage.setItem('print_show_print_time', checked.toString())}
                    />
                    <Label htmlFor="show-print-time">Afficher l'heure d'impression</Label>
                  </div>
                </div>
              </div>

              {/* Spacing Settings */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Espacement</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="section-spacing">Espacement entre sections</Label>
                    <select
                      id="section-spacing"
                      defaultValue={localStorage.getItem('print_section_spacing') || 'normal'}
                      onChange={(e) => localStorage.setItem('print_section_spacing', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="tight">Serré</option>
                      <option value="normal">Normal</option>
                      <option value="loose">Large</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="line-spacing">Espacement des lignes</Label>
                    <select
                      id="line-spacing"
                      defaultValue={localStorage.getItem('print_line_spacing') || 'normal'}
                      onChange={(e) => localStorage.setItem('print_line_spacing', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="tight">Serré</option>
                      <option value="normal">Normal</option>
                      <option value="loose">Large</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="margin-size">Marges</Label>
                    <select
                      id="margin-size"
                      defaultValue={localStorage.getItem('print_margin_size') || 'normal'}
                      onChange={(e) => localStorage.setItem('print_margin_size', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="small">Petites</option>
                      <option value="normal">Normales</option>
                      <option value="large">Grandes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t flex gap-2">
              <Button 
                onClick={() => {
                  // Clear all print settings
                  const keys = Object.keys(localStorage).filter(key => key.startsWith('print_'));
                  keys.forEach(key => localStorage.removeItem(key));
                  window.location.reload();
                }}
                variant="outline"
                size="sm"
              >
                Réinitialiser tous les paramètres
              </Button>
              
              <Button 
                onClick={() => {
                  // Test print with current settings
                  const testOrder = {
                    id: 'test-123',
                    table_number: '5',
                    table_comment: 'Terrasse',
                    room_name: 'Salle principale',
                    waitress: 'Marie',
                    status: 'pending',
                    drinks: [
                      { id: 1, name: 'Coca-Cola', price: 2.50, quantity: 2, needsCooking: false, comment: 'Sans glaçons' }
                    ],
                    meals: [
                      { id: 2, name: 'Burger Maison', price: 12.90, quantity: 1, needsCooking: true, cooking: 'Saignant', comment: 'Sans oignons' }
                    ],
                    created_at: new Date().toISOString()
                  };
                  handleManualPrint('test-preview');
                }}
                variant="default"
                size="sm"
              >
                Aperçu test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Errors Display */}
        {errors.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Erreurs récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errors.slice(-3).map((error, index) => (
                  <div key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {error.timestamp.toLocaleTimeString()}: {error.message}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content - Dashboard only since auto-print handles queue automatically */}
        <PrintingDashboard 
          printedOrders={printedOrders}
          isListening={isListening}
          lastPrintTime={lastPrintTime}
        />
      </div>
    </div>
  );
};

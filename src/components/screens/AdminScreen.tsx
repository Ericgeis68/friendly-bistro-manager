
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, LayoutDashboard, Coffee, Utensils, Settings } from 'lucide-react';
import Sidebar from './admin/Sidebar';
import MenuScreen from './admin/MenuScreen';
import DashboardScreen from './admin/DashboardScreen';
import CookingScreen from './admin/CookingScreen';
import SettingsScreen from './admin/SettingsScreen';
import EditMenuScreen from './admin/EditMenuScreen';
import AddMenuItemScreen from './admin/AddMenuItemScreen';
import EditItemScreen from './admin/EditItemScreen';
import AddCookingOptionScreen from './admin/AddCookingOptionScreen';
import DailySalesScreen from './admin/DailySalesScreen';
import MobileHeader from './admin/MobileHeader';
import { useWindowSize } from 'react-use';
import { useMobile } from '@/hooks/use-mobile';
import { toast } from "@/hooks/use-toast";
import { Button } from '../../components/ui/button';
import { set, ref, get } from "firebase/database";
import { database, cookingOptionsRef } from '../../utils/firebase';

type AdminScreenType = 'dashboard' | 'menu' | 'cooking' | 'settings' | 'editMenu' | 'addMenuItem' | 'editItem' | 'dailySales' | 'addCookingOption' | 'editCooking';

interface AdminScreenProps {
  onLogout: () => void;
  setLoggedInUser: (user: string | null) => void;
  setCurrentScreen: (screen: string) => void;
  cookingOptions: string[];
  setCookingOptions: React.Dispatch<React.SetStateAction<string[]>>;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ 
  onLogout, 
  setLoggedInUser, 
  setCurrentScreen,
  cookingOptions,
  setCookingOptions
}) => {
  const [activeScreen, setActiveScreen] = useState<AdminScreenType>('dashboard');
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedCookingOption, setSelectedCookingOption] = useState<string>('');
  const isMobile = useMobile();

  // Confirm logout handler
  const handleConfirmLogout = () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter?')) {
      onLogout();
    }
  };

  // Save cooking options to Firebase and localStorage
  const saveCookingOptions = (options: string[]) => {
    // Save to Firebase
    set(cookingOptionsRef, options)
      .then(() => {
        console.log("Cooking options saved to Firebase");
        
        // Also save to localStorage as backup
        try {
          localStorage.setItem('cookingOptions', JSON.stringify(options));
        } catch (e) {
          console.error("Error saving to localStorage:", e);
        }
        
        toast({
          title: "Options enregistrées",
          description: "Les options de cuisson ont été enregistrées avec succès.",
        });
      })
      .catch(error => {
        console.error("Error saving cooking options:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer les options de cuisson.",
          variant: "destructive",
        });
      });
  };

  // Add a new cooking option
  const handleAddCookingOption = (newOption: string) => {
    if (!cookingOptions.includes(newOption) && newOption.trim() !== '') {
      const updatedOptions = [...cookingOptions, newOption];
      setCookingOptions(updatedOptions);
      saveCookingOptions(updatedOptions);
      setActiveScreen('cooking');
    } else {
      toast({
        title: "Option déjà existante",
        description: "Cette option de cuisson existe déjà.",
        variant: "destructive",
      });
    }
  };

  // Delete a cooking option
  const handleDeleteCookingOption = (optionToDelete: string) => {
    const updatedOptions = cookingOptions.filter(option => option !== optionToDelete);
    setCookingOptions(updatedOptions);
    saveCookingOptions(updatedOptions);
  };

  // Edit a cooking option
  const handleEditCookingOption = (oldOption: string, newOption: string) => {
    if (oldOption === newOption || newOption.trim() === '') {
      setActiveScreen('cooking');
      return;
    }
    
    if (cookingOptions.includes(newOption)) {
      toast({
        title: "Option déjà existante",
        description: "Cette option de cuisson existe déjà.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedOptions = cookingOptions.map(option => 
      option === oldOption ? newOption : option
    );
    
    setCookingOptions(updatedOptions);
    saveCookingOptions(updatedOptions);
    setActiveScreen('cooking');
  };

  // Navigation sidebar options
  const sidebarOptions = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard /> },
    { id: 'menu', label: 'Menus', icon: <Coffee /> },
    { id: 'cooking', label: 'Cuisson', icon: <Utensils /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings /> },
  ];

  // Handle navigation in sidebar
  const handleNavigation = (screenId: AdminScreenType) => {
    setActiveScreen(screenId);
    setShowMobileMenu(false);
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Render active screen content
  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen setActiveScreen={(screen: AdminScreenType) => setActiveScreen(screen)} />;
      case 'menu':
        return <MenuScreen setActiveScreen={(screen: AdminScreenType) => setActiveScreen(screen)} />;
      case 'cooking':
        return (
          <CookingScreen 
            cookingOptions={cookingOptions} 
            onAddOption={() => setActiveScreen('addCookingOption')}
            onEditOption={(option: string) => {
              setSelectedCookingOption(option);
              setActiveScreen('editCooking');
            }}
            onDeleteOption={handleDeleteCookingOption}
          />
        );
      case 'settings':
        return <SettingsScreen setCurrentScreen={(screen: string) => setCurrentScreen(screen)} setLoggedInUser={setLoggedInUser} />;
      case 'editMenu':
        return <EditMenuScreen setActiveScreen={(screen: AdminScreenType) => setActiveScreen(screen)} />;
      case 'addMenuItem':
        return <AddMenuItemScreen setActiveScreen={(screen: AdminScreenType) => setActiveScreen(screen)} />;
      case 'editItem':
        return <EditItemScreen item={selectedMenuItem} setActiveScreen={(screen: AdminScreenType) => setActiveScreen(screen)} />;
      case 'dailySales':
        return <DailySalesScreen setActiveScreen={(screen: AdminScreenType) => setActiveScreen(screen)} />;
      case 'addCookingOption':
        return (
          <AddCookingOptionScreen 
            onCancel={() => setActiveScreen('cooking')} 
            onSave={(newOption: string) => handleAddCookingOption(newOption)}
          />
        );
      case 'editCooking':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Modifier option de cuisson</h2>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedCookingOption}
                onChange={(e) => setSelectedCookingOption(e.target.value)}
                placeholder="Nouvelle option"
              />
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveScreen('cooking')}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={() => handleEditCookingOption(selectedCookingOption, selectedCookingOption)}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardScreen setActiveScreen={(screen: AdminScreenType) => setActiveScreen(screen)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar for desktop */}
        {!isMobile && (
          <div className="w-64 bg-white shadow-md">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold text-blue-600">Administration</h1>
            </div>
            <Sidebar 
              options={sidebarOptions}
              activeScreen={activeScreen}
              onSelect={handleNavigation}
              onLogout={handleConfirmLogout}
            />
          </div>
        )}
        
        {/* Mobile header */}
        {isMobile && (
          <MobileHeader
            title="Administration"
            showMenu={showMobileMenu}
            toggleMenu={toggleMobileMenu}
            onLogout={handleConfirmLogout}
          />
        )}
        
        {/* Mobile sidebar */}
        {isMobile && showMobileMenu && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 z-20" onClick={toggleMobileMenu}>
            <div className="w-64 h-full bg-white shadow-md" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">Menu</h1>
                <X className="cursor-pointer" onClick={toggleMobileMenu} />
              </div>
              <Sidebar 
                options={sidebarOptions}
                activeScreen={activeScreen}
                onSelect={handleNavigation}
                onLogout={handleConfirmLogout}
              />
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-auto">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;


// Importez les interfaces de props pour chaque composant
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

// Définissez les interfaces pour les props de chaque composant
interface DashboardScreenProps {
  setActiveScreen: (screen: AdminScreenType) => void;
}

interface MenuScreenProps {
  setActiveScreen: (screen: AdminScreenType) => void;
}

interface SettingsScreenProps {
  setCurrentScreen: (screen: string) => void;
  setLoggedInUser: (user: string | null) => void;
}

interface EditMenuScreenProps {
  setActiveScreen: (screen: AdminScreenType) => void;
}

interface AddMenuItemScreenProps {
  setActiveScreen: (screen: AdminScreenType) => void;
}

interface EditItemScreenProps {
  item: any;
  setActiveScreen: (screen: AdminScreenType) => void;
}

interface DailySalesScreenProps {
  setActiveScreen: (screen: AdminScreenType) => void;
}

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

  // Modifiez la fonction renderScreen pour fournir les bonnes props
  // Modifiez la fonction renderScreen pour corriger le double default
  const renderScreen = () => {
    console.log("Rendering screen:", activeScreen);
    
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen 
          localOrders={[]} 
          refreshOrders={() => {}} 
        />;
      case 'menu':
        return <MenuScreen 
          menuItems={{ drinks: [], meals: [] }} // Fournir un objet MenuItems valide
          handleEditMenu={() => setActiveScreen('editMenu')} 
        />;
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
        return <SettingsScreen 
          serverIp="" 
          setServerIp={() => {}}
          connectedDevices={0} // Doit être un nombre, pas un tableau
          setConnectedDevices={() => {}}
          resetApplication={() => {}}
        />;
      case 'editMenu':
        return <EditMenuScreen 
          menuItems={{ drinks: [], meals: [] }} // Fournir un objet MenuItems valide
          setCurrentScreenLocal={() => setActiveScreen('menu')}
          handleAddItem={() => {}}
          handleEditItem={() => {}}
          handleDeleteItem={() => {}}
        />;
      case 'addMenuItem':
        return <AddMenuItemScreen 
          handleCancelEdit={() => setActiveScreen('menu')}
          editCategory="meals"
          handleAddItemSubmit={() => {}}
        />;
      case 'editItem':
        return <EditItemScreen 
          handleCancelEdit={() => setActiveScreen('menu')}
          editItem={selectedMenuItem}
          editCategory="meals"
          handleSaveItem={() => {}}
        />;
      case 'dailySales':
        return <DailySalesScreen 
          localOrders={[]}
          refreshOrders={() => {}}
        />;
      case 'addCookingOption':
        // Check what props AddCookingOptionScreen actually expects
        return (
          <AddCookingOptionScreen 
            editCookingOption=""
            newCookingOption=""
            setNewCookingOption={(option) => setSelectedCookingOption(option)}
            handleSaveCookingOption={() => handleAddCookingOption(selectedCookingOption)}
            handleCancelCookingEdit={() => setActiveScreen('cooking')}
          />
        );
      case 'editCooking':
        // Check what props AddCookingOptionScreen actually expects
        return (
          <AddCookingOptionScreen 
            editCookingOption={selectedCookingOption}
            newCookingOption={selectedCookingOption}
            setNewCookingOption={(option) => setSelectedCookingOption(option)}
            handleSaveCookingOption={() => handleEditCookingOption(selectedCookingOption, selectedCookingOption)}
            handleCancelCookingEdit={() => setActiveScreen('cooking')}
          />
        );
      default:
        // Check what props DashboardScreen actually expects
        // Supprimez le mot-clé default ici et gardez juste le return
        return <DashboardScreen 
          localOrders={[]} 
          refreshOrders={() => {}} 
        />;
  }
};

  // Supprimez les composants Sidebar et MobileHeader qui sont définis en dehors du return
  // et placez-les correctement dans le return
  
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
              currentScreenLocal={activeScreen}
              setCurrentScreenLocal={handleNavigation}
              sidebarOpen={showMobileMenu}
              setSidebarOpen={setShowMobileMenu}
              handleLogoutAdmin={handleConfirmLogout}
              onLogout={onLogout} // Ajout de la propriété manquante
            />
          </div>
        )}
        
        {/* Mobile header */}
        {isMobile && (
          <MobileHeader
            currentScreenLocal={activeScreen}
            setSidebarOpen={setShowMobileMenu}
            sidebarOpen={showMobileMenu}
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
                currentScreenLocal={activeScreen}
                setCurrentScreenLocal={handleNavigation}
                sidebarOpen={showMobileMenu}
                setSidebarOpen={setShowMobileMenu}
                handleLogoutAdmin={handleConfirmLogout}
                onLogout={onLogout} // Ajoutez cette prop
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

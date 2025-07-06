import React, { useState, useEffect } from 'react';
import { X, ChevronRight, LayoutDashboard, Coffee, Utensils, Settings, Users } from 'lucide-react';
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
import WaitressManagementScreen from './admin/WaitressManagementScreen';
import FloorPlanManager from '../ui/FloorPlanManager'; // Utiliser FloorPlanManager au lieu d'AdminPage
import MobileHeader from './admin/MobileHeader';
import { useMobile } from '@/hooks/use-mobile';
import { toast } from "@/hooks/use-toast";
import { supabaseHelpers } from '../../utils/supabase';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order } from '../../types/restaurant';

type AdminScreenType = 'dashboard' | 'menu' | 'cooking' | 'settings' | 'editMenu' | 'addMenuItem' | 'editItem' | 'dailySales' | 'addCookingOption' | 'editCooking' | 'waitresses' | 'floorplan';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const isMobile = useMobile();
  
  // Get data from context instead of setting up subscriptions
  const { 
    pendingOrders, 
    completedOrders, 
    refreshOrders, 
    resetOrders 
  } = useRestaurant();

  useEffect(() => {
    // Combine pending and completed orders for admin view
    setOrders([...pendingOrders, ...completedOrders]);
  }, [pendingOrders, completedOrders]);

  const handleResetApplication = () => {
    resetOrders();
    setOrders([]);
  };

  const handleLogoutAdmin = () => {
    onLogout();
  };

  const saveCookingOptions = async (options: string[]) => {
    try {
      await supabaseHelpers.updateCookingOptions(options);
      console.log("Cooking options saved to Supabase");
      
      try {
        localStorage.setItem('cookingOptions', JSON.stringify(options));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
      
      toast({
        title: "Options enregistrées",
        description: "Les options de cuisson ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error("Error saving cooking options:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les options de cuisson.",
        variant: "destructive",
      });
    }
  };

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

  const handleDeleteCookingOption = (optionToDelete: string) => {
    const updatedOptions = cookingOptions.filter(option => option !== optionToDelete);
    setCookingOptions(updatedOptions);
    saveCookingOptions(updatedOptions);
  };

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

  const sidebarOptions = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard /> },
    { id: 'menu', label: 'Menus', icon: <Coffee /> },
    { id: 'cooking', label: 'Cuisson', icon: <Utensils /> },
    { id: 'floorplan', label: 'Plans de salle', icon: <Settings /> },
    { id: 'waitresses', label: 'Serveuses', icon: <Users /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings /> },
  ];

  const handleNavigation = (screenId: AdminScreenType) => {
    setActiveScreen(screenId);
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleEditMenu = () => {
    setActiveScreen('editMenu');
  };

  const handleCancelEdit = () => {
    setActiveScreen('menu');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen 
          localOrders={orders} 
          refreshOrders={refreshOrders} 
        />;
      case 'menu':
        return <MenuScreen 
          handleEditMenu={handleEditMenu} 
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
      case 'floorplan':
        // Utiliser FloorPlanManager au lieu d'AdminPage pour avoir accès aux modèles prédéfinis
        return <FloorPlanManager isDarkMode={true} />;
      case 'waitresses':
        return <WaitressManagementScreen />;
      case 'settings':
        return <SettingsScreen 
          serverIp="" 
          setServerIp={() => {}}
          connectedDevices={0}
          setConnectedDevices={() => {}}
          resetApplication={handleResetApplication}
        />;
      case 'editMenu':
        return <EditMenuScreen 
          setCurrentScreenLocal={(screen) => setActiveScreen(screen as AdminScreenType)}
        />;
      case 'addMenuItem':
        return <AddMenuItemScreen 
          handleCancelEdit={handleCancelEdit}
        />;
      case 'editItem':
        return <EditItemScreen 
          handleCancelEdit={handleCancelEdit}
        />;
      case 'dailySales':
        return <DailySalesScreen 
          localOrders={orders}
          refreshOrders={refreshOrders}
        />;
      case 'addCookingOption':
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
        return <DashboardScreen 
          localOrders={orders} 
          refreshOrders={refreshOrders} 
        />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-30">
            <MobileHeader
              currentScreenLocal={activeScreen}
              setSidebarOpen={setShowMobileMenu}
              sidebarOpen={showMobileMenu}
            />
          </div>
        )}
        
        {!isMobile && (
          <div className="w-64 bg-white shadow-md h-screen fixed left-0 top-0 z-20">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold text-blue-600">Administration</h1>
            </div>
            <Sidebar 
              currentScreenLocal={activeScreen}
              setCurrentScreenLocal={handleNavigation}
              sidebarOpen={true}
              setSidebarOpen={() => {}}
              handleLogoutAdmin={handleLogoutAdmin}
              onLogout={onLogout}
            />
          </div>
        )}
        
        {isMobile && showMobileMenu && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40" onClick={toggleMobileMenu}>
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
                handleLogoutAdmin={handleLogoutAdmin}
                onLogout={onLogout}
              />
            </div>
          </div>
        )}
        
        <div className={`flex-1 overflow-auto ${!isMobile ? 'ml-64' : ''} ${isMobile ? 'mt-14' : ''}`}>
          {renderScreen()}
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;

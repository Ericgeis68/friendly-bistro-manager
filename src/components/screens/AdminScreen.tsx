
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
import { useMobile } from '@/hooks/use-mobile';
import { toast } from "@/hooks/use-toast";
import { set, ref, get, onValue } from "firebase/database";
import { database, cookingOptionsRef, pendingOrdersRef, completedOrdersRef } from '../../utils/firebase';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { Order } from '../../types/restaurant';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const isMobile = useMobile();
  const { setPendingOrders, setCompletedOrders } = useOrderManagement();

  // Charger toutes les commandes depuis Firebase
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        // Récupérer toutes les commandes (en cours et terminées)
        const pendingSnapshot = await get(pendingOrdersRef);
        const completedSnapshot = await get(completedOrdersRef);
        
        const pendingOrders = pendingSnapshot.exists() ? Object.values(pendingSnapshot.val()) as Order[] : [];
        const completedOrders = completedSnapshot.exists() ? Object.values(completedSnapshot.val()) as Order[] : [];
        
        // Combiner les commandes
        setOrders([...pendingOrders, ...completedOrders]);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes:", error);
      }
    };

    fetchAllOrders();

    // Mettre en place des écouteurs pour les mises à jour en temps réel
    const unsubscribePending = onValue(pendingOrdersRef, () => {
      fetchAllOrders();
    });
    
    const unsubscribeCompleted = onValue(completedOrdersRef, () => {
      fetchAllOrders();
    });
    
    return () => {
      unsubscribePending();
      unsubscribeCompleted();
    };
  }, []);

  // Fonction pour rafraîchir les commandes
  const refreshOrders = async () => {
    try {
      // Récupérer toutes les commandes (en cours et terminées)
      const pendingSnapshot = await get(pendingOrdersRef);
      const completedSnapshot = await get(completedOrdersRef);
      
      const pendingOrders = pendingSnapshot.exists() ? Object.values(pendingSnapshot.val()) as Order[] : [];
      const completedOrders = completedSnapshot.exists() ? Object.values(completedSnapshot.val()) as Order[] : [];
      
      // Combiner les commandes
      setOrders([...pendingOrders, ...completedOrders]);
      
      toast({
        title: "Actualisation",
        description: "Les données ont été actualisées.",
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les commandes.",
        variant: "destructive",
      });
    }
  };

  // Reset application function that clears orders but preserves menu items
  const handleResetApplication = () => {
    // Update local state to clear orders
    setPendingOrders([]);
    setCompletedOrders([]);
    
    toast({
      title: "Application réinitialisée localement",
      description: "Toutes les commandes ont été supprimées localement.",
    });
  };

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

  // Gestionnaires pour les écrans de menu
  const handleEditMenu = () => {
    setActiveScreen('editMenu');
  };

  const handleCancelEdit = () => {
    setActiveScreen('menu');
  };

  // Fonction de rendu des écrans
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
        {/* Mobile header - toujours visible en mode mobile */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-30">
            <MobileHeader
              currentScreenLocal={activeScreen}
              setSidebarOpen={setShowMobileMenu}
              sidebarOpen={showMobileMenu}
            />
          </div>
        )}
        
        {/* Sidebar pour desktop - côté gauche de l'écran */}
        {!isMobile && (
          <div className="w-64 bg-white shadow-md h-screen fixed left-0 top-0 z-20">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold text-blue-600">Administration</h1>
            </div>
            <Sidebar 
              currentScreenLocal={activeScreen}
              setCurrentScreenLocal={handleNavigation}
              sidebarOpen={true}  // Toujours visible en desktop
              setSidebarOpen={() => {}}
              handleLogoutAdmin={handleConfirmLogout}
              onLogout={onLogout}
            />
          </div>
        )}
        
        {/* Menu mobile - s'affiche en overlay lorsqu'activé */}
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
                handleLogoutAdmin={handleConfirmLogout}
                onLogout={onLogout}
              />
            </div>
          </div>
        )}
        
        {/* Zone de contenu principal */}
        <div className={`flex-1 overflow-auto ${!isMobile ? 'ml-64' : ''} ${isMobile ? 'mt-14' : ''}`}>
          {renderScreen()}
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;

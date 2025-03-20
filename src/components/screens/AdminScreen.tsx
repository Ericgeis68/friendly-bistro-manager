
import React, { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import type { MenuItem, Order, ScreenType } from '../../types/restaurant';
import { useRestaurant } from '../../context/RestaurantContext';

// Import all the component screens we've created
import Sidebar from './admin/Sidebar';
import MobileHeader from './admin/MobileHeader';
import DashboardScreen from './admin/DashboardScreen';
import MenuScreen from './admin/MenuScreen';
import EditMenuScreen from './admin/EditMenuScreen';
import AddMenuItemScreen from './admin/AddMenuItemScreen';
import EditItemScreen from './admin/EditItemScreen';
import CookingScreen from './admin/CookingScreen';
import AddCookingOptionScreen from './admin/AddCookingOptionScreen';
import DailySalesScreen from './admin/DailySalesScreen';
import SettingsScreen from './admin/SettingsScreen';

interface AdminScreenProps {
    onLogout: () => void;
    setLoggedInUser: (user: string | null) => void;
    setCurrentScreen: (screen: ScreenType) => void;
    cookingOptions: string[];
    setCookingOptions: (options: string[]) => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ 
  onLogout, 
  setLoggedInUser, 
  setCurrentScreen, 
  cookingOptions, 
  setCookingOptions 
}) => {
    const { menuItems, setMenuItems } = useRestaurant();
    const [currentScreenLocal, setCurrentScreenLocal] = useState<'dashboard' | 'menu' | 'cooking' | 'settings' | 'editMenu' | 'addMenuItem' | 'editItem' | 'dailySales' | 'editCooking' | 'addCookingOption'>('dashboard');
    const [serverIp, setServerIp] = useState<string>('127.0.0.1');
    const [connectedDevices, setConnectedDevices] = useState<number>(5);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);
    const [editCategory, setEditCategory] = useState<'drinks' | 'meals' | null>(null);
    const [localOrders, setLocalOrders] = useState<Order[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // For cooking options management
    const [editCookingOption, setEditCookingOption] = useState<string>('');
    const [newCookingOption, setNewCookingOption] = useState<string>('');

    // Load orders from localStorage on component mount and when orders change
    useEffect(() => {
        refreshOrders();
    }, []);

    // Refresh orders from localStorage
    const refreshOrders = () => {
        const pendingOrdersFromStorage = localStorage.getItem('pendingOrders');
        const completedOrdersFromStorage = localStorage.getItem('completedOrders');

        const pendingOrders = pendingOrdersFromStorage ? JSON.parse(pendingOrdersFromStorage) : [];
        const completedOrders = completedOrdersFromStorage ? JSON.parse(completedOrdersFromStorage) : [];

        setLocalOrders([...pendingOrders, ...completedOrders]);

        toast({
            title: "Données actualisées",
            description: "Les commandes ont été mises à jour.",
        });
    };

    // Clear all completed orders
    const clearCompletedOrders = () => {
        // Get pending orders
        const pendingOrdersFromStorage = localStorage.getItem('pendingOrders');
        const pendingOrders = pendingOrdersFromStorage ? JSON.parse(pendingOrdersFromStorage) : [];

        // Clear completed orders from localStorage
        localStorage.setItem('completedOrders', JSON.stringify([]));

        // Update local state
        setLocalOrders([...pendingOrders]);

        toast({
            title: "Commandes terminées effacées",
            description: "Toutes les commandes terminées ont été supprimées.",
        });
    };

    // Réinitialiser l'application (supprimer toutes les commandes)
    const resetApplication = () => {
        // Vider toutes les commandes dans localStorage
        localStorage.setItem('pendingOrders', JSON.stringify([]));
        localStorage.setItem('completedOrders', JSON.stringify([]));
        
        // Réinitialiser les notifications
        localStorage.setItem('pendingNotifications', JSON.stringify([]));
        
        // Forcer un rechargement de la page pour que tous les composants se réinitialisent
        // Cette technique assure que toutes les vues (serveuse, cuisine, etc.) sont mises à jour
        window.location.reload();
        
        // Mettre à jour l'état local
        setLocalOrders([]);
        
        toast({
            title: "Application réinitialisée",
            description: "Toutes les commandes ont été supprimées. Les menus et cuissons sont conservés.",
        });
    };

    const handleEditMenu = () => {
        setCurrentScreenLocal('editMenu');
    };

    const handleAddItem = (category: 'drinks' | 'meals') => {
        setEditCategory(category);
        setCurrentScreenLocal('addMenuItem');
    };

    const handleEditItem = (item: MenuItem, category: 'drinks' | 'meals') => {
        setEditItem(item);
        setEditCategory(category);
        setCurrentScreenLocal('editItem');
    };

    const handleSaveItem = (editedItem: MenuItem) => {
        if (!editCategory) return;
        setMenuItems(prev => {
            const updatedMenuItems = {
                ...prev,
                [editCategory]: prev[editCategory].map(item =>
                    item.id === editedItem.id ? { ...editedItem } : item
                )
            };
            localStorage.setItem('menuItems', JSON.stringify(updatedMenuItems));
            return updatedMenuItems;
        });
        setCurrentScreenLocal('editMenu');
        setEditItem(null);
        setEditCategory(null);
    };

    const handleAddItemSubmit = (newItem: Omit<MenuItem, 'id'>, category: 'drinks' | 'meals') => {
        const id = Date.now();
        setMenuItems(prev => {
            const updatedMenuItems = {
                ...prev,
                [category]: [...prev[category], { ...newItem, id }]
            };
            localStorage.setItem('menuItems', JSON.stringify(updatedMenuItems));
            return updatedMenuItems;
        });
        setCurrentScreenLocal('editMenu');
    };

    const handleDeleteItem = (id: number, category: 'drinks' | 'meals') => {
        setMenuItems(prev => {
            const updatedMenuItems = {
                ...prev,
                [category]: prev[category].filter(item => item.id !== id)
            };
            localStorage.setItem('menuItems', JSON.stringify(updatedMenuItems));
            return updatedMenuItems;
        });
    };

    const handleCancelEdit = () => {
        setCurrentScreenLocal('editMenu');
        setEditItem(null);
        setEditCategory(null);
    };

    const handleLogoutAdmin = () => {
        setLoggedInUser(null);
        setCurrentScreen('login');
    };

    // Cooking options management functions
    const handleEditCooking = () => {
        setCurrentScreenLocal('editCooking');
    };

    const handleAddCookingOption = () => {
        setCurrentScreenLocal('addCookingOption');
    };

    const handleEditCookingOption = (option: string) => {
        setEditCookingOption(option);
        setNewCookingOption(option);
        setCurrentScreenLocal('addCookingOption');
    };

    const handleDeleteCookingOption = (option: string) => {
        const updatedOptions = cookingOptions.filter(o => o !== option);
        setCookingOptions(updatedOptions);
        localStorage.setItem('cookingOptions', JSON.stringify(updatedOptions));

        toast({
            title: "Cuisson supprimée",
            description: `La cuisson "${option}" a été supprimée.`,
        });
    };

    const handleSaveCookingOption = () => {
        if (!newCookingOption.trim()) {
            toast({
                title: "Erreur",
                description: "Le nom de la cuisson ne peut pas être vide.",
                variant: "destructive"
            });
            return;
        }

        let updatedOptions: string[];
        
        if (editCookingOption) {
            // Edit existing
            updatedOptions = cookingOptions.map(o => 
                o === editCookingOption ? newCookingOption.toUpperCase() : o
            );
        } else {
            // Add new, avoid duplicates
            if (cookingOptions.includes(newCookingOption.toUpperCase())) {
                toast({
                    title: "Erreur",
                    description: "Cette cuisson existe déjà.",
                    variant: "destructive"
                });
                return;
            }
            updatedOptions = [...cookingOptions, newCookingOption.toUpperCase()];
        }

        setCookingOptions(updatedOptions);
        localStorage.setItem('cookingOptions', JSON.stringify(updatedOptions));
        
        setEditCookingOption('');
        setNewCookingOption('');
        setCurrentScreenLocal('cooking');

        toast({
            title: editCookingOption ? "Cuisson modifiée" : "Cuisson ajoutée",
            description: editCookingOption 
                ? `La cuisson "${editCookingOption}" a été modifiée en "${newCookingOption.toUpperCase()}".`
                : `La cuisson "${newCookingOption.toUpperCase()}" a été ajoutée.`,
        });
    };

    const handleCancelCookingEdit = () => {
        setEditCookingOption('');
        setNewCookingOption('');
        setCurrentScreenLocal('cooking');
    };

    // Main content based on currentScreenLocal
    const renderContent = () => {
        switch (currentScreenLocal) {
            case 'dashboard':
                return <DashboardScreen localOrders={localOrders} refreshOrders={refreshOrders} />;
            case 'menu':
                return <MenuScreen menuItems={menuItems} handleEditMenu={handleEditMenu} />;
            case 'cooking':
                return <CookingScreen 
                         cookingOptions={cookingOptions} 
                         handleAddCookingOption={handleAddCookingOption} 
                         handleEditCookingOption={handleEditCookingOption} 
                         handleDeleteCookingOption={handleDeleteCookingOption} />;
            case 'dailySales':
                return <DailySalesScreen localOrders={localOrders} refreshOrders={refreshOrders} />;
            case 'settings':
                return <SettingsScreen 
                         serverIp={serverIp} 
                         setServerIp={setServerIp} 
                         connectedDevices={connectedDevices} 
                         setConnectedDevices={setConnectedDevices} 
                         resetApplication={resetApplication} />;
            case 'editMenu':
                return <EditMenuScreen 
                         menuItems={menuItems} 
                         setCurrentScreenLocal={setCurrentScreenLocal} 
                         handleAddItem={handleAddItem} 
                         handleEditItem={handleEditItem} 
                         handleDeleteItem={handleDeleteItem} />;
            case 'addMenuItem':
                return <AddMenuItemScreen 
                         handleCancelEdit={handleCancelEdit} 
                         editCategory={editCategory} 
                         handleAddItemSubmit={handleAddItemSubmit} />;
            case 'editItem':
                return <EditItemScreen 
                         handleCancelEdit={handleCancelEdit} 
                         editItem={editItem} 
                         editCategory={editCategory} 
                         handleSaveItem={handleSaveItem} />;
            case 'addCookingOption':
                return <AddCookingOptionScreen 
                         editCookingOption={editCookingOption} 
                         newCookingOption={newCookingOption} 
                         setNewCookingOption={setNewCookingOption} 
                         handleSaveCookingOption={handleSaveCookingOption} 
                         handleCancelCookingEdit={handleCancelCookingEdit} />;
            default:
                return <DashboardScreen localOrders={localOrders} refreshOrders={refreshOrders} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <MobileHeader
                currentScreenLocal={currentScreenLocal}
                setSidebarOpen={setSidebarOpen}
                sidebarOpen={sidebarOpen}
            />
            <div className="flex">
                <Sidebar
                    currentScreenLocal={currentScreenLocal}
                    setCurrentScreenLocal={setCurrentScreenLocal}
                    setSidebarOpen={setSidebarOpen}
                    sidebarOpen={sidebarOpen}
                    handleLogoutAdmin={handleLogoutAdmin}
                    onLogout={onLogout}
                />
                <div className="w-full md:ml-64 mt-0 md:mt-0 p-0">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminScreen;

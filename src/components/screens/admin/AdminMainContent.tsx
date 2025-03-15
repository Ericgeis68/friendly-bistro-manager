
import React from 'react';
import type { MenuItem, Order, ScreenType } from '../../../types/restaurant';
import DashboardScreen from './DashboardScreen';
import MenuScreen from './MenuScreen';
import EditMenuScreen from './EditMenuScreen';
import AddMenuItemScreen from './AddMenuItemScreen';
import EditItemScreen from './EditItemScreen';
import CookingScreen from './CookingScreen';
import AddCookingOptionScreen from './AddCookingOptionScreen';
import DailySalesScreen from './DailySalesScreen';
import SettingsScreen from './SettingsScreen';

interface AdminMainContentProps {
  currentScreenLocal: 'dashboard' | 'menu' | 'cooking' | 'settings' | 'editMenu' | 'addMenuItem' | 'editItem' | 'dailySales' | 'editCooking' | 'addCookingOption';
  setCurrentScreenLocal: React.Dispatch<React.SetStateAction<'dashboard' | 'menu' | 'cooking' | 'settings' | 'editMenu' | 'addMenuItem' | 'editItem' | 'dailySales' | 'editCooking' | 'addCookingOption'>>;
  menuItems: {
    drinks: MenuItem[];
    meals: MenuItem[];
  };
  localOrders: Order[];
  editItem: MenuItem | null;
  editCategory: 'drinks' | 'meals' | null;
  editCookingOption: string;
  newCookingOption: string;
  cookingOptions: string[];
  serverIp: string;
  connectedDevices: number;
  handlers: {
    handleEditMenu: () => void;
    handleAddItem: (category: 'drinks' | 'meals') => void;
    handleEditItem: (item: MenuItem, category: 'drinks' | 'meals') => void;
    handleSaveItem: (editedItem: MenuItem) => void;
    handleAddItemSubmit: (newItem: Omit<MenuItem, 'id'>, category: 'drinks' | 'meals') => void;
    handleDeleteItem: (id: number, category: 'drinks' | 'meals') => void;
    handleCancelEdit: () => void;
    refreshOrders: () => void;
    handleAddCookingOption: () => void;
    handleEditCookingOption: (option: string) => void;
    handleDeleteCookingOption: (option: string) => void;
    handleSaveCookingOption: () => void;
    handleCancelCookingEdit: () => void;
    setServerIp: (ip: string) => void;
    setConnectedDevices: (num: number) => void;
    resetApplication: () => void;
    setNewCookingOption: React.Dispatch<React.SetStateAction<string>>;
  };
}

const AdminMainContent: React.FC<AdminMainContentProps> = ({
  currentScreenLocal,
  setCurrentScreenLocal,
  menuItems,
  localOrders,
  editItem,
  editCategory,
  editCookingOption,
  newCookingOption,
  cookingOptions,
  serverIp,
  connectedDevices,
  handlers
}) => {
  switch (currentScreenLocal) {
    case 'dashboard':
      return <DashboardScreen localOrders={localOrders} refreshOrders={handlers.refreshOrders} />;
    case 'menu':
      return <MenuScreen menuItems={menuItems} handleEditMenu={handlers.handleEditMenu} />;
    case 'cooking':
      return <CookingScreen 
              cookingOptions={cookingOptions} 
              handleAddCookingOption={handlers.handleAddCookingOption} 
              handleEditCookingOption={handlers.handleEditCookingOption} 
              handleDeleteCookingOption={handlers.handleDeleteCookingOption} />;
    case 'dailySales':
      return <DailySalesScreen localOrders={localOrders} refreshOrders={handlers.refreshOrders} />;
    case 'settings':
      return <SettingsScreen 
              serverIp={serverIp} 
              setServerIp={handlers.setServerIp} 
              connectedDevices={connectedDevices} 
              setConnectedDevices={handlers.setConnectedDevices} 
              resetApplication={handlers.resetApplication} />;
    case 'editMenu':
      return <EditMenuScreen 
              menuItems={menuItems} 
              setCurrentScreenLocal={setCurrentScreenLocal} 
              handleAddItem={handlers.handleAddItem} 
              handleEditItem={handlers.handleEditItem} 
              handleDeleteItem={handlers.handleDeleteItem} />;
    case 'addMenuItem':
      return <AddMenuItemScreen 
              handleCancelEdit={handlers.handleCancelEdit} 
              editCategory={editCategory} 
              handleAddItemSubmit={handlers.handleAddItemSubmit} />;
    case 'editItem':
      return <EditItemScreen 
              handleCancelEdit={handlers.handleCancelEdit} 
              editItem={editItem} 
              editCategory={editCategory} 
              handleSaveItem={handlers.handleSaveItem} />;
    case 'addCookingOption':
      return <AddCookingOptionScreen 
              editCookingOption={editCookingOption} 
              newCookingOption={newCookingOption} 
              setNewCookingOption={handlers.setNewCookingOption} 
              handleSaveCookingOption={handlers.handleSaveCookingOption} 
              handleCancelCookingEdit={handlers.handleCancelCookingEdit} />;
    default:
      return <DashboardScreen localOrders={localOrders} refreshOrders={handlers.refreshOrders} />;
  }
};

export default AdminMainContent;

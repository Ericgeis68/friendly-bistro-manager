import React, { useState } from 'react';
import { Beer, UtensilsCrossed, FileText, ArrowLeft, Plus, Trash2, Edit, Save, X, CheckCircle, Clock, AlertTriangle, Settings, List, BarChart2 } from 'lucide-react';
import type { MenuItem, Order, ScreenType } from '../../types/restaurant';
import { useRestaurant } from '../../context/RestaurantContext';

interface AdminScreenProps {
    onLogout: () => void;
    setLoggedInUser: (user: string | null) => void;
    setCurrentScreen: (screen: ScreenType) => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ onLogout, setLoggedInUser, setCurrentScreen }) => {
    const { menuItems, setMenuItems, orders, pendingOrders, completedOrders } = useRestaurant();
    const [currentScreenLocal, setCurrentScreenLocal] = useState<'dashboard' | 'menu' | 'orders' | 'settings' | 'editMenu' | 'addMenuItem' | 'editItem' | 'dailySales'>('dashboard');
    const [serverIp, setServerIp] = useState<string>('127.0.0.1');
    const [connectedDevices, setConnectedDevices] = useState<number>(5);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);
    const [editCategory, setEditCategory] = useState<'drinks' | 'meals' | null>(null);

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

    const handleOrderStatusChange = (orderId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    const handleLogoutAdmin = () => {
        setLoggedInUser(null);
        setCurrentScreen('login');
    };

    const Sidebar: React.FC = () => {
        return (
            <div className="bg-gray-800 text-white w-64 p-4 flex flex-col space-y-4">
                <div className="text-2xl font-bold mb-4 text-center">Admin Panel</div>
                <button
                    onClick={() => setCurrentScreenLocal('dashboard')}
                    className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreenLocal === 'dashboard' ? 'bg-gray-700' : ''}`}
                >
                    <BarChart2 size={20} className="mr-2" />
                    Tableau de Bord
                </button>
                <button
                    onClick={() => setCurrentScreenLocal('menu')}
                    className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreenLocal === 'menu' ? 'bg-gray-700' : ''}`}
                >
                    <UtensilsCrossed size={20} className="mr-2" />
                    Menu
                </button>
                <button
                    onClick={() => setCurrentScreenLocal('orders')}
                    className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreenLocal === 'orders' ? 'bg-gray-700' : ''}`}
                >
                    <FileText size={20} className="mr-2" />
                    Commandes
                </button>
                <button
                    onClick={() => setCurrentScreenLocal('dailySales')}
                    className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreenLocal === 'dailySales' ? 'bg-gray-700' : ''}`}
                >
                    <List size={20} className="mr-2" />
                    Ventes du Jour
                </button>
                <button
                    onClick={() => setCurrentScreenLocal('settings')}
                    className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreenLocal === 'settings' ? 'bg-gray-700' : ''}`}
                >
                    <Settings size={20} className="mr-2" />
                    Paramètres
                </button>
                <button
                    onClick={() => {
                        handleLogoutAdmin();
                        onLogout();
                    }}
                    className="flex items-center py-2 px-4 rounded-md hover:bg-gray-700"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Déconnexion
                </button>
            </div>
        );
    };

    const MenuScreen: React.FC = () => {
        return (
            <div className="flex-1 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Gestion du Menu</h2>
                    <button onClick={handleEditMenu} className="bg-blue-500 hover:bg-blue-600 text-white rounded-md p-2">Modifier</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-xl font-medium mb-2">Boissons</h3>
                        {menuItems.drinks && menuItems.drinks.map(drink => (
                            <div key={drink.id} className="bg-white rounded-xl p-4 shadow flex justify-between mb-2">
                                <div>
                                    <div className="font-medium text-lg">{drink.name}</div>
                                    <div className="text-gray-600">{drink.price.toFixed(2)} €</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3 className="text-xl font-medium mb-2">Repas</h3>
                        {menuItems.meals && menuItems.meals.map(meal => (
                            <div key={meal.id} className="bg-white rounded-xl p-4 shadow flex justify-between mb-2">
                                <div>
                                    <div className="font-medium text-lg">{meal.name}</div>
                                    <div className="text-gray-600">{meal.price.toFixed(2)} €</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const EditMenuScreen: React.FC = () => {
        return (
            <div className="flex-1 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Modifier le Menu</h2>
                    <button onClick={() => setCurrentScreenLocal('menu')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md p-2">
                        <X size={20}/>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-medium">Boissons</h3>
                            <button onClick={() => handleAddItem('drinks')} className="bg-green-500 hover:bg-green-600 text-white rounded-md p-2">
                                <Plus size={20}/>
                            </button>
                        </div>
                        {menuItems.drinks && menuItems.drinks.map(drink => (
                            <div key={drink.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center mb-2">
                                <div>
                                    <div className="font-medium text-lg">{drink.name}</div>
                                    <div className="text-gray-600">{drink.price.toFixed(2)} €</div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEditItem(drink, 'drinks')} className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-md p-2">
                                        <Edit size={20}/>
                                    </button>
                                    <button onClick={() => handleDeleteItem(drink.id, 'drinks')} className="bg-red-500 hover:bg-red-600 text-white rounded-md p-2">
                                        <Trash2 size={20}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-medium">Repas</h3>
                            <button onClick={() => handleAddItem('meals')} className="bg-green-500 hover:bg-green-600 text-white rounded-md p-2">
                                <Plus size={20}/>
                            </button>
                        </div>
                        {menuItems.meals && menuItems.meals.map(meal => (
                            <div key={meal.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center mb-2">
                                <div>
                                    <div className="font-medium text-lg">{meal.name}</div>
                                    <div className="text-gray-600">{meal.price.toFixed(2)} €</div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEditItem(meal, 'meals')} className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-md p-2">
                                        <Edit size={20}/>
                                    </button>
                                    <button onClick={() => handleDeleteItem(meal.id, 'meals')} className="bg-red-500 hover:bg-red-600 text-white rounded-md p-2">
                                        <Trash2 size={20}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const AddMenuItemScreen: React.FC = () => {
        const [name, setName] = useState('');
        const [price, setPrice] = useState('');

        const handleSubmit = () => {
            if (!editCategory || !name || !price) return;
            handleAddItemSubmit({ name, price: parseFloat(price) }, editCategory);
            setName('');
            setPrice('');
        };

        return (
            <div className="flex-1 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Ajouter un élément</h2>
                    <button onClick={handleCancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md p-2">
                        <X size={20}/>
                    </button>
                </div>
                <div className="bg-white rounded-xl p-6 shadow">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Nom</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border rounded-md h-12 px-3"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Prix</label>
                        <input
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="w-full border rounded-md h-12 px-3"
                        />
                    </div>
                    <button onClick={handleSubmit} className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md h-12 text-lg">Ajouter</button>
                </div>
            </div>
        );
    };

    const EditItemScreen: React.FC = () => {
        const [name, setName] = useState(editItem?.name || '');
        const [price, setPrice] = useState(editItem?.price?.toString() || '');

        const handleSubmit = () => {
            if (!editItem || !editCategory) return;

            handleSaveItem({...editItem, name, price: parseFloat(price)});
            setName('');
            setPrice('');
        };

        return (
            <div className="flex-1 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Modifier l'élément</h2>
                    <button onClick={handleCancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md p-2">
                        <X size={20}/>
                    </button>
                </div>
                <div className="bg-white rounded-xl p-6 shadow">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Nom</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border rounded-md h-12 px-3"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Prix</label>
                        <input
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="w-full border rounded-md h-12 px-3"
                        />
                    </div>
                    <button onClick={handleSubmit} className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md h-12 text-lg">Enregistrer</button>
                </div>
            </div>
        );
    };

    const OrderScreen: React.FC = () => {
        return (
            <div className="flex-1 p-4">
                <h2 className="text-2xl font-bold mb-4">Gestion des Commandes</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-xl shadow mt-4">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Table</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Serveuse</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Heure</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Boissons</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Repas</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const orderTime = typeof order.createdAt === 'string' 
                                    ? new Date(order.createdAt).toLocaleTimeString() 
                                    : new Date(order.createdAt).toLocaleTimeString();
                                
                                return (
                                <tr key={order.id} className="border-b">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.table}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.waitress}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{orderTime}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {order.drinks.map((drink, idx) => (
                                            <div key={idx}>
                                                {drink.name} x{drink.quantity || 1}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {order.meals.map((meal, idx) => (
                                            <div key={idx}>
                                                {meal.name} x{meal.quantity || 1} {meal.cooking && `(${meal.cooking})`}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {order.status === 'pending' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <Clock className="w-3 h-3 mr-1"/>
                                                En cours
                                            </span>
                                        )}
                                        {order.status === 'completed' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1"/>
                                                Terminée
                                            </span>
                                        )}
                                        {order.status === 'cancelled' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                <AlertTriangle className="w-3 h-3 mr-1"/>
                                                Annulée
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value as 'pending' | 'completed' | 'cancelled')}
                                            className="border rounded-md p-2"
                                        >
                                            <option value="pending">En cours</option>
                                            <option value="completed">Terminée</option>
                                            <option value="cancelled">Annulée</option>
                                        </select>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const DashboardScreen: React.FC = () => {
        const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;
        const completedOrdersCount = orders.filter(order => order.status === 'completed').length;
        return (
            <div className="flex-1 p-4">
                <h2 className="text-2xl font-bold mb-4">Tableau de Bord</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow flex items-center justify-between">
                        <div>
                            <div className="text-xl font-bold text-gray-700">Commandes en cours</div>
                            <div className="text-3xl font-bold text-yellow-600">{pendingOrdersCount}</div>
                        </div>
                        <Clock size={48} className="text-yellow-600" />
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow flex items-center justify-between">
                        <div>
                            <div className="text-xl font-bold text-gray-700">Commandes terminées</div>
                            <div className="text-3xl font-bold text-green-600">{completedOrdersCount}</div>
                        </div>
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                </div>
            </div>
        );
    };

    const DailySalesScreen: React.FC = () => {
        const [selectedService, setSelectedService] = useState<'midi' | 'soir'>('midi');
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const isMidday = now.getHours() >= 11 && now.getHours() < 14;
        const isEvening = now.getHours() >= 18 && now.getHours() < 22;

        const isCurrentServiceMidday = selectedService === 'midi' && isMidday;
        const isCurrentServiceEvening = selectedService === 'soir' && isEvening;

        const filteredOrders = orders.filter(order => {
            const orderDate = typeof order.createdAt === 'string' 
                ? new Date(order.createdAt) 
                : new Date(order.createdAt);
                
            const isSameDay = orderDate >= startOfToday && orderDate < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
            if (selectedService === 'midi') {
                return isSameDay && orderDate.getHours() >= 11 && orderDate.getHours() < 14;
            } else {
                return isSameDay && orderDate.getHours() >= 18 && orderDate.getHours() < 22;
            }
        });

        const calculateSales = () => {
            let totalDrinks = 0;
            let totalMeals = 0;
            const drinksSales = {} as { [name: string]: { quantity: number; price: number } };
            const mealsSales = {} as { [name: string]: { quantity: number; price: number } };

            filteredOrders.forEach(order => {
                order.drinks.forEach(drink => {
                    totalDrinks += drink.price * (drink.quantity || 0);
                    if (drinksSales[drink.name]) {
                        drinksSales[drink.name].quantity += (drink.quantity || 0);
                    } else {
                        drinksSales[drink.name] = { quantity: (drink.quantity || 0), price: drink.price };
                    }
                });
                order.meals.forEach(meal => {
                    totalMeals += meal.price * (meal.quantity || 0);
                    if (mealsSales[meal.name]) {
                        mealsSales[meal.name].quantity += (meal.quantity || 0);
                    } else {
                        mealsSales[meal.name] = { quantity: (meal.quantity || 0), price: meal.price };
                    }
                });
            });
            return { totalDrinks, totalMeals, drinksSales, mealsSales };
        };

        const { totalDrinks, totalMeals, drinksSales, mealsSales } = calculateSales();

        return (
            <div className="flex-1 p-4">
                <h2 className="text-2xl font-bold mb-4">Ventes du Jour</h2>
                <div className="mb-4">
                    <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value as 'midi' | 'soir')}
                        className="border rounded-md p-2"
                    >
                        <option value="midi">Service de Midi</option>
                        <option value="soir">Service du Soir</option>
                    </select>
                </div>
                <div className="bg-white rounded-xl p-6 shadow">
                    {isCurrentServiceMidday && <div className="text-center mb-4 text-lg font-bold text-green-600">Service de midi en cours</div>}
                    {isCurrentServiceEvening && <div className="text-center mb-4 text-lg font-bold text-green-600">Service du soir en cours</div>}
                    {(!isCurrentServiceMidday && !isCurrentServiceEvening) && <div className="text-center mb-4 text-lg font-bold text-gray-600">Service terminé</div>}

                    <div className="mb-6">
                        <h3 className="text-xl font-medium mb-2">Boissons</h3>
                        {Object.entries(drinksSales).length > 0 ? (
                            <ul className="space-y-2">
                                {Object.entries(drinksSales).map(([name, { quantity, price }]) => (
                                    <li key={name} className="flex justify-between">
                                        <span>{name}</span>
                                        <span>{quantity} x {price.toFixed(2)}€ = {(quantity * price).toFixed(2)}€</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <div className="text-gray-600">Aucune boisson vendue</div>}

                        <div className="font-bold mt-2">Total Boissons : {totalDrinks.toFixed(2)}€</div>
                    </div>
                    <div>
                        <h3 className="text-xl font-medium mb-2">Repas</h3>
                        {Object.entries(mealsSales).length > 0 ? (
                            <ul className="space-y-2">
                                {Object.entries(mealsSales).map(([name, { quantity, price }]) => (
                                    <li key={name} className="flex justify-between">
                                        <span>{name}</span>
                                        <span>{quantity} x {price.toFixed(2)}€ = {(quantity * price).toFixed(2)}€</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <div className="text-gray-600">Aucun repas vendu</div>}
                        <div className="font-bold mt-2">Total Repas: {totalMeals.toFixed(2)}€</div>
                    </div>

                    <div className="font-bold mt-6 text-xl">Total Ventes: {(totalDrinks + totalMeals).toFixed(2)}€</div>
                </div>
            </div>
        );
    };

    const SettingsScreen: React.FC = () => {
        return (
            <div className="flex-1 p-4">
                <h2 className="text-2xl font-bold mb-4">Paramètres</h2>
                <div className="bg-white p-6 rounded-2xl shadow max-w-md">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Adresse IP du serveur</label>
                        <input
                            type="text"
                            value={serverIp}
                            onChange={e => setServerIp(e.target.value)}
                            className="w-full border rounded-md h-12 px-3"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Appareils connectés</label>
                        <input
                            type="number"
                            value={connectedDevices}
                            onChange={e => setConnectedDevices(parseInt(e.target.value))}
                            className="w-full border rounded-md h-12 px-3"
                        />
                    </div>
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md h-12 text-lg">Enregistrer</button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <div className="flex-1 bg-gray-50">
                {currentScreenLocal === 'dashboard' && <DashboardScreen />}
                {currentScreenLocal === 'menu' && <MenuScreen />}
                {currentScreenLocal === 'orders' && <OrderScreen />}
                {currentScreenLocal === 'dailySales' && <DailySalesScreen />}
                {currentScreenLocal === 'settings' && <SettingsScreen />}
                {currentScreenLocal === 'editMenu' && <EditMenuScreen />}
                {currentScreenLocal === 'addMenuItem' && <AddMenuItemScreen />}
                {currentScreenLocal === 'editItem' && <EditItemScreen />}
            </div>
        </div>
    );
};

export default AdminScreen;

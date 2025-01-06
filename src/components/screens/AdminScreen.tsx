import React, { useState } from 'react';
import { Beer, UtensilsCrossed, FileText, ArrowLeft, Plus, Trash2, Edit, Save, X, CheckCircle, Clock, AlertTriangle, Settings, List, BarChart2 } from 'lucide-react';

type MenuItem = {
    id: number;
    name: string;
    price: number;
    quantity?: number;
    cooking?: string;
};

type Order = {
  id: number;
  table: string;
  waitress: string;
  drinks: MenuItem[];
  meals: MenuItem[];
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
};

const AdminApp: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'menu' | 'orders' | 'settings' | 'editMenu' | 'addMenuItem' | 'editItem' | 'dailySales'>('dashboard');
    const [menuItems, setMenuItems] = useState<{drinks: MenuItem[], meals: MenuItem[]}>({
        drinks: [
            { id: 1, name: 'Bière', price: 4.50 },
            { id: 2, name: 'Coca', price: 3.50 },
            { id: 3, name: 'Eau', price: 2.00 },
            { id: 4, name: 'Vin Rouge', price: 5.50 }
        ],
        meals: [
            { id: 1, name: 'Entrecôte', price: 18.50 },
            { id: 2, name: 'Entrecôte spécial', price: 22.50 },
            { id: 3, name: 'Frites', price: 4.00 },
            { id: 4, name: 'Saucisse blanche frite', price: 12.50 },
            { id: 5, name: 'Merguez pain', price: 8.50 }
        ]
    });
    const [orders, setOrders] = useState<Order[]>([
        {
            id: 1,
            table: '1',
            waitress: 'Celine',
            drinks: [{ id: 1, name: 'Bière', price: 4.50, quantity: 2 }, {id: 2, name: 'Coca', price: 3.50, quantity: 1}],
            meals: [{id: 1, name: 'Entrecôte', price: 18.50, quantity: 1, cooking: 'SAIGNANT'}],
            status: 'completed',
            createdAt: new Date('2024-05-24T10:00:00')
        },
        {
            id: 2,
            table: '3',
            waitress: 'Audrey',
            drinks: [{ id: 3, name: 'Eau', price: 2.00, quantity: 3 }],
            meals: [{ id: 3, name: 'Frites', price: 4.00, quantity: 2 }],
            status: 'pending',
            createdAt: new Date('2024-05-24T11:30:00')
        },
        {
            id: 3,
            table: '2',
            waitress: 'Stephanie',
            drinks: [{ id: 4, name: 'Vin Rouge', price: 5.50, quantity: 1 }],
            meals: [{ id: 4, name: 'Saucisse blanche frite', price: 12.50, quantity: 1 }],
            status: 'cancelled',
            createdAt: new Date('2024-05-24T12:45:00')
        }
    ]);
    const [serverIp, setServerIp] = useState<string>('127.0.0.1');
    const [connectedDevices, setConnectedDevices] = useState<number>(5);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);
    const [editCategory, setEditCategory] = useState<'drinks' | 'meals' | null>(null);

    const handleEditMenu = () => {
        setCurrentScreen('editMenu');
    };

    const handleAddItem = (category: 'drinks' | 'meals') => {
        setEditCategory(category);
        setCurrentScreen('addMenuItem');
    };

    const handleEditItem = (item: MenuItem, category: 'drinks' | 'meals') => {
        setEditItem(item);
        setEditCategory(category);
        setCurrentScreen('editItem');
    };

    const handleSaveItem = (editedItem: MenuItem) => {
        if (!editCategory) return;
        setMenuItems(prev => ({
            ...prev,
            [editCategory]: prev[editCategory].map(item =>
                item.id === editedItem.id ? editedItem : item
            )
        }));
        setCurrentScreen('editMenu');
        setEditItem(null);
        setEditCategory(null);
    };

    const handleAddItemSubmit = (newItem: MenuItem, category: 'drinks' | 'meals') => {
        setMenuItems(prev => ({
            ...prev,
            [category]: [...prev[category], {...newItem, id: Date.now()}]
        }));
        setCurrentScreen('editMenu');
    };

    const handleDeleteItem = (id: number, category: 'drinks' | 'meals') => {
        setMenuItems(prev => ({
            ...prev,
            [category]: prev[category].filter(item => item.id !== id)
        }));
    };

    const handleCancelEdit = () => {
        setCurrentScreen('editMenu');
        setEditItem(null);
        setEditCategory(null);
    };

    const handleOrderStatusChange = (orderId: number, newStatus: 'pending' | 'completed' | 'cancelled') => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    // Sidebar Component
    const Sidebar: React.FC = () => {
        return (
            <div className="bg-gray-800 text-white w-64 p-4 flex flex-col space-y-4">
                <div className="text-2xl font-bold mb-4 text-center">Admin Panel</div>
                <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreen === 'dashboard' ? 'bg-gray-700' : ''}`}
                >
                    <BarChart2 size={20} className="mr-2" />
                    Tableau de Bord
                </button>
                <button
                    onClick={() => setCurrentScreen('menu')}
                    className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreen === 'menu' ? 'bg-gray-700' : ''}`}>
                    <UtensilsCrossed size={20} className="mr-2" />
                    Menu
                </button>
                <button
                    onClick={() => setCurrentScreen('orders')}
                    className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreen === 'orders' ? 'bg-gray-700' : ''}`}
                >
                    <FileText size={20} className="mr-2" />
                    Commandes
                </button>
                <button
                    onClick={() => setCurrentScreen('dailySales')}
                    className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreen === 'dailySales' ? 'bg-gray-700' : ''}`}
                >
                    <List size={20} className="mr-2" />
                    Ventes du Jour
                </button>
                <button
                    onClick={() => setCurrentScreen('settings')}
                    className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-700 ${currentScreen === 'settings' ? 'bg-gray-700' : ''}`}
                >
                    <Settings size={20} className="mr-2" />
                    Paramètres
                </button>
            </div>
        );
    };

    // Menu Management Screen
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
                        {menuItems.drinks.map(drink => (
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
                        {menuItems.meals.map(meal => (
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

    // Edit Menu Screen
    const EditMenuScreen: React.FC = () => {
        return (
            <div className="flex-1 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Modifier le Menu</h2>
                    <button onClick={() => setCurrentScreen('menu')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md p-2">
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
                        {menuItems.drinks.map(drink => (
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
                        {menuItems.meals.map(meal => (
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

    // Order Management Screen
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
                            {orders.map(order => (
                                <tr key={order.id} className="border-b">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.table}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.waitress}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.createdAt.toLocaleTimeString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {order.drinks.map(drink => (
                                            <div key={drink.id}>
                                                {drink.name} x{drink.quantity}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {order.meals.map(meal => (
                                            <div key={meal.id}>
                                                {meal.name} x{meal.quantity} {meal.cooking && `(${meal.cooking})`}
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const DashboardScreen: React.FC = () => {
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const completedOrders = orders.filter(order => order.status === 'completed').length;
        return (
            <div className="flex-1 p-4">
                <h2 className="text-2xl font-bold mb-4">Tableau de Bord</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow flex items-center justify-between">
                        <div>
                            <div className="text-xl font-bold text-gray-700">Commandes en cours</div>
                            <div className="text-3xl font-bold text-yellow-600">{pendingOrders}</div>
                        </div>
                        <Clock size={48} className="text-yellow-600" />
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow flex items-center justify-between">
                        <div>
                            <div className="text-xl font-bold text-gray-700">Commandes terminées</div>
                            <div className="text-3xl font-bold text-green-600">{completedOrders}</div>
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
            const orderDate = new Date(order.createdAt);
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
                    totalDrinks += drink.price * drink.quantity!;
                    if (drinksSales[drink.name]) {
                        drinksSales[drink.name].quantity += drink.quantity!;
                    } else {
                        drinksSales[drink.name] = { quantity: drink.quantity!, price: drink.price };
                    }
                });
                order.meals.forEach(meal => {
                    totalMeals += meal.price * meal.quantity!;
                    if (mealsSales[meal.name]) {
                        mealsSales[meal.name].quantity += meal.quantity!;
                    } else {
                        mealsSales[meal.name] = { quantity: meal.quantity!, price: meal.price };
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

    // Settings Screen
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
                {currentScreen === 'dashboard' && <DashboardScreen />}
                {currentScreen === 'menu' && <MenuScreen />}
                {currentScreen === 'orders' && <OrderScreen />}
                {currentScreen === 'dailySales' && <DailySalesScreen />}
                {currentScreen === 'settings' && <SettingsScreen />}
                {currentScreen === 'editMenu' && <EditMenuScreen />}
                {currentScreen === 'addMenuItem' && <AddMenuItemScreen />}
                {currentScreen === 'editItem' && <EditItemScreen />}
            </div>
        </div>
    );
};

export default AdminApp;


import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddMenuItemScreenProps {
  handleCancelEdit: () => void;
  editCategory: 'drinks' | 'meals' | null;
  handleAddItemSubmit: (newItem: { name: string; price: number }, category: 'drinks' | 'meals') => void;
}

const AddMenuItemScreen: React.FC<AddMenuItemScreenProps> = ({ 
  handleCancelEdit, 
  editCategory, 
  handleAddItemSubmit 
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = () => {
    if (!editCategory || !name || !price) return;
    handleAddItemSubmit({ name, price: parseFloat(price) }, editCategory);
    setName('');
    setPrice('');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Ajouter un élément</h2>
        <button onClick={handleCancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md p-2">
          <X size={20}/>
        </button>
      </div>
      <div className="bg-white rounded-xl p-6 shadow max-w-md mx-auto">
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

export default AddMenuItemScreen;

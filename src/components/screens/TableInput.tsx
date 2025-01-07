import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TableInputProps {
  tableNumber: string;
  setTableNumber: (value: string) => void;
  setCurrentScreen: (screen: 'category') => void;
}

const TableInput: React.FC<TableInputProps> = ({ tableNumber, setTableNumber, setCurrentScreen }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tableNumber.trim()) {
      setCurrentScreen('category');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Numéro de table</h2>
        <div className="space-y-4">
          <Input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Entrez le numéro de table"
            className="w-full"
            min="1"
            required
          />
          <Button type="submit" className="w-full">
            Continuer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TableInput;
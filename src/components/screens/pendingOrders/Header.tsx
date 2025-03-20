
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
  return (
    <div className="bg-green-500 p-4 text-white flex items-center">
      <button onClick={onBack} className="mr-2">
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-xl font-bold">Commandes en cours</h1>
    </div>
  );
};

export default Header;

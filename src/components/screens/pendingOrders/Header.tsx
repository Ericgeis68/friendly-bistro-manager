
import React from 'react';
import { ArrowLeft, Wifi } from 'lucide-react';

interface HeaderProps {
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
  return (
    <div className="bg-green-500 p-4 text-white flex items-center justify-between">
      <div className="flex items-center">
        <button onClick={onBack} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Commandes en cours</h1>
      </div>
      <div className="flex items-center">
        <Wifi size={18} className="mr-1" />
        <span className="text-xs">Firebase Realtime</span>
      </div>
    </div>
  );
};

export default Header;

import React from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin') => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, darkMode, toggleDarkMode }) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} flex flex-col items-center justify-center p-4`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-md shadow-lg space-y-4`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>Connexion</h1>
          <button 
            onClick={toggleDarkMode} 
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
          >
            {darkMode ? 
              <Sun size={20} className="text-yellow-400" /> : 
              <Moon size={20} className="text-gray-500" />
            }
          </button>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => onLogin('Celine')}
            className="w-full h-12 text-lg"
          >
            Céline
          </Button>
          
          <Button 
            onClick={() => onLogin('Audrey')}
            className="w-full h-12 text-lg"
          >
            Audrey
          </Button>
          
          <Button 
            onClick={() => onLogin('Stephanie')}
            className="w-full h-12 text-lg"
          >
            Stéphanie
          </Button>
          
          <div className="border-t border-gray-200 my-4"></div>
          
          <Button 
            onClick={() => onLogin('cuisine')}
            variant="outline"
            className={`w-full h-12 text-lg ${darkMode ? 'border-gray-700 hover:bg-gray-700' : ''}`}
          >
            Grillade
          </Button>
          
          <Button 
            onClick={() => onLogin('admin')}
            variant="outline"
            className={`w-full h-12 text-lg ${darkMode ? 'border-gray-700 hover:bg-gray-700' : ''}`}
          >
            Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
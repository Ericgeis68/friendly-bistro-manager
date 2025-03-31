import React from 'react';
import { Button } from "@/components/ui/button";

interface LoginScreenProps {
  onLogin: (user: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin') => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Connexion</h1>
        
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
            className="w-full h-12 text-lg"
          >
            Cuisine
          </Button>
          
          <Button 
            onClick={() => onLogin('admin')}
            variant="outline"
            className="w-full h-12 text-lg"
          >
            Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

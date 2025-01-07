import React from 'react';
import { Button } from "@/components/ui/button";

type LoginScreenProps = {
  onLogin: (user: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin') => void;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>
        <div className="space-y-4">
          <Button 
            onClick={() => onLogin('Celine')}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Céline
          </Button>
          <Button 
            onClick={() => onLogin('Audrey')}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Audrey
          </Button>
          <Button 
            onClick={() => onLogin('Stephanie')}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Stéphanie
          </Button>
          <Button 
            onClick={() => onLogin('cuisine')}
            className="w-full bg-yellow-500 hover:bg-yellow-600"
          >
            Cuisine
          </Button>
          <Button 
            onClick={() => onLogin('admin')}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
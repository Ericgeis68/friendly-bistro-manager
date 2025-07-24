import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from 'lucide-react';
import { supabaseHelpers } from '../../utils/supabase';
import { useRestaurant } from '../../context/RestaurantContext'; // Import useRestaurant
import type { UserRole } from '../../types/restaurant'; // Import UserRole

interface LoginScreenProps {
  onLogin: (user: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin' | string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, darkMode, toggleDarkMode }) => {
  const [waitresses, setWaitresses] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentUser } = useRestaurant(); // Use the context

  useEffect(() => {
    loadWaitresses();
  }, []);

  const loadWaitresses = async () => {
    try {
      const data = await supabaseHelpers.getWaitresses();
      setWaitresses(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des serveuses:', error);
      // Ne pas bloquer l'application, juste continuer avec un tableau vide
      setWaitresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (name: string, role: UserRole) => {
    setCurrentUser({ id: name, name: name, role: role }); // Set the current user in context
    onLogin(name);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} flex flex-col items-center justify-center p-4`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-md shadow-lg space-y-4`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>Connexion</h1>
          <button 
            onClick={toggleDarkMode} 
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={darkMode ? "Activer mode clair" : "Activer mode sombre"}
          >
            {darkMode ? 
              <Sun size={20} className="text-yellow-400" /> : 
              <Moon size={20} className="text-gray-500" />
            }
          </button>
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <span className="animate-pulse">Chargement...</span>
            </div>
          ) : (
            <>
              {waitresses.map((waitress) => (
                <Button 
                  key={waitress.id}
                  onClick={() => handleLogin(waitress.name, waitress.name as UserRole)} // Pass role based on name for waitresses
                  className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {waitress.name}
                </Button>
              ))}
              
              <Button 
                onClick={() => handleLogin('cuisine', 'cuisine')}
                className="w-full h-12 text-lg bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
              >
                Grillade
              </Button>
              
              <Button 
                onClick={() => handleLogin('admin', 'admin')}
                className="w-full h-12 text-lg bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
              >
                Admin
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

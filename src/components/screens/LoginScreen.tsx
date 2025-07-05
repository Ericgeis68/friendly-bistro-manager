import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun, AlertCircle } from 'lucide-react';
import { supabaseHelpers } from '../../utils/supabase';

interface LoginScreenProps {
  onLogin: (user: 'Celine' | 'Audrey' | 'Stephanie' | 'cuisine' | 'admin' | string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, darkMode, toggleDarkMode }) => {
  const [waitresses, setWaitresses] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWaitresses();
  }, []);

  const loadWaitresses = async () => {
    try {
      setError(null);
      const data = await supabaseHelpers.getWaitresses();
      setWaitresses(data);
    } catch (error) {
      console.error('Erreur lors du chargement des serveuses:', error);
      setError('Impossible de se connecter à la base de données. Vérifiez que le serveur Supabase est démarré.');
      setWaitresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    loadWaitresses();
  };

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
          {loading ? (
            <div className="text-center py-4">
              <span className="animate-pulse">Chargement des serveuses...</span>
            </div>
          ) : error ? (
            <div className="text-center py-4 space-y-4">
              <div className={`flex items-center justify-center p-4 rounded-lg ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                <AlertCircle className="mr-2" size={20} />
                <span className="text-sm">{error}</span>
              </div>
              <Button 
                onClick={handleRetry}
                variant="outline"
                className={`w-full ${darkMode ? 'border-gray-700 hover:bg-gray-700' : ''}`}
              >
                Réessayer
              </Button>
            </div>
          ) : waitresses.length === 0 ? (
            <div className="text-center py-4">
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Aucune serveuse enregistrée dans la base de données.
              </span>
            </div>
          ) : (
            <>
              {waitresses.map((waitress) => (
                <Button 
                  key={waitress.id}
                  onClick={() => onLogin(waitress.name)}
                  className="w-full h-12 text-lg"
                >
                  {waitress.name}
                </Button>
              ))}
              
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Sonner } from '@/components/ui/sonner';
import AppRoutes from '@/routes';
import { RestaurantProvider } from '@/context/RestaurantContext'; // Import RestaurantProvider

const queryClient = new QueryClient();

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('Global error:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 text-red-700">
        <h1 className="text-xl font-bold">Erreur d'application</h1>
        <p>Veuillez recharger la page ou contacter le support</p>
      </div>
    );
  }

  return children;
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RestaurantProvider> {/* Wrap AppRoutes with RestaurantProvider */}
            <AppRoutes />
          </RestaurantProvider>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

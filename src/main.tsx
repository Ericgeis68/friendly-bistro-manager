import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Sonner } from '@/components/ui/sonner';
import { RestaurantProvider } from '@/context/RestaurantContext';
import AppRoutes from '@/routes';
import './index.css';

const queryClient = new QueryClient();

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    console.log('🔧 Setting up global error handlers...');
    
    const errorHandler = (error: ErrorEvent) => {
      console.error('❌ Global error:', error);
      setHasError(true);
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('❌ Unhandled promise rejection:', event.reason);
      // Don't set hasError for promises to avoid unnecessary reloads
    };
    
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    
    return () => {
      console.log('🔧 Cleaning up global error handlers...');
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 text-red-700">
        <h1 className="text-xl font-bold">Erreur d'application</h1>
        <p>Veuillez recharger la page ou contacter le support</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          Recharger la page
        </button>
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
          <RestaurantProvider>
            <AppRoutes />
          </RestaurantProvider>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

createRoot(document.getElementById("root")!).render(<App />);

import React from 'react';
import Index from './Index';

// Ce composant sert de wrapper sécurisé pour le composant Index
const SafeIndex = () => {
  try {
    console.log("Tentative de rendu du composant Index réel");
    return <Index />;
  } catch (error) {
    console.error("Erreur lors du rendu du composant Index:", error);
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h2 className="text-xl font-bold mb-2">Erreur de rendu</h2>
        <p>Une erreur s'est produite lors du chargement de la page principale:</p>
        <pre className="mt-2 p-2 bg-red-50 rounded">{String(error)}</pre>
      </div>
    );
  }
};

export default SafeIndex;
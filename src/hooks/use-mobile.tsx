
import { useEffect, useState } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fonction pour vérifier si la largeur de la fenêtre correspond à un appareil mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Point de rupture courant pour les appareils mobiles
    };

    // Vérification initiale
    checkMobile();

    // Ajouter un écouteur d'événement pour le redimensionnement de la fenêtre
    window.addEventListener('resize', checkMobile);

    // Nettoyer l'écouteur d'événement
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

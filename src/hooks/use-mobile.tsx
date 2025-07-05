import { useEffect, useState } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fonction pour vérifier si la largeur de la fenêtre correspond à un appareil mobile
    const checkMobile = () => {
      // Détection plus précise des différents appareils
      const width = window.innerWidth;
      const isTV = window.matchMedia('(min-width: 1200px) and (orientation: landscape) and (hover: none)').matches;
      const isTablet = width >= 768 && width < 1200 && !isTV;
      const isMobile = width < 768;
      
      setIsMobile(isMobile);
      // Vous pouvez ajouter d'autres états si nécessaire
      // setIsTablet(isTablet);
      // setIsTV(isTV);
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

// Ajoutez ce code à votre configuration Firebase existante
import { isPlatform } from '@ionic/react';

// Détection de la plateforme
const isAndroidTV = isPlatform('android') && window.navigator.userAgent.indexOf('TV') !== -1;

// Journalisation spécifique pour Android TV
if (isAndroidTV) {
  console.log('Exécution sur Android TV, initialisation de Firebase...');
}

// Après l'initialisation de Firebase
console.log('Firebase initialisé avec succès');
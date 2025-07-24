import jsPDF from 'jspdf';
import type { Order } from '../types/restaurant';

/**
 * Génère le contenu du ticket au format d'impression (identique au TicketGenerator)
 */
const generateTicketContent = (order: Order): string => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDateTime(order.createdAt);
  
  const calculateTotal = () => {
    const drinksTotal = order.drinks ? order.drinks.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    const mealsTotal = order.meals ? order.meals.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    return drinksTotal + mealsTotal;
  };
  
  const total = calculateTotal();
  
  let orderTypeHeader = "COMMANDE";
  const hasDrinks = order.drinks && order.drinks.length > 0;
  const hasMeals = order.meals && order.meals.length > 0;

  if (hasDrinks && !hasMeals) {
    orderTypeHeader = "COMMANDE BOISSONS";
  } else if (!hasDrinks && hasMeals) {
    orderTypeHeader = "COMMANDE REPAS";
  }

  return `HOPLA'GEIS
================================
${orderTypeHeader}
================================

TABLE: ${order.table}${order.tableComment ? ` (${order.tableComment})` : ''}
${order.room ? `SALLE: ${order.room}` : ''}
SERVEUSE: ${order.waitress}
DATE: ${date} ${time}
--------------------------------

${hasDrinks ? `🥤 BOISSONS:
--------------------------------
${order.drinks.map(item => {
  const itemLine = `${item.quantity}x ${item.name}`;
  const price = `${(item.price * item.quantity).toFixed(2)}€`;
  const spacing = ' '.repeat(Math.max(1, 30 - itemLine.length));
  let result = `${itemLine}${spacing}${price}`;
  if (item.comment) result += `\n→ ${item.comment}`;
  return result;
}).join('\n')}

` : ''}${hasMeals ? `🍽️ PLATS:
--------------------------------
${order.meals.map(item => {
  const itemLine = `${item.quantity}x ${item.name}`;
  const price = `${(item.price * item.quantity).toFixed(2)}€`;
  const spacing = ' '.repeat(Math.max(1, 30 - itemLine.length));
  let result = `${itemLine}${spacing}${price}`;
  if (item.cooking) result += `\n→ CUISSON: ${item.cooking}`;
  if (item.comment) result += `\n→ ${item.comment}`;
  return result;
}).join('\n')}

` : ''}================================
TOTAL:${' '.repeat(Math.max(1, 25 - total.toFixed(2).length))}${total.toFixed(2)}€
================================

Merci de votre visite!
Imprimé le ${new Date().toLocaleString('fr-FR')}`;
};

/**
 * Génère le nom de fichier selon le format demandé
 */
const generateFileName = (order: Order): string => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  };

  const hasDrinks = order.drinks && order.drinks.length > 0;
  const hasMeals = order.meals && order.meals.length > 0;
  
  let orderType = 'MIXTE';
  if (hasDrinks && !hasMeals) {
    orderType = 'BOISSONS';
  } else if (!hasDrinks && hasMeals) {
    orderType = 'REPAS';
  }

  const time = formatTime(order.createdAt);
  
  return `Table${order.table}_${orderType}_${order.waitress}_${time}`;
};

/**
 * Génère un PDF professionnel de la commande avec jsPDF
 */
const generatePDF = async (order: Order): Promise<Blob> => {
  const { date, time } = formatDateTime(order.createdAt);
  const total = calculateTotal(order);
  
  // Format A4 pour un PDF professionnel
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Couleurs (format RGB)
  const primaryColor: [number, number, number] = [41, 128, 185]; // Bleu professionnel
  const lightGray: [number, number, number] = [245, 245, 245];
  const darkGray: [number, number, number] = [52, 73, 94];
  
  let y = 20;
  
  // Configuration de l'encodage pour les caractères français
  pdf.setLanguage('fr');
  
  // En-tête avec logo et titre
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, 210, 30, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.text('HOPLA\'GEIS', 105, 20, { align: 'center' });
  
  // Type de commande
  pdf.setFontSize(14);
  const hasDrinks = order.drinks && order.drinks.length > 0;
  const hasMeals = order.meals && order.meals.length > 0;
  let orderTypeHeader = "COMMANDE MIXTE";
  if (hasDrinks && !hasMeals) orderTypeHeader = "COMMANDE BOISSONS";
  else if (!hasDrinks && hasMeals) orderTypeHeader = "COMMANDE REPAS";
  
  pdf.text(orderTypeHeader, 105, 27, { align: 'center' });
  
  y = 45;
  
  // Informations de commande
  pdf.setTextColor(...darkGray);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  
  // Cadre d'informations
  pdf.setFillColor(...lightGray);
  pdf.rect(15, y - 5, 180, 25, 'F');
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(15, y - 5, 180, 25, 'S');
  
  pdf.setFont('helvetica', 'bold');
  const tableText = `Table: ${order.table}${order.tableComment ? ` (${order.tableComment})` : ''}`;
  pdf.text(tableText, 20, y + 5);
  if (order.room) {
    pdf.text(`Salle: ${order.room}`, 20, y + 12);
  }
  pdf.text(`Serveuse: ${order.waitress}`, 110, y + 5);
  pdf.text(`${date} à ${time}`, 110, y + 12);
  
  y += 35;
  
  // Section Boissons
  if (hasDrinks) {
    pdf.setFillColor(...primaryColor);
    pdf.rect(15, y - 3, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('BOISSONS', 20, y + 2);
    
    y += 15;
    pdf.setTextColor(...darkGray);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    order.drinks.forEach(item => {
      const itemTotal = (item.price * item.quantity).toFixed(2);
      pdf.text(`${item.quantity}x`, 20, y);
      pdf.text(item.name, 35, y);
      pdf.text(`${itemTotal}€`, 180, y, { align: 'right' });
      
      if (item.comment) {
        y += 5;
        pdf.setFont('helvetica', 'italic');
        pdf.text(`→ ${item.comment}`, 35, y);
        pdf.setFont('helvetica', 'normal');
      }
      y += 8;
    });
    y += 5;
  }
  
  // Section Plats
  if (hasMeals) {
    pdf.setFillColor(...primaryColor);
    pdf.rect(15, y - 3, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('PLATS', 20, y + 2);
    
    y += 15;
    pdf.setTextColor(...darkGray);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    order.meals.forEach(item => {
      const itemTotal = (item.price * item.quantity).toFixed(2);
      pdf.text(`${item.quantity}x`, 20, y);
      pdf.text(item.name, 35, y);
      pdf.text(`${itemTotal}€`, 180, y, { align: 'right' });
      
      if (item.cooking) {
        y += 5;
        pdf.setFont('helvetica', 'bold');
        const cookingText = `Cuisson: ${item.cooking}`;
        pdf.text(cookingText, 35, y);
        pdf.setFont('helvetica', 'normal');
      }
      
      if (item.comment) {
        y += 5;
        pdf.setFont('helvetica', 'italic');
        const commentText = `Note: ${item.comment}`;
        pdf.text(commentText, 35, y);
        pdf.setFont('helvetica', 'normal');
      }
      y += 8;
    });
  }
  
  // Total
  y += 10;
  pdf.setFillColor(...darkGray);
  pdf.rect(15, y - 3, 180, 12, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  const totalText = `TOTAL: ${total.toFixed(2)} EUR`;
  pdf.text(totalText, 180, y + 5, { align: 'right' });
  
  // Pied de page
  y = 280;
  pdf.setTextColor(...darkGray);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  const footerText1 = 'Merci de votre visite!';
  const footerText2 = `Document genere le ${new Date().toLocaleString('fr-FR')}`;
  pdf.text(footerText1, 105, y, { align: 'center' });
  pdf.text(footerText2, 105, y + 5, { align: 'center' });
  
  return pdf.output('blob');
};

// Fonctions utilitaires pour le PDF
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('fr-FR'),
    time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  };
};

const calculateTotal = (order: Order) => {
  const drinksTotal = order.drinks ? order.drinks.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  const mealsTotal = order.meals ? order.meals.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  return drinksTotal + mealsTotal;
};

/**
 * Sauvegarde une commande localement en PDF
 */
export const saveOrderToLocalFile = async (order: Order): Promise<void> => {
  try {
    const blob = await generatePDF(order);
    const url = window.URL.createObjectURL(blob);
    
    // Créer un élément de téléchargement
    const link = document.createElement('a');
    link.href = url;
    
    // Nom du fichier selon le format demandé
    const fileName = `${generateFileName(order)}.pdf`;
    link.download = fileName;
    link.style.display = 'none';
    
    // Déclencher le téléchargement de façon sécurisée
    document.body.appendChild(link);
    link.click();
    
    // Nettoyage asynchrone pour éviter les conflits React
    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 100);
    
    console.log(`Commande ${order.id} sauvegardée en PDF`);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde locale:', error);
    throw error;
  }
};

/**
 * Sauvegarde une commande localement en fichier texte (format ticket)
 */
export const saveOrderToTextFile = (order: Order): void => {
  try {
    const fileContent = generateTicketContent(order);
    
    // Créer le blob et télécharger le fichier
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    
    // Créer un élément de téléchargement
    const link = document.createElement('a');
    link.href = url;
    
    // Nom du fichier selon le format demandé
    const fileName = `${generateFileName(order)}.txt`;
    link.download = fileName;
    link.style.display = 'none';
    
    // Déclencher le téléchargement de façon sécurisée
    document.body.appendChild(link);
    link.click();
    
    // Nettoyage asynchrone pour éviter les conflits React
    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 100);
    
    console.log(`Commande ${order.id} sauvegardée en fichier texte`);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde texte:', error);
    throw error;
  }
};

/**
 * Vérifie si la sauvegarde locale est supportée par le navigateur
 */
export const isLocalBackupSupported = (): boolean => {
  try {
    return !!(window.Blob && window.URL && window.URL.createObjectURL);
  } catch (error) {
    console.error('Local backup not supported:', error);
    return false;
  }
};
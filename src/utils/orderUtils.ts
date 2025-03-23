
export const generateOrderId = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  // Format: CMD-YYMMDD-HHMMSS-RR (RR est un nombre aléatoire entre 00 et 99)
  return `CMD-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
};

export const sortOrdersByCreationTime = (orders: any[]) => {
  return [...orders].sort((a, b) => {
    // Si les dates de création sont disponibles, utilisez-les
    if (a.createdAt && b.createdAt) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    
    // Sinon, essayez d'extraire la date/heure de l'ID de commande
    const extractTimeFromId = (id: string) => {
      // Format attendu: CMD-YYMMDD-HHMMSS-RR
      const parts = id.split('-');
      if (parts.length >= 3) {
        const dateStr = parts[1]; // YYMMDD
        const timeStr = parts[2]; // HHMMSS-RR ou HHMMSS
        
        // Si nous avons un format valide
        if (dateStr.length === 6 && (timeStr.length >= 6)) {
          const year = '20' + dateStr.substring(0, 2);
          const month = dateStr.substring(2, 4);
          const day = dateStr.substring(4, 6);
          
          const hours = timeStr.substring(0, 2);
          const minutes = timeStr.substring(2, 4);
          const seconds = timeStr.substring(4, 6);
          
          // Créer une date au format YYYY-MM-DDTHH:MM:SS
          return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`).getTime();
        }
      }
      
      return 0; // Valeur par défaut si on ne peut pas extraire
    };
    
    return extractTimeFromId(a.id) - extractTimeFromId(b.id);
  });
};

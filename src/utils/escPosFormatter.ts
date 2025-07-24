interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cooking?: string;
  comment?: string;
  needsCooking: boolean;
}

interface Order {
  id: string;
  table_number: string;
  table_comment: string;
  room_name: string;
  waitress: string;
  status: string;
  drinks: OrderItem[];
  meals: OrderItem[];
  created_at: string;
}

export const generateEscPosTicket = (order: Order): string => {
  const ESC = '\x1B';
  const GS = '\x1D';
  
  // ESC/POS Commands
  const commands = {
    init: ESC + '@',           // Initialize printer
    centerAlign: ESC + 'a1',   // Center alignment
    leftAlign: ESC + 'a0',     // Left alignment
    bold: ESC + 'E1',          // Bold on
    boldOff: ESC + 'E0',       // Bold off
    doubleHeight: GS + '!1',   // Double height
    normalSize: GS + '!0',     // Normal size
    cut: GS + 'V66' + '\x00',  // Cut paper
    lineFeed: '\n',
    largeFeed: '\n\n'
  };

  let ticket = '';
  
  // Initialize printer
  ticket += commands.init;
  
  // Header - Professional format like the preview
  ticket += commands.centerAlign;
  ticket += commands.bold;
  ticket += commands.doubleHeight;
  ticket += "HOPLA'GEIS";
  ticket += commands.lineFeed;
  
  ticket += commands.normalSize;
  ticket += commands.boldOff;
  ticket += '================================';
  ticket += commands.lineFeed;
  
  // Determine order type header like in preview
  let orderTypeHeader = "COMMANDE";
  const hasDrinks = order.drinks.length > 0;
  const hasMeals = order.meals.length > 0;

  if (hasDrinks && !hasMeals) {
    orderTypeHeader = "COMMANDE BOISSONS";
  } else if (!hasDrinks && hasMeals) {
    orderTypeHeader = "COMMANDE REPAS";
  }
  
  ticket += commands.bold;
  ticket += orderTypeHeader;
  ticket += commands.lineFeed;
  ticket += commands.boldOff;
  
  ticket += '================================';
  ticket += commands.largeFeed;
  
  // Order Information - Professional format
  ticket += commands.leftAlign;
  ticket += commands.bold;
  
  // Table with comment like in preview
  let tableInfo = `TABLE: ${order.table_number}`;
  if (order.table_comment) {
    tableInfo += ` (${order.table_comment})`;
  }
  ticket += tableInfo;
  ticket += commands.lineFeed;
  
  // Show room if it exists
  if (order.room_name) {
    ticket += `SALLE: ${order.room_name}`;
    ticket += commands.lineFeed;
  }
  
  ticket += `SERVEUSE: ${order.waitress}`;
  ticket += commands.lineFeed;
  
  const orderDate = new Date(order.created_at);
  ticket += `DATE: ${orderDate.toLocaleDateString('fr-FR')} ${orderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  ticket += commands.lineFeed;
  
  ticket += commands.boldOff;
  ticket += '--------------------------------';
  ticket += commands.largeFeed;
  
  // Calculate totals
  let total = 0;
  
  // Drinks Section - with emoji like preview
  if (order.drinks.length > 0) {
    ticket += commands.bold;
    ticket += '🥤 BOISSONS:';
    ticket += commands.lineFeed;
    ticket += commands.boldOff;
    ticket += '--------------------------------';
    ticket += commands.lineFeed;
    
    order.drinks.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      // Item line
      const itemLine = `${item.quantity}x ${item.name}`;
      const priceStr = `${itemTotal.toFixed(2)}€`;
      const padding = 32 - itemLine.length - priceStr.length;
      
      ticket += itemLine + ' '.repeat(Math.max(1, padding)) + priceStr;
      ticket += commands.lineFeed;
      
      // Comment if exists
      if (item.comment) {
        ticket += `  → ${item.comment}`;
        ticket += commands.lineFeed;
      }
    });
    
    ticket += commands.largeFeed;
  }
  
  // Meals Section - with emoji like preview
  if (order.meals.length > 0) {
    ticket += commands.bold;
    ticket += '🍽️ PLATS:';
    ticket += commands.lineFeed;
    ticket += commands.boldOff;
    ticket += '--------------------------------';
    ticket += commands.lineFeed;
    
    order.meals.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      // Item line
      const itemLine = `${item.quantity}x ${item.name}`;
      const priceStr = `${itemTotal.toFixed(2)}€`;
      const padding = 32 - itemLine.length - priceStr.length;
      
      ticket += itemLine + ' '.repeat(Math.max(1, padding)) + priceStr;
      ticket += commands.lineFeed;
      
      // Cooking instruction
      if (item.cooking) {
        ticket += commands.bold;
        ticket += `  → CUISSON: ${item.cooking}`;
        ticket += commands.boldOff;
        ticket += commands.lineFeed;
      }
      
      // Comment if exists
      if (item.comment) {
        ticket += `  → ${item.comment}`;
        ticket += commands.lineFeed;
      }
    });
    
    ticket += commands.largeFeed;
  }
  
  // Total
  ticket += '================================';
  ticket += commands.lineFeed;
  ticket += commands.bold;
  ticket += commands.doubleHeight;
  
  const totalLine = 'TOTAL:';
  const totalPrice = `${total.toFixed(2)}€`;
  const totalPadding = 32 - totalLine.length - totalPrice.length;
  
  ticket += totalLine + ' '.repeat(Math.max(1, totalPadding)) + totalPrice;
  ticket += commands.lineFeed;
  
  ticket += commands.normalSize;
  ticket += commands.boldOff;
  ticket += '================================';
  ticket += commands.largeFeed;
  
  // Footer - Professional format like preview
  ticket += commands.centerAlign;
  ticket += '================================';
  ticket += commands.lineFeed;
  ticket += 'Merci de votre visite!';
  ticket += commands.lineFeed;
  
  const printTime = new Date().toLocaleString('fr-FR');
  ticket += `Imprimé le ${printTime}`;
  ticket += commands.largeFeed;
  
  // Cut paper
  ticket += commands.cut;
  
  return ticket;
};

// Helper functions for formatting
const getMargin = () => {
  const marginSize = localStorage.getItem('print_margin_size') || 'normal';
  switch (marginSize) {
    case 'small': return '  ';
    case 'large': return '      ';
    default: return '   ';
  }
};

const getSectionSpacing = () => {
  const spacing = localStorage.getItem('print_section_spacing') || 'normal';
  switch (spacing) {
    case 'tight': return '\n';
    case 'loose': return '\n\n\n';
    default: return '\n\n';
  }
};

const getLineSpacing = () => {
  const spacing = localStorage.getItem('print_line_spacing') || 'normal';
  switch (spacing) {
    case 'tight': return '';
    case 'loose': return '\n';
    default: return '';
  }
};

const formatText = (text: string, align: string, bold: boolean = false) => {
  const margin = getMargin();
  const lineLength = 32;
  
  let formattedText = text;
  if (bold) {
    formattedText = `**${text}**`; // Bold marker for text format
  }
  
  switch (align) {
    case 'center':
      const padding = Math.max(0, Math.floor((lineLength - text.length) / 2));
      return margin + ' '.repeat(padding) + formattedText;
    case 'right':
      const rightPadding = Math.max(0, lineLength - text.length);
      return margin + ' '.repeat(rightPadding) + formattedText;
    default:
      return margin + formattedText;
  }
};

const getSizeModifier = (size: string) => {
  switch (size) {
    case 'small': return '';
    case 'large': return '█ ';
    case 'extra-large': return '██ ';
    default: return '';
  }
};

// Generate professional text format with customization
export const generateSimpleTextTicket = (order: Order): string => {
  let ticket = '';
  const margin = getMargin();
  const sectionSpacing = getSectionSpacing();
  const lineSpacing = getLineSpacing();
  
  // Get settings
  const restaurantName = localStorage.getItem('print_restaurant_name') || "HOPLA'GEIS";
  const headerAlign = localStorage.getItem('print_header_align') || 'center';
  const headerSize = localStorage.getItem('print_header_size') || 'large';
  const headerBold = localStorage.getItem('print_header_bold') !== 'false';
  
  const infoAlign = localStorage.getItem('print_info_align') || 'left';
  const infoSize = localStorage.getItem('print_info_size') || 'normal';
  const infoBold = localStorage.getItem('print_info_bold') !== 'false';
  const showRoom = localStorage.getItem('print_show_room') !== 'false';
  
  const sectionAlign = localStorage.getItem('print_section_align') || 'left';
  const sectionSize = localStorage.getItem('print_section_size') || 'normal';
  const sectionBold = localStorage.getItem('print_section_bold') !== 'false';
  const showEmojis = localStorage.getItem('print_show_emojis') !== 'false';
  const showComments = localStorage.getItem('print_show_comments') !== 'false';
  const showCooking = localStorage.getItem('print_show_cooking') !== 'false';
  const cookingBold = localStorage.getItem('print_cooking_bold') !== 'false';
  
  const totalAlign = localStorage.getItem('print_total_align') || 'left';
  const totalSize = localStorage.getItem('print_total_size') || 'large';
  const totalBold = localStorage.getItem('print_total_bold') !== 'false';
  
  const footerText = localStorage.getItem('print_footer_text') || 'Merci de votre visite!';
  const footerAlign = localStorage.getItem('print_footer_align') || 'center';
  const showPrintTime = localStorage.getItem('print_show_print_time') !== 'false';
  
  // Header
  ticket += margin + '================================\n';
  const headerText = getSizeModifier(headerSize) + restaurantName;
  ticket += formatText(headerText, headerAlign, headerBold) + '\n';
  ticket += margin + '================================\n';
  
  // Determine order type header
  let orderTypeHeader = "COMMANDE";
  const hasDrinks = order.drinks.length > 0;
  const hasMeals = order.meals.length > 0;

  if (hasDrinks && !hasMeals) {
    orderTypeHeader = "COMMANDE BOISSONS";
  } else if (!hasDrinks && hasMeals) {
    orderTypeHeader = "COMMANDE REPAS";
  }
  
  ticket += formatText(orderTypeHeader, headerAlign, headerBold) + '\n';
  ticket += margin + '================================' + sectionSpacing;
  
  // Order Information
  let tableInfo = `TABLE: ${order.table_number}`;
  if (order.table_comment) {
    tableInfo += ` (${order.table_comment})`;
  }
  const infoText = getSizeModifier(infoSize) + tableInfo;
  ticket += formatText(infoText, infoAlign, infoBold) + '\n' + lineSpacing;
  
  // Show room if enabled and exists
  if (showRoom && order.room_name) {
    const roomText = getSizeModifier(infoSize) + `SALLE: ${order.room_name}`;
    ticket += formatText(roomText, infoAlign, infoBold) + '\n' + lineSpacing;
  }
  
  const waitressText = getSizeModifier(infoSize) + `SERVEUSE: ${order.waitress}`;
  ticket += formatText(waitressText, infoAlign, infoBold) + '\n' + lineSpacing;
  
  const orderDate = new Date(order.created_at);
  const dateText = getSizeModifier(infoSize) + `DATE: ${orderDate.toLocaleDateString('fr-FR')} ${orderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  ticket += formatText(dateText, infoAlign, infoBold) + '\n';
  
  ticket += margin + '--------------------------------' + sectionSpacing;
  
  let total = 0;
  
  // Drinks section
  if (order.drinks.length > 0) {
    const drinksTitle = getSizeModifier(sectionSize) + (showEmojis ? '🥤 BOISSONS:' : 'BOISSONS:');
    ticket += formatText(drinksTitle, sectionAlign, sectionBold) + '\n';
    ticket += margin + '--------------------------------\n';
    
    order.drinks.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      const itemLine = `${item.quantity}x ${item.name}`;
      const priceStr = `${itemTotal.toFixed(2)}€`;
      const padding = 32 - itemLine.length - priceStr.length;
      
      ticket += margin + itemLine + ' '.repeat(Math.max(1, padding)) + priceStr + '\n' + lineSpacing;
      
      if (showComments && item.comment) {
        ticket += formatText(`→ ${item.comment}`, 'left', false) + '\n' + lineSpacing;
      }
    });
    
    ticket += sectionSpacing;
  }
  
  // Meals section
  if (order.meals.length > 0) {
    const mealsTitle = getSizeModifier(sectionSize) + (showEmojis ? '🍽️ PLATS:' : 'PLATS:');
    ticket += formatText(mealsTitle, sectionAlign, sectionBold) + '\n';
    ticket += margin + '--------------------------------\n';
    
    order.meals.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      const itemLine = `${item.quantity}x ${item.name}`;
      const priceStr = `${itemTotal.toFixed(2)}€`;
      const padding = 32 - itemLine.length - priceStr.length;
      
      ticket += margin + itemLine + ' '.repeat(Math.max(1, padding)) + priceStr + '\n' + lineSpacing;
      
      if (showCooking && item.cooking) {
        const cookingText = `→ CUISSON: ${item.cooking}`;
        ticket += formatText(cookingText, 'left', cookingBold) + '\n' + lineSpacing;
      }
      
      if (showComments && item.comment) {
        ticket += formatText(`→ ${item.comment}`, 'left', false) + '\n' + lineSpacing;
      }
    });
    
    ticket += sectionSpacing;
  }
  
  // Total
  ticket += margin + '================================\n';
  const totalLine = getSizeModifier(totalSize) + 'TOTAL:';
  const totalPrice = `${total.toFixed(2)}€`;
  const totalPadding = 32 - 'TOTAL:'.length - totalPrice.length;
  
  // Format total with proper alignment
  if (totalAlign === 'center') {
    const totalText = `TOTAL: ${totalPrice}`;
    ticket += formatText(getSizeModifier(totalSize) + totalText, 'center', totalBold) + '\n';
  } else if (totalAlign === 'right') {
    ticket += formatText(totalLine + ' '.repeat(Math.max(1, totalPadding)) + totalPrice, 'right', totalBold) + '\n';
  } else {
    ticket += formatText(totalLine + ' '.repeat(Math.max(1, totalPadding)) + totalPrice, 'left', totalBold) + '\n';
  }
  
  ticket += margin + '================================' + sectionSpacing;
  
  // Footer
  ticket += margin + '================================\n';
  ticket += formatText(footerText, footerAlign, false) + '\n';
  
  if (showPrintTime) {
    const printTime = new Date().toLocaleString('fr-FR');
    ticket += formatText(`Imprimé le ${printTime}`, footerAlign, false) + '\n';
  }
  
  return ticket;
};

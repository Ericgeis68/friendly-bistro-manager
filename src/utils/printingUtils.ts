// Printing utilities for sending tickets to printer

export interface PrinterConfig {
  printerName?: string;
  paperWidth: number;
  encoding: string;
  autocut: boolean;
  // Layout configuration
  pageWidth: string;
  pageHeight: string;
  margin: string;
  textAlign: 'left' | 'center' | 'right';
  fontSize: string;
  lineHeight: string;
}

const defaultConfig: PrinterConfig = {
  paperWidth: 32,
  encoding: 'utf-8',
  autocut: true,
  pageWidth: '80mm',
  pageHeight: 'auto',
  margin: '2mm',
  textAlign: 'center',
  fontSize: '11px',
  lineHeight: '1.3'
};

// For silent automatic printing (recommended method)
export const printSilently = (content: string, config: Partial<PrinterConfig> = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      
      document.body.appendChild(iframe);
      
      const finalConfig = { ...defaultConfig, ...config };
      
      // Generate HTML content optimized for thermal printers
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ticket de Commande</title>
            <style>
              @page {
                size: ${finalConfig.pageWidth} ${finalConfig.pageHeight};
                margin: 0;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: ${finalConfig.fontSize};
                line-height: ${finalConfig.lineHeight};
                margin: 0;
                padding: ${finalConfig.margin};
                white-space: pre-wrap;
                width: calc(${finalConfig.pageWidth} - ${finalConfig.margin} * 2);
                box-sizing: border-box;
                text-align: ${finalConfig.textAlign};
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: ${finalConfig.margin}; 
                  -webkit-print-color-adjust: exact;
                  text-align: ${finalConfig.textAlign};
                }
              }
            </style>
          </head>
          <body>${content.replace(/\n/g, '<br>')}</body>
        </html>
      `;
      
      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Impossible d\'accéder au document iframe');
      }
      
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      
      // Wait for content to load, then print silently
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            
            // Clean up after printing
            setTimeout(() => {
              document.body.removeChild(iframe);
              resolve();
            }, 1000);
            
          } catch (printError) {
            document.body.removeChild(iframe);
            reject(new Error(`Erreur lors de l'impression: ${printError}`));
          }
        }, 100);
      };
      
      iframe.onerror = () => {
        document.body.removeChild(iframe);
        reject(new Error('Erreur lors du chargement du contenu d\'impression'));
      };
      
    } catch (error) {
      reject(error);
    }
  });
};

// For web-based printing with dialog (fallback method)
export const printToWebBrowser = (content: string, config: Partial<PrinterConfig> = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      
      if (!printWindow) {
        throw new Error('Popup bloqué - impossible d\'ouvrir la fenêtre d\'impression');
      }
      
      const finalConfig = { ...defaultConfig, ...config };
      
      // Generate HTML content for printing
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ticket de Commande</title>
            <style>
              @page {
                size: ${finalConfig.pageWidth} ${finalConfig.pageHeight};
                margin: 0;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: ${finalConfig.fontSize};
                line-height: ${finalConfig.lineHeight};
                margin: 0;
                padding: ${finalConfig.margin};
                white-space: pre-wrap;
                width: calc(${finalConfig.pageWidth} - ${finalConfig.margin} * 2);
                box-sizing: border-box;
                text-align: ${finalConfig.textAlign};
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: ${finalConfig.margin}; 
                  -webkit-print-color-adjust: exact;
                  text-align: ${finalConfig.textAlign};
                }
              }
            </style>
          </head>
          <body>${content.replace(/\n/g, '<br>')}</body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        resolve();
      }, 500);
      
    } catch (error) {
      reject(error);
    }
  });
};

// For silent printing via Capacitor (mobile apps)
export const printToMobilePrinter = async (content: string): Promise<void> => {
  // Check if running in Capacitor environment
  if (typeof (window as any).Capacitor !== 'undefined') {
    try {
      // This would require a Capacitor plugin for printing
      // For now, we'll fall back to web printing
      console.log('Capacitor printing not yet implemented, falling back to web printing');
      return printToWebBrowser(content);
    } catch (error) {
      throw new Error(`Erreur d'impression mobile: ${error}`);
    }
  } else {
    return printToWebBrowser(content);
  }
};

// For network/USB printing (requires backend service)
export const printToNetworkPrinter = async (
  content: string, 
  printerEndpoint: string = '/api/print'
): Promise<void> => {
  try {
    const response = await fetch(printerEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        format: 'escpos',
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Impression réseau réussie:', result);
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur d'impression réseau: ${error.message}`);
    }
    throw new Error('Erreur d\'impression réseau inconnue');
  }
};

// Main printing function - tries different methods based on environment
export const sendToPrinter = async (
  content: string, 
  config: Partial<PrinterConfig> = {}
): Promise<void> => {
  // Get layout configuration from localStorage
  const layoutConfig = {
    pageWidth: localStorage.getItem('printer_page_width') || defaultConfig.pageWidth,
    pageHeight: localStorage.getItem('printer_page_height') || defaultConfig.pageHeight,
    margin: localStorage.getItem('printer_margin') || defaultConfig.margin,
    textAlign: (localStorage.getItem('printer_text_align') as 'left' | 'center' | 'right') || defaultConfig.textAlign,
    fontSize: localStorage.getItem('printer_font_size') || defaultConfig.fontSize,
    lineHeight: localStorage.getItem('printer_line_height') || defaultConfig.lineHeight,
  };
  
  const finalConfig = { ...defaultConfig, ...layoutConfig, ...config };
  
  console.log('Envoi vers l\'imprimante...', { content: content.substring(0, 100) + '...' });
  
  // Strategy 1: Try network printing first (if endpoint is available)
  try {
    const networkEndpoint = localStorage.getItem('printer_endpoint');
    if (networkEndpoint) {
      await printToNetworkPrinter(content, networkEndpoint);
      console.log('Impression réseau réussie');
      return;
    }
  } catch (error) {
    console.warn('Impression réseau échouée, tentative alternatives...', error);
  }
  
  // Strategy 2: Try mobile printing (Capacitor)
  try {
    if (typeof (window as any).Capacitor !== 'undefined') {
      await printToMobilePrinter(content);
      console.log('Impression mobile réussie');
      return;
    }
  } catch (error) {
    console.warn('Impression mobile échouée, utilisation du navigateur...', error);
  }
  
  // Strategy 3: Try silent printing first (automatic without dialog)
  try {
    const silentPrintEnabled = localStorage.getItem('silent_print_enabled') !== 'false';
    if (silentPrintEnabled) {
      await printSilently(content, finalConfig);
      console.log('Impression silencieuse réussie');
      return;
    }
  } catch (error) {
    console.warn('Impression silencieuse échouée, utilisation de la boîte de dialogue...', error);
  }
  
  // Strategy 4: Fallback to web browser printing with dialog
  try {
    await printToWebBrowser(content, finalConfig);
    console.log('Impression navigateur réussie');
  } catch (error) {
    throw new Error(`Toutes les méthodes d'impression ont échoué: ${error}`);
  }
};

// Configuration helpers
export const setPrinterEndpoint = (endpoint: string): void => {
  localStorage.setItem('printer_endpoint', endpoint);
};

export const getPrinterEndpoint = (): string | null => {
  return localStorage.getItem('printer_endpoint');
};

export const clearPrinterConfig = (): void => {
  localStorage.removeItem('printer_endpoint');
  localStorage.removeItem('silent_print_enabled');
};

// Silent printing configuration
export const setSilentPrintEnabled = (enabled: boolean): void => {
  localStorage.setItem('silent_print_enabled', enabled.toString());
};

export const getSilentPrintEnabled = (): boolean => {
  const setting = localStorage.getItem('silent_print_enabled');
  return setting !== 'false'; // Default to true if not set
};

// Test printing function
export const testPrinter = async (): Promise<void> => {
  const testTicket = `
================================
         TEST D'IMPRESSION
================================

Date: ${new Date().toLocaleString('fr-FR')}
Statut: Test de connectivité

--------------------------------

Si vous voyez ce message,
l'imprimante fonctionne correctement!

================================
  `;
  
  await sendToPrinter(testTicket);
};

import type { MenuItem } from '../types/restaurant';

/**
 * Groups menu items by name and cooking style (for meals) or just by name (for drinks)
 * @param items Array of menu items to group
 * @param includeCooking Whether to include cooking style in the grouping key (for meals)
 * @returns Record with grouped items and their quantities
 */
export const groupMenuItems = <T extends MenuItem>(items: T[], includeCooking = true): Record<string, T> => {
  const groupedItems: Record<string, T> = {};
  
  items.forEach((item) => {
    // For meals, group by name and cooking style. For drinks, just group by name
    const key = includeCooking && item.cooking 
      ? `${item.name}-${item.cooking}` 
      : item.name;
    
    if (!groupedItems[key]) {
      groupedItems[key] = { ...item, quantity: 0 };
    }
    
    groupedItems[key].quantity = (groupedItems[key].quantity || 0) + (item.quantity || 1);
  });
  
  return groupedItems;
};

/**
 * Gets unique cooking options from a list of meals
 * @param meals Array of meals to extract cooking options from
 * @returns Array of unique cooking options
 */
export const getUniqueCookingOptions = (meals: MenuItem[]): string[] => {
  const cookingOptions = new Set<string>();
  
  meals.forEach(meal => {
    if (meal.cooking) {
      cookingOptions.add(meal.cooking);
    }
  });
  
  return Array.from(cookingOptions);
};

/**
 * Loads cooking options from localStorage or returns defaults
 * @returns Array of cooking options
 */
export const loadCookingOptions = (): string[] => {
  const savedOptions = localStorage.getItem('cookingOptions');
  if (savedOptions) {
    try {
      return JSON.parse(savedOptions);
    } catch (e) {
      console.error('Error parsing cooking options:', e);
      return DEFAULT_COOKING_OPTIONS;
    }
  }
  return DEFAULT_COOKING_OPTIONS;
};

/**
 * Default cooking options
 */
export const DEFAULT_COOKING_OPTIONS = ['BLEU', 'SAIGNANT', 'A POINT', 'CUIT', 'BIEN CUIT'];

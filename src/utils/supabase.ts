import { createClient } from '@supabase/supabase-js';
import { FloorPlan } from '../types/floorPlan'; // Assurez-vous que ce chemin est correct
import { AppSettings } from '../types/restaurant';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log("Initializing Supabase...");
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey ? "Present" : "Missing");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations
export const supabaseHelpers = {
  // Exposer le client supabase pour les requêtes personnalisées
  supabase,

  // Menu Items
  async getMenuItems() {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, price, needs_cooking, category, variants')
      .order('id');
    
    if (error) throw error;
    return data;
  },

  async updateMenuItems(menuItems: any) {
    // Clear existing items
    await supabase.from('menu_items').delete().neq('id', 0);
    
    // Insert new items with proper column mapping including variants
    const allItems = [
      ...menuItems.drinks.map((item: any) => ({ 
        id: item.id,
        name: item.name,
        price: item.price,
        needs_cooking: item.needsCooking, // Map camelCase to snake_case
        category: 'drinks',
        variants: item.variants || null // Inclure les variantes
      })),
      ...menuItems.meals.map((item: any) => ({ 
        id: item.id,
        name: item.name,
        price: item.price,
        needs_cooking: item.needsCooking, // Map camelCase to snake_case
        category: 'meals',
        variants: null // Les repas n'ont pas de variantes
      }))
    ];
    
    const { error } = await supabase
      .from('menu_items')
      .insert(allItems);
    
    if (error) throw error;
  },

  // Orders
  async getPendingOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'ready'])
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  },

  async getCompletedOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['delivered', 'cancelled'])
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createOrder(order: any) {
      const { error } = await supabaseHelpers.supabase
        .from('orders')
        .insert({
          id: order.id,
          table_number: order.table,
          table_comment: order.tableComment || '',
          room_name: order.room || null,
          waitress: order.waitress,
          status: order.status,
          drinks_status: order.drinksStatus,
          meals_status: order.mealsStatus,
          drinks: order.drinks || [],
          meals: order.meals || []
        });
    
    if (error) throw error;
  },

  async updateOrder(orderId: string, updates: any) {
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);
    
    if (error) throw error;
  },

  async deleteOrder(orderId: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    
    if (error) throw error;
  },

  // Notifications
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('read', false)
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  },

  async createNotification(notification: any) {
    const { error } = await supabase
      .from('notifications')
      .insert({
        order_id: notification.orderId,
        waitress: notification.waitress,
        table_number: notification.table,
        status: notification.status,
        message: notification.message || null,
        read: false
      });
    
    if (error) throw error;
  },

  async createKitchenCallNotification(targetWaitress?: string) {
    try {
      let waitresses: string[] = [];
      
      if (targetWaitress) {
        // Appeler une serveuse spécifique
        waitresses = [targetWaitress];
      } else {
        // Appeler toutes les serveuses - récupérer depuis la base de données
        const waitressesData = await this.getWaitresses();
        waitresses = waitressesData.map(w => w.name);
      }
      
      if (waitresses.length === 0) {
        throw new Error('Aucune serveuse disponible');
      }
      
      const notifications = waitresses.map(waitress => ({
        order_id: null,
        waitress: waitress,
        table_number: null,
        status: 'kitchen_call',
        message: 'La cuisine vous demande',
        read: false
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la création de la notification cuisine:', error);
      throw error;
    }
  },

  async markNotificationAsRead(orderId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('order_id', orderId);
    
    if (error) throw error;
  },

  async updateNotificationRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
  },

  async deleteNotification(orderId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('order_id', orderId);
    
    if (error) throw error;
  },

  // Cooking Options with better error handling
  async getCookingOptions() {
    try {
      console.log("Fetching cooking options from Supabase...");
      const { data, error } = await supabase
        .from('cooking_options')
        .select('option_name')
        .order('id');
      
      if (error) {
        console.error("Supabase error fetching cooking options:", error);
        throw error;
      }
      
      console.log("Successfully fetched cooking options:", data);
      return data?.map(item => item.option_name) || [];
    } catch (error) {
      console.error("Error in getCookingOptions:", error);
      throw error;
    }
  },

  async updateCookingOptions(options: string[]) {
    try {
      console.log("Updating cooking options in Supabase:", options);
      
      // Clear existing options
      await supabase.from('cooking_options').delete().neq('id', 0);
      
      // Insert new options
      const optionsData = options.map(option => ({ option_name: option }));
      const { error } = await supabase
        .from('cooking_options')
        .insert(optionsData);
      
      if (error) {
        console.error("Error updating cooking options:", error);
        throw error;
      }
      
      console.log("Successfully updated cooking options");
    } catch (error) {
      console.error("Error in updateCookingOptions:", error);
      throw error;
    }
  },

  // Waitresses management
  async getWaitresses() {
    try {
      const { data, error } = await supabase
        .from('waitresses')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Supabase error fetching waitresses:', error);
        return []; // Retourner un tableau vide au lieu de throw
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getWaitresses:', error);
      // Retourner un tableau vide au lieu de throw pour éviter le crash
      return [];
    }
  },

  async createWaitress(name: string) {
    const { error } = await supabase
      .from('waitresses')
      .insert({ name });
    
    if (error) throw error;
  },

  async updateWaitress(id: string, name: string) {
    const { error } = await supabase
      .from('waitresses')
      .update({ name })
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteWaitress(id: string) {
    const { error } = await supabase
      .from('waitresses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Floor Plan Management - CORRECTION CRITIQUE
  async getFloorPlan(planId: string = 'main_floor_plan'): Promise<FloorPlan | null> {
    console.log(`Fetching floor plan with ID: ${planId}`);
    const { data, error } = await supabase
      .from('floor_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching floor plan:", error);
      throw error;
    }
    
    if (data) {
      console.log("Floor plan fetched:", data);
      return {
        id: data.id,
        name: data.name,
        roomSize: data.room_size,
        elements: data.elements,
        gridSize: data.grid_size || 100 // CORRECTION : Inclure gridSize
      } as FloorPlan;
    }
    console.log("No floor plan found with ID:", planId);
    return null;
  },

  async upsertFloorPlan(floorPlan: FloorPlan) {
    console.log("Upserting floor plan:", floorPlan);
    
    // CORRECTION CRITIQUE : Mapper correctement les propriétés
    const dataToSave = {
      id: floorPlan.id,
      name: floorPlan.name,
      room_size: floorPlan.roomSize, // Mapper roomSize vers room_size
      elements: floorPlan.elements,
      grid_size: floorPlan.gridSize || 100, // Mapper gridSize vers grid_size
      updated_at: new Date().toISOString()
    };
    
    console.log("Data to save:", dataToSave);
    
    const { error } = await supabase
      .from('floor_plans')
      .upsert(dataToSave, { onConflict: 'id' });

    if (error) {
      console.error("Error upserting floor plan:", error);
      throw error;
    }
    console.log("Floor plan upserted successfully.");
  },

  // Real-time subscriptions
  subscribeToOrders(callback: (payload: any) => void) {
    return supabase
      .channel('orders_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        callback
      )
      .subscribe();
  },

  subscribeToNotifications(callback: (payload: any) => void) {
    return supabase
      .channel('notifications_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' }, 
        callback
      )
      .subscribe();
  },

  subscribeToMenuItems(callback: (payload: any) => void) {
    return supabase
      .channel('menu_items_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'menu_items' }, 
        callback
      )
      .subscribe();
  },

  subscribeToCookingOptions(callback: (payload: any) => void) {
    try {
      console.log("Setting up cooking options subscription...");
      return supabase
        .channel('cooking_options_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'cooking_options' }, 
          callback
        )
        .subscribe();
    } catch (error) {
      console.error("Error setting up cooking options subscription:", error);
      throw error;
    }
  },

  subscribeToWaitresses(callback: (payload: any) => void) {
    return supabase
      .channel('waitresses_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'waitresses' }, 
        callback
      )
      .subscribe();
  },

  // Settings management
  async getSettings(settingId: string) {
    const { data, error } = await supabase
      .from('settings')
      .select('data')
      .eq('id', settingId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data?.data || null;
  },

  async updateSettings(settingId: string, data: any) {
    const { error } = await supabase
      .from('settings')
      .upsert({
        id: settingId,
        data: data
      });
    
    if (error) throw error;
  },

  // Specific setting for auto print
  async getAutoPrintSetting(): Promise<boolean> {
    try {
      const settings = await this.getSettings('app_settings');
      console.log('getAutoPrintSetting - settings loaded:', settings);
      const result = settings?.autoPrintEnabled ?? true; // Default to true if not found
      console.log('getAutoPrintSetting result:', result);
      return result;
    } catch (error) {
      console.error("Error getting auto print setting:", error);
      return true; // Default to true on error to enable auto-print
    }
  },

  async saveAutoPrintSetting(enabled: boolean) {
    try {
      const currentSettings = await this.getSettings('app_settings') || {};
      await this.updateSettings('app_settings', { ...currentSettings, autoPrintEnabled: enabled });
    } catch (error) {
      console.error("Error saving auto print setting:", error);
      throw error;
    }
  },

  // Specific setting for auto email
  async getAutoEmailSetting(): Promise<boolean> {
    try {
      const settings = await this.getSettings('app_settings');
      return settings?.autoEmailEnabled ?? false; // Default to false if not found
    } catch (error) {
      console.error("Error getting auto email setting:", error);
      return false; // Default to false on error
    }
  },

  async saveAutoEmailSetting(enabled: boolean) {
    try {
      const currentSettings = await this.getSettings('app_settings') || {};
      await this.updateSettings('app_settings', { ...currentSettings, autoEmailEnabled: enabled });
    } catch (error) {
      console.error("Error saving auto email setting:", error);
      throw error;
    }
  },

  async saveLocalBackupSetting(enabled: boolean) {
    try {
      const currentSettings = await this.getSettings('app_settings') || {};
      await this.updateSettings('app_settings', { ...currentSettings, localBackupEnabled: enabled });
    } catch (error) {
      console.error("Error saving local backup setting:", error);
      throw error;
    }
  },

  async saveAutoPrintMealsSetting(enabled: boolean) {
    try {
      const currentSettings = await this.getSettings('app_settings') || {};
      await this.updateSettings('app_settings', { ...currentSettings, autoPrintMealsEnabled: enabled });
    } catch (error) {
      console.error("Error saving auto print meals setting:", error);
      throw error;
    }
  },

  async saveAutoPrintDrinksSetting(enabled: boolean) {
    try {
      const currentSettings = await this.getSettings('app_settings') || {};
      await this.updateSettings('app_settings', { ...currentSettings, autoPrintDrinksEnabled: enabled });
    } catch (error) {
      console.error("Error saving auto print drinks setting:", error);
      throw error;
    }
  },

  async saveLocalBackupMealsSetting(enabled: boolean) {
    try {
      const currentSettings = await this.getSettings('app_settings') || {};
      await this.updateSettings('app_settings', { ...currentSettings, localBackupMealsEnabled: enabled });
    } catch (error) {
      console.error("Error saving local backup meals setting:", error);
      throw error;
    }
  },

  async saveLocalBackupDrinksSetting(enabled: boolean) {
    try {
      const currentSettings = await this.getSettings('app_settings') || {};
      await this.updateSettings('app_settings', { ...currentSettings, localBackupDrinksEnabled: enabled });
    } catch (error) {
      console.error("Error saving local backup drinks setting:", error);
      throw error;
    }
  },

  // Generic settings save method
  async saveSettings(settingId: string, data: any) {
    try {
      await this.updateSettings(settingId, data);
    } catch (error) {
      console.error(`Error saving settings for ${settingId}:`, error);
      throw error;
    }
  },

  // Cleanup functions
  async resetAllData() {
    console.log("Réinitialisation complète des données Supabase");
    
    try {
      // Delete all orders first
      console.log("Suppression de toutes les commandes...");
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .neq('id', '');
      
      if (ordersError) {
        console.error("Erreur lors de la suppression des commandes:", ordersError);
        throw ordersError;
      }
      
      // Delete all notifications - Fix the problematic query
      console.log("Suppression de toutes les notifications...");
      const { error: notificationsError } = await supabase
        .from('notifications')
        .delete()
        .gte('created_at', '1970-01-01'); // Use a date filter instead of neq with empty string
      
      if (notificationsError) {
        console.error("Erreur lors de la suppression des notifications:", notificationsError);
        throw notificationsError;
      }
      
      console.log("Toutes les données ont été supprimées avec succès");
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      throw error;
    }
  }
};

console.log("Supabase initialized successfully");

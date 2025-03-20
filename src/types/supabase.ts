
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: {
          id: number;
          name: string;
          price: number;
          type: 'drink' | 'meal';
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          price: number;
          type: 'drink' | 'meal';
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          price?: number;
          type?: 'drink' | 'meal';
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          table: string;
          table_comment?: string;
          waitress: string;
          status: 'pending' | 'ready' | 'delivered' | 'cancelled';
          drinks_status?: 'pending' | 'ready' | 'delivered';
          meals_status?: 'pending' | 'ready' | 'delivered';
          created_at: string;
        };
        Insert: {
          id: string;
          table: string;
          table_comment?: string;
          waitress: string;
          status: 'pending' | 'ready' | 'delivered' | 'cancelled';
          drinks_status?: 'pending' | 'ready' | 'delivered';
          meals_status?: 'pending' | 'ready' | 'delivered';
          created_at?: string;
        };
        Update: {
          id?: string;
          table?: string;
          table_comment?: string;
          waitress?: string;
          status?: 'pending' | 'ready' | 'delivered' | 'cancelled';
          drinks_status?: 'pending' | 'ready' | 'delivered';
          meals_status?: 'pending' | 'ready' | 'delivered';
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: number;
          order_id: string;
          menu_item_id: number;
          quantity: number;
          cooking?: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          order_id: string;
          menu_item_id: number;
          quantity: number;
          cooking?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          order_id?: string;
          menu_item_id?: number;
          quantity?: number;
          cooking?: string;
          created_at?: string;
        };
      };
      cooking_options: {
        Row: {
          id: number;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

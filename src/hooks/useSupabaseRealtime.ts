
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from "@/hooks/use-toast";

interface UseSupabaseRealtimeProps {
  table: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onError?: (error: any) => void;
  filter?: string;
  disabled?: boolean;
}

export const useSupabaseRealtime = ({
  table,
  onInsert,
  onUpdate,
  onDelete,
  onError,
  filter,
  disabled = false
}: UseSupabaseRealtimeProps) => {
  useEffect(() => {
    if (disabled) {
      console.log(`Supabase realtime listener disabled for ${table}`);
      return;
    }

    console.log(`Setting up Supabase realtime listener for ${table}`);
    
    try {
      const channel = supabase
        .channel(`public:${table}`)
        
      // Insert event
      if (onInsert) {
        channel.on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: table,
          filter: filter
        }, (payload) => {
          console.log(`INSERT event on ${table}:`, payload);
          onInsert(payload.new);
        });
      }
      
      // Update event
      if (onUpdate) {
        channel.on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          filter: filter
        }, (payload) => {
          console.log(`UPDATE event on ${table}:`, payload);
          onUpdate(payload.new);
        });
      }
      
      // Delete event
      if (onDelete) {
        channel.on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: table,
          filter: filter
        }, (payload) => {
          console.log(`DELETE event on ${table}:`, payload);
          onDelete(payload.old);
        });
      }
      
      const subscription = channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${table} changes`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to ${table} changes`);
          if (onError) onError(new Error(`Failed to subscribe to ${table} changes`));
          
          toast({
            title: "Erreur de connexion Supabase",
            description: "La connexion en temps réel a été perdue.",
            variant: "destructive"
          });
        }
      });
      
      // Nettoyer l'abonnement lors du démontage du composant
      return () => {
        console.log(`Cleaning up Supabase realtime listener for ${table}`);
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error(`Error setting up Supabase realtime for ${table}:`, error);
      if (onError) onError(error);
      
      toast({
        title: "Erreur Supabase",
        description: "Impossible de configurer la synchronisation en temps réel.",
        variant: "destructive"
      });
    }
  }, [table, onInsert, onUpdate, onDelete, onError, filter, disabled]);
};

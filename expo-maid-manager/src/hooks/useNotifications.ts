// Custom Hook for Notifications - SDK 54 Best Practice
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Notification } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setNotifications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (updateError) throw updateError;

      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark as read'));
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark all as read'));
      return false;
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

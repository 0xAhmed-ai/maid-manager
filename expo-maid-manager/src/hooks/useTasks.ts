// Custom Hook for Tasks - SDK 54 Best Practice: Extract data fetching logic
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Task } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';

interface UseTasksOptions {
  status?: Task['status'];
  autoFetch?: boolean;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { status, autoFetch = true } = options;
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('tasks').select('*');

      // Filter by role
      if (user.role === 'maid') {
        query = query.eq('assigned_to', user.id);
      } else {
        query = query.eq('created_by', user.id);
      }

      // Filter by status if provided
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  }, [user, status]);

  const createTask = useCallback(async (task: Omit<Task, 'id' | 'created_at'>): Promise<Task | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();

      if (insertError) throw insertError;
      
      if (data) {
        setTasks(prev => [data, ...prev]);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create task'));
      return null;
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task'));
      return false;
    }
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setTasks(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete task'));
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchTasks();
    }
  }, [autoFetch, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'owner' | 'maid';
          language: 'en' | 'ar' | 'hi' | 'id' | 'fil' | 'ur' | 'tw' | 'am';
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'owner' | 'maid';
          language?: 'en' | 'ar' | 'hi' | 'id' | 'fil' | 'ur' | 'tw' | 'am';
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'owner' | 'maid';
          language?: 'en' | 'ar' | 'hi' | 'id' | 'fil' | 'ur' | 'tw' | 'am';
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: 'pending' | 'in_progress' | 'completed';
          priority: 'low' | 'medium' | 'high';
          assigned_to: string | null;
          created_by: string;
          deadline: string | null;
          completed_at: string | null;
          photo_evidence: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: 'pending' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          assigned_to?: string | null;
          created_by: string;
          deadline?: string | null;
          completed_at?: string | null;
          photo_evidence?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: 'pending' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high';
          assigned_to?: string | null;
          created_by?: string;
          deadline?: string | null;
          completed_at?: string | null;
          photo_evidence?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'task_assigned' | 'task_completed' | 'reminder' | 'general';
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: 'task_assigned' | 'task_completed' | 'reminder' | 'general';
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'task_assigned' | 'task_completed' | 'reminder' | 'general';
          read?: boolean;
          created_at?: string;
        };
      };
    };
  };
};

export type User = Database['public']['Tables']['users']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

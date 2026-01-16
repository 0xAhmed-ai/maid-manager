// Lib barrel export - SDK 54 Best Practice
export { supabase, handleSupabaseError, isAuthenticated } from './supabase';
export { colors, spacing, borderRadius, typography } from './theme';
export type { ThemeColors } from './theme';
export { default as i18n, isRTL, setLanguage } from './i18n';
export type { User, Task, Notification, Database } from './database.types';

// App Constants - SDK 54 Best Practice: Centralize app-wide values

export const APP_NAME = 'MaidManager';

// API & Network
export const API_TIMEOUT = 30000; // 30 seconds
export const RETRY_ATTEMPTS = 3;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Task Statuses
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// Task Priorities
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// User Roles
export const USER_ROLE = {
  OWNER: 'owner',
  MAID: 'maid',
} as const;

// Notification Types
export const NOTIFICATION_TYPE = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  REMINDER: 'reminder',
  GENERAL: 'general',
} as const;

// Supported Languages
export const LANGUAGES = [
  { code: 'en', name: 'English', rtl: false },
  { code: 'ar', name: 'العربية', rtl: true },
  { code: 'ur', name: 'اردو', rtl: true },
  { code: 'hi', name: 'हिन्दी', rtl: false },
  { code: 'id', name: 'Bahasa Indonesia', rtl: false },
  { code: 'fil', name: 'Filipino', rtl: false },
  { code: 'tw', name: '繁體中文', rtl: false },
  { code: 'am', name: 'አማርኛ', rtl: false },
] as const;

// RTL Languages
export const RTL_LANGUAGES = ['ar', 'ur'];

// Date Formats
export const DATE_FORMAT = {
  SHORT: 'MMM d',
  MEDIUM: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  TIME: 'h:mm a',
} as const;

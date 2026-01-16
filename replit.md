# MaidManager

## Overview

MaidManager is a multilingual maid management mobile application built with React Native/Expo and Supabase backend. The app enables household owners to create and assign tasks to maids, while maids can view and complete their assigned tasks. Key features include real-time task tracking, multi-language support with RTL layout for Arabic/Urdu, push notifications, and an iOS-style design system.

**Note:** This project contains an Expo mobile app for export and external deployment. The Replit environment cannot run React Native/Expo due to package compatibility constraints.

## User Preferences

Preferred communication style: Simple, everyday language.

## Expo Mobile App (expo-maid-manager/)

### Architecture
- **Framework**: React Native 0.81 with Expo SDK 54 (New Architecture enabled)
- **React**: 19.1
- **Navigation**: Expo Router v6 (File-based routing with typed routes)
- **Backend**: Supabase (Auth + PostgreSQL + Row Level Security)
- **State Management**: React Context (AuthContext, ThemeContext)
- **Internationalization**: react-i18next with 8 languages, RTL support for Arabic/Urdu
- **Storage**: expo-secure-store for token persistence
- **Android**: Edge-to-edge display enabled

### Languages Supported
1. English (en)
2. Arabic (ar) - RTL
3. Urdu (ur) - RTL
4. Hindi (hi)
5. Indonesian (id)
6. Filipino (fil)
7. Chinese Traditional (tw)
8. Amharic (am)

### iOS-style Design System
- System Blue: #007AFF (light) / #0A84FF (dark)
- System Green: #34C759 (light) / #30D158 (dark)
- System Orange: #FF9500 (light) / #FF9F0A (dark)

### Project Structure (Expo Router v6)
```
expo-maid-manager/
├── app/                       # File-based routes (Expo Router v6)
│   ├── _layout.tsx            # Root layout with providers
│   ├── index.tsx              # Auth redirect
│   ├── +not-found.tsx         # 404 handler
│   ├── (auth)/                # Auth group
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                # Tab navigator group
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Dashboard
│   │   ├── tasks.tsx
│   │   ├── maids.tsx
│   │   ├── notifications.tsx
│   │   └── settings.tsx
│   └── task/
│       ├── [id].tsx           # Dynamic route
│       └── create.tsx         # Modal
├── src/
│   ├── components/            # Button, Card, Input, TaskCard
│   ├── constants/             # App-wide constants
│   ├── contexts/              # AuthContext, ThemeContext
│   ├── hooks/                 # useTasks, useNotifications
│   ├── lib/                   # supabase, i18n, theme, types
│   └── utils/                 # Date formatting utilities
├── supabase-schema.sql        # Database setup with RLS policies
└── README.md                  # Setup instructions
```

### Export Instructions
1. Download the `expo-maid-manager` folder
2. Run `npm install` to install dependencies
3. Create a Supabase project and run `supabase-schema.sql`
4. Create `.env` with Supabase credentials
5. Run `npx expo start` to launch the app

## Original Web App (Legacy)

The `client/`, `server/`, and `shared/` directories contain the original web application built with:
- React + Vite frontend
- Express.js backend
- Drizzle ORM with PostgreSQL

This web version remains available but is superseded by the Expo mobile app for the core use case.
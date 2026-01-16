# MaidManager - React Native Expo App

A multilingual maid management mobile app with iOS-style design, role-based access control, and Supabase backend. Built with **Expo Router v6** and **SDK 54** best practices.

## Features

- **Expo Router v6** - File-based routing with typed routes
- **Role-based Access Control** - Separate dashboards for Owners and Maids
- **Task Management** - Create, assign, update, and complete tasks
- **Multi-language Support** - 8 languages including RTL support
  - English (en)
  - Arabic (ar) - RTL
  - Urdu (ur) - RTL
  - Hindi (hi)
  - Indonesian (id)
  - Filipino (fil)
  - Chinese Traditional (tw)
  - Amharic (am)
- **Notifications** - Real-time task assignment and completion notifications
- **Dark Mode** - System-based theme switching
- **iOS-style Design** - System Blue (#007AFF), Green (#34C759), Orange (#FF9500)
- **New Architecture** - Built with React Native's New Architecture enabled

## Expo Router v6 Features

- **File-based routing** - Routes auto-generated from `app/` directory
- **Native modals** - Modal presentation for task creation
- **Typed routes** - TypeScript support for navigation
- **Link Previews** - iOS context menus (upcoming)
- **Liquid Glass Tabs** - Native tabs for iOS/Android (upcoming)

## Tech Stack

- **Expo SDK**: 54
- **Expo Router**: 6.0
- **React Native**: 0.81
- **React**: 19.1
- **Backend**: Supabase (Auth + PostgreSQL + Row Level Security)
- **Internationalization**: i18next with RTL support

## Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- Xcode 16.1+ (for iOS development)

## Setup

### 1. Install Dependencies

```bash
cd expo-maid-manager
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `supabase-schema.sql`
3. Get your project URL and anon key from Project Settings > API

### 3. Configure Environment

Create a `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the App

```bash
# Start the development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run in web browser
npx expo start --web
```

## Project Structure (Expo Router v6)

```
expo-maid-manager/
├── app/                       # File-based routes (Expo Router v6)
│   ├── _layout.tsx            # Root layout with providers
│   ├── index.tsx              # Auth redirect
│   ├── +not-found.tsx         # 404 handler
│   ├── (auth)/                # Auth group (no URL segment)
│   │   ├── _layout.tsx
│   │   ├── login.tsx          # /login
│   │   └── register.tsx       # /register
│   ├── (tabs)/                # Tab group (no URL segment)
│   │   ├── _layout.tsx        # Tab navigator
│   │   ├── index.tsx          # / (Dashboard)
│   │   ├── tasks.tsx          # /tasks
│   │   ├── maids.tsx          # /maids (Owner only)
│   │   ├── notifications.tsx  # /notifications
│   │   └── settings.tsx       # /settings
│   └── task/
│       ├── [id].tsx           # /task/:id (Dynamic route)
│       └── create.tsx         # /task/create (Modal)
├── src/
│   ├── components/            # Reusable UI components
│   ├── constants/             # App-wide constants
│   ├── contexts/              # React Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Supabase, theme, i18n, types
│   └── utils/                 # Utility functions
├── assets/                    # Images and icons
├── app.json                   # Expo config
├── package.json
└── supabase-schema.sql        # Database schema
```

## Expo Router v6 Navigation

### File-based Routing

| File | Route |
|------|-------|
| `app/index.tsx` | `/` |
| `app/(tabs)/tasks.tsx` | `/tasks` |
| `app/task/[id].tsx` | `/task/:id` |
| `app/task/create.tsx` | `/task/create` |

### Navigation Examples

```tsx
import { Link, router } from 'expo-router';

// Declarative navigation
<Link href="/tasks">View Tasks</Link>
<Link href="/task/123">View Task</Link>

// Imperative navigation
router.push('/tasks');
router.push('/task/create');
router.back();
router.replace('/(tabs)');
```

### Route Groups

- `(auth)` - Authentication screens (login, register)
- `(tabs)` - Main app with tab navigation

Route groups use parentheses and don't affect the URL.

## Demo Accounts

After setting up, create accounts through the app:

1. **Owner Account** - Register with role "Owner" to manage tasks and maids
2. **Maid Account** - Register with role "Maid" to view and complete assigned tasks

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Verify project health
npx expo-doctor
```

## SDK 54 + Router v6 Best Practices

1. **File-based routing** - All routes in `app/` directory
2. **Route groups** - `(auth)`, `(tabs)` for organization
3. **Dynamic routes** - `[id].tsx` for parameters
4. **Modal presentation** - `presentation: 'modal'` in Stack.Screen
5. **Typed routes** - Enable in `app.json` experiments
6. **New Architecture** - Enabled by default
7. **Edge-to-edge** - Android 16 display support

## License

MIT

# MaidManager - React Native Expo App

A multilingual maid management mobile app with iOS-style design, role-based access control, and Supabase backend.

## Features

- **Role-based Access Control**: Separate dashboards for Owners and Maids
- **Task Management**: Create, assign, update, and complete tasks
- **Multi-language Support**: 8 languages including RTL support for Arabic and Urdu
  - English (en)
  - Arabic (ar) - RTL
  - Urdu (ur) - RTL
  - Hindi (hi)
  - Indonesian (id)
  - Filipino (fil)
  - Chinese Traditional (tw)
  - Amharic (am)
- **Notifications**: Real-time task assignment and completion notifications
- **Dark Mode**: System-based theme switching
- **iOS-style Design**: System Blue (#007AFF), Green (#34C759), Orange (#FF9500)
- **New Architecture**: Built with React Native's New Architecture enabled

## Tech Stack

- **Expo SDK**: 54 (Latest)
- **React Native**: 0.81
- **React**: 19.1
- **Backend**: Supabase (Auth + PostgreSQL + Row Level Security)
- **Navigation**: React Navigation 7
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

## Project Structure

```
expo-maid-manager/
├── App.tsx                    # App entry point
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── TaskCard.tsx
│   ├── contexts/              # React Context providers
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── ThemeContext.tsx   # Theme/dark mode state
│   ├── lib/
│   │   ├── database.types.ts  # Supabase type definitions
│   │   ├── i18n.ts           # Internationalization setup
│   │   ├── supabase.ts       # Supabase client
│   │   └── theme.ts          # Design tokens
│   ├── navigation/
│   │   └── AppNavigator.tsx   # React Navigation setup
│   └── screens/               # App screens
│       ├── LoginScreen.tsx
│       ├── DashboardScreen.tsx
│       ├── TasksScreen.tsx
│       ├── TaskDetailScreen.tsx
│       ├── CreateTaskScreen.tsx
│       ├── MaidsScreen.tsx
│       ├── NotificationsScreen.tsx
│       └── SettingsScreen.tsx
├── supabase-schema.sql        # Database schema
└── package.json
```

## SDK 54 Features Used

- **New Architecture**: Enabled by default for better performance
- **Edge-to-edge**: Android 16 edge-to-edge display support
- **React 19.1**: Latest React with improved concurrent features
- **React Native 0.81**: Latest stable React Native

## Demo Accounts

After setting up, create accounts through the app:

1. **Owner Account**: Register with role "Owner" to manage tasks and maids
2. **Maid Account**: Register with role "Maid" to view and complete assigned tasks

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
```

## License

MIT

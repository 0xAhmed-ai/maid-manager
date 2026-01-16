// Tabs Layout - Expo Router v6 with NativeTabs (Liquid Glass)
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';

// Tab bar icons using simple text for now (SF Symbols on iOS, Material on Android)
function TabBarIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const icons: Record<string, string> = {
    home: '🏠',
    tasks: '📋',
    maids: '👥',
    notifications: '🔔',
    settings: '⚙️',
  };
  return null; // We'll use tabBarIcon option
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();

  const isOwner = user?.role === 'owner';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard'),
          tabBarLabel: t('home'),
          tabBarTestID: 'tab-home',
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t('tasks'),
          tabBarLabel: t('tasks'),
          tabBarTestID: 'tab-tasks',
        }}
      />
      {isOwner && (
        <Tabs.Screen
          name="maids"
          options={{
            title: t('maids'),
            tabBarLabel: t('maids'),
            tabBarTestID: 'tab-maids',
          }}
        />
      )}
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('notifications'),
          tabBarLabel: t('notifications'),
          tabBarTestID: 'tab-notifications',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarLabel: t('settings'),
          tabBarTestID: 'tab-settings',
        }}
      />
    </Tabs>
  );
}

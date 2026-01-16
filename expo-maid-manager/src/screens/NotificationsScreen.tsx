import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { Notification } from '../lib/database.types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { spacing, typography, borderRadius } from '../lib/theme';

export function NotificationsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id);
    
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_assigned': return '📋';
      case 'task_completed': return '✅';
      case 'reminder': return '⏰';
      default: return '🔔';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {unreadCount > 0 && (
        <View style={styles.header}>
          <Button
            testID="button-mark-all-read"
            title={t('markAllAsRead')}
            onPress={markAllAsRead}
            variant="ghost"
            size="sm"
          />
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            testID={`notification-${item.id}`}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
          >
            <Card style={[
              styles.notificationCard,
              !item.read && { borderLeftWidth: 3, borderLeftColor: colors.primary },
            ]}>
              <View style={styles.notificationContent}>
                <Text style={styles.icon}>{getNotificationIcon(item.type)}</Text>
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.title,
                    { color: colors.text },
                    !item.read && { fontWeight: '600' },
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.message, { color: colors.textSecondary }]}>
                    {item.message}
                  </Text>
                  <Text style={[styles.time, { color: colors.textTertiary }]}>
                    {formatDate(item.created_at)}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('noNotifications')}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    paddingBottom: 0,
  },
  listContent: {
    padding: spacing.md,
  },
  notificationCard: {
    marginBottom: spacing.sm,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.headline,
    marginBottom: 2,
  },
  message: {
    ...typography.subheadline,
    marginBottom: spacing.xs,
  },
  time: {
    ...typography.caption1,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

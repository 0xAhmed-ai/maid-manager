// Notifications Screen - Expo Router v6
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useNotifications } from '../../src/hooks';
import { Card, Loading, EmptyState, Button } from '../../src/components';
import { spacing, typography } from '../../src/lib/theme';
import { formatTimeAgo } from '../../src/utils';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { notifications, loading, refetch, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  if (loading) {
    return <Loading fullScreen message={t('loadingNotifications')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {unreadCount > 0 && (
        <View style={styles.header}>
          <Text style={[styles.unreadCount, { color: colors.textSecondary }]}>
            {unreadCount} {t('unread')}
          </Text>
          <Button
            title={t('markAllRead')}
            variant="ghost"
            size="small"
            onPress={markAllAsRead}
            testID="button-mark-all-read"
          />
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => !item.read && markAsRead(item.id)}
            testID={`notification-${item.id}`}
          >
            <Card 
              style={[
                styles.notificationCard, 
                { backgroundColor: colors.card },
                !item.read && { borderLeftWidth: 3, borderLeftColor: colors.primary }
              ]}
            >
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                  {item.message}
                </Text>
                <Text style={[styles.notificationTime, { color: colors.textTertiary }]}>
                  {formatTimeAgo(item.created_at)}
                </Text>
              </View>
              {!item.read && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
              )}
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <EmptyState
            title={t('noNotifications')}
            message={t('noNotificationsMessage')}
            testID="empty-notifications"
          />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: 0,
  },
  unreadCount: {
    ...typography.subheadline,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...typography.headline,
    marginBottom: 4,
  },
  notificationMessage: {
    ...typography.body,
    marginBottom: 4,
  },
  notificationTime: {
    ...typography.caption1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: spacing.sm,
  },
});

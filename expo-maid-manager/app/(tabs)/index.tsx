// Dashboard Screen - Expo Router v6
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTasks } from '../../src/hooks';
import { Card, TaskCard, Loading } from '../../src/components';
import { spacing, typography } from '../../src/lib/theme';
import { TASK_STATUS } from '../../src/constants';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { tasks, loading, refetch } = useTasks();

  const pendingTasks = tasks.filter(t => t.status === TASK_STATUS.PENDING);
  const inProgressTasks = tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS);
  const completedTasks = tasks.filter(t => t.status === TASK_STATUS.COMPLETED);

  if (loading) {
    return <Loading fullScreen message={t('loadingDashboard')} />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refetch} />
      }
    >
      <View style={styles.content}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          {t('hello')}, {user?.name || t('user')}!
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('hereIsYourOverview')}
        </Text>

        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.systemOrange }]}>
              {pendingTasks.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('pending')}
            </Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {inProgressTasks.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('inProgress')}
            </Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.systemGreen }]}>
              {completedTasks.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('completed')}
            </Text>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('recentTasks')}
            </Text>
            <Link href="/(tabs)/tasks" asChild>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {t('seeAll')}
              </Text>
            </Link>
          </View>
          
          {tasks.slice(0, 3).map(task => (
            <Link key={task.id} href={`/task/${task.id}`} asChild>
              <TaskCard task={task} />
            </Link>
          ))}
          
          {tasks.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('noTasksYet')}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  greeting: {
    ...typography.largeTitle,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.title1,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption1,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
  },
  seeAll: {
    ...typography.subheadline,
    fontWeight: '600',
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    padding: spacing.xl,
  },
});

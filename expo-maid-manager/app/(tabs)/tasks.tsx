// Tasks Screen - Expo Router v6
import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTasks } from '../../src/hooks';
import { Button, TaskCard, Loading, EmptyState } from '../../src/components';
import { spacing, typography } from '../../src/lib/theme';
import { TASK_STATUS } from '../../src/constants';

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed';

export default function TasksScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { tasks, loading, refetch } = useTasks();
  const [filter, setFilter] = useState<FilterType>('all');

  const isOwner = user?.role === 'owner';

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'pending', label: t('pending') },
    { key: 'in_progress', label: t('inProgress') },
    { key: 'completed', label: t('completed') },
  ];

  if (loading) {
    return <Loading fullScreen message={t('loadingTasks')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          {filters.map(f => (
            <Button
              key={f.key}
              title={f.label}
              variant={filter === f.key ? 'primary' : 'outline'}
              size="small"
              onPress={() => setFilter(f.key)}
              testID={`button-filter-${f.key}`}
            />
          ))}
        </View>
        
        {isOwner && (
          <Button
            title={t('addTask')}
            onPress={() => router.push('/task/create')}
            testID="button-add-task"
          />
        )}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Link href={`/task/${item.id}`} asChild>
            <TaskCard task={item} />
          </Link>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <EmptyState
            title={t('noTasks')}
            message={isOwner ? t('createFirstTask') : t('noTasksAssigned')}
            actionLabel={isOwner ? t('addTask') : undefined}
            onAction={isOwner ? () => router.push('/task/create') : undefined}
            testID="empty-tasks"
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
    padding: spacing.md,
    gap: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
    gap: spacing.sm,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { Task } from '../lib/database.types';
import { Card } from '../components/Card';
import { TaskCard } from '../components/TaskCard';
import { spacing, typography } from '../lib/theme';
import { useNavigation } from '@react-navigation/native';

export function DashboardScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    if (!user) return;

    let query = supabase.from('tasks').select('*');
    
    if (user.role === 'maid') {
      query = query.eq('assigned_to', user.id);
    } else {
      query = query.eq('created_by', user.id);
    }

    const { data } = await query.order('created_at', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const recentTasks = tasks.slice(0, 5);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.welcome, { color: colors.textSecondary }]}>
          {t('welcome')}
        </Text>
        <Text style={[styles.name, { color: colors.text }]}>
          {user?.name}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('totalTasks')}</Text>
        </Card>
        <Card style={[styles.statCard, { borderLeftColor: colors.warning, borderLeftWidth: 4 }]}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{stats.pending}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('pendingTasks')}</Text>
        </Card>
        <Card style={[styles.statCard, { borderLeftColor: colors.info, borderLeftWidth: 4 }]}>
          <Text style={[styles.statNumber, { color: colors.info }]}>{stats.inProgress}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('inProgressTasks')}</Text>
        </Card>
        <Card style={[styles.statCard, { borderLeftColor: colors.success, borderLeftWidth: 4 }]}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats.completed}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('completedTasks')}</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('tasks')}
        </Text>
        {recentTasks.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('noTasks')}
          </Text>
        ) : (
          recentTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              testID={`task-card-${task.id}`}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  welcome: {
    ...typography.subheadline,
  },
  name: {
    ...typography.title1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
  },
  statNumber: {
    ...typography.title1,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.footnote,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.title2,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

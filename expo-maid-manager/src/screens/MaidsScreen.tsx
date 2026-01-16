import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { User, Task } from '../lib/database.types';
import { Card } from '../components/Card';
import { spacing, typography, borderRadius } from '../lib/theme';

interface MaidWithStats extends User {
  taskStats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export function MaidsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [maids, setMaids] = useState<MaidWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMaids = async () => {
    const { data: maidsData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'maid');

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*');

    const maidsWithStats = (maidsData || []).map((maid) => {
      const maidTasks = (tasksData || []).filter((t: Task) => t.assigned_to === maid.id);
      return {
        ...maid,
        taskStats: {
          total: maidTasks.length,
          pending: maidTasks.filter((t: Task) => t.status === 'pending').length,
          inProgress: maidTasks.filter((t: Task) => t.status === 'in_progress').length,
          completed: maidTasks.filter((t: Task) => t.status === 'completed').length,
        },
      };
    });

    setMaids(maidsWithStats);
    setLoading(false);
  };

  useEffect(() => {
    fetchMaids();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMaids();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={maids}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card testID={`maid-card-${item.id}`} style={styles.maidCard}>
            <View style={styles.header}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.email, { color: colors.textSecondary }]}>
                  {item.email}
                </Text>
              </View>
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>
                  {item.taskStats.total}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('totalTasks')}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>
                  {item.taskStats.pending}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('pending')}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: colors.info }]}>
                  {item.taskStats.inProgress}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('inProgress')}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statNumber, { color: colors.success }]}>
                  {item.taskStats.completed}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('completed')}
                </Text>
              </View>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No maids registered
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
  listContent: {
    padding: spacing.md,
  },
  maidCard: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    ...typography.title2,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.headline,
  },
  email: {
    ...typography.subheadline,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.title3,
  },
  statLabel: {
    ...typography.caption2,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { Task, User } from '../lib/database.types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { spacing, typography, borderRadius } from '../lib/theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type RouteParams = {
  TaskDetail: { taskId: string };
};

export function TaskDetailScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'TaskDetail'>>();

  const [task, setTask] = useState<Task | null>(null);
  const [assignee, setAssignee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [route.params?.taskId]);

  const fetchTask = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', route.params?.taskId)
      .single();

    if (data) {
      setTask(data);
      if (data.assigned_to) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.assigned_to)
          .single();
        setAssignee(userData);
      }
    }
    setLoading(false);
  };

  const updateStatus = async (status: Task['status']) => {
    if (!task) return;
    setUpdating(true);

    const updates: Partial<Task> = { status };
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    await supabase
      .from('tasks')
      .update(updates)
      .eq('id', task.id);

    setTask({ ...task, ...updates });
    setUpdating(false);
  };

  const deleteTask = async () => {
    Alert.alert(
      t('deleteTask'),
      t('confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await supabase.from('tasks').delete().eq('id', task?.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getPriorityColor = () => {
    switch (task?.priority) {
      case 'high': return colors.danger;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = () => {
    switch (task?.status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.primary;
      case 'pending': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  if (loading || !task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getPriorityColor() }]}>
            <Text style={styles.badgeText}>
              {t(task.priority)}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.badgeText}>
              {task.status === 'in_progress' ? t('inProgress') : t(task.status)}
            </Text>
          </View>
        </View>
      </View>

      {task.description && (
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('description')}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {task.description}
          </Text>
        </Card>
      )}

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t('assignTo')}
        </Text>
        <Text style={[styles.assignee, { color: colors.text }]}>
          {assignee?.name || 'Not assigned'}
        </Text>
      </Card>

      {task.deadline && (
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('deadline')}
          </Text>
          <Text style={[styles.deadline, { color: colors.text }]}>
            {new Date(task.deadline).toLocaleDateString()}
          </Text>
        </Card>
      )}

      {task.notes && (
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('notes')}
          </Text>
          <Text style={[styles.notes, { color: colors.text }]}>
            {task.notes}
          </Text>
        </Card>
      )}

      <View style={styles.actions}>
        {user?.role === 'maid' && task.status !== 'completed' && (
          <>
            {task.status === 'pending' && (
              <Button
                testID="button-start-task"
                title={t('inProgress')}
                onPress={() => updateStatus('in_progress')}
                loading={updating}
                fullWidth
                style={styles.actionButton}
              />
            )}
            {task.status === 'in_progress' && (
              <Button
                testID="button-complete-task"
                title={t('completed')}
                onPress={() => updateStatus('completed')}
                loading={updating}
                fullWidth
                variant="secondary"
                style={[styles.actionButton, { backgroundColor: colors.success }]}
                textStyle={{ color: '#FFFFFF' }}
              />
            )}
          </>
        )}

        {user?.role === 'owner' && (
          <>
            <Button
              testID="button-edit-task"
              title={t('editTask')}
              onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
              variant="outline"
              fullWidth
              style={styles.actionButton}
            />
            <Button
              testID="button-delete-task"
              title={t('deleteTask')}
              onPress={deleteTask}
              variant="danger"
              fullWidth
              style={styles.actionButton}
            />
          </>
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
  loadingText: {
    ...typography.body,
    textAlign: 'center',
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    color: '#FFFFFF',
    ...typography.caption1,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.caption1,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  description: {
    ...typography.body,
  },
  assignee: {
    ...typography.body,
  },
  deadline: {
    ...typography.body,
  },
  notes: {
    ...typography.body,
  },
  actions: {
    marginTop: spacing.lg,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});

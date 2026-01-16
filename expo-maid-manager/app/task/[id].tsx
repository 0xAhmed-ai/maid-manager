// Task Detail Screen - Expo Router v6 with Link Previews
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { supabase } from '../../src/lib/supabase';
import { Task } from '../../src/lib/database.types';
import { Card, Button, Loading } from '../../src/components';
import { spacing, typography } from '../../src/lib/theme';
import { formatDate, isOverdue } from '../../src/utils';
import { TASK_STATUS, TASK_PRIORITY } from '../../src/constants';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const isOwner = user?.role === 'owner';
  const isMaid = user?.role === 'maid';

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
      Alert.alert(t('error'), t('taskNotFound'));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!task) return;

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;
      setTask({ ...task, status: newStatus as Task['status'] });
    } catch (error) {
      Alert.alert(t('error'), t('updateFailed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('deleteTask'),
      t('deleteTaskConfirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', task?.id);

              if (error) throw error;
              router.back();
            } catch (error) {
              Alert.alert(t('error'), t('deleteFailed'));
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case TASK_STATUS.PENDING: return colors.systemOrange;
      case TASK_STATUS.IN_PROGRESS: return colors.primary;
      case TASK_STATUS.COMPLETED: return colors.systemGreen;
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TASK_PRIORITY.HIGH: return colors.systemRed;
      case TASK_PRIORITY.MEDIUM: return colors.systemOrange;
      case TASK_PRIORITY.LOW: return colors.systemGreen;
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return <Loading fullScreen message={t('loadingTask')} />;
  }

  if (!task) {
    return null;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Card style={[styles.mainCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {task.title}
          </Text>
          
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
              <Text style={[styles.badgeText, { color: getStatusColor(task.status) }]}>
                {t(task.status)}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
              <Text style={[styles.badgeText, { color: getPriorityColor(task.priority) }]}>
                {t(task.priority)} {t('priority')}
              </Text>
            </View>
          </View>

          {task.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {task.description}
            </Text>
          )}

          {task.due_date && (
            <View style={styles.dueDateContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {t('dueDate')}:
              </Text>
              <Text 
                style={[
                  styles.dueDate, 
                  { color: isOverdue(task.due_date) ? colors.systemRed : colors.text }
                ]}
              >
                {formatDate(task.due_date)}
                {isOverdue(task.due_date) && ` (${t('overdue')})`}
              </Text>
            </View>
          )}
        </Card>

        {/* Status Actions */}
        {isMaid && task.status !== TASK_STATUS.COMPLETED && (
          <Card style={[styles.actionsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('updateStatus')}
            </Text>
            <View style={styles.statusButtons}>
              {task.status === TASK_STATUS.PENDING && (
                <Button
                  title={t('startTask')}
                  onPress={() => updateStatus(TASK_STATUS.IN_PROGRESS)}
                  disabled={updating}
                  testID="button-start-task"
                />
              )}
              {task.status === TASK_STATUS.IN_PROGRESS && (
                <Button
                  title={t('completeTask')}
                  variant="success"
                  onPress={() => updateStatus(TASK_STATUS.COMPLETED)}
                  disabled={updating}
                  testID="button-complete-task"
                />
              )}
            </View>
          </Card>
        )}

        {/* Owner Actions */}
        {isOwner && (
          <Card style={[styles.actionsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('actions')}
            </Text>
            <View style={styles.ownerButtons}>
              <Button
                title={t('delete')}
                variant="destructive"
                onPress={handleDelete}
                testID="button-delete-task"
              />
            </View>
          </Card>
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
    gap: spacing.md,
  },
  mainCard: {
    padding: spacing.lg,
  },
  title: {
    ...typography.title1,
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  badgeText: {
    ...typography.caption1,
    fontWeight: '600',
  },
  description: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.subheadline,
  },
  dueDate: {
    ...typography.subheadline,
    fontWeight: '600',
  },
  actionsCard: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  statusButtons: {
    gap: spacing.sm,
  },
  ownerButtons: {
    gap: spacing.sm,
  },
});

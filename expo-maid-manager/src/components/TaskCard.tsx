import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Task } from '../lib/database.types';
import { Card } from './Card';
import { spacing, typography, borderRadius } from '../lib/theme';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  testID?: string;
}

export function TaskCard({ task, onPress, testID }: TaskCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return colors.danger;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.primary;
      case 'pending': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case 'completed': return t('completed');
      case 'in_progress': return t('inProgress');
      case 'pending': return t('pending');
      default: return task.status;
    }
  };

  const getPriorityText = () => {
    switch (task.priority) {
      case 'high': return t('high');
      case 'medium': return t('medium');
      case 'low': return t('low');
      default: return task.priority;
    }
  };

  const formatDeadline = () => {
    if (!task.deadline) return null;
    const date = new Date(task.deadline);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return t('today');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return t('tomorrow');
    } else if (date < today) {
      return t('overdue');
    }
    return date.toLocaleDateString();
  };

  return (
    <Card onPress={onPress} testID={testID} style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
          <Text style={styles.priorityText}>{getPriorityText()}</Text>
        </View>
      </View>

      {task.description && (
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {task.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {formatDeadline() && (
          <Text style={[
            styles.deadline,
            { color: formatDeadline() === t('overdue') ? colors.danger : colors.textSecondary }
          ]}>
            {formatDeadline()}
          </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.headline,
    flex: 1,
    marginRight: spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  priorityText: {
    color: '#FFFFFF',
    ...typography.caption2,
    fontWeight: '600',
  },
  description: {
    ...typography.subheadline,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption1,
    fontWeight: '500',
  },
  deadline: {
    ...typography.caption1,
  },
});

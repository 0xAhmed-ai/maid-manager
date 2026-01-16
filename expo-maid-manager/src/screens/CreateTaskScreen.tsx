import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { User } from '../lib/database.types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { spacing, typography, borderRadius } from '../lib/theme';
import { useNavigation } from '@react-navigation/native';

type Priority = 'low' | 'medium' | 'high';

export function CreateTaskScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [maids, setMaids] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMaids();
  }, []);

  const fetchMaids = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'maid');
    setMaids(data || []);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError(t('taskTitle') + ' is required');
      return;
    }

    setLoading(true);
    setError('');

    const { error: insertError } = await supabase.from('tasks').insert({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      assigned_to: assignedTo,
      created_by: user!.id,
      status: 'pending',
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (assignedTo) {
      await supabase.from('notifications').insert({
        user_id: assignedTo,
        title: 'New Task Assigned',
        message: `You have been assigned '${title}'`,
        type: 'task_assigned',
        read: false,
      });
    }

    navigation.goBack();
  };

  const priorities: { key: Priority; color: string }[] = [
    { key: 'low', color: colors.success },
    { key: 'medium', color: colors.warning },
    { key: 'high', color: colors.danger },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Input
        testID="input-title"
        label={t('taskTitle')}
        value={title}
        onChangeText={setTitle}
        placeholder={t('taskTitle')}
      />

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('description')}
        </Text>
        <TextInput
          testID="input-description"
          style={[
            styles.textArea,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder={t('description')}
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('priority')}
        </Text>
        <View style={styles.priorityButtons}>
          {priorities.map((p) => (
            <TouchableOpacity
              key={p.key}
              testID={`priority-${p.key}`}
              style={[
                styles.priorityButton,
                { borderColor: colors.border },
                priority === p.key && { backgroundColor: p.color, borderColor: p.color },
              ]}
              onPress={() => setPriority(p.key)}
            >
              <Text style={[
                styles.priorityText,
                { color: priority === p.key ? '#FFFFFF' : colors.text },
              ]}>
                {t(p.key)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('assignTo')}
        </Text>
        <Card style={styles.maidsList}>
          <TouchableOpacity
            testID="assign-none"
            style={[
              styles.maidRow,
              { borderBottomWidth: 0.5, borderBottomColor: colors.border },
            ]}
            onPress={() => setAssignedTo(null)}
          >
            <Text style={[styles.maidName, { color: colors.textSecondary }]}>
              Not assigned
            </Text>
            {assignedTo === null && (
              <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
          {maids.map((maid, index) => (
            <TouchableOpacity
              key={maid.id}
              testID={`assign-${maid.id}`}
              style={[
                styles.maidRow,
                index < maids.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
              ]}
              onPress={() => setAssignedTo(maid.id)}
            >
              <Text style={[styles.maidName, { color: colors.text }]}>
                {maid.name}
              </Text>
              {assignedTo === maid.id && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Card>
      </View>

      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          testID="button-cancel"
          title={t('cancel')}
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          testID="button-save"
          title={t('save')}
          onPress={handleSubmit}
          loading={loading}
          style={styles.actionButton}
        />
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
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.subheadline,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  textArea: {
    ...typography.body,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 100,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityText: {
    ...typography.body,
    fontWeight: '500',
  },
  maidsList: {
    padding: 0,
  },
  maidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  maidName: {
    ...typography.body,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    ...typography.footnote,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});

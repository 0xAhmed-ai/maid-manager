// Create Task Screen - Expo Router v6 Modal
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { supabase } from '../../src/lib/supabase';
import { User } from '../../src/lib/database.types';
import { Card, Button, Input } from '../../src/components';
import { spacing, typography } from '../../src/lib/theme';
import { TASK_PRIORITY } from '../../src/constants';

export default function CreateTaskScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [maids, setMaids] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaids();
  }, []);

  const fetchMaids = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'maid')
        .order('name');

      if (error) throw error;
      setMaids(data || []);
    } catch (error) {
      console.error('Error fetching maids:', error);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert(t('error'), t('titleRequired'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('tasks').insert({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status: 'pending',
        created_by: user?.id,
        assigned_to: assignedTo,
      });

      if (error) throw error;
      router.back();
    } catch (error) {
      Alert.alert(t('error'), t('createTaskFailed'));
    } finally {
      setLoading(false);
    }
  };

  const priorities: { key: 'low' | 'medium' | 'high'; label: string; color: string }[] = [
    { key: 'low', label: t('low'), color: colors.systemGreen },
    { key: 'medium', label: t('medium'), color: colors.systemOrange },
    { key: 'high', label: t('high'), color: colors.systemRed },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Card style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('taskDetails')}
            </Text>
            
            <Input
              placeholder={t('taskTitle')}
              value={title}
              onChangeText={setTitle}
              testID="input-task-title"
            />
            
            <Input
              placeholder={t('description')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              testID="input-task-description"
            />
          </Card>

          <Card style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('priority')}
            </Text>
            <View style={styles.priorityButtons}>
              {priorities.map(p => (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.priorityButton,
                    { borderColor: colors.border },
                    priority === p.key && { 
                      borderColor: p.color,
                      backgroundColor: p.color + '15',
                    },
                  ]}
                  onPress={() => setPriority(p.key)}
                  testID={`button-priority-${p.key}`}
                >
                  <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                  <Text 
                    style={[
                      styles.priorityText, 
                      { color: priority === p.key ? p.color : colors.text }
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {maids.length > 0 && (
            <Card style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('assignTo')}
              </Text>
              <View style={styles.maidsList}>
                <TouchableOpacity
                  style={[
                    styles.maidButton,
                    { borderColor: colors.border },
                    !assignedTo && { 
                      borderColor: colors.primary,
                      backgroundColor: colors.primary + '10',
                    },
                  ]}
                  onPress={() => setAssignedTo(null)}
                  testID="button-assign-none"
                >
                  <Text 
                    style={[
                      styles.maidText, 
                      { color: !assignedTo ? colors.primary : colors.text }
                    ]}
                  >
                    {t('unassigned')}
                  </Text>
                </TouchableOpacity>
                {maids.map(maid => (
                  <TouchableOpacity
                    key={maid.id}
                    style={[
                      styles.maidButton,
                      { borderColor: colors.border },
                      assignedTo === maid.id && { 
                        borderColor: colors.primary,
                        backgroundColor: colors.primary + '10',
                      },
                    ]}
                    onPress={() => setAssignedTo(maid.id)}
                    testID={`button-assign-${maid.id}`}
                  >
                    <Text 
                      style={[
                        styles.maidText, 
                        { color: assignedTo === maid.id ? colors.primary : colors.text }
                      ]}
                    >
                      {maid.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button
          title={t('cancel')}
          variant="outline"
          onPress={() => router.back()}
          style={styles.footerButton}
          testID="button-cancel"
        />
        <Button
          title={loading ? t('creating') : t('createTask')}
          onPress={handleCreate}
          disabled={loading || !title.trim()}
          style={styles.footerButton}
          testID="button-create-task"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.xs,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    ...typography.callout,
    fontWeight: '500',
  },
  maidsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  maidButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  maidText: {
    ...typography.callout,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
  },
});

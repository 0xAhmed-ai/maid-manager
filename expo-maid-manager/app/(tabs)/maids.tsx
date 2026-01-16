// Maids Screen - Expo Router v6 (Owner only)
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import { supabase } from '../../src/lib/supabase';
import { Card, Loading, EmptyState } from '../../src/components';
import { spacing, typography } from '../../src/lib/theme';
import { User } from '../../src/lib/database.types';

export default function MaidsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [maids, setMaids] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaids = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'maid')
        .order('name');

      if (error) throw error;
      setMaids(data || []);
    } catch (error) {
      console.error('Error fetching maids:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaids();
  }, []);

  if (loading) {
    return <Loading fullScreen message={t('loadingMaids')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={maids}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={[styles.maidCard, { backgroundColor: colors.card }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {item.name?.charAt(0).toUpperCase() || 'M'}
              </Text>
            </View>
            <View style={styles.maidInfo}>
              <Text style={[styles.maidName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.maidEmail, { color: colors.textSecondary }]}>
                {item.email}
              </Text>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchMaids} />
        }
        ListEmptyComponent={
          <EmptyState
            title={t('noMaids')}
            message={t('inviteMaidsMessage')}
            testID="empty-maids"
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
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  maidCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  maidInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  maidName: {
    ...typography.headline,
  },
  maidEmail: {
    ...typography.subheadline,
    marginTop: 2,
  },
});

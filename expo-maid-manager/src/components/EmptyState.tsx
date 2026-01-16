import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, typography } from '../lib/theme';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export function EmptyState({ 
  title, 
  message, 
  actionLabel, 
  onAction,
  testID 
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container} testID={testID}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          style={styles.button}
          testID={`${testID}-action`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  title: {
    ...typography.headline,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.subheadline,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
});

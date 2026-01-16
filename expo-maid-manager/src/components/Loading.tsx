import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, typography } from '../lib/theme';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function Loading({ message, size = 'large', fullScreen = false }: LoadingProps) {
  const { colors } = useTheme();

  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreenWrapper, { backgroundColor: colors.background }]}>
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fullScreen: {
    flex: 1,
  },
  fullScreenWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...typography.subheadline,
    marginTop: spacing.md,
  },
});

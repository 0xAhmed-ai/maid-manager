// 404 Not Found Screen - Expo Router v6
import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { spacing, typography } from '../src/lib/theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Page not found
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          The page you're looking for doesn't exist.
        </Text>
        <Link href="/" style={[styles.link, { color: colors.primary }]}>
          Go home
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.title1,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  link: {
    ...typography.headline,
  },
});

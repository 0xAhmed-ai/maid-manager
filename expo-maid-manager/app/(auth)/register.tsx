// Register Screen - Expo Router v6
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Button, Input } from '../../src/components';
import { spacing, typography } from '../../src/lib/theme';
import { USER_ROLE } from '../../src/constants';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const { colors } = useTheme();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'owner' | 'maid'>('owner');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name, role);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(t('error'), t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('createAccount')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('signUpToGetStarted')}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder={t('fullName')}
              value={name}
              onChangeText={setName}
              testID="input-name"
            />
            <Input
              placeholder={t('email')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="input-email"
            />
            <Input
              placeholder={t('password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              testID="input-password"
            />

            <View style={styles.roleContainer}>
              <Text style={[styles.roleLabel, { color: colors.text }]}>
                {t('iAmA')}:
              </Text>
              <View style={styles.roleButtons}>
                <Button
                  title={t('owner')}
                  variant={role === 'owner' ? 'primary' : 'outline'}
                  onPress={() => setRole('owner')}
                  style={styles.roleButton}
                  testID="button-role-owner"
                />
                <Button
                  title={t('maid')}
                  variant={role === 'maid' ? 'primary' : 'outline'}
                  onPress={() => setRole('maid')}
                  style={styles.roleButton}
                  testID="button-role-maid"
                />
              </View>
            </View>

            <Button
              title={loading ? t('creatingAccount') : t('signUp')}
              onPress={handleRegister}
              disabled={loading}
              testID="button-signup"
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {t('alreadyHaveAccount')}{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Text style={[styles.link, { color: colors.primary }]}>
                {t('signIn')}
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.largeTitle,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
  },
  form: {
    gap: spacing.md,
  },
  roleContainer: {
    marginVertical: spacing.sm,
  },
  roleLabel: {
    ...typography.callout,
    marginBottom: spacing.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleButton: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.callout,
  },
  link: {
    ...typography.callout,
    fontWeight: '600',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { spacing, typography, borderRadius } from '../lib/theme';

type AuthMode = 'login' | 'register';
type Role = 'owner' | 'maid';

export function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();
  const { colors } = useTheme();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      } else {
        const { error } = await signUp(email, password, name, role);
        if (error) setError(error.message);
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>
            {t('appName')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {mode === 'login' ? t('login') : t('register')}
          </Text>
        </View>

        <View style={styles.form}>
          {mode === 'register' && (
            <Input
              testID="input-name"
              label={t('name')}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <Input
            testID="input-email"
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            testID="input-password"
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {mode === 'register' && (
            <View style={styles.roleContainer}>
              <Text style={[styles.roleLabel, { color: colors.text }]}>
                {t('role')}
              </Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  testID="button-role-owner"
                  style={[
                    styles.roleButton,
                    { borderColor: colors.border },
                    role === 'owner' && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setRole('owner')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    { color: role === 'owner' ? '#FFFFFF' : colors.text },
                  ]}>
                    {t('owner')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="button-role-maid"
                  style={[
                    styles.roleButton,
                    { borderColor: colors.border },
                    role === 'maid' && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setRole('maid')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    { color: role === 'maid' ? '#FFFFFF' : colors.text },
                  ]}>
                    {t('maid')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {error ? (
            <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
          ) : null}

          <Button
            testID="button-submit"
            title={mode === 'login' ? t('login') : t('register')}
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>

        <TouchableOpacity
          testID="button-toggle-mode"
          onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          style={styles.toggleMode}
        >
          <Text style={[styles.toggleModeText, { color: colors.primary }]}>
            {mode === 'login' ? t('register') : t('login')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.largeTitle,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.title3,
  },
  form: {
    marginBottom: spacing.lg,
  },
  roleContainer: {
    marginBottom: spacing.md,
  },
  roleLabel: {
    ...typography.subheadline,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleButtonText: {
    ...typography.body,
    fontWeight: '500',
  },
  error: {
    ...typography.footnote,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  toggleMode: {
    alignItems: 'center',
  },
  toggleModeText: {
    ...typography.body,
    fontWeight: '500',
  },
});

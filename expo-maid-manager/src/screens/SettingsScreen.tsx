import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { setLanguage } from '../lib/i18n';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { spacing, typography, borderRadius } from '../lib/theme';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
  { code: 'ur', name: 'اردو' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'fil', name: 'Filipino' },
  { code: 'tw', name: '繁體中文' },
  { code: 'am', name: 'አማርኛ' },
];

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { user, signOut, updateLanguage } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const handleLanguageChange = async (langCode: string) => {
    await setLanguage(langCode);
    await updateLanguage(langCode);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>
          {user?.name}
        </Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
          {user?.email}
        </Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.roleText, { color: colors.primary }]}>
            {user?.role === 'owner' ? t('owner') : t('maid')}
          </Text>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings')}
        </Text>

        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t('darkMode')}
            </Text>
            <Switch
              testID="switch-dark-mode"
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('language')}
        </Text>

        <Card style={styles.languageCard}>
          {LANGUAGES.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              testID={`language-${lang.code}`}
              style={[
                styles.languageRow,
                index < LANGUAGES.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text style={[styles.languageName, { color: colors.text }]}>
                {lang.name}
              </Text>
              {i18n.language === lang.code && (
                <View style={[styles.checkmark, { backgroundColor: colors.success }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Card>
      </View>

      <Button
        testID="button-logout"
        title={t('logout')}
        onPress={signOut}
        variant="danger"
        fullWidth
        size="lg"
        style={styles.logoutButton}
      />
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
  profileCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    color: '#FFFFFF',
    ...typography.title1,
  },
  profileName: {
    ...typography.title2,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    ...typography.subheadline,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    ...typography.footnote,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.sm,
  },
  settingCard: {
    padding: 0,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingLabel: {
    ...typography.body,
  },
  languageCard: {
    padding: 0,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  languageName: {
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
  logoutButton: {
    marginTop: spacing.md,
  },
});

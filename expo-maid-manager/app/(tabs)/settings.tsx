// Settings Screen - Expo Router v6
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Card, Button } from '../../src/components';
import { setLanguage } from '../../src/lib/i18n';
import { spacing, typography } from '../../src/lib/theme';
import { LANGUAGES } from '../../src/constants';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
  };

  const handleSignOut = () => {
    Alert.alert(
      t('signOut'),
      t('signOutConfirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('signOut'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Profile Section */}
        <Card style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user?.name}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {user?.email}
              </Text>
              <Text style={[styles.profileRole, { color: colors.primary }]}>
                {user?.role === 'owner' ? t('owner') : t('maid')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Appearance Section */}
        <Card style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('appearance')}
          </Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t('darkMode')}
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              testID="switch-dark-mode"
            />
          </View>
        </Card>

        {/* Language Section */}
        <Card style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('language')}
          </Text>
          <View style={styles.languageGrid}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  { borderColor: colors.border },
                  i18n.language === lang.code && { 
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + '10',
                  },
                ]}
                onPress={() => handleLanguageChange(lang.code)}
                testID={`button-lang-${lang.code}`}
              >
                <Text 
                  style={[
                    styles.languageText, 
                    { color: i18n.language === lang.code ? colors.primary : colors.text }
                  ]}
                >
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Sign Out */}
        <Button
          title={t('signOut')}
          variant="destructive"
          onPress={handleSignOut}
          style={styles.signOutButton}
          testID="button-signout"
        />

        <Text style={[styles.version, { color: colors.textTertiary }]}>
          v1.0.0
        </Text>
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
    gap: spacing.md,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    ...typography.title2,
  },
  profileEmail: {
    ...typography.subheadline,
    marginTop: 2,
  },
  profileRole: {
    ...typography.caption1,
    fontWeight: '600',
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    ...typography.body,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  languageButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  languageText: {
    ...typography.callout,
  },
  signOutButton: {
    marginTop: spacing.md,
  },
  version: {
    ...typography.caption1,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

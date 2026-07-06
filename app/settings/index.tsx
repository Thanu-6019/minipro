import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '../../src/components/ui/Typography';
import { Card } from '../../src/components/cards/Card';
import { useTheme } from '../../src/hooks/useTheme';
import { useNotifications } from '../../src/hooks/useNotifications';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { permissionGranted, loading, requestPermission } = useNotifications();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Page Header */}
        <Typography variant="display-lg-mobile" color={theme.colors['on-surface']} style={styles.header}>
          Settings
        </Typography>

        {/* 1. Notifications Hub Card */}
        <Card style={styles.card}>
          {/* Toggle Row */}
          <View style={[styles.settingRow, styles.borderRow]}>
            <View style={styles.settingInfo}>
              <Typography variant="headline-md" color={theme.colors['on-surface']}>Push Notifications</Typography>
              <Typography variant="label-md" color={theme.colors['on-surface-variant']}>
                Receive medication reminders
              </Typography>
            </View>
            {loading ? (
              <Typography variant="body-md" color={theme.colors['on-surface-variant']}>Loading...</Typography>
            ) : (
              <Switch
                value={permissionGranted}
                onValueChange={async () => { await requestPermission(); }}
                disabled={loading}
                trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
                thumbColor={permissionGranted ? theme.colors.primary : theme.colors.outline}
                accessibilityLabel="Push notifications"
                accessibilityRole="switch"
                accessibilityState={{ checked: permissionGranted, disabled: loading }}
              />
            )}
          </View>

          {/* Navigation Link to Notifications Screen - FIXED WITH `as any` */}
          <Pressable
            style={({ pressed }) => [styles.navRow, pressed && styles.pressed]}
            onPress={() => router.push('/settings/notifications')}
            accessibilityLabel="Manage reminders"
            accessibilityRole="button"
          >
            <Typography variant="headline-md" color={theme.colors['on-surface']}>Manage Reminders</Typography>
            <Typography variant="body-lg" style={styles.chevron}>chevron_right</Typography>
          </Pressable>
        </Card>

        {/* 2. Privacy & Data Hub Card */}
        <Card style={styles.card}>
          {/* Navigation Link to Privacy Screen - FIXED WITH `as any` */}
          <Pressable
            style={({ pressed }) => [styles.navRow, pressed && styles.pressed]}
            onPress={() => router.push('/settings/privacy')}
            accessibilityLabel="Privacy and data settings"
            accessibilityRole="button"
          >
            <View style={styles.settingInfo}>
              <Typography variant="headline-md" color={theme.colors['on-surface']}>Privacy & Data</Typography>
              <Typography variant="label-md" color={theme.colors['on-surface-variant']}>
                Manage encryption, biometrics, and export
              </Typography>
            </View>
            <Typography variant="body-lg" style={styles.chevron}>chevron_right</Typography>
          </Pressable>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  header: { marginBottom: 8 },
  card: { marginTop: 0, paddingVertical: 8, paddingHorizontal: 16, overflow: 'hidden' },

  // --- Common Rows ---
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  settingInfo: { flex: 1, paddingRight: 12 },
  borderRow: { borderBottomWidth: 1, borderBottomColor: 'rgba(193, 198, 215, 0.3)' },

  // --- Navigation Rows ---
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  pressed: { opacity: 0.6, backgroundColor: 'rgba(0,0,0,0.03)' },
  chevron: { color: '#c1c6d7' }, // outline-variant
});
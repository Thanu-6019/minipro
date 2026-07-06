import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUpcomingReminders } from '../../src/features/reminders/hooks/useReminders';

function formatTime(iso: string) {
  const d = new Date(iso);
  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${mins} ${ampm}`;
}

function getTimeLabel(iso: string) {
  const h = new Date(iso).getHours();
  if (h >= 5 && h < 12) return 'Morning Routine';
  if (h >= 12 && h < 17) return 'Afternoon Routine';
  return 'Evening Routine';
}

function getMealRoute(iso: string) {
  const h = new Date(iso).getHours();
  if (h >= 5 && h < 12) return 'breakfast';
  if (h >= 12 && h < 17) return 'lunch';
  return 'dinner';
}

export default function MedicineReminder() {
  const router = useRouter();
  const { data: reminders = [], isLoading } = useUpcomingReminders();

  const reminder = reminders[0];
  const medName = reminder?.schedules?.medicines?.name || 'Medicine';
  const medDosage = reminder?.schedules?.medicines?.dosage || '';
  const timeLabel = reminder ? getTimeLabel(reminder.fire_time) : 'Routine';
  const scheduledTime = reminder ? formatTime(reminder.fire_time) : '';
  const mealRoute = reminder ? getMealRoute(reminder.fire_time) : 'breakfast';

  // --- Animations ---
  const pulseAnim = useMemo(() => new Animated.Value(0), []);
  const floatAnim1 = useMemo(() => new Animated.Value(0), []);
  const floatAnim2 = useMemo(() => new Animated.Value(0), []);
  const entranceAnim = useMemo(() => new Animated.Value(0), []);
  const entranceTranslate = useMemo(() => new Animated.Value(20), []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, { toValue: 1, duration: 15000, useNativeDriver: true }),
        Animated.timing(floatAnim1, { toValue: 0, duration: 15000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, { toValue: 1, duration: 18000, useNativeDriver: true }),
        Animated.timing(floatAnim2, { toValue: 0, duration: 18000, useNativeDriver: true }),
      ])
    ).start();

    Animated.parallel([
      Animated.timing(entranceAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(entranceTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [pulseAnim, floatAnim1, floatAnim2, entranceAnim, entranceTranslate]);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.02, 1] });
  const floatTranslateY1 = floatAnim1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -20, 0] });
  const floatRotate1 = floatAnim1.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '2deg', '0deg'] });
  const floatTranslateY2 = floatAnim2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -20, 0] });
  const floatRotate2 = floatAnim2.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '-2deg', '0deg'] });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0058bc" />
        </View>
      </View>
    );
  }

  if (!reminder) {
    return (
      <View style={styles.container}>
        <View style={styles.ambientContainer}>
          <View style={styles.ambientGradient} />
          <Animated.View style={[styles.ambientShape1, { transform: [{ translateY: floatTranslateY1 }, { rotate: floatRotate1 }] }]} />
          <Animated.View style={[styles.ambientShape2, { transform: [{ translateY: floatTranslateY2 }, { rotate: floatRotate2 }] }]} />
        </View>
        <Animated.View style={[styles.mainContainer, { opacity: entranceAnim, transform: [{ translateY: entranceTranslate }] }]}>
          <View style={styles.glassCard}>
            <View style={styles.glassHighlight} />
            <Text style={styles.timeContext}>ALL CAUGHT UP</Text>
            <View style={styles.heroContainer}>
              <View style={styles.heroPillContainer}>
                <Text style={styles.heroPillIcon}>check_circle</Text>
              </View>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.medTitle}>No Upcoming Doses</Text>
              <Text style={[styles.medInstructionText, { textAlign: 'center' }]}>
                All your medication has been taken for now.
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.ambientContainer}>
        <View style={styles.ambientGradient} />
        <Animated.View style={[styles.ambientShape1, { transform: [{ translateY: floatTranslateY1 }, { rotate: floatRotate1 }] }]} />
        <Animated.View style={[styles.ambientShape2, { transform: [{ translateY: floatTranslateY2 }, { rotate: floatRotate2 }] }]} />
      </View>

      <Animated.View style={[styles.mainContainer, { opacity: entranceAnim, transform: [{ translateY: entranceTranslate }] }]}>
        <View style={styles.glassCard}>
          <View style={styles.glassHighlight} />

          <Text style={styles.timeContext}>{timeLabel}</Text>

          <View style={styles.heroContainer}>
            <Animated.View style={[styles.heroGlow, { transform: [{ scale: pulseScale }] }]} />
            <Animated.View style={[styles.heroPillContainer, { transform: [{ scale: pulseScale }] }]}>
              <Text style={styles.heroPillIcon}>medication</Text>
            </Animated.View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeIcon}>schedule</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.medTitle}>{medName}</Text>
            <View style={styles.medTagsRow}>
              {medDosage ? <Text style={styles.medTagText}>{medDosage}</Text> : null}
              {medDosage ? <View style={styles.medTagDivider} /> : null}
              <Text style={styles.medTagText}>1 pill</Text>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              onPress={() => router.push(`/reminders/${mealRoute}?reminderId=${reminder.id}&name=${encodeURIComponent(medName)}&dosage=${encodeURIComponent(medDosage)}` as any)}
              accessibilityLabel="Acknowledge dose"
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonIcon}>check_circle</Text>
              <Text style={styles.primaryButtonText}>Acknowledge</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={() => router.push(`/reminders/reschedule?reminderId=${reminder.id}&name=${encodeURIComponent(medName)}&dosage=${encodeURIComponent(medDosage)}&time=${encodeURIComponent(scheduledTime)}` as any)}
              accessibilityLabel="Reschedule dose"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonIcon}>update</Text>
              <Text style={styles.secondaryButtonText}>Reschedule</Text>
            </Pressable>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerIcon}>info</Text>
            <Text style={styles.footerText}>Scheduled for {scheduledTime}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8fb', // surface
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Ambient Background ---
  ambientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  ambientGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(252, 248, 251, 0.8)',
  },
  ambientShape1: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: 384, // w-96
    height: 384,
    backgroundColor: '#d8e2ff', // primary-fixed
    borderRadius: 192,
    opacity: 0.4,
  },
  ambientShape2: {
    position: 'absolute',
    bottom: '25%',
    right: '25%',
    width: 320, // w-80
    height: 320,
    backgroundColor: '#f6d9ff', // tertiary-fixed
    borderRadius: 160,
    opacity: 0.3,
  },

  // --- Main Card ---
  mainContainer: {
    zIndex: 10,
    width: '100%',
    maxWidth: 400, // max-w-sm
    paddingHorizontal: 20, // margin-mobile
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // surface-light/80
    borderRadius: 24, // rounded-3xl
    padding: 24, // p-lg
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 10,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },

  // --- Top Context ---
  timeContext: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    letterSpacing: 0.5,
    color: '#414755', // on-surface-variant
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // --- Hero Icon ---
  heroContainer: {
    width: 128,
    height: 128,
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0070eb', // primary-container
    borderRadius: 64,
    opacity: 0.3,
  },
  heroPillContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e2e4', // surface-variant
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
    zIndex: 10,
  },
  heroPillIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 48,
    color: '#0058bc', // primary
  },
  heroBadge: {
    position: 'absolute',
    top: 8,
    right: -8,
    backgroundColor: '#FF9500', // status-pending
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 20,
  },
  heroBadgeIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 16,
    color: '#ffffff',
  },

  // --- Details ---
  detailsContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  medTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.01,
    color: '#1b1b1d', // on-surface
    marginBottom: 4,
  },
  medTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f3f5', // surface-container-low
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.3)',
    marginBottom: 12,
  },
  medTagText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#0058bc',
  },
  medTagDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#c1c6d7', // outline-variant
    marginHorizontal: 8,
  },
  medInstructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medInstructionIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#414755',
  },
  medInstructionText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 17,
    color: '#414755',
  },

  // --- Actions ---
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#0058bc', // primary
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    gap: 8,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#f6f3f5', // surface-container-low
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e2e4', // surface-variant
    gap: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  primaryButtonIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#ffffff',
  },
  primaryButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#1b1b1d',
  },
  secondaryButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },

  // --- Footer ---
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 14,
    color: '#717786', // outline
  },
  footerText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#717786',
  },
});
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useGenderAvatar } from '@/hooks/useGenderAvatar';
import { useMedicines } from '@/features/medicines/hooks/useMedicines';
import { useHealthMetrics } from '@/features/health/hooks/useHealthMetrics';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { useUpcomingReminders } from '@/features/reminders/hooks/useReminders';
import { useAdherenceScore } from '@/features/reminders/hooks/useAdherence';
import UnifiedBottomNav from '@/components/UnifiedBottomNav';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function formatAppointmentTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = formatTime(iso);
  return isToday ? `${time} Today` : `${time}`;
}

export default function MedTrackDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const avatarSource = useGenderAvatar();

  const { data: medicines = [] } = useMedicines();
  const { data: appointments = [] } = useAppointments();
  const { data: reminders = [] } = useUpcomingReminders();

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data: adherenceScore } = useAdherenceScore(
    weekAgo.toISOString().slice(0, 10),
    today.toISOString().slice(0, 10)
  );

  const { data: hrData } = useHealthMetrics('heart_rate');
  const { data: bpSysData } = useHealthMetrics('bp_systolic');
  const { data: bpDiaData } = useHealthMetrics('bp_diastolic');

  const latestHR = hrData?.[0]?.value;
  const latestBPSys = bpSysData?.[0]?.value;
  const latestBPDia = bpDiaData?.[0]?.value;

  const nextReminder = reminders.find((r) => r.status === 'pending');
  const nextMedicine = nextReminder
    ? medicines.find((m) => m.id === (nextReminder as any).schedules?.medicine_id)
    : null;
  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topAppBar}>
        <View style={styles.appBarLeft}>
          <Image
            source={avatarSource}
            style={styles.profileImage}
            accessibilityLabel="Profile avatar"
          />
          <Text style={styles.appBarTitle}>MedTrack AI</Text>
        </View>
        <Pressable style={styles.notificationButton} onPress={() => router.push('/settings/notifications')} accessibilityLabel="Notifications" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.notificationIcon}>notifications</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>{getGreeting()}, {userName}</Text>
          <Text style={styles.greetingSubtitle}>Here is your health overview for today.</Text>
        </View>

        {/* 2. Adherence Score Card */}
        <View style={styles.card}>
          <View style={styles.cardGlow} />
          <Text style={styles.cardTitle}>Adherence Score</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.progressRingContainer}>
              {/* Simulating SVG Circles */}
              <View style={styles.progressRingBg} />
              <View style={[styles.progressRingFg, { transform: [{ rotate: '-90deg' }] }]} />
              <View style={styles.scoreTextContainer}>
                <Text style={styles.scoreText}>{adherenceScore != null ? `${adherenceScore}%` : '—'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.onTrackBadge}>
            <Text style={styles.onTrackIcon}>check_circle</Text>
            <Text style={styles.onTrackText}>On track</Text>
          </View>
        </View>

        {/* 3. Next Dose Card */}
        <View style={[styles.card, styles.nextDoseCard]}>
          <View style={styles.nextDoseGlow} />
          <View style={styles.nextDoseHeader}>
            <View>
              <Text style={styles.nextDoseLabel}>Next Dose</Text>
              <Text style={styles.nextDoseTime}>{nextReminder ? formatTime(nextReminder.fire_time) : '—'}</Text>
            </View>
            <Text style={styles.medicationIcon}>medication</Text>
          </View>
          <View style={styles.nextDoseBody}>
            <View style={styles.medicationInfo}>
              <View style={styles.pillIconContainer}>
                <Text style={styles.pillIcon}>pill</Text>
              </View>
              <View>
                <Text style={styles.medicationName}>{nextMedicine?.name || 'No upcoming dose'}</Text>
                <Text style={styles.medicationDetails}>{nextMedicine ? `${nextMedicine.dosage} • ${nextMedicine.frequency}` : ''}</Text>
              </View>
            </View>
            <Pressable style={styles.takeNowButton} accessibilityLabel="Take now" accessibilityRole="button" onPress={() => {
              if (nextReminder) {
                const hour = new Date(nextReminder.fire_time).getHours();
                const meal = hour < 10 ? 'breakfast' : hour < 15 ? 'lunch' : 'dinner';
                router.push(`/reminders/${meal}?reminderId=${nextReminder.id}&name=${encodeURIComponent(nextMedicine?.name || '')}&dosage=${encodeURIComponent(nextMedicine?.dosage || '')}`);
              }
            }}>
              <Text style={styles.takeNowText}>Take Now</Text>
            </Pressable>
          </View>
        </View>

        {/* 4. Today's Medicines */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s Medicines</Text>
          <Pressable onPress={() => router.push('/medicines')} accessibilityLabel="See all medicines" accessibilityRole="button">
            <Text style={styles.seeAllText}>See All</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicationScroll}>
          {medicines.slice(0, 3).map((med, idx) => (
            <View key={med.id} style={styles.medicationCard}>
              <View style={styles.medCardHeader}>
                <View style={[styles.medIconContainer, { backgroundColor: idx === 1 ? '#e4e2e4' : 'rgba(255, 149, 0, 0.1)' }]}>
                  <Text style={[styles.medCardIcon, { color: idx === 1 ? '#1b1b1d' : '#FF9500' }]}>{idx === 1 ? 'medication_liquid' : 'nutrition'}</Text>
                </View>
                {idx === 1 ? (
                  <View style={styles.takenBadge}>
                    <Text style={styles.takenIcon}>check</Text>
                    <Text style={styles.takenText}>Taken</Text>
                  </View>
                ) : (
                  <Text style={styles.medTimeBadge}>{reminders[idx] ? formatTime(reminders[idx].fire_time) : ''}</Text>
                )}
              </View>
              <View style={styles.medCardBody}>
                <Text style={styles.medCardName}>{med.name}</Text>
                <Text style={styles.medCardDetails}>{med.dosage} • {med.frequency}</Text>
              </View>
              {idx === 1 ? (
                <Text style={styles.medCardStatus}>Taken today</Text>
              ) : (
                <Pressable style={styles.medCardButton} accessibilityLabel={`Mark ${med.name} as taken`} accessibilityRole="button">
                  <Text style={styles.medCardButtonText}>Mark as Taken</Text>
                </Pressable>
              )}
            </View>
          ))}
        </ScrollView>

        {/* 5. Upcoming Appointments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.appointmentRow}>
            <View style={styles.appointmentInfo}>
              <View style={styles.appointmentIconContainer}>
                <Text style={styles.appointmentIcon}>stethoscope</Text>
              </View>
              <View>
                <Text style={styles.appointmentTitle}>{appointments[0]?.title || 'No upcoming appointments'}</Text>
                <View style={styles.appointmentTimeRow}>
                  <Text style={styles.scheduleIcon}>schedule</Text>
                  <Text style={styles.appointmentTime}>{appointments[0] ? formatAppointmentTime(appointments[0].appointment_date) : ''}</Text>
                </View>
              </View>
            </View>
            <Pressable onPress={() => appointments[0] && router.push(`/appointments/details?id=${appointments[0].id}`)} accessibilityLabel={`View ${appointments[0]?.title || 'appointment'} details`} accessibilityRole="button">
              <Text style={styles.chevronIcon}>chevron_right</Text>
            </Pressable>
          </View>
        </View>

        {/* 6. Alerts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alerts</Text>
        </View>
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>warning</Text>
          <Text style={styles.alertText}>1 medicine expiring soon</Text>
          <Pressable accessibilityLabel="View expiring medicine details" accessibilityRole="button">
            <Text style={styles.alertAction}>View</Text>
          </Pressable>
        </View>

        {/* 7. Vitals (Health Summary) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Summary</Text>
        </View>
        <View style={styles.vitalsRow}>
          <View style={[styles.card, styles.vitalCard]}>
            <View style={[styles.vitalIconContainer, { backgroundColor: 'rgba(186, 26, 26, 0.5)' }]}>
              <Text style={[styles.vitalIcon, { color: '#ba1a1a' }]}>favorite</Text>
            </View>
            <View>
              <Text style={styles.vitalLabel}>Heart Rate</Text>
              <View style={styles.vitalValueRow}>
                <Text style={styles.vitalValue}>{latestHR != null ? String(latestHR) : '—'}</Text>
                <Text style={styles.vitalUnit}>bpm</Text>
              </View>
            </View>
          </View>
          <View style={[styles.card, styles.vitalCard]}>
            <View style={[styles.vitalIconContainer, { backgroundColor: 'rgba(0, 88, 188, 0.5)' }]}>
              <Text style={[styles.vitalIcon, { color: '#0058bc' }]}>water_drop</Text>
            </View>
            <View>
              <Text style={styles.vitalLabel}>Blood Pressure</Text>
              <View style={styles.vitalValueRow}>
                <Text style={styles.vitalValue}>{latestBPSys != null && latestBPDia != null ? `${latestBPSys}/${latestBPDia}` : '—'}</Text>
                <Text style={styles.vitalUnit}>mmHg</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Padding for Bottom Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
      <UnifiedBottomNav active="home" />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8fb', // background
  },
  scrollContent: {
    paddingHorizontal: 20, // margin-mobile
    paddingTop: 8,
    paddingBottom: 20,
  },
  // Top App Bar
  topAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: 'rgba(252, 248, 251, 0.8)', // surface/80
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  appBarTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#0058bc', // primary
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#0058bc',
  },

  // Greeting
  greetingSection: {
    marginTop: 4, // mt-sm
    marginBottom: 24,
  },
  greetingTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.01,
    color: '#1b1b1d', // on-surface
  },
  greetingSubtitle: {
    fontSize: 17,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    color: '#414755', // on-surface-variant
    marginTop: 4,
  },

  // Generic Card
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  cardGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(0, 88, 188, 0.05)',
    borderRadius: 64,
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
    marginBottom: 12,
    alignSelf: 'flex-start',
    width: '100%',
  },

  // Adherence
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  progressRingContainer: {
    width: 128,
    height: 128,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingBg: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 6,
    borderColor: '#e4e2e4', // surface-variant
  },
  progressRingFg: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 6,
    borderColor: '#34C759', // status-taken
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  scoreTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#1b1b1d',
  },
  onTrackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'center',
  },
  onTrackIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 16,
    color: '#34C759',
    marginRight: 4,
  },
  onTrackText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#34C759',
  },

  // Next Dose
  nextDoseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // base glass
    borderColor: 'rgba(255, 255, 255, 0.6)', // subtle gradient simulated
  },
  nextDoseGlow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 192,
    height: 192,
    backgroundColor: 'rgba(0, 88, 188, 0.1)',
    borderRadius: 96,
  },
  nextDoseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    zIndex: 1,
  },
  nextDoseLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    letterSpacing: 0.5,
    color: '#0058bc',
    textTransform: 'uppercase',
  },
  nextDoseTime: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#1b1b1d',
    marginTop: 4,
  },
  medicationIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 40,
    color: '#0058bc',
  },
  nextDoseBody: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pillIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#6ffb85', // secondary-container
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#00732a', // on-secondary-container
  },
  medicationName: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  medicationDetails: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },
  takeNowButton: {
    backgroundColor: '#0058bc',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  takeNowText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#ffffff',
  },

  // Medicines Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  seeAllText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#0058bc',
  },
  medicationScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  medicationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    minWidth: 260,
    marginRight: 16,
    flexShrink: 0,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  medCardTaken: {
    opacity: 0.7,
  },
  medCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medCardIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
  },
  medTimeBadge: {
    backgroundColor: 'rgba(228, 226, 228, 0.5)',
    color: '#414755',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  medCardBody: {
    marginBottom: 16,
  },
  medCardName: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  medCardDetails: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },
  medCardButton: {
    width: '100%',
    backgroundColor: 'rgba(0, 88, 188, 0.1)',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  medCardButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#0058bc',
  },
  takenBadge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignItems: 'center',
  },
  takenIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 12,
    color: '#34C759',
    marginRight: 4,
  },
  takenText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#34C759',
  },
  medCardStatus: {
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 13,
    color: '#414755',
  },
  upcomingButton: {
    backgroundColor: '#f0edef', // surface-container
  },
  upcomingButtonText: {
    color: '#1b1b1d',
  },

  // Appointments
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appointmentIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(138, 43, 185, 0.2)', // tertiary-container/20
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#8a2bb9', // tertiary
  },
  appointmentTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  appointmentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduleIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 16,
    color: '#414755',
  },
  appointmentTime: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },
  chevronIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#0058bc',
  },

  // Alerts
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdad6', // error-container
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 12,
  },
  alertIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#93000a', // on-error-container
  },
  alertText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#93000a',
  },
  alertAction: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#93000a',
    textDecorationLine: 'underline',
  },

  // Vitals
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
    marginBottom: 24,
  },
  vitalCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 0,
    gap: 12,
  },
  vitalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vitalIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
  },
  vitalLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
  },
  vitalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  vitalValue: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  vitalUnit: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },
});
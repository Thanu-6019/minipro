import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  SectionList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGenderAvatar } from '@/hooks/useGenderAvatar';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return {
    month: months[d.getMonth()],
    day: d.getDate().toString().padStart(2, '0'),
    weekday: days[d.getDay()],
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
}

export default function UpcomingAppointments() {
  const router = useRouter();
  const avatarSource = useGenderAvatar();
  const { data: rawAppointments = [], isLoading } = useAppointments();

  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

  const thisWeek = rawAppointments.filter((a) => new Date(a.appointment_date) <= endOfWeek);
  const nextMonth = rawAppointments.filter((a) => new Date(a.appointment_date) > endOfWeek);

  const APPOINTMENTS = [
    ...(thisWeek.length > 0 ? [{
      section: 'This Week',
      data: thisWeek.map((a, i) => {
        const fmt = formatDate(a.appointment_date);
        return {
          id: a.id,
          status: 'Confirmed',
          statusColor: '#34C759',
          statusBg: '#E8F5E9',
          statusBorder: '#C8E6C9',
          name: a.title,
          specialty: a.location || 'Medical Visit',
          facility: a.location || '',
          month: fmt.month,
          day: fmt.day,
          weekday: fmt.weekday,
          time: fmt.time,
          blobColor: i % 2 === 0 ? 'rgba(0, 88, 188, 0.05)' : 'rgba(255, 149, 0, 0.05)',
          isNextMonth: false,
        };
      }),
    }] : []),
    ...(nextMonth.length > 0 ? [{
      section: 'Next Month',
      data: nextMonth.map((a) => {
        const fmt = formatDate(a.appointment_date);
        return {
          id: a.id,
          status: 'Confirmed',
          statusColor: '#34C759',
          statusBg: '#E8F5E9',
          statusBorder: '#C8E6C9',
          name: a.title,
          specialty: a.location || 'Medical Visit',
          facility: a.location || '',
          month: fmt.month,
          day: fmt.day,
          weekday: fmt.weekday,
          time: fmt.time,
          blobColor: 'rgba(0, 88, 188, 0.05)',
          isNextMonth: true,
        };
      }),
    }] : []),
  ];

  const renderAppointmentCard = ({ item }: { item: typeof APPOINTMENTS[0]['data'][0] }) => (
    <Pressable
      style={[styles.card, item.isNextMonth && styles.cardNextMonth]}
      onPress={() => router.push(`/appointments/details?id=${item.id}`)}
      accessibilityLabel={`Appointment with ${item.name}, ${item.weekday} ${item.month} ${item.day} at ${item.time}`}
      accessibilityRole="button"
    >
      {/* Decorative Top Right Blob */}
      <View style={[styles.cardBlob, { backgroundColor: item.blobColor }]} />

      {/* Top Row: Status & Options */}
      <View style={styles.cardTopRow}>
        <View style={[styles.statusBadge, { backgroundColor: item.statusBg, borderColor: item.statusBorder }]}>
          <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
          <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.moreButton, pressed && styles.pressedScale]}
          accessibilityLabel="More options"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.moreIcon}>more_vert</Text>
        </Pressable>
      </View>

      {/* Doctor Info Row */}
      <View style={styles.doctorRow}>
        <Image source={{ uri: (item as any).image || undefined }} style={styles.doctorImage} accessibilityLabel={`Photo of ${item.name}`} />
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
          <View style={styles.facilityRow}>
            <Text style={styles.facilityIcon}>local_hospital</Text>
            <Text style={styles.facilityText}>{item.facility}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Row: Date & Navigation */}
      <View style={styles.bottomRow}>
        <View style={styles.dateWrapper}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateMonth}>{item.month}</Text>
            <Text style={styles.dateDay}>{item.day}</Text>
          </View>
          <View>
            <Text style={styles.dateWeekday}>{item.weekday}</Text>
            <Text style={styles.dateTime}>{item.time}</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.directionButton, pressed && styles.pressedScale]}
          accessibilityLabel="Get directions"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.directionIcon}>directions</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>

      {/* TopAppBar */}
      <View style={styles.topAppBar}>
        <View style={styles.topBarLeft}>
          <Image
            source={avatarSource}
            style={styles.profileImage}
            accessibilityLabel="Profile photo"
          />
        </View>
        <Text style={styles.appBarTitle}>MedTrack AI</Text>
        <Pressable
          style={styles.notificationButton}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.notificationIcon}>notifications</Text>
        </Pressable>
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color="#0058bc" />
          <Text style={styles.centeredText}>Loading appointments...</Text>
        </View>
      ) : (
        <SectionList
          sections={APPOINTMENTS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderAppointmentCard}
          renderSectionHeader={({ section: { section } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section}</Text>
              {section === 'This Week' && (
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{thisWeek.length} upcoming</Text>
                </View>
              )}
            </View>
          )}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.pageTitle}>Appointments</Text>
              <Text style={styles.pageSubtitle}>
                Manage your upcoming medical visits and consultations.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>event_busy</Text>
              <Text style={styles.emptyTitle}>No Appointments</Text>
              <Text style={styles.emptyText}>You don&apos;t have any upcoming appointments scheduled.</Text>
            </View>
          }
        />
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} accessibilityLabel="Dashboard" accessibilityRole="tab" accessibilityState={{ selected: false }}>
          <Text style={styles.navIcon}>dashboard</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
        </Pressable>
        <Pressable style={styles.navItem} accessibilityLabel="Metrics" accessibilityRole="tab" accessibilityState={{ selected: false }}>
          <Text style={styles.navIcon}>monitoring</Text>
          <Text style={styles.navLabel}>Metrics</Text>
        </Pressable>
        <Pressable style={[styles.navItem, styles.navItemActive]} accessibilityLabel="Meds" accessibilityRole="tab" accessibilityState={{ selected: true }}>
          <Text style={[styles.navIcon, styles.navIconActive]}>medical_services</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Meds</Text>
        </Pressable>
        <Pressable style={styles.navItem} accessibilityLabel="Insights" accessibilityRole="tab" accessibilityState={{ selected: false }}>
          <Text style={styles.navIcon}>query_stats</Text>
          <Text style={styles.navLabel}>Insights</Text>
        </Pressable>
        <Pressable style={styles.navItem} accessibilityLabel="Profile" accessibilityRole="tab" accessibilityState={{ selected: false }}>
          <Text style={styles.navIcon}>person</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </Pressable>
      </View>

    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8fb', // background
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listHeader: {
    marginTop: 8,
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.01,
    color: '#1b1b1d',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },

  // --- Top App Bar ---
  topAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: 'rgba(252, 248, 251, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#ffffff' },
  appBarTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    fontWeight: '700',
    color: '#0058bc'
  },
  notificationButton: { padding: 8 },
  notificationIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#0058bc'
  },

  // --- Sections ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  sectionBadge: {
    backgroundColor: 'rgba(0, 88, 188, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sectionBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#0058bc',
  },

  // --- Card ---
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0edef',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  cardNextMonth: {
    opacity: 0.8,
  },
  cardBlob: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    borderBottomLeftRadius: 128,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    zIndex: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
  },
  moreButton: {
    padding: 4,
  },
  moreIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#414755',
  },

  // --- Doctor Info ---
  doctorRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 10,
  },
  doctorImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#f0edef',
  },
  doctorInfo: { flex: 1 },
  doctorName: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  doctorSpecialty: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#0058bc',
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  facilityIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 14,
    color: '#414755',
  },
  facilityText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
  },

  // --- Bottom Row ---
  bottomRow: {
    backgroundColor: '#f6f3f5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBlock: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#ba1a1a',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  dateDay: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
    marginTop: -2,
  },
  dateWeekday: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#1b1b1d',
    fontWeight: '600',
  },
  dateTime: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },
  directionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  directionIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#0058bc',
  },

  // --- Bottom Nav ---
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingTop: 8,
    backgroundColor: 'rgba(252, 248, 251, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(0, 112, 235, 0.2)',
    paddingHorizontal: 16,
  },
  navIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    marginBottom: 2,
    color: '#414755',
  },
  navIconActive: {
    color: '#0058bc',
  },
  navLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#414755',
  },
  navLabelActive: {
    color: '#0058bc',
    fontWeight: '600',
  },

  // --- Common ---
  pressedScale: { transform: [{ scale: 0.95 }] },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  centeredText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 48,
    color: '#c1c6d7',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
    textAlign: 'center',
  },
});
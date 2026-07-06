import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useGenderAvatar } from '@/hooks/useGenderAvatar';
import { useHealthMetrics } from '@/features/health/hooks/useHealthMetrics';

export default function HealthMetricsDashboard() {
  const router = useRouter();
  const avatarSource = useGenderAvatar();

  const { data: bpSysData, isLoading: bpSysLoading } = useHealthMetrics('bp_systolic');
  const { data: bpDiaData, isLoading: bpDiaLoading } = useHealthMetrics('bp_diastolic');
  const { data: sugarData, isLoading: sugarLoading } = useHealthMetrics('blood_sugar');
  const { data: hrData, isLoading: hrLoading } = useHealthMetrics('heart_rate');
  const { data: bmiData, isLoading: bmiLoading } = useHealthMetrics('bmi');
  const { data: weightData, isLoading: weightLoading } = useHealthMetrics('weight');
  const { data: spo2Data, isLoading: spo2Loading } = useHealthMetrics('spo2');

  const isLoading = bpSysLoading || bpDiaLoading || sugarLoading || hrLoading || bmiLoading || weightLoading || spo2Loading;

  const latestBPSys = bpSysData?.[0]?.value;
  const latestBPDia = bpDiaData?.[0]?.value;
  const latestSugar = sugarData?.[0]?.value;
  const latestHR = hrData?.[0]?.value;
  const latestBMI = bmiData?.[0]?.value;
  const latestWeight = weightData?.[0]?.value;
  const latestSpo2 = spo2Data?.[0]?.value;

  const latestRecorded = bpSysData?.[0]?.recorded_at;
  const lastUpdated = latestRecorded
    ? new Date(latestRecorded).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' })
    : '—';

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0058bc" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* TopAppBar */}
      <View style={styles.topAppBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.profileContainer}>
            <Image
              source={avatarSource}
              style={styles.profileImage}
              accessibilityLabel="Profile avatar"
            />
          </View>
        </View>
        <Text style={styles.appBarTitle}>MedTrack AI</Text>
        <Pressable style={styles.notificationButton} accessibilityLabel="Notifications" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.notificationIcon}>notifications</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Health Metrics</Text>
            <Text style={styles.pageSubtitle}>Last updated: {lastUpdated}</Text>
          </View>
        </View>

        {/* Bento Grid for Metrics */}
        <View style={styles.metricsGrid}>

          {/* 1. Blood Pressure Card */}
          <Pressable style={styles.metricCard} onPress={() => router.push('/health/blood-pressure')} accessibilityLabel="View Blood Pressure details" accessibilityRole="button">
            <View style={styles.metricHeader}>
              <View style={styles.metricLeft}>
                <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(186, 26, 26, 0.5)' }]}>
                  <Text style={[styles.metricIcon, { color: '#ba1a1a' }]}>favorite</Text>
                </View>
                <Text style={styles.metricTitle}>Blood Pressure</Text>
              </View>
              <View style={[styles.statusBadge, styles.statusBadgeNormal]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Normal</Text>
              </View>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{latestBPSys != null && latestBPDia != null ? `${latestBPSys}/${latestBPDia}` : '—'}</Text>
              <Text style={styles.metricUnit}>mmHg</Text>
            </View>
            <View style={styles.chartContainer}>
              <Svg style={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 100 30">
                <Path d="M0,25 Q10,20 20,25 T40,15 T60,20 T80,10 T100,15" fill="none" stroke="#ba1a1a" strokeWidth="2" strokeLinecap="round" />
                <Path d="M0,25 Q10,20 20,25 T40,15 T60,20 T80,10 T100,15 L100,30 L0,30 Z" fill="rgba(186, 26, 26, 0.2)" />
              </Svg>
            </View>
          </Pressable>

          {/* 2. Blood Sugar Card */}
          <Pressable style={styles.metricCard} onPress={() => router.push('/health/blood-sugar')} accessibilityLabel="View Blood Sugar details" accessibilityRole="button">
            <View style={styles.metricHeader}>
              <View style={styles.metricLeft}>
                <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(0, 88, 188, 0.2)' }]}>
                  <Text style={[styles.metricIcon, { color: '#0058bc' }]}>water_drop</Text>
                </View>
                <Text style={styles.metricTitle}>Blood Sugar</Text>
              </View>
              <View style={[styles.statusBadge, styles.statusBadgeNormal]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Normal</Text>
              </View>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{latestSugar != null ? String(latestSugar) : '—'}</Text>
              <Text style={styles.metricUnit}>mg/dL</Text>
            </View>
            <View style={styles.chartContainer}>
              <Svg style={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 100 30">
                <Path d="M0,15 Q15,20 30,15 T60,10 T90,18 T100,15" fill="none" stroke="#0058bc" strokeWidth="2" strokeLinecap="round" />
                <Path d="M0,15 Q15,20 30,15 T60,10 T90,18 T100,15 L100,30 L0,30 Z" fill="rgba(0, 88, 188, 0.3)" />
              </Svg>
            </View>
          </Pressable>

          {/* 3. Heart Rate Card */}
          <Pressable style={styles.metricCard} onPress={() => router.push('/health/heart-oxygen')} accessibilityLabel="View Heart Rate details" accessibilityRole="button">
            <View style={styles.metricHeader}>
              <View style={styles.metricLeft}>
                <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                  <Text style={[styles.metricIcon, { color: '#FF3B30' }]}>monitor_heart</Text>
                </View>
                <Text style={styles.metricTitle}>Heart Rate</Text>
              </View>
              <View style={[styles.statusBadge, styles.statusBadgeResting]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Resting</Text>
              </View>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{latestHR != null ? String(latestHR) : '—'}</Text>
              <Text style={styles.metricUnit}>bpm</Text>
            </View>
            <View style={styles.chartContainer}>
              <Svg style={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 100 30">
                <Path d="M0,20 L10,20 L15,10 L25,30 L30,20 L100,20" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </Pressable>

          {/* 4. BMI Card */}
          <Pressable style={styles.metricCard} onPress={() => router.push('/health/weight-bmi')} accessibilityLabel="View BMI details" accessibilityRole="button">
            <View style={styles.metricHeader}>
              <View style={styles.metricLeft}>
                <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(138, 43, 185, 0.2)' }]}>
                  <Text style={[styles.metricIcon, { color: '#8a2bb9' }]}>accessibility_new</Text>
                </View>
                <Text style={styles.metricTitle}>BMI</Text>
              </View>
              <View style={[styles.statusBadge, styles.statusBadgeNormal]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Healthy</Text>
              </View>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{latestBMI != null ? String(latestBMI) : '—'}</Text>
            </View>
            <View style={styles.bmiTrackerContainer}>
              <View style={styles.bmiTrack} />
              <View style={[styles.bmiFill, { width: '50%' }]}>
                <View style={styles.bmiKnob} />
              </View>
            </View>
            <View style={styles.bmiLabels}>
              <Text style={styles.bmiLabel}>Under</Text>
              <Text style={styles.bmiLabel}>Healthy</Text>
              <Text style={styles.bmiLabel}>Over</Text>
            </View>
          </Pressable>

          {/* 5. Weight Card */}
          <Pressable style={styles.metricCard} onPress={() => router.push('/health/weight-bmi')} accessibilityLabel="View Weight details" accessibilityRole="button">
            <View style={styles.metricHeader}>
              <View style={styles.metricLeft}>
                <View style={[styles.metricIconContainer, { backgroundColor: '#e4e2e4' }]}>
                  <Text style={[styles.metricIcon, { color: '#1b1b1d' }]}>monitor_weight</Text>
                </View>
                <Text style={styles.metricTitle}>Weight</Text>
              </View>
              <View style={[styles.statusBadge, styles.statusBadgeStable]}>
                <Text style={styles.statusTextStable}>Stable</Text>
              </View>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{latestWeight != null ? String(latestWeight) : '—'}</Text>
              <Text style={styles.metricUnit}>kg</Text>
            </View>
            <View style={styles.chartContainer}>
              <Svg style={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 100 30">
                <Path d="M0,20 Q20,21 40,20 T80,19 T100,20" fill="none" stroke="#414755" strokeWidth="2" strokeLinecap="round" />
              </Svg>
            </View>
          </Pressable>

          {/* 6. Oxygen (SpO2) Card */}
          <Pressable style={styles.metricCard} onPress={() => router.push('/health/heart-oxygen')} accessibilityLabel="View Oxygen details" accessibilityRole="button">
            <View style={styles.metricHeader}>
              <View style={styles.metricLeft}>
                <View style={[styles.metricIconContainer, { backgroundColor: 'rgba(0, 112, 235, 0.3)' }]}>
                  <Text style={[styles.metricIcon, { color: '#0070eb' }]}>air</Text>
                </View>
                <Text style={styles.metricTitle}>Oxygen (SpO2)</Text>
              </View>
              <View style={[styles.statusBadge, styles.statusBadgeNormal]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Optimal</Text>
              </View>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{latestSpo2 != null ? String(latestSpo2) : '—'}</Text>
              <Text style={styles.metricUnit}>%</Text>
            </View>
            <View style={styles.chartContainer}>
              <Svg style={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 100 30">
                <Path d="M0,10 Q20,12 40,8 T80,11 T100,10" fill="none" stroke="#0070eb" strokeWidth="2" strokeLinecap="round" />
              </Svg>
            </View>
          </Pressable>

        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

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
    paddingHorizontal: 20, // margin-mobile
    paddingTop: 8,
    paddingBottom: 20,
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
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0edef',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  appBarTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#0058bc',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#414755',
  },

  // --- Header ---
  headerRow: {
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    fontWeight: '600',
    color: '#1b1b1d',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },

  // --- Metrics Grid ---
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
  },
  metricTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  metricValue: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#1b1b1d',
  },
  metricUnit: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
    marginBottom: 4,
  },

  // --- Status Badges ---
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeNormal: {
    backgroundColor: 'rgba(111, 251, 133, 0.3)',
  },
  statusBadgeResting: {
    backgroundColor: 'rgba(111, 251, 133, 0.3)',
  },
  statusBadgeStable: {
    backgroundColor: '#e4e2e4',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  statusText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#00732a',
  },
  statusTextStable: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#414755',
  },

  // --- Mini Charts ---
  chartContainer: {
    height: 48,
    width: '100%',
    marginTop: 'auto',
  },
  chartSvg: {
    width: '100%',
    height: '100%',
  },

  // --- BMI Specific ---
  bmiTrackerContainer: {
    height: 8,
    width: '100%',
    marginTop: 16,
    marginBottom: 4,
    position: 'relative',
  },
  bmiTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0edef', // surface-container
    borderRadius: 999,
  },
  bmiFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#8a2bb9', // tertiary
    borderRadius: 999,
  },
  bmiKnob: {
    position: 'absolute',
    right: -6,
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#8a2bb9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bmiLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bmiLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 10,
    color: '#414755',
  },

  // --- FAB ---
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0058bc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 40,
  },
  fabPressed: {
    transform: [{ scale: 0.9 }],
    opacity: 0.9,
  },
  fabIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#ffffff',
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
});
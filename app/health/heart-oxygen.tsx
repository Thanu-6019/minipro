import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useHealthMetrics } from '../../src/features/health/hooks/useHealthMetrics';
import { useGenderAvatar } from '../../src/hooks/useGenderAvatar';

function getSpO2Status(val: number): { label: string; color: string } {
  if (val >= 95) return { label: 'Optimal', color: '#34C759' };
  if (val >= 90) return { label: 'Fair', color: '#FF9500' };
  return { label: 'Low', color: '#FF3B30' };
}

export default function HeartOxygenTracker() {
  const avatarSource = useGenderAvatar();
  const { data: hrData } = useHealthMetrics('heart_rate');
  const { data: spo2Data } = useHealthMetrics('spo2');

  const latestHR = useMemo(() => {
    if (hrData && hrData.length > 0) return Math.round(hrData[0].value);
    return 72;
  }, [hrData]);

  const latestSpO2 = useMemo(() => {
    if (spo2Data && spo2Data.length > 0) return Math.round(spo2Data[0].value);
    return 98;
  }, [spo2Data]);

  const restingHR = useMemo(() => {
    if (!hrData || hrData.length === 0) return 64;
    const sorted = [...hrData].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
    const min = Math.min(...sorted.map(r => r.value));
    return Math.round(min);
  }, [hrData]);

  const spo2Status = useMemo(() => getSpO2Status(latestSpO2), [latestSpO2]);
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
          <Text style={styles.appBarTitle}>MedTrack AI</Text>
        </View>
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
            <Text style={styles.pageTitle}>Heart Health</Text>
            <Text style={styles.pageSubtitle}>Real-time vitals monitoring</Text>
          </View>
          <Text style={styles.infoIcon}>info</Text>
        </View>

        {/* 1. Heart Rate Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.cardIcon, { color: '#FF3B30' }]}>favorite</Text>
              <Text style={styles.cardTitle}>Heart Rate</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
          <View style={styles.cardValueRow}>
            <Text style={styles.cardValue}>{latestHR}</Text>
            <Text style={styles.cardUnit}>bpm</Text>
          </View>

          {/* ECG Graph */}
          <View style={styles.ecgContainer}>
            <Svg style={styles.ecgSvg} preserveAspectRatio="none" viewBox="0 0 100 30">
              <Path
                d="M0,15 L15,15 L18,5 L22,25 L26,15 L40,15 L43,8 L47,22 L51,15 L65,15 L68,2 L72,28 L76,15 L90,15 L93,10 L97,20 L100,15"
                fill="none"
                stroke="#FF3B30"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                opacity="0.8"
              />
              <Path
                d="M0,15 L15,15 L18,5 L22,25 L26,15 L40,15 L43,8 L47,22 L51,15 L65,15 L68,2 L72,28 L76,15 L90,15 L93,10 L97,20 L100,15"
                fill="none"
                stroke="#FF3B30"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                opacity="0.2"
              />
            </Svg>
            <View style={styles.ecgFade} />
          </View>
        </View>

        {/* 2. Oxygen Saturation Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.cardIcon, { color: '#0058bc' }]}>air</Text>
              <Text style={styles.cardTitle}>Oxygen Saturation</Text>
            </View>
            <View style={styles.spo2Badge}>
              <Text style={styles.spo2BadgeText}>SpO2</Text>
            </View>
          </View>
          <View style={styles.cardValueRow}>
            <Text style={styles.cardValue}>{latestSpO2}</Text>
            <Text style={styles.cardUnit}>%</Text>
          </View>

          <View style={styles.spo2BarContainer}>
            <View style={styles.spo2Track}>
              <View style={[styles.spo2Fill, { width: `${latestSpO2}%` }]} />
            </View>
            <View style={styles.spo2Labels}>
              <Text style={styles.spo2Label}>90%</Text>
              <Text style={styles.spo2Label}>100%</Text>
            </View>
          </View>
        </View>

        {/* 3. Bento Grid */}
        <View style={styles.bentoGrid}>

          {/* Resting HR Trend */}
          <View style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>Resting HR</Text>
            <View style={styles.bentoValueRow}>
              <Text style={styles.bentoValue}>{restingHR}</Text>
              <Text style={styles.bentoUnit}>bpm</Text>
            </View>
            <View style={styles.bentoChartContainer}>
              <Svg style={styles.bentoSvg} preserveAspectRatio="none" viewBox="0 0 100 40">
                <Path
                  d="M0,30 Q20,35 40,25 T80,20 T100,10"
                  fill="none"
                  stroke="#414755"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </Svg>
              <View style={styles.trendBadge}>
                <Text style={styles.trendIcon}>trending_down</Text>
              </View>
            </View>
          </View>

          {/* Oxygen Stability */}
          <View style={styles.bentoCard}>
            <Text style={styles.bentoLabel}>Stability</Text>
            <Text style={styles.bentoStatus}>{spo2Status.label}</Text>
            <View style={styles.stabilityContainer}>
              <View style={[styles.stabilityRing, styles.stabilityRing1]} />
              <View style={[styles.stabilityRing, styles.stabilityRing2]} />
              <View style={styles.stabilityDot} />
            </View>
          </View>

        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8fb', // surface
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
    gap: 8,
  },
  profileContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#e4e2e4',
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
    padding: 8,
  },
  notificationIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#0058bc',
  },

  // --- Header ---
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  pageSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
    marginTop: 4,
  },
  infoIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#717786',
  },

  // --- Generic Card ---
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 226, 228, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#1b1b1d',
  },
  cardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  cardValue: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 34,
    fontWeight: '700',
    color: '#1b1b1d',
  },
  cardUnit: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },

  // --- Heart Rate Specific ---
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  liveText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#FF3B30',
  },
  ecgContainer: {
    height: 96,
    width: '100%',
    marginTop: 8,
    position: 'relative',
  },
  ecgSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  ecgFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    // Using gradient impossible here without extra library, using simple overlays to fake edge fade
  },

  // --- Oxygen Saturation Specific ---
  spo2Badge: {
    backgroundColor: 'rgba(0, 88, 188, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  spo2BadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#0058bc',
  },
  spo2BarContainer: {
    marginTop: 16,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  spo2Track: {
    width: '100%',
    height: 8,
    backgroundColor: '#e4e2e4',
    borderRadius: 999,
    overflow: 'hidden',
  },
  spo2Fill: {
    height: '100%',
    backgroundColor: '#0058bc',
    borderRadius: 999,
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  spo2Labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  spo2Label: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#717786',
  },

  // --- Bento Grid ---
  bentoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  bentoCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(228, 226, 228, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 15,
    elevation: 1,
    justifyContent: 'space-between',
  },
  bentoLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
  },
  bentoValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  bentoValue: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  bentoUnit: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 11,
    color: '#414755',
  },
  bentoStatus: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#1b1b1d',
    marginTop: 2,
  },

  // --- Resting HR Trend ---
  bentoChartContainer: {
    height: 48,
    width: '100%',
    position: 'relative',
    marginTop: 'auto',
  },
  bentoSvg: {
    width: '100%',
    height: '100%',
  },
  trendBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 16,
    color: '#34C759',
  },

  // --- Stability Nested Circles ---
  stabilityContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  stabilityRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
  },
  stabilityRing1: {
    width: 48,
    height: 48,
    borderColor: 'rgba(0, 88, 188, 0.2)',
  },
  stabilityRing2: {
    width: 32,
    height: 32,
    borderColor: 'rgba(0, 88, 188, 0.4)',
  },
  stabilityDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0058bc',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
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
    width: 64,
    height: 56,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(0, 112, 235, 0.2)',
    paddingHorizontal: 16,
    height: 56,
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
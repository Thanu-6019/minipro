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
import Svg, { Path, Circle, Line, G, Polygon } from 'react-native-svg';
import { useHealthMetrics } from '../../src/features/health/hooks/useHealthMetrics';
import { useHealthTrend } from '../../src/features/analytics/hooks/useAnalytics';
import { useGenderAvatar } from '../../src/hooks/useGenderAvatar';

const TARGET_WEIGHT = 160;
const START_WEIGHT = 175;

function getBMILabel(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#adc6ff' };
  if (bmi < 25) return { label: 'Normal', color: '#34C759' };
  if (bmi < 30) return { label: 'Overweight', color: '#FF9500' };
  return { label: 'Obese', color: '#FF3B30' };
}

function formatLastUpdated(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const recorded = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  let dateStr: string;
  if (recorded.getTime() === today.getTime()) dateStr = 'today';
  else {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    dateStr = `${months[d.getMonth()]} ${d.getDate()}`;
  }

  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `Last updated ${dateStr} at ${h12}:${mins} ${ampm}`;
}

function generateWeightPath(data: number[], viewW: number, viewH: number): string {
  if (data.length === 0) return '';
  const min = Math.min(...data) - 2;
  const max = Math.max(...data) + 2;
  const range = max - min || 1;
  const padX = 4;
  const padY = 4;
  const step = data.length > 1 ? (viewW - 2 * padX) / (data.length - 1) : 0;
  const points = data.map((v, i) => ({
    x: padX + i * step,
    y: padY + ((max - v) / range) * (viewH - 2 * padY),
  }));
  if (points.length === 1) return `M${points[0].x},${points[0].y} L${points[0].x},${points[0].y}`;
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

function generateWeightArea(data: number[], viewW: number, viewH: number): string {
  const linePath = generateWeightPath(data, viewW, viewH);
  if (!linePath) return '';
  const padX = 4;
  const step = data.length > 1 ? (viewW - 2 * padX) / (data.length - 1) : 0;
  const lastX = padX + (data.length - 1) * step;
  return `${linePath} L${lastX},${viewH} L0,${viewH} Z`;
}

export default function WeightBMITracking() {
  const avatarSource = useGenderAvatar();
  const { data: weightData } = useHealthMetrics('weight');
  const { data: bmiData } = useHealthMetrics('bmi');
  const { data: weightTrend } = useHealthTrend('weight', 1);

  const latestWeight = useMemo(() => {
    if (weightData && weightData.length > 0) return Math.round(weightData[0].value);
    return 165;
  }, [weightData]);

  const latestBMI = useMemo(() => {
    if (bmiData && bmiData.length > 0) return Number(bmiData[0].value).toFixed(1);
    return '22.4';
  }, [bmiData]);

  const bmiLabel = useMemo(() => {
    const val = parseFloat(latestBMI);
    return getBMILabel(val);
  }, [latestBMI]);

  const lastUpdated = useMemo(() => {
    if (weightData && weightData.length > 0) return formatLastUpdated(weightData[0].recorded_at);
    return 'Last updated today at 8:00 AM';
  }, [weightData]);

  const weightTrendValues = useMemo(() => {
    if (weightTrend && weightTrend.length > 0) return weightTrend.map(t => Number(t.avg_value));
    if (weightData && weightData.length > 0) return weightData.slice().reverse().slice(-10).map(w => Math.round(w.value));
    return [175, 173, 171, 170, 168, 167, 165];
  }, [weightTrend, weightData]);

  const weightPath = useMemo(() => generateWeightPath(weightTrendValues, 100, 50), [weightTrendValues]);
  const weightArea = useMemo(() => generateWeightArea(weightTrendValues, 100, 50), [weightTrendValues]);

  const goalProgress = Math.min(Math.max(((START_WEIGHT - latestWeight) / (START_WEIGHT - TARGET_WEIGHT)) * 100, 0), 100);
  const lbsToGo = Math.max(latestWeight - TARGET_WEIGHT, 0);

  const bmiNeedleRotation = useMemo(() => {
    const val = parseFloat(latestBMI);
    const clamped = Math.min(Math.max(val, 15), 35);
    return -10 + ((clamped - 15) / 20) * 20;
  }, [latestBMI]);
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
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Weight &amp; BMI</Text>
          <Text style={styles.pageSubtitle}>{lastUpdated}</Text>
        </View>

        {/* Bento Grid Layout */}
        <View style={styles.bentoGrid}>

          {/* 1. Current BMI Card */}
          <View style={[styles.card, styles.cardGauge]}>
            <Text style={styles.cardTitle}>Current BMI</Text>
            <View style={styles.gaugeContainer}>
              <Svg style={styles.gaugeSvg} viewBox="0 0 100 50">

                {/* Background Track */}
                <Path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#e4e2e4"
                  strokeLinecap="round"
                  strokeWidth="8"
                />

                {/* Colored Segments (Underweight, Normal, Overweight) */}
                <Path
                  d="M 10 50 A 40 40 0 0 1 25 25"
                  fill="none"
                  stroke="#adc6ff"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
                <Path
                  d="M 25 25 A 40 40 0 0 1 75 25"
                  fill="none"
                  stroke="#34C759"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
                <Path
                  d="M 75 25 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#FF9500"
                  strokeLinecap="round"
                  strokeWidth="8"
                />

                {/* Needle Indicator */}
                <G transform={`translate(50, 50) rotate(${bmiNeedleRotation})`}>
                  <Polygon points="-2,0 2,0 0,-38" fill="#1b1b1d" />
                  <Circle cx="0" cy="0" fill="#1b1b1d" r="4" />
                </G>
              </Svg>

              <View style={styles.gaugeValueContainer}>
                <Text style={styles.gaugeValue}>{latestBMI}</Text>
                <View style={styles.gaugeBadge}>
                  <Text style={styles.gaugeBadgeText}>{bmiLabel.label}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 2. Goal Progress Card */}
          <View style={styles.card}>
            <View style={styles.goalHeader}>
              <Text style={styles.cardTitle}>Goal Progress</Text>
              <Text style={styles.goalFlagIcon}>flag</Text>
            </View>
            <View style={styles.goalValueRow}>
              <Text style={styles.goalValue}>{latestWeight}</Text>
              <Text style={styles.goalUnit}>lbs</Text>
            </View>
            <Text style={styles.goalTarget}>Target: {TARGET_WEIGHT} lbs</Text>

            <View style={styles.goalFooter}>
              <View style={styles.goalLabels}>
                <Text style={styles.goalLabel}>Start: {START_WEIGHT}</Text>
                <Text style={styles.goalLabel}>{lbsToGo} lbs to go</Text>
              </View>
              <View style={styles.goalProgressContainer}>
                <View style={[styles.goalProgressFill, { width: `${goalProgress}%` }]} />
              </View>
            </View>
          </View>

          {/* 3. Weight Trend Chart */}
          <View style={[styles.card, styles.cardChart]}>
            <View style={styles.chartHeader}>
              <Text style={styles.cardTitle}>Weight Trend</Text>
              <View style={styles.chartDropdown}>
                <Text style={styles.chartDropdownText}>Last 30 Days</Text>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Svg style={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 100 50">

                {/* Grid Lines */}
                <Line x1="0" x2="100" y1="10" y2="10" stroke="#e4e2e4" strokeDasharray="2" strokeWidth="0.5" />
                <Line x1="0" x2="100" y1="30" y2="30" stroke="#e4e2e4" strokeDasharray="2" strokeWidth="0.5" />

                {/* Area Fill */}
                {weightArea ? <Path d={weightArea} fill="rgba(138, 43, 185, 0.1)" /> : null}

                {/* Data Line */}
                {weightPath ? <Path d={weightPath} fill="none" stroke="#8a2bb9" strokeWidth="2" /> : null}

                {/* Data Points */}
                {weightTrendValues.length > 0 && (() => {
                  const min = Math.min(...weightTrendValues) - 2;
                  const max = Math.max(...weightTrendValues) + 2;
                  const range = max - min || 1;
                  const padX = 4;
                  const step = weightTrendValues.length > 1 ? (100 - 2 * padX) / (weightTrendValues.length - 1) : 0;
                  return weightTrendValues.slice(-3).map((v, i) => {
                    const idx = weightTrendValues.length - 3 + i;
                    const cx = padX + idx * step;
                    const cy = 4 + ((max - v) / range) * 42;
                    return <Circle key={i} cx={cx} cy={cy} fill="#8a2bb9" r="2" />;
                  });
                })()}
              </Svg>
            </View>

            <View style={styles.chartLabels}>
              {weightTrendValues.length > 0 && (() => {
                const labels: string[] = [];
                const count = weightTrendValues.length;
                if (count <= 3) {
                  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  weightTrendValues.forEach((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (count - 1 - i) * 5);
                    labels.push(`${months[d.getMonth()]} ${d.getDate()}`);
                  });
                } else {
                  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  [0, Math.floor(count / 2), count - 1].forEach(i => {
                    const d = new Date();
                    d.setDate(d.getDate() - (count - 1 - i) * 5);
                    labels.push(`${months[d.getMonth()]} ${d.getDate()}`);
                  });
                }
                return labels.map((l, i) => <Text key={i} style={styles.chartLabel}>{l}</Text>);
              })()}
            </View>
          </View>

          {/* 4. Quick Action Button */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              styles.quickActionCard,
              pressed && styles.pressedScale,
            ]}
            accessibilityLabel="Log Today's Weight"
            accessibilityRole="button"
          >
            <View style={styles.quickActionLeft}>
              <View style={styles.quickActionIconContainer}>
                <Text style={styles.quickActionIcon}>add</Text>
              </View>
              <Text style={styles.quickActionText}>Log Today&apos;s Weight</Text>
            </View>
            <Text style={styles.quickActionChevron}>chevron_right</Text>
          </Pressable>

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
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.3)',
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
  headerSection: {
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

  // --- Bento Grid ---
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGauge: {
    flexBasis: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  cardChart: {
    flexBasis: '100%',
    minHeight: 260,
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
    marginBottom: 8,
  },

  // --- BMI Gauge ---
  gaugeContainer: {
    width: 192,
    height: 192,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  gaugeSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gaugeValueContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  gaugeValue: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 34,
    fontWeight: '700',
    color: '#1b1b1d',
  },
  gaugeBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 4,
  },
  gaugeBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#34C759',
  },

  // --- Goal Progress ---
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalFlagIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#8a2bb9',
  },
  goalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  goalValue: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 34,
    fontWeight: '700',
    color: '#1b1b1d',
  },
  goalUnit: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },
  goalTarget: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
    marginTop: 2,
  },
  goalFooter: {
    marginTop: 16,
  },
  goalLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  goalLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#414755',
  },
  goalProgressContainer: {
    height: 8,
    width: '100%',
    backgroundColor: '#e4e2e4',
    borderRadius: 999,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#8a2bb9',
    borderRadius: 999,
  },

  // --- Weight Trend Chart ---
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartDropdown: {
    backgroundColor: '#f6f3f5', // surface-container-low
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chartDropdownText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#1b1b1d',
  },
  chartContainer: {
    height: 192,
    width: '100%',
    position: 'relative',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#e4e2e4',
    paddingBottom: 4,
    paddingLeft: 4,
  },
  chartSvg: {
    width: '100%',
    height: '100%',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  chartLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#414755',
  },

  // --- Quick Action ---
  quickActionCard: {
    flexBasis: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickActionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f6d9ff', // tertiary-fixed
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#310048', // on-tertiary-fixed
  },
  quickActionText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  quickActionChevron: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#414755',
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

  // --- Common ---
  pressedScale: {
    transform: [{ scale: 0.95 }],
  },
});
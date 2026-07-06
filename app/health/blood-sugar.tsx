import React, { useMemo } from 'react';
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
import Svg, { Line, Rect, Path, Circle, Text as SvgText } from 'react-native-svg';
import { useHealthMetrics } from '../../src/features/health/hooks/useHealthMetrics';
import { useHealthTrend } from '../../src/features/analytics/hooks/useAnalytics';
import { useGenderAvatar } from '../../src/hooks/useGenderAvatar';

function formatRecordedAt(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const recorded = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  let dateStr: string;
  if (recorded.getTime() === today.getTime()) dateStr = 'Today';
  else if (recorded.getTime() === yesterday.getTime()) dateStr = 'Yesterday';
  else {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    dateStr = `${months[d.getMonth()]} ${d.getDate()}`;
  }

  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${dateStr}, ${h12}:${mins} ${ampm}`;
}

function getGlucoseStatus(val: number): { color: string; bg: string; label: string } {
  if (val < 70) return { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)', label: 'Low' };
  if (val <= 140) return { color: '#34C759', bg: 'rgba(52, 199, 89, 0.1)', label: 'Normal' };
  if (val <= 180) return { color: '#34C759', bg: 'rgba(52, 199, 89, 0.1)', label: 'In Range' };
  return { color: '#FF9500', bg: 'rgba(255, 149, 0, 0.1)', label: 'High' };
}

function generateLinePath(data: number[], viewW: number, viewH: number, minVal: number, maxVal: number): string {
  if (data.length === 0) return '';
  const range = maxVal - minVal || 1;
  const padX = 10;
  const padY = 10;
  const step = data.length > 1 ? (viewW - 2 * padX) / (data.length - 1) : 0;
  const points = data.map((v, i) => ({
    x: padX + i * step,
    y: padY + ((maxVal - v) / range) * (viewH - 2 * padY),
  }));
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  return points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
}

export default function BloodSugarTracking() {
  const avatarSource = useGenderAvatar();
  const { data: metrics, isLoading } = useHealthMetrics('blood_sugar');
  const { data: trendData } = useHealthTrend('blood_sugar', 1);

  const readings = useMemo(() => metrics || [], [metrics]);

  const average = useMemo(() => {
    if (readings.length === 0) return 112;
    return Math.round(readings.reduce((sum, r) => sum + r.value, 0) / readings.length);
  }, [readings]);

  const timeInRange = useMemo(() => {
    if (readings.length === 0) return 85;
    const inRange = readings.filter(r => r.value >= 70 && r.value <= 180).length;
    return Math.round((inRange / readings.length) * 100);
  }, [readings]);

  const trendValues = useMemo(() => {
    if (trendData && trendData.length > 0) return trendData.map(t => Number(t.avg_value));
    if (readings.length > 0) return readings.slice().reverse().slice(-7).map(r => Math.round(r.value));
    return [95, 142, 110, 185, 98, 130, 112];
  }, [trendData, readings]);

  const chartPath = useMemo(() => generateLinePath(trendValues, 300, 150, 70, 180), [trendValues]);

  const dataPoints = useMemo(() => {
    if (trendValues.length === 0) return [];
    const range = 110;
    const padX = 10;
    const padY = 10;
    const step = trendValues.length > 1 ? (300 - 2 * padX) / (trendValues.length - 1) : 0;
    return trendValues.map((v, i) => ({
      cx: padX + i * step,
      cy: padY + ((180 - v) / range) * 130,
    }));
  }, [trendValues]);

  const xLabels = useMemo(() => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    if (trendValues.length <= 7) return trendValues.map((_, i) => days[i % 7]);
    return Array.from({ length: 7 }, (_, i) => days[i]);
  }, [trendValues]);

  const recentLogs = readings.slice(0, 5);
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
        {/* Header & Time Filter */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Blood Glucose</Text>
          <View style={styles.segmentedControl}>
            <Pressable style={styles.segmentButton} accessibilityLabel="View today's data" accessibilityRole="button">
              <Text style={styles.segmentText}>Today</Text>
            </Pressable>
            <Pressable style={[styles.segmentButton, styles.segmentButtonActive]} accessibilityLabel="View this week's data" accessibilityRole="button">
              <Text style={[styles.segmentText, styles.segmentTextActive]}>Week</Text>
            </Pressable>
            <Pressable style={styles.segmentButton} accessibilityLabel="View this month's data" accessibilityRole="button">
              <Text style={styles.segmentText}>Month</Text>
            </Pressable>
          </View>
        </View>

        {/* Bento Summary Cards */}
        <View style={styles.summaryGrid}>

          {/* Average Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryIcon}>water_drop</Text>
              <View style={styles.trendBadge}>
                <Text style={styles.trendIcon}>trending_down</Text>
                <Text style={styles.trendText}>{readings.length > 0 ? `${Math.round((1 - average / 180) * 100)}%` : '--'}</Text>
              </View>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Average Glucose</Text>
              <View style={styles.summaryValueRow}>
                <Text style={styles.summaryValue}>{average}</Text>
                <Text style={styles.summaryUnit}>mg/dL</Text>
              </View>
            </View>
          </View>

          {/* Time in Range Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryIcon}>timelapse</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Time in Range</Text>
              <View style={styles.summaryValueRow}>
                <Text style={styles.summaryValue}>{timeInRange}</Text>
                <Text style={styles.summaryUnit}>%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${timeInRange}%` }]} />
              </View>
            </View>
          </View>

        </View>

        {/* Main Chart Area */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Trends</Text>
            <View style={styles.chartLegend}>
              <View style={styles.chartLegendBox} />
              <Text style={styles.chartLegendText}>Target (70-180)</Text>
            </View>
          </View>

          {/* SVG Line Chart */}
          <View style={styles.chartContainer}>
            <Svg style={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 300 150">

              {/* Y Axis Grid Lines */}
              <Line x1="0" x2="300" y1="130" y2="130" stroke="#e4e2e4" strokeWidth="1" opacity="0.5" />
              <Line x1="0" x2="300" y1="75" y2="75" stroke="#e4e2e4" strokeWidth="1" opacity="0.5" />
              <Line x1="0" x2="300" y1="20" y2="20" stroke="#e4e2e4" strokeWidth="1" opacity="0.5" />

              {/* Y Axis Labels */}
              <SvgText x="-5" y="133" fontSize="10" fill="#717786" textAnchor="end" fontFamily="Inter">70</SvgText>
              <SvgText x="-5" y="78" fontSize="10" fill="#717786" textAnchor="end" fontFamily="Inter">125</SvgText>
              <SvgText x="-5" y="23" fontSize="10" fill="#717786" textAnchor="end" fontFamily="Inter">180</SvgText>

              {/* Target Range Shading */}
              <Rect x="0" y="20" width="300" height="110" fill="rgba(52, 199, 89, 0.1)" />

              {/* Data Line */}
              {chartPath ? (
                <Path d={chartPath} fill="none" stroke="#0058bc" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              ) : null}

              {/* Data Points */}
              {dataPoints.map((pt, i) => (
                <Circle key={i} cx={pt.cx} cy={pt.cy} r="4" fill={i === dataPoints.length - 1 ? '#0058bc' : '#ffffff'} stroke="#0058bc" strokeWidth="2" />
              ))}

              {/* X Axis Labels */}
              {xLabels.map((label, i) => {
                const padX = 10;
                const step = trendValues.length > 1 ? (300 - 2 * padX) / (trendValues.length - 1) : 0;
                const xPos = padX + i * step;
                return (
                  <SvgText key={i} x={xPos} y="145" fontSize="10" fill="#717786" textAnchor="middle" fontFamily="Inter">{label}</SvgText>
                );
              })}
            </Svg>
          </View>
        </View>

        {/* Recent Logs List */}
        <View style={styles.logsSection}>
          <Text style={styles.logsTitle}>Recent Readings</Text>

          {isLoading ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#0058bc" />
            </View>
          ) : recentLogs.length === 0 ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 15, color: '#414755' }}>
                No readings yet. Start tracking your blood sugar.
              </Text>
            </View>
          ) : (
            recentLogs.map((reading, index) => {
              const val = Math.round(reading.value);
              const status = getGlucoseStatus(val);
              const fmt = formatRecordedAt(reading.recorded_at);
              const isOutOfRange = val < 70 || val > 180;
              return (
                <View key={reading.id} style={[styles.logCard, isOutOfRange && styles.logCardOutOfRange]}>
                  <View style={styles.logCardLeft}>
                    <View style={[styles.logIconContainer, { backgroundColor: status.bg }]}>
                      <Text style={[styles.logIcon, { color: status.color }]}>water_drop</Text>
                    </View>
                    <View>
                      <Text style={styles.logValue}>{val} <Text style={styles.logUnit}>mg/dL</Text></Text>
                      <Text style={styles.logDate}>{fmt}</Text>
                    </View>
                  </View>
                  <View style={styles.logCardRight}>
                    <View style={styles.logBadge}>
                      <Text style={styles.logBadgeText}>{status.label}</Text>
                    </View>
                    <View style={[styles.logDot, { backgroundColor: status.color }]} />
                  </View>
                </View>
              );
            })
          )}
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

  // --- TopAppBar ---
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
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#0058bc',
  },

  // --- Header ---
  headerSection: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(228, 226, 228, 0.4)',
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
  },
  segmentTextActive: {
    color: '#0058bc',
    fontWeight: '600',
  },

  // --- Summary Cards ---
  summaryGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
    justifyContent: 'space-between',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#717786',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  trendIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 14,
    color: '#34C759',
  },
  trendText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#34C759',
  },
  summaryLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
    marginBottom: 4,
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  summaryValue: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#1b1b1d',
  },
  summaryUnit: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#717786',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#e4e2e4',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 999,
  },

  // --- Chart ---
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chartLegendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  chartLegendText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#717786',
  },
  chartContainer: {
    height: 192,
    width: '100%',
    position: 'relative',
    marginTop: 8,
  },
  chartSvg: {
    width: '100%',
    height: '100%',
  },

  // --- Logs ---
  logsSection: {
    gap: 12,
  },
  logsTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
    marginBottom: 12,
  },
  logCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
  },
  logCardOutOfRange: {
    borderLeftWidth: 2,
    borderLeftColor: '#FF9500',
  },
  logCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
  },
  logValue: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 16,
    color: '#1b1b1d',
  },
  logUnit: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#717786',
  },
  logDate: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
  },
  logCardRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  logBadge: {
    backgroundColor: 'rgba(228, 226, 228, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 10,
    color: '#414755',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
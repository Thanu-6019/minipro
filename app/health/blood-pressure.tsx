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
import Svg, { Defs, LinearGradient, Stop, Path, Circle } from 'react-native-svg';
import { useHealthMetrics } from '../../src/features/health/hooks/useHealthMetrics';
import { useHealthTrend } from '../../src/features/analytics/hooks/useAnalytics';
import { useGenderAvatar } from '../../src/hooks/useGenderAvatar';
import type { HealthMetric } from '../../src/features/health/services/health.service';

function formatRecordedAt(iso: string): { date: string; time: string } {
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
  const timeStr = `${h12}:${mins} ${ampm}`;

  return { date: dateStr, time: timeStr };
}

function getBPStatus(sys: number, dia: number): { label: string; color: string; bg: string; border: string } {
  if (sys < 120 && dia < 80) return { label: 'Healthy', color: '#34C759', bg: 'rgba(52, 199, 89, 0.15)', border: 'rgba(52, 199, 89, 0.3)' };
  if (sys < 130 && dia < 80) return { label: 'Elevated', color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)', border: 'rgba(255, 149, 0, 0.3)' };
  if (sys < 140 || dia < 90) return { label: 'High Stage 1', color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)', border: 'rgba(255, 149, 0, 0.3)' };
  return { label: 'High', color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.15)', border: 'rgba(255, 59, 48, 0.3)' };
}

function generatePath(data: number[], minVal: number, maxVal: number, viewW: number, viewH: number, padY: number): string {
  if (data.length === 0) return '';
  const range = maxVal - minVal || 1;
  const step = data.length > 1 ? viewW / (data.length - 1) : viewW;
  const points = data.map((v, i) => ({
    x: i * step,
    y: padY + ((maxVal - v) / range) * (viewH - 2 * padY),
  }));
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

function generateAreaPath(data: number[], minVal: number, maxVal: number, viewW: number, viewH: number, padY: number): string {
  const linePath = generatePath(data, minVal, maxVal, viewW, viewH, padY);
  if (!linePath) return '';
  const step = data.length > 1 ? viewW / (data.length - 1) : viewW;
  const lastX = (data.length - 1) * step;
  return `${linePath} L${lastX},${viewH} L0,${viewH} Z`;
}

export default function BloodPressureTracker() {
  const avatarSource = useGenderAvatar();
  const { data: sysData, isLoading: sysLoading } = useHealthMetrics('bp_systolic');
  const { data: diaData, isLoading: diaLoading } = useHealthMetrics('bp_diastolic');
  const { data: sysTrend } = useHealthTrend('bp_systolic', 1);
  const { data: diaTrend } = useHealthTrend('bp_diastolic', 1);

  const isLoading = sysLoading || diaLoading;

  const pairedReadings = useMemo(() => {
    if (!sysData || !diaData) return [];
    const pairs: { sys: HealthMetric; dia: HealthMetric; ts: number }[] = [];
    for (const s of sysData) {
      const closest = diaData.reduce<{ dia: HealthMetric; diff: number } | null>((best, d) => {
        const diff = Math.abs(new Date(s.recorded_at).getTime() - new Date(d.recorded_at).getTime());
        if (!best || diff < best.diff) return { dia: d, diff };
        return best;
      }, null);
      if (closest && closest.diff < 3600000) {
        pairs.push({ sys: s, dia: closest.dia, ts: new Date(s.recorded_at).getTime() });
      }
    }
    return pairs.sort((a, b) => b.ts - a.ts);
  }, [sysData, diaData]);

  const latestPair = pairedReadings[0];
  const latestSys = latestPair ? Math.round(latestPair.sys.value) : 118;
  const latestDia = latestPair ? Math.round(latestPair.dia.value) : 76;
  const latestTs = latestPair ? latestPair.sys.recorded_at : new Date().toISOString();
  const latestFmt = formatRecordedAt(latestTs);
  const bpStatus = getBPStatus(latestSys, latestDia);

  const sysTrendValues = useMemo(() => {
    if (sysTrend && sysTrend.length > 0) return sysTrend.map(t => Number(t.avg_value));
    if (pairedReadings.length > 0) return pairedReadings.slice().reverse().map(p => Math.round(p.sys.value));
    return [118, 122, 115, 120, 118, 125, 118];
  }, [sysTrend, pairedReadings]);

  const diaTrendValues = useMemo(() => {
    if (diaTrend && diaTrend.length > 0) return diaTrend.map(t => Number(t.avg_value));
    if (pairedReadings.length > 0) return pairedReadings.slice().reverse().map(p => Math.round(p.dia.value));
    return [76, 80, 75, 78, 76, 82, 76];
  }, [diaTrend, pairedReadings]);

  const sysPath = useMemo(() => generatePath(sysTrendValues, 60, 160, 400, 160, 16), [sysTrendValues]);
  const sysArea = useMemo(() => generateAreaPath(sysTrendValues, 60, 160, 400, 160, 16), [sysTrendValues]);
  const diaPath = useMemo(() => generatePath(diaTrendValues, 60, 160, 400, 160, 16), [diaTrendValues]);
  const diaArea = useMemo(() => generateAreaPath(diaTrendValues, 60, 160, 400, 160, 16), [diaTrendValues]);

  const historyReadings = pairedReadings.slice(0, 10);

  const xLabels = useMemo(() => {
    if (sysTrend && sysTrend.length > 0) {
      const labels = sysTrend.map(t => {
        const d = new Date(t.date_bucket);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${months[d.getMonth()]} ${d.getDate()}`;
      });
      if (labels.length <= 5) return labels;
      const step = Math.floor(labels.length / 4);
      return [labels[0], labels[step], labels[step * 2], labels[step * 3], labels[labels.length - 1]];
    }
    return ['Oct 1', 'Oct 8', 'Oct 15', 'Oct 22', 'Today'];
  }, [sysTrend]);
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
        {/* Header & View Toggle */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Blood Pressure</Text>
            <Text style={styles.pageSubtitle}>Past 30 Days</Text>
          </View>
          <View style={styles.segmentedControl}>
            <Pressable style={styles.segmentButton} accessibilityLabel="View weekly data" accessibilityRole="button">
              <Text style={styles.segmentText}>W</Text>
            </Pressable>
            <Pressable style={[styles.segmentButton, styles.segmentButtonActive]} accessibilityLabel="View monthly data" accessibilityRole="button">
              <Text style={[styles.segmentText, styles.segmentTextActive]}>M</Text>
            </Pressable>
          </View>
        </View>

        {/* Latest Reading Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroOrb} />
          <View style={styles.heroHeader}>
            <Text style={styles.heroLabel}>Latest Reading</Text>
            <View style={[styles.heroBadge, { backgroundColor: bpStatus.bg }]}>
              <Text style={[styles.heroBadgeIcon, { color: bpStatus.color }]}>check_circle</Text>
              <Text style={[styles.heroBadgeText, { color: bpStatus.color }]}>{bpStatus.label}</Text>
            </View>
          </View>
          <View style={styles.heroValues}>
            <Text style={styles.heroValue}>{latestSys}</Text>
            <Text style={styles.heroDivider}>/</Text>
            <Text style={styles.heroValue}>{latestDia}</Text>
            <Text style={styles.heroUnit}>mmHg</Text>
          </View>
          <Text style={styles.heroTimestamp}>
            <Text style={styles.heroTimestampIcon}>schedule</Text> {latestFmt.date}, {latestFmt.time}
          </Text>
        </View>

        {/* Chart Section */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Trends</Text>
            <View style={styles.chartLegend}>
              <View style={styles.chartLegendItem}>
                <View style={[styles.chartLegendDot, { backgroundColor: '#0058bc' }]} />
                <Text style={styles.chartLegendText}>SYS</Text>
              </View>
              <View style={styles.chartLegendItem}>
                <View style={[styles.chartLegendDot, { backgroundColor: '#a649d5' }]} />
                <Text style={styles.chartLegendText}>DIA</Text>
              </View>
            </View>
          </View>

          {/* SVG Chart */}
          <View style={styles.chartContainer}>
            {/* Y-Axis Grid Lines */}
            <View style={styles.chartGridContainer}>
              <View style={styles.gridRow}><Text style={styles.gridLabel}>140</Text></View>
              <View style={styles.gridRow}><Text style={styles.gridLabel}>120</Text></View>
              <View style={styles.gridRow}><Text style={styles.gridLabel}>100</Text></View>
              <View style={styles.gridRow}><Text style={styles.gridLabel}>80</Text></View>
              <View style={styles.gridRow}><Text style={styles.gridLabel}>60</Text></View>
            </View>

            {/* The Chart SVG */}
            <Svg style={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 400 160">
              <Defs>
                <LinearGradient id="sysGrad" x1="0" x2="0" y1="0" y2="1">
                  <Stop offset="0%" stopColor="#0058bc" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#0058bc" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="diaGrad" x1="0" x2="0" y1="0" y2="1">
                  <Stop offset="0%" stopColor="#a649d5" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#a649d5" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              {diaArea ? <Path d={diaArea} fill="url(#diaGrad)" /> : null}
              {diaPath ? <Path d={diaPath} fill="none" stroke="#a649d5" strokeLinecap="round" strokeWidth="2" /> : null}
              {sysArea ? <Path d={sysArea} fill="url(#sysGrad)" /> : null}
              {sysPath ? <Path d={sysPath} fill="none" stroke="#0058bc" strokeLinecap="round" strokeWidth="2.5" /> : null}
              {sysTrendValues.length > 0 && (
                <>
                  <Circle cx={Math.min((sysTrendValues.length - 1) * (400 / Math.max(sysTrendValues.length - 1, 1)), 400)} cy={16 + ((160 - sysTrendValues[sysTrendValues.length - 1]) / 100) * 128} fill="#ffffff" r="4" stroke="#0058bc" strokeWidth="2" />
                  <Circle cx={Math.min((diaTrendValues.length - 1) * (400 / Math.max(diaTrendValues.length - 1, 1)), 400)} cy={16 + ((160 - diaTrendValues[diaTrendValues.length - 1]) / 100) * 128} fill="#ffffff" r="4" stroke="#a649d5" strokeWidth="2" />
                </>
              )}
            </Svg>

            {/* X-Axis Labels */}
            <View style={styles.xAxisLabels}>
              {xLabels.map((label, i) => (
                <Text key={i} style={styles.xAxisLabel}>{label}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* History List */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>History</Text>

          <View style={styles.historyCard}>
            {isLoading ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#0058bc" />
              </View>
            ) : historyReadings.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 15, color: '#414755' }}>
                  No readings yet. Start tracking your blood pressure.
                </Text>
              </View>
            ) : (
              historyReadings.map((reading, index) => {
                const fmt = formatRecordedAt(reading.sys.recorded_at);
                const sys = Math.round(reading.sys.value);
                const dia = Math.round(reading.dia.value);
                const status = getBPStatus(sys, dia);
                const isFirst = index === 0;
                return (
                  <View
                    key={reading.sys.id}
                    style={[styles.historyRow, index < historyReadings.length - 1 && styles.historyRowBorder]}
                  >
                    <View style={styles.historyLeft}>
                      <View style={[styles.historyIconContainer, { backgroundColor: isFirst ? 'rgba(0, 88, 188, 0.1)' : '#e4e2e4' }]}>
                        <Text style={[styles.historyIcon, { color: isFirst ? '#0058bc' : '#414755' }]}>favorite</Text>
                      </View>
                      <View>
                        <Text style={styles.historyDate}>{fmt.date}</Text>
                        <Text style={styles.historyTime}>{fmt.time}</Text>
                      </View>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={styles.historyValue}>{sys} <Text style={styles.historyDivider}>/</Text> {dia}</Text>
                      <Text style={[styles.historyStatus, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>
                );
              })
            )}
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
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    fontWeight: '600',
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

  // --- Header & Toggle ---
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.01,
    color: '#1b1b1d',
  },
  pageSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
    marginTop: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(228, 226, 228, 0.4)',
    borderRadius: 8,
    padding: 4,
  },
  segmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
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
    color: '#1b1b1d',
  },

  // --- Hero Card ---
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 226, 228, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 24,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroOrb: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    backgroundColor: 'rgba(0, 88, 188, 0.05)',
    borderRadius: 80,
    pointerEvents: 'none',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroBadgeIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 16,
    color: '#34C759',
  },
  heroBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#34C759',
  },
  heroValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 8,
  },
  heroValue: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 48,
    fontWeight: '700',
    color: '#1b1b1d',
  },
  heroDivider: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 32,
    fontWeight: '300',
    color: '#717786',
  },
  heroUnit: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
    marginLeft: 4,
  },
  heroTimestamp: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#414755',
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroTimestampIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 14,
  },

  // --- Chart ---
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(228, 226, 228, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 24,
    elevation: 2,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLegendText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#414755',
  },
  chartContainer: {
    height: 192,
    position: 'relative',
  },
  chartGridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 24,
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 24,
    zIndex: 0,
  },
  gridRow: {
    borderTopWidth: 1,
    borderColor: 'rgba(228, 226, 228, 0.4)',
    position: 'relative',
    width: '100%',
    height: 0,
  },
  gridLabel: {
    position: 'absolute',
    top: -10,
    left: -4,
    fontSize: 10,
    color: '#717786',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
  },
  chartSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
    zIndex: 2,
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#717786',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
  },

  // --- History ---
  historySection: {
    marginBottom: 24,
  },
  historyTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(228, 226, 228, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 24,
    elevation: 2,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderColor: 'rgba(228, 226, 228, 0.3)',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
  },
  historyDate: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 15,
    color: '#1b1b1d',
  },
  historyTime: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#414755',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyValue: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  historyDivider: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontWeight: '300',
    color: '#717786',
  },
  historyStatus: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    marginTop: 2,
  },
  historyStatusHealthy: {
    color: '#34C759',
  },
  historyStatusElevated: {
    color: '#FF9500',
  },
  viewAllButton: {
    width: '100%',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 88, 188, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
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
    width: 64,
    height: 56,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: '#0070eb',
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
    color: '#ffffff',
  },
  navLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#414755',
  },
  navLabelActive: {
    color: '#ffffff',
  },
});
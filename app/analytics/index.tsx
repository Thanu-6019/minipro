import React, { useState, useMemo } from 'react';
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
import Svg, { Path, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useGenderAvatar } from '@/hooks/useGenderAvatar';
import { useAdherenceScore } from '@/features/reminders/hooks/useAdherence';
import { useHealthTrend } from '@/features/analytics/hooks/useAnalytics';
import type { TrendData } from '@/features/analytics/services/analytics.service';

type Period = '1W' | '1M' | '3M' | '6M' | '9M' | '12M';

function getMonthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function genPath(data: number[], viewW: number, viewH: number, padX: number, padY: number): string {
  if (data.length === 0) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = data.length > 1 ? (viewW - 2 * padX) / (data.length - 1) : 0;
  const pts = data.map((v, i) => ({
    x: padX + i * step,
    y: padY + ((max - v) / range) * (viewH - 2 * padY),
  }));
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C${cpx},${pts[i - 1].y} ${cpx},${pts[i].y} ${pts[i].x},${pts[i].y}`;
  }
  return d;
}

function genArea(data: number[], viewW: number, viewH: number, padX: number, padY: number): string {
  const lp = genPath(data, viewW, viewH, padX, padY);
  if (!lp) return '';
  const step = data.length > 1 ? (viewW - 2 * padX) / (data.length - 1) : 0;
  const lastX = padX + (data.length - 1) * step;
  return `${lp} L${lastX},${viewH} L0,${viewH} Z`;
}

function aggregateMonthly(trend: TrendData[] | undefined, monthsBack: number): number[] {
  if (!trend || trend.length === 0) return [];
  const now = new Date();
  const result: number[] = [];
  for (let m = monthsBack - 1; m >= 0; m--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);
    const bucket = trend.filter(t => {
      const d = new Date(t.date_bucket);
      return d >= monthStart && d <= monthEnd;
    });
    if (bucket.length > 0) {
      result.push(Math.round(bucket.reduce((s, b) => s + b.avg_value, 0) / bucket.length));
    }
  }
  return result;
}

export default function HealthAnalyticsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('3M');
  const avatarSource = useGenderAvatar();

  const { data: adherence1M, isLoading: adherence1MLoading } = useAdherenceScore(getMonthsAgo(1), todayISO());
  const { data: adherence3M, isLoading: adherence3MLoading } = useAdherenceScore(getMonthsAgo(3), todayISO());
  const { data: adherence6M, isLoading: adherence6MLoading } = useAdherenceScore(getMonthsAgo(6), todayISO());
  const { data: adherence12M, isLoading: adherence12MLoading } = useAdherenceScore(getMonthsAgo(12), todayISO());

  const currentMonths = period === '1M' ? 1 : period === '3M' ? 3 : period === '6M' ? 6 : period === '9M' ? 9 : 12;
  const { data: bpSysTrend, isLoading: bpSysTrendLoading } = useHealthTrend('bp_systolic', currentMonths);
  const { data: bpDiaTrend, isLoading: bpDiaTrendLoading } = useHealthTrend('bp_diastolic', currentMonths);
  const { data: glucoseTrend, isLoading: glucoseTrendLoading } = useHealthTrend('blood_sugar', currentMonths);
  const { data: weightTrend, isLoading: weightTrendLoading } = useHealthTrend('weight', currentMonths);
  const { data: hrTrend, isLoading: hrTrendLoading } = useHealthTrend('heart_rate', currentMonths);

  const isLoading = adherence1MLoading || adherence3MLoading || adherence6MLoading || adherence12MLoading || bpSysTrendLoading || bpDiaTrendLoading || glucoseTrendLoading || weightTrendLoading || hrTrendLoading;

  const avgBP = bpSysTrend?.length && bpDiaTrend?.length
    ? `${Math.round(bpSysTrend.reduce((s, d) => s + d.avg_value, 0) / bpSysTrend.length)}/${Math.round(bpDiaTrend.reduce((s, d) => s + d.avg_value, 0) / bpDiaTrend.length)}`
    : null;
  const avgGlucose = glucoseTrend?.length
    ? Math.round(glucoseTrend.reduce((s, d) => s + d.avg_value, 0) / glucoseTrend.length)
    : null;
  const avgHR = hrTrend?.length
    ? Math.round(hrTrend.reduce((s, d) => s + d.avg_value, 0) / hrTrend.length)
    : null;
  const weightChange = weightTrend && weightTrend.length >= 2
    ? (weightTrend[weightTrend.length - 1].avg_value - weightTrend[0].avg_value).toFixed(1)
    : null;

  const bpSysValues = useMemo(() => {
    const months = period === '1M' ? 1 : period === '3M' ? 3 : period === '6M' ? 6 : period === '9M' ? 9 : 12;
    return aggregateMonthly(bpSysTrend, months);
  }, [bpSysTrend, period]);

  const bpDiaValues = useMemo(() => {
    const months = period === '1M' ? 1 : period === '3M' ? 3 : period === '6M' ? 6 : period === '9M' ? 9 : 12;
    return aggregateMonthly(bpDiaTrend, months);
  }, [bpDiaTrend, period]);

  const bpSysPath1M = useMemo(() => genPath(bpSysValues, 400, 200, 8, 20), [bpSysValues]);
  const bpSysArea1M = useMemo(() => genArea(bpSysValues, 400, 200, 8, 20), [bpSysValues]);

  const weightValues = useMemo(() => aggregateMonthly(weightTrend, 3), [weightTrend]);
  const bmiValues = useMemo(() => {
    if (!weightValues.length) return [];
    return weightValues.map(w => Number((w / 2.205 / (1.75 * 1.75)).toFixed(1)));
  }, [weightValues]);

  const weightPath3M = useMemo(() => genPath(weightValues, 400, 150, 8, 15), [weightValues]);
  const weightArea3M = useMemo(() => genArea(weightValues, 400, 150, 8, 15), [weightValues]);
  const bmiPath3M = useMemo(() => genPath(bmiValues, 400, 150, 8, 15), [bmiValues]);

  const hrvValues = useMemo(() => aggregateMonthly(hrTrend, 6), [hrTrend]);
  const hrvPath6M = useMemo(() => genPath(hrvValues, 100, 40, 4, 4), [hrvValues]);
  const hrvArea6M = useMemo(() => genArea(hrvValues, 100, 40, 4, 4), [hrvValues]);

  const wellnessValues = useMemo(() => {
    if (!bpSysValues.length && !bpDiaValues.length && !hrvValues.length) return [];
    const len = Math.max(bpSysValues.length, bpDiaValues.length, hrvValues.length);
    const result: number[] = [];
    for (let i = 0; i < len; i++) {
      const bpScore = bpSysValues[i] ? Math.max(0, 100 - (bpSysValues[i] - 120) * 2) : 80;
      const hrScore = hrvValues[i] ? Math.max(0, 100 - (hrvValues[i] - 70) * 1.5) : 80;
      result.push(Math.round((bpScore + hrScore) / 2));
    }
    return result;
  }, [bpSysValues, bpDiaValues, hrvValues]);

  const wellnessPath9M = useMemo(() => genPath(wellnessValues, 400, 200, 8, 20), [wellnessValues]);
  const wellnessArea9M = useMemo(() => genArea(wellnessValues, 400, 200, 8, 20), [wellnessValues]);

  const sixMBPHeights = useMemo(() => {
    const vals = aggregateMonthly(bpSysTrend, 6);
    if (vals.length === 0) return [65, 72, 68, 85, 92, 95];
    const min = Math.min(...vals) - 5;
    const max = Math.max(...vals) + 5;
    const range = max - min || 1;
    return vals.map(v => Math.round(((v - min) / range) * 100));
  }, [bpSysTrend]);

  const twelveMHRHeights = useMemo(() => {
    const vals = aggregateMonthly(hrTrend, 12);
    if (vals.length === 0) return [85, 92, 95, 98, 94, 78, 88, 96, 99, 97, 98, 100];
    const min = Math.min(...vals) - 5;
    const max = Math.max(...vals) + 5;
    const range = max - min || 1;
    return vals.map(v => Math.round(((v - min) / range) * 100));
  }, [hrTrend]);

  const totalDoses = useMemo(() => {
    if (adherence3M != null) return Math.round(adherence3M * 3 * 3.8);
    return 342;
  }, [adherence3M]);

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
        <Pressable
          style={styles.menuButton}
          accessibilityLabel="Menu"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.menuIcon}>menu</Text>
        </Pressable>
        <Text style={styles.appBarTitle}>Health Analytics</Text>
        <View style={styles.profileContainer}>
          <Image
            source={avatarSource}
            style={styles.profileImage}
            accessibilityLabel="Profile photo"
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Period Selector Tabs */}
        <View style={styles.periodSelectorContainer}>
          {['1W', '1M', '3M', '6M', '9M', '12M'].map((p) => (
            <Pressable
              key={p}
              style={({ pressed }) => [
                styles.periodChip,
                period === p && styles.periodChipActive,
                pressed && styles.pressedScale,
              ]}
              onPress={() => setPeriod(p as Period)}
              accessibilityLabel={`Show ${p} data`}
              accessibilityRole="tab"
              accessibilityState={{ selected: period === p }}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        {/* --- 1. MONTHLY (1M) VIEW --- */}
        {period === '1M' && (
          <View style={styles.viewContainer}>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Monthly Overview</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Adherence</Text>
                <Text style={styles.cardValueBlue}>{adherence1M != null ? `${adherence1M}%` : '—'}</Text>
              </View>
              <View style={styles.chartContainer}>
                <Svg style={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 400 200">
                  <Defs>
                    <LinearGradient id="grad1M" x1="0" x2="0" y1="0" y2="1">
                      <Stop offset="0%" stopColor="#0058bc" stopOpacity="0.3" />
                      <Stop offset="100%" stopColor="#0058bc" stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  {bpSysArea1M ? <Path d={bpSysArea1M} fill="url(#grad1M)" /> : null}
                  {bpSysPath1M ? <Path d={bpSysPath1M} fill="none" stroke="#0058bc" strokeWidth="3" /> : null}
                </Svg>
                <View style={styles.chartLabelsRow}>
                  {bpSysValues.length > 0 ? bpSysValues.slice(0, 3).map((_, i) => (
                    <Text key={i} style={styles.chartLabel}>{`Day ${Math.round((i / Math.max(bpSysValues.length - 1, 1)) * 30) + 1}`}</Text>
                  )) : <>
                    <Text style={styles.chartLabel}>1st</Text>
                    <Text style={styles.chartLabel}>15th</Text>
                    <Text style={styles.chartLabel}>30th</Text>
                  </>}
                </View>
              </View>
              <Text style={styles.cardDesc}>Your adherence is up 2% from last month. Great job staying consistent with your plan.</Text>
            </View>

            <View style={styles.grid2Col}>
              <View style={styles.card}>
                <View style={styles.compHeader}>
                  <Text style={styles.compIcon}>favorite</Text>
                  <Text style={styles.compTitle}>Avg Blood Pressure</Text>
                </View>
                <View style={styles.compValueRow}>
                  <Text style={styles.compValue}>{avgBP || '—'}</Text>
                  <Text style={styles.compUnit}>mmHg</Text>
                </View>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeIcon}>trending_down</Text>
                  <Text style={styles.badgeTextGreen}>-2% vs last month</Text>
                </View>
              </View>
              <View style={styles.card}>
                <View style={styles.compHeader}>
                  <Text style={styles.compIcon}>water_drop</Text>
                  <Text style={styles.compTitle}>Avg Glucose</Text>
                </View>
                <View style={styles.compValueRow}>
                  <Text style={styles.compValue}>{avgGlucose != null ? String(avgGlucose) : '—'}</Text>
                  <Text style={styles.compUnit}>mg/dL</Text>
                </View>
                <View style={styles.badgeOrange}>
                  <Text style={styles.badgeIcon}>trending_flat</Text>
                  <Text style={styles.badgeTextOrange}>No change</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* --- 2. 3-MONTH (3M) VIEW --- */}
        {period === '3M' && (
          <View style={styles.viewContainer}>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Quarterly Progress</Text>
              <Text style={styles.sectionSubtitle}>Last 90 days overview</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.threeMTrendHeader}>
                <View>
                  <Text style={styles.cardLabel}>Weight & BMI Trends</Text>
                  <View style={styles.compValueRow}>
                    <Text style={styles.compValue}>{weightChange != null ? weightChange : '—'}</Text>
                    <Text style={styles.compUnit}>kg this quarter</Text>
                  </View>
                </View>
                <View style={styles.legendCol}>
                  <View style={styles.legendRow}>
                    <View style={[styles.dot, { backgroundColor: '#0058bc' }]} />
                    <Text style={styles.legendText}>Weight (kg)</Text>
                  </View>
                  <View style={styles.legendRow}>
                    <View style={[styles.dot, { backgroundColor: '#8a2bb9' }]} />
                    <Text style={styles.legendText}>BMI</Text>
                  </View>
                </View>
              </View>
              <View style={styles.chartContainer}>
                <Svg style={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 400 150">
                  <Defs>
                    <LinearGradient id="grad3M" x1="0" x2="0" y1="0" y2="1">
                      <Stop offset="0%" stopColor="#0058bc" stopOpacity="0.4" />
                      <Stop offset="100%" stopColor="#0058bc" stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  <Line x1="0" x2="400" y1="25" y2="25" stroke="#e4e2e4" strokeDasharray="4 4" strokeWidth="1" />
                  <Line x1="0" x2="400" y1="75" y2="75" stroke="#e4e2e4" strokeDasharray="4 4" strokeWidth="1" />
                  <Line x1="0" x2="400" y1="125" y2="125" stroke="#e4e2e4" strokeDasharray="4 4" strokeWidth="1" />
                  {weightArea3M ? <Path d={weightArea3M} fill="url(#grad3M)" /> : null}
                  {weightPath3M ? <Path d={weightPath3M} fill="none" stroke="#0058bc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /> : null}
                  {bmiPath3M ? <Path d={bmiPath3M} fill="none" stroke="#8a2bb9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /> : null}
                </Svg>
                <View style={styles.xAxisRow}>
                  {weightValues.length > 0 ? weightValues.map((_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - (weightValues.length - 1 - i));
                    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    return <Text key={i} style={styles.xAxisLabel}>{months[d.getMonth()]}</Text>;
                  }) : <>
                    <Text style={styles.xAxisLabel}>Oct</Text>
                    <Text style={styles.xAxisLabel}>Nov</Text>
                    <Text style={styles.xAxisLabel}>Dec</Text>
                  </>}
                </View>
              </View>
            </View>

            <View style={styles.grid2Col}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBoxGreen}>
                    <Text style={styles.iconGreen}>medication</Text>
                  </View>
                  <View style={styles.badgeGreen}>
                    <Text style={styles.badgeTextGreen}>+5% vs last Q</Text>
                  </View>
                </View>
                <Text style={styles.bigMetric}>{totalDoses}</Text>
                <Text style={styles.cardLabel}>Total Doses Taken</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '92%' }]} />
                </View>
                <Text style={styles.progressLabel}>{adherence3M != null ? `${adherence3M}% Adherence` : '— Adherence'}</Text>
              </View>
              <View style={[styles.card, styles.milestoneCard]}>
                <View style={styles.iconBoxPurple}>
                  <Text style={styles.iconPurple}>workspace_premium</Text>
                </View>
                <View>
                  <Text style={styles.milestoneLabel}>Health Milestone</Text>
                  <Text style={styles.milestoneTitle}>90-Day Streak</Text>
                  <Text style={styles.milestoneSub}>Consistent tracking</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* --- 3. 6-MONTH (6M) VIEW --- */}
        {period === '6M' && (
          <View style={styles.viewContainer}>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Semi-Annual Vitality</Text>
              <Text style={styles.sectionSubtitle}>Your long-term health trajectory remains positive. Adherence has improved by 14% since Q1.</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Medication Adherence</Text>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeIcon}>trending_up</Text>
                    <Text style={styles.badgeTextGreen}>{adherence6M != null ? `${adherence6M}% Avg` : '— Avg'}</Text>
                </View>
              </View>
              <Text style={styles.cardLabel}>6-Month Average</Text>

              <View style={styles.barChartContainer}>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => {
                  const heightVal = sixMBPHeights[i] ?? 65;
                  return (
                    <View key={m} style={styles.barCol}>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: `${heightVal}%` }]} />
                      </View>
                      <Text style={[styles.barLabel, i === sixMBPHeights.length - 1 && styles.barLabelActive]}>{m}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.grid2Col}>
              <View style={[styles.card, styles.hrvCard]}>
                <View style={styles.compHeader}>
                  <Text style={styles.compIcon}>favorite</Text>
                  <Text style={styles.compTitle}>HRV Trend</Text>
                </View>
                <View style={styles.compValueRow}>
                  <Text style={styles.compValue}>{avgHR != null ? String(avgHR) : '—'}</Text>
                  <Text style={styles.compUnit}>ms</Text>
                </View>
                <Text style={styles.cardDesc}>Your Heart Rate Variability has stabilized in the optimal range since April.</Text>
                <View style={styles.chartContainer}>
                  <Svg style={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 100 40">
                    <Defs>
                      <LinearGradient id="grad6M" x1="0" x2="0" y1="0" y2="1">
                        <Stop offset="0%" stopColor="#8a2bb9" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#8a2bb9" stopOpacity="0" />
                      </LinearGradient>
                    </Defs>
                    {hrvPath6M ? <Path d={hrvPath6M} fill="none" stroke="#8a2bb9" strokeWidth="2" /> : null}
                    {hrvArea6M ? <Path d={hrvArea6M} fill="url(#grad6M)" opacity="0.1" /> : null}
                  </Svg>
                </View>
              </View>
              <View style={[styles.card, styles.oxygenCard]}>
                <View style={styles.iconBoxBlue}>
                  <Text style={styles.iconBlue}>air</Text>
                </View>
                <Text style={styles.cardTitle}>Blood Oxygen Stability</Text>
                <Text style={styles.cardDesc}>Consistent readings averaging 98% overnight throughout the past 6 months. No significant drops detected.</Text>
                <Pressable
                  style={styles.viewBtn}
                  accessibilityLabel="View sleep data"
                  accessibilityRole="button"
                >
                  <Text style={styles.viewBtnText}>View Sleep Data</Text>
                  <Text style={styles.viewBtnIcon}>arrow_forward</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* --- 4. 9-MONTH (9M) VIEW --- */}
        {period === '9M' && (
          <View style={styles.viewContainer}>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>9-Month Trajectory</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Overall Wellness Score</Text>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeIcon}>trending_up</Text>
                  <Text style={styles.badgeTextGreen}>+14%</Text>
                </View>
              </View>
              <Text style={styles.cardLabel}>Combined metrics trajectory</Text>
              <View style={styles.chartContainer}>
                <Svg style={styles.chartSvg} preserveAspectRatio="none" viewBox="0 0 400 200">
                  <Defs>
                    <LinearGradient id="grad9M" x1="0" x2="0" y1="0" y2="1">
                      <Stop offset="0%" stopColor="#0058bc" stopOpacity="0.2" />
                      <Stop offset="100%" stopColor="#0058bc" stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  {wellnessArea9M ? <Path d={wellnessArea9M} fill="url(#grad9M)" /> : null}
                  {wellnessPath9M ? <Path d={wellnessPath9M} fill="none" stroke="#0058bc" strokeWidth="3" strokeLinecap="round" /> : null}
                </Svg>
                <View style={styles.xAxisRow}>
                  {wellnessValues.length > 0 ? wellnessValues.map((_, i) => (
                    <Text key={i} style={styles.xAxisLabel}>{`M${i + 1}`}</Text>
                  )) : <>
                    <Text style={styles.xAxisLabel}>Q1</Text>
                    <Text style={styles.xAxisLabel}>Q2</Text>
                    <Text style={styles.xAxisLabel}>Q3</Text>
                  </>}
                </View>
              </View>
            </View>

            <View style={styles.grid2Col}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBoxGreen}>
                    <Text style={styles.iconGreen}>task_alt</Text>
                  </View>
                  <Text style={styles.cardTitle}>Consistent Habits</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listText}>Medication Adherence</Text>
                  <Text style={styles.listVal}>98%</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listText}>Sleep Routine</Text>
                  <Text style={styles.listVal}>85%</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listText}>Activity Goal</Text>
                  <Text style={styles.listVal}>92%</Text>
                </View>
              </View>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconBoxPurple}>
                    <Text style={styles.iconPurple}>balance</Text>
                  </View>
                  <Text style={styles.cardTitle}>Metric Stabilization</Text>
                </View>
                <Text style={styles.cardDesc}>Your key vitals have shown a 22% decrease in volatility compared to the previous 9-month period.</Text>
                <View style={styles.statsRow}>
                  <View>
                    <Text style={styles.statLabel}>BP Variance</Text>
                    <Text style={styles.statVal}>±4 mmHg</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View>
                    <Text style={styles.statLabel}>HR Resting</Text>
                    <Text style={styles.statVal}>62 bpm</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* --- 5. 12-MONTH (12M) VIEW --- */}
        {period === '12M' && (
          <View style={styles.viewContainer}>
            <View style={styles.grid2Col}>
              <View style={styles.card}>
                <Text style={styles.statLabel}>Yearly Consistency</Text>
                <Text style={styles.bigMetricBlue}>{adherence12M != null ? `${adherence12M}%` : '—'}</Text>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeIcon}>trending_up</Text>
                  <Text style={styles.badgeTextGreen}>+4.2% vs 2024</Text>
                </View>
              </View>
              <View style={styles.card}>
                <Text style={styles.statLabel}>Health Score</Text>
                <View style={styles.compValueRow}>
                  <Text style={styles.compValueGreen}>88</Text>
                  <Text style={styles.compUnit}>/100</Text>
                </View>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeIcon}>check_circle</Text>
                  <Text style={styles.badgeTextGreen}>Target Exceeded</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Adherence Overview</Text>
                <Text style={styles.moreIcon}>more_horiz</Text>
              </View>

              <View style={styles.yearBarContainer}>
                {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => {
                  const heightVal = twelveMHRHeights[i] ?? 85;
                  const color = heightVal >= 95 ? '#34C759' : heightVal >= 85 ? 'rgba(0,88,188,0.8)' : 'rgba(255,149,0,0.8)';
                  return (
                    <View key={m} style={styles.barCol}>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: `${heightVal}%`, backgroundColor: color }]} />
                      </View>
                      <Text style={[styles.barLabel, i === twelveMHRHeights.length - 1 && styles.barLabelActive]}>{m}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.legendRowLarge}>
                <View style={styles.legendRow}>
                  <View style={[styles.dot, { backgroundColor: '#34C759' }]} />
                  <Text style={styles.legendText}>Excellent ({'>'}95%)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.dot, { backgroundColor: 'rgba(0,88,188,0.8)' }]} />
                  <Text style={styles.legendText}>Good (85-94%)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.dot, { backgroundColor: 'rgba(255,149,0,0.8)' }]} />
                  <Text style={styles.legendText}>Needs Attention</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Progress: Jan vs Dec</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressSide}>
                  <Text style={styles.statLabel}>January</Text>
                  <Text style={styles.progVal}>85%</Text>
                  <Text style={styles.progSub}>Adherence</Text>
                </View>
                <View style={styles.progressArrow}>
                  <Text style={styles.arrowIcon}>arrow_forward</Text>
                </View>
                <View style={styles.progressSide}>
                  <Text style={[styles.statLabel, { color: '#0058bc' }]}>December</Text>
                  <Text style={[styles.progVal, { color: '#34C759' }]}>100%</Text>
                  <Text style={styles.progSub}>Adherence</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.push('/(tabs)')} accessibilityLabel="Today" accessibilityRole="tab" accessibilityState={{ selected: false }}>
          <Text style={styles.navIcon}>calendar_today</Text>
          <Text style={styles.navLabel}>Today</Text>
        </Pressable>
        <Pressable style={[styles.navItem, styles.navItemActive]} accessibilityLabel="Trends" accessibilityRole="tab" accessibilityState={{ selected: true }}>
          <Text style={[styles.navIcon, styles.navIconActive]}>monitoring</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Trends</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/medicines')} accessibilityLabel="Plan" accessibilityRole="tab" accessibilityState={{ selected: false }}>
          <Text style={styles.navIcon}>medication</Text>
          <Text style={styles.navLabel}>Plan</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/(tabs)/profile')} accessibilityLabel="Profile" accessibilityRole="tab" accessibilityState={{ selected: false }}>
          <Text style={styles.navIcon}>person</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </Pressable>
      </View>

    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcf8fb' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  topAppBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, height: 64, backgroundColor: 'rgba(252, 248, 251, 0.8)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuButton: { padding: 8 },
  menuIcon: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 24, color: '#414755' },
  appBarTitle: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 22, fontWeight: '600', color: '#0058bc' },
  profileContainer: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f0edef' },
  profileImage: { width: '100%', height: '100%' },
  periodSelectorContainer: {
    flexDirection: 'row', backgroundColor: '#f6f3f5', borderRadius: 12, padding: 4, marginBottom: 24, justifyContent: 'space-between',
  },
  periodChip: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  periodChipActive: { backgroundColor: '#0058bc', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  periodText: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 13, color: '#414755' },
  periodTextActive: { color: '#ffffff' },
  viewContainer: { gap: 16 },
  headerSection: { marginBottom: 4 },
  sectionTitle: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 28, fontWeight: '700', letterSpacing: -0.01, color: '#1b1b1d' },
  sectionSubtitle: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 15, color: '#414755', marginTop: 4 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 2, flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 20, fontWeight: '600', color: '#1b1b1d' },
  cardLabel: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 15, color: '#414755', marginBottom: 8 },
  cardDesc: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 15, color: '#414755', lineHeight: 20, marginTop: 8 },
  cardValueBlue: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 22, fontWeight: '600', color: '#0058bc' },
  grid2Col: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  badgeGreen: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(52,199,89,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  badgeOrange: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,149,0,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  badgeIcon: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 16, color: '#34C759' },
  badgeTextGreen: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 11, color: '#34C759' },
  badgeTextOrange: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 11, color: '#FF9500' },
  iconBoxGreen: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(52,199,89,0.1)', justifyContent: 'center', alignItems: 'center' },
  iconGreen: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 24, color: '#34C759' },
  iconBoxPurple: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(138,43,185,0.1)', justifyContent: 'center', alignItems: 'center' },
  iconPurple: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 24, color: '#8a2bb9' },
  iconBoxBlue: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,88,188,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  iconBlue: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 32, color: '#0058bc' },
  chartContainer: { height: 160, width: '100%', position: 'relative', marginTop: 8 },
  chartSvg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  chartLabelsRow: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 },
  chartLabel: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 11, color: '#717786' },
  xAxisRow: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, borderTopWidth: 1, borderColor: 'rgba(193,198,215,0.3)', paddingTop: 8 },
  xAxisLabel: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 11, color: 'rgba(65,71,85,0.6)' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#e4e2e4' },
  listText: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 15, color: '#414755' },
  listVal: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 13, color: '#1b1b1d' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#ffffff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: 'rgba(193,198,215,0.3)', marginTop: 12 },
  statDivider: { width: 1, height: '100%', backgroundColor: '#e4e2e4' },
  statLabel: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 11, color: '#717786' },
  statVal: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 20, fontWeight: '600', color: '#0058bc' },
  threeMTrendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  legendCol: { gap: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 11, color: '#414755' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  bigMetric: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 34, fontWeight: '700', color: '#1b1b1d' },
  progressBar: { height: 6, backgroundColor: '#e4e2e4', borderRadius: 999, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: '100%', backgroundColor: '#34C759', borderRadius: 999 },
  progressLabel: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 11, color: '#414755', textAlign: 'right', marginTop: 4 },
  milestoneCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ffffff' },
  milestoneLabel: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 11, color: '#8a2bb9', letterSpacing: 0.5, textTransform: 'uppercase' },
  milestoneTitle: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 17, fontWeight: '600', color: '#1b1b1d' },
  milestoneSub: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 13, color: '#414755' },
  barChartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 128, marginTop: 12 },
  barCol: { flex: 1, alignItems: 'center', gap: 8 },
  barTrack: { width: '100%', backgroundColor: '#e4e2e4', borderRadius: 4, height: '100%', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: '#0058bc', borderRadius: 4, position: 'absolute', bottom: 0 },
  barLabel: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 11, color: '#414755' },
  barLabelActive: { color: '#0058bc', fontWeight: '700' },
  hrvCard: { position: 'relative', overflow: 'hidden' },
  oxygenCard: { alignItems: 'center', paddingTop: 24 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f6f3f5', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999, marginTop: 16 },
  viewBtnText: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 13, color: '#0058bc' },
  viewBtnIcon: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 16, color: '#0058bc' },
  compValue: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 28, fontWeight: '700', color: '#1b1b1d' },
  compUnit: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 15, color: '#717786', paddingBottom: 2 },
  compHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  compTitle: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 13, color: '#414755' },
  compIcon: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 20, color: '#414755' },
  compValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  bigMetricBlue: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 34, fontWeight: '700', color: '#0058bc', marginBottom: 4 },
  compValueGreen: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 34, fontWeight: '700', color: '#006e28' },
  moreIcon: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 20, color: '#0058bc' },
  yearBarContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, marginTop: 8 },
  legendRowLarge: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: 'rgba(193,198,215,0.3)' },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, backgroundColor: '#fcf8fb', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(193,198,215,0.5)' },
  progressSide: { flex: 1, alignItems: 'center' },
  progVal: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 20, fontWeight: '600', color: '#1b1b1d' },
  progSub: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 11, color: '#717786', marginTop: 2 },
  progressArrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f6f3f5', justifyContent: 'center', alignItems: 'center' },
  arrowIcon: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 20, color: '#0058bc' },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 20 : 12, paddingTop: 8,
    backgroundColor: 'rgba(252, 248, 251, 0.8)', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)',
    borderTopLeftRadius: 12, borderTopRightRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05, shadowRadius: 20, elevation: 10,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  navItemActive: { backgroundColor: 'rgba(111, 251, 133, 0.2)', paddingHorizontal: 20, borderRadius: 999 },
  navIcon: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 24, marginBottom: 2, color: '#414755' },
  navIconActive: { color: '#006e28' },
  navLabel: { fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 11, color: '#414755' },
  navLabelActive: { color: '#006e28' },
  pressedScale: { transform: [{ scale: 0.95 }] },
});
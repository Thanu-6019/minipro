import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Platform,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMedicine } from '@/features/medicines/hooks/useMedicine';
import { useDeleteMedicine } from '@/features/medicines/hooks/useDeleteMedicine';
import { useUpcomingReminders } from '@/features/reminders/hooks/useReminders';

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function getExpiryLabel(endDate?: string): string {
  if (!endDate) return '—';
  const d = new Date(endDate);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function MedicineDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: medicine, isLoading, error } = useMedicine(id || '');
  const deleteMedicine = useDeleteMedicine();
  const { data: reminders = [] } = useUpcomingReminders();

  const [usageOpen, setUsageOpen] = useState(false);
  const [sideEffectsOpen, setSideEffectsOpen] = useState(false);

  const usageRotate = useMemo(() => new Animated.Value(0), []);
  const sideEffectsRotate = useMemo(() => new Animated.Value(0), []);

  const toggleAccordion = (
    isOpen: boolean,
    setOpen: (val: boolean) => void,
    animValue: Animated.Value
  ) => {
    setOpen(!isOpen);
    Animated.timing(animValue, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const getRotateInterpolation = (animValue: Animated.Value) =>
    animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0058bc" />
      </View>
    );
  }

  if (error || !medicine) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }]}>
        <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif', fontSize: 16, color: '#414755', textAlign: 'center' }}>
          Failed to load medicine details.
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium', fontSize: 15, color: '#0058bc' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const expiryLabel = getExpiryLabel(medicine.endDate);
  const isExpired = medicine.endDate ? new Date(medicine.endDate) < new Date() : false;
  const medReminders = reminders.filter((r) => (r as any).schedules?.medicine_id === medicine.id);

  return (
    <View style={styles.container}>
      {/* Decorative top background gradient */}
      <View style={styles.decorativeBg} />

      {/* Top Navigation */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topNav}>
          <Pressable style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.icon}>arrow_back</Text>
          </Pressable>
          <Text style={styles.navTitle}>{medicine.name}</Text>
          <Pressable style={styles.iconButton} onPress={() => router.push(`/medicines/edit?id=${medicine.id}`)} accessibilityLabel="Edit medicine" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.icon, styles.primaryIcon]}>edit</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroImageContainer}>
              <Text style={styles.heroIcon}>pill</Text>
              <View style={styles.heroCheckContainer}>
                <Text style={styles.heroCheckIcon}>check</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{medicine.name}</Text>
            <Text style={styles.heroSubtitle}>{medicine.dosage}{medicine.frequency ? ` • ${medicine.frequency}` : ''}</Text>

            <View style={styles.tagContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Medicine</Text>
              </View>
              <View style={[styles.tag, styles.tagActive]}>
                <Text style={styles.tagIconSmall}>schedule</Text>
                <Text style={styles.tagTextActive}>{medicine.frequency || 'As prescribed'}</Text>
              </View>
              {medicine.instructions && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{medicine.instructions}</Text>
                </View>
              )}
            </View>
          </View>

          {/* 2. Bento Grid (Stats) */}
          <View style={styles.bentoGrid}>
            {/* Supply Left */}
            <View style={[styles.card, styles.bentoCard]}>
              <View style={styles.cardDecorativeBlob1} />
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>Supply Left</Text>
                <Text style={styles.cardIcon}>inventory_2</Text>
              </View>
              <View style={styles.cardValueRow}>
                <Text style={styles.cardValue}>14</Text>
                <Text style={styles.cardUnit}>pills</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: '45%' }]} />
              </View>
              <Text style={styles.progressWarning}>Refill needed soon</Text>
            </View>

            {/* Expiry Card */}
            <View style={[styles.card, styles.bentoCard]}>
              <View style={styles.cardDecorativeBlob2} />
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>Expires</Text>
                <Text style={[styles.cardIcon, styles.tertiaryIcon]}>calendar_today</Text>
              </View>
              <View style={styles.cardValueRow}>
                <Text style={styles.cardValueMedium}>{expiryLabel}</Text>
              </View>
              <View style={styles.cardStatusRow}>
                <Text style={styles.cardStatusIcon}>{isExpired ? 'error' : 'check_circle'}</Text>
                <Text style={[styles.cardStatusText, isExpired && { color: '#ba1a1a' }]}>{isExpired ? 'Expired' : 'Valid'}</Text>
              </View>
            </View>
          </View>

          {/* 3. Schedule Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Schedule</Text>
            <Pressable accessibilityLabel="View calendar" accessibilityRole="button">
              <Text style={styles.sectionAction}>View Calendar</Text>
            </Pressable>
          </View>

          <View style={styles.scheduleContainer}>
            {medReminders.length > 0 ? medReminders.slice(0, 3).map((reminder, idx) => {
              const isTaken = reminder.status === 'taken';
              const isSkipped = reminder.status === 'skipped';
              const isPending = reminder.status === 'pending';
              return (
                <View
                  key={reminder.id}
                  style={[
                    styles.scheduleItem,
                    isTaken && styles.scheduleItemTaken,
                    idx === 1 && !isTaken && styles.scheduleItemUpcoming,
                    idx === 2 && styles.scheduleItemPending,
                  ]}
                >
                  <View
                    style={[
                      styles.scheduleIconContainerTaken,
                      isTaken && styles.scheduleIconContainerTaken,
                      !isTaken && idx === 1 && styles.scheduleIconContainerUpcoming,
                      isPending && idx >= 2 && styles.scheduleIconContainerPending,
                    ]}
                  >
                    <Text style={styles.scheduleIconText}>
                      {isTaken ? 'check' : isSkipped ? 'remove' : idx === 1 ? 'notifications_active' : 'schedule'}
                    </Text>
                  </View>
                  <View style={styles.scheduleTextContainer}>
                    <Text
                      style={[
                        styles.scheduleTime,
                        isTaken && styles.scheduleTimeTaken,
                        !isTaken && idx === 1 && styles.scheduleTimeUpcoming,
                      ]}
                    >
                      {formatTime(reminder.fire_time)}
                    </Text>
                    <Text
                      style={[
                        styles.scheduleDesc,
                        isTaken && styles.scheduleDescTaken,
                        !isTaken && idx === 1 && styles.scheduleDescUpcoming,
                      ]}
                    >
                      {isTaken ? 'Taken' : isSkipped ? 'Skipped' : idx === 0 ? 'Morning Dose' : idx === 1 ? 'Afternoon Dose' : 'Evening Dose'}
                    </Text>
                  </View>
                  {isTaken && (
                    <View style={styles.scheduleBadge}>
                      <Text style={styles.scheduleBadgeText}>Taken</Text>
                    </View>
                  )}
                  {!isTaken && idx === 1 && (
                    <Pressable style={styles.scheduleMoreButton} accessibilityLabel="More options" accessibilityRole="button">
                      <Text style={styles.scheduleMoreIcon}>more_vert</Text>
                    </Pressable>
                  )}
                </View>
              );
            }) : (
              <View style={[styles.scheduleItem, styles.scheduleItemPending]}>
                <View style={styles.scheduleIconContainerPending}>
                  <Text style={styles.scheduleIconText}>schedule</Text>
                </View>
                <View style={styles.scheduleTextContainer}>
                  <Text style={styles.scheduleTime}>No scheduled doses</Text>
                  <Text style={styles.scheduleDesc}>Set up a schedule for this medicine</Text>
                </View>
              </View>
            )}
          </View>

          {/* 4. Information Accordions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Information</Text>
          </View>

          {/* Usage Instructions */}
          <View style={styles.accordionContainer}>
            <Pressable
              style={styles.accordionHeader}
              onPress={() => toggleAccordion(usageOpen, setUsageOpen, usageRotate)}
              accessibilityLabel="Usage instructions"
              accessibilityRole="button"
              accessibilityState={{ expanded: usageOpen }}
            >
              <View style={styles.accordionLeft}>
                <Text style={[styles.accordionIcon, styles.tertiaryIcon]}>medical_information</Text>
                <Text style={styles.accordionTitle}>Usage Instructions</Text>
              </View>
              <Animated.View style={{ transform: [{ rotate: getRotateInterpolation(usageRotate) }] }}>
                <Text style={styles.accordionChevron}>expand_more</Text>
              </Animated.View>
            </Pressable>
            {usageOpen && (
              <View style={styles.accordionBody}>
                <Text style={styles.accordionBodyText}>
                  {medicine.instructions || 'No specific instructions provided. Follow your doctor\'s guidance for dosage and administration.'}
                </Text>
              </View>
            )}
          </View>

          {/* Side Effects */}
          <View style={styles.accordionContainer}>
            <Pressable
              style={styles.accordionHeader}
              onPress={() => toggleAccordion(sideEffectsOpen, setSideEffectsOpen, sideEffectsRotate)}
              accessibilityLabel="Side effects"
              accessibilityRole="button"
              accessibilityState={{ expanded: sideEffectsOpen }}
            >
              <View style={styles.accordionLeft}>
                <Text style={[styles.accordionIcon, { color: '#FF9500' }]}>warning</Text>
                <Text style={styles.accordionTitle}>Side Effects</Text>
              </View>
              <Animated.View style={{ transform: [{ rotate: getRotateInterpolation(sideEffectsRotate) }] }}>
                <Text style={styles.accordionChevron}>expand_more</Text>
              </Animated.View>
            </Pressable>
            {sideEffectsOpen && (
              <View style={styles.accordionBody}>
                <Text style={styles.accordionBodyText}>
                  Nausea, vomiting, or diarrhea may occur. If any of these effects last or get worse, tell your doctor or pharmacist promptly.
                </Text>
                <Pressable style={styles.accordionLinkContainer} accessibilityLabel="Read full FDA report" accessibilityRole="button">
                  <Text style={styles.accordionLinkText}>Read full FDA report</Text>
                  <Text style={styles.accordionLinkIcon}>open_in_new</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Padding for bottom action bar */}
          <View style={{ height: 100 }} />

        </ScrollView>

        {/* 5. Fixed Action Bar */}
        <View style={styles.bottomActionBar}>
          <Pressable style={({ pressed }) => [styles.actionButtonDanger, pressed && styles.pressedScale]} onPress={() => {
            Alert.alert('Delete Medicine', `Are you sure you want to delete ${medicine?.name}?`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete', style: 'destructive', onPress: () => {
                  if (medicine) {
                    deleteMedicine.mutate(medicine.id, { onSuccess: () => router.back() });
                  }
                }
              },
            ]);
          }} accessibilityLabel="Delete medicine" accessibilityRole="button">
            <Text style={styles.actionIconDanger}>delete</Text>
            <Text style={styles.actionTextDanger}>Delete</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionButtonPrimary, pressed && styles.pressedScale]} onPress={() => router.push(`/medicines/edit?id=${medicine?.id}`)} accessibilityLabel="Edit medicine" accessibilityRole="button">
            <Text style={styles.actionIconPrimary}>edit</Text>
            <Text style={styles.actionTextPrimary}>Edit</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8fb', // background
  },
  decorativeBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 256, // h-64
    backgroundColor: 'rgba(0, 88, 188, 0.05)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20, // margin-mobile
    paddingBottom: 20,
  },

  // --- Top Nav ---
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  icon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#414755', // on-surface-variant
  },
  primaryIcon: {
    color: '#0058bc',
  },
  navTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    fontWeight: '600',
    color: '#1b1b1d',
  },

  // --- Hero ---
  heroSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  heroImageContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
    position: 'relative',
  },
  heroIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 64,
    color: '#0058bc',
  },
  heroCheckContainer: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759', // status-taken
    borderWidth: 4,
    borderColor: '#fcf8fb', // surface
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCheckIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#ffffff',
  },
  heroTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.01,
    color: '#1b1b1d',
    marginTop: 16,
  },
  heroSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 17,
    color: '#414755',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#eae7ea', // surface-container-high
    borderRadius: 999,
  },
  tagActive: {
    backgroundColor: 'rgba(0, 88, 188, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
  },
  tagTextActive: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#0058bc',
  },
  tagIconSmall: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 16,
    color: '#0058bc',
    marginRight: 4,
  },

  // --- Bento Grid ---
  bentoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  bentoCard: {
    gap: 8,
  },
  cardDecorativeBlob1: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 96,
    height: 96,
    backgroundColor: 'rgba(0, 88, 188, 0.05)',
    borderBottomLeftRadius: 96,
  },
  cardDecorativeBlob2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 96,
    height: 96,
    backgroundColor: 'rgba(138, 43, 185, 0.05)',
    borderBottomLeftRadius: 96,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#0058bc',
  },
  tertiaryIcon: {
    color: '#8a2bb9',
  },
  cardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  cardValue: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#1b1b1d',
  },
  cardValueMedium: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  cardUnit: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0edef', // surface-container
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF9500', // status-pending
    borderRadius: 999,
  },
  progressWarning: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 11,
    color: '#FF9500',
    marginTop: 4,
  },
  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 'auto',
  },
  cardStatusIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 16,
    color: '#34C759',
  },
  cardStatusText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#34C759',
  },

  // --- Schedule ---
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
  sectionAction: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#0058bc',
  },
  scheduleContainer: {
    backgroundColor: '#f6f3f5', // surface-container-low
    borderRadius: 12,
    padding: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.2)',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff', // surface
    borderRadius: 8,
    marginBottom: 8,
    gap: 16,
  },
  scheduleItemTaken: {
    opacity: 0.6,
  },
  scheduleItemUpcoming: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 88, 188, 0.1)',
  },
  scheduleItemPending: {
    marginBottom: 0,
  },
  scheduleIconContainerTaken: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleIconContainerUpcoming: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0070eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleIconContainerPending: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#717786',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleIconText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#ffffff',
  },
  scheduleTextContainer: {
    flex: 1,
  },
  scheduleTime: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 17,
    color: '#1b1b1d',
  },
  scheduleTimeTaken: {
    textDecorationLine: 'line-through',
  },
  scheduleTimeUpcoming: {
    fontWeight: '600',
  },
  scheduleDesc: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },
  scheduleDescTaken: {
    textDecorationLine: 'line-through',
  },
  scheduleDescUpcoming: {
    color: '#0058bc',
  },
  scheduleBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  scheduleBadgeText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#34C759',
  },
  scheduleMoreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eae7ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleMoreIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#1b1b1d',
  },

  // --- Accordions ---
  accordionContainer: {
    backgroundColor: '#f6f3f5', // surface-container-low
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.2)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accordionIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
  },
  accordionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 17,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  accordionChevron: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#414755',
  },
  accordionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(193, 198, 215, 0.1)',
  },
  accordionBodyText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
    marginTop: 12,
    lineHeight: 20,
  },
  accordionLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  accordionLinkText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#0058bc',
  },
  accordionLinkIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 16,
    color: '#0058bc',
  },

  // --- Action Bar ---
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(252, 248, 251, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(193, 198, 215, 0.2)',
    gap: 12,
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: '#eae7ea', // surface-container-high
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonPrimary: {
    flex: 2,
    backgroundColor: '#0058bc',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  pressedScale: {
    transform: [{ scale: 0.95 }],
  },
  actionIconSecondary: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#1b1b1d',
  },
  actionTextSecondary: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#1b1b1d',
  },
  actionIconPrimary: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#ffffff',
  },
  actionTextPrimary: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#ffffff',
  },
  actionButtonDanger: {
    flex: 1,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  actionIconDanger: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 20,
    color: '#FF3B30',
  },
  actionTextDanger: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#FF3B30',
  },
});
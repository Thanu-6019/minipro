import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function MedicationConfirmation() {
  const router = useRouter();
  const { name, dosage, frequency } = useLocalSearchParams<{
    name: string;
    dosage: string;
    frequency: string;
  }>();

  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);
  const opacityAnim = useMemo(() => new Animated.Value(0), []);
  const translateYAnim = useMemo(() => new Animated.Value(20), []);
  const cardOpacity = useMemo(() => new Animated.Value(0), []);
  const cardTranslate = useMemo(() => new Animated.Value(20), []);

  useEffect(() => {
    const anim1 = Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]);
    anim1.start();

    const anim2 = Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(cardTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(translateYAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]);
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, [scaleAnim, opacityAnim, translateYAnim, cardOpacity, cardTranslate]);

  const displayName = name || 'Medication';
  const displayDosage = dosage || '';
  const displayFrequency = frequency || 'As prescribed';

  return (
    <View style={styles.container}>
      {/* Decorative Background Blobs */}
      <View style={styles.backgroundContainer}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentWrapper}>

          {/* Success Animation/Icon */}
          <Animated.View
            style={[
              styles.successSection,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <View style={styles.checkmarkCircle}>
              <Text style={styles.checkmarkIcon}>check_circle</Text>
            </View>
            <Text style={styles.successTitle}>Medication Added</Text>
            <Text style={styles.successSubtitle}>
              Your schedule has been successfully updated. We&apos;ll remind you when it&apos;s time.
            </Text>
          </Animated.View>

          {/* Summary Card */}
          <Animated.View
            style={[
              styles.summaryCard,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslate }],
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.pillIconContainer}>
                <Text style={styles.pillIcon}>pill</Text>
              </View>
              <View style={styles.medInfoContainer}>
                <Text style={styles.medName}>{displayName}</Text>
                <Text style={styles.medDetails}>{displayDosage}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Frequency</Text>
                <Text style={styles.detailValue}>{displayFrequency}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>7 Days</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Dose</Text>
                <Text style={[styles.detailValue, styles.nextDoseText]}>Today, 2:00 PM</Text>
              </View>
            </View>
          </Animated.View>

          {/* Actions */}
          <Animated.View
            style={[
              styles.actionsContainer,
              {
                transform: [{ translateY: translateYAnim }],
                opacity: cardOpacity, // reuse card opacity for fade in
              }
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.replace('/(tabs)')}
              accessibilityLabel="Go to dashboard"
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                Go to Dashboard <Text style={styles.arrowIcon}>arrow_forward</Text>
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.replace('/medicines/add')}
              accessibilityLabel="Add another medicine"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>
                <Text style={styles.addIcon}>add</Text> Add Another
              </Text>
            </Pressable>
          </Animated.View>

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

  // --- Background Elements ---
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  },
  blob1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '70%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#d8e2ff', // primary-fixed
    opacity: 0.4,
  },
  blob2: {
    position: 'absolute',
    top: '40%',
    left: '-20%',
    width: '60%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#53e16f', // secondary-fixed-dim
    opacity: 0.2,
  },

  // --- Main Content ---
  safeArea: {
    flex: 1,
    zIndex: 10,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20, // margin-mobile
    paddingTop: 64,
    paddingBottom: 20,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },

  // --- Success Header ---
  successSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  checkmarkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#6ffb85', // secondary-container
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#6ffb85',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  checkmarkIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 48,
    color: '#00732a', // on-secondary-container
  },
  successTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.01,
    color: '#1b1b1d', // on-surface
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 17,
    lineHeight: 22,
    color: '#414755', // on-surface-variant
    textAlign: 'center',
    maxWidth: 280,
  },

  // --- Summary Card ---
  summaryCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 40,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  pillIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eae7ea', // surface-container-high
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#0058bc', // primary
  },
  medInfoContainer: {
    flex: 1,
  },
  medName: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '600',
    color: '#1b1b1d',
    marginBottom: 4,
  },
  medDetails: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#c1c6d7', // outline-variant
    opacity: 0.3,
    marginVertical: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#717786', // outline
  },
  detailValue: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#1b1b1d',
    fontWeight: '500',
  },
  nextDoseText: {
    color: '#0058bc', // primary
    fontWeight: '600',
  },

  // --- Actions ---
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginTop: 'auto',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#0058bc', // primary
    paddingVertical: 16,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#eae7ea', // surface-container-high
    paddingVertical: 16,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  primaryButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#ffffff',
  },
  arrowIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 18,
  },
  secondaryButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#1b1b1d',
  },
  addIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 18,
  },
});
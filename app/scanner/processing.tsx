import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { prescriptionPipeline } from '../../src/features/scanner/prescription.pipeline';

const TITLES = [
  'Uploading image',
  'Reading prescription',
  'Analyzing details',
  'Verifying medicine',
  'Saving to your meds',
];
const DESCRIPTIONS = [
  'Securely uploading your scan...',
  'Extracting text via OCR...',
  'AI is parsing medicine info...',
  'Checking FDA database...',
  'Adding to your medication list...',
];
const PROGRESS_STEPS = [15, 35, 60, 80, 95];

export default function ScanningPrescription() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  const scanAnim = useMemo(() => new Animated.Value(0), []);
  const pulseAnim1 = useMemo(() => new Animated.Value(0), []);
  const pulseAnim2 = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim1, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim1, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim2, { toValue: 1, duration: 2000, delay: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim2, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
    }, [scanAnim, pulseAnim1, pulseAnim2]);

  useEffect(() => {
    if (!imageUri) {
      Alert.alert('Error', 'No image provided. Please go back and try again.');
      return;
    }

    let cancelled = false;

    const runPipeline = async () => {
      try {
        const stageResult = await prescriptionPipeline.processImage(imageUri);
        if (cancelled) return;

        if (stageResult.success) {
          setStepIndex(4);
          setProgress(100);
          setTimeout(() => {
            if (!cancelled) {
              router.replace({
                pathname: '/scanner/review',
                params: {
                  result: JSON.stringify(stageResult),
                  imageUri,
                },
              });
            }
          }, 600);
        } else {
          Alert.alert(
            'Scan Failed',
            stageResult.error || 'Could not process the prescription. Please try again.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      } catch {
        if (!cancelled) {
          Alert.alert(
            'Error',
            'An unexpected error occurred. Please try again.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      }
    };

    const stageInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= TITLES.length - 1) return prev;
        const next = prev + 1;
        setProgress(PROGRESS_STEPS[next]);
        return next;
      });
    }, 2500);

    runPipeline();

    return () => {
      cancelled = true;
      clearInterval(stageInterval);
    };
    }, [imageUri, router]);

  const scanLineTop = scanAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const scanLineOpacity = scanAnim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] });
  const ringScale1 = pulseAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] });
  const ringOpacity1 = pulseAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const ringScale2 = pulseAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] });
  const ringOpacity2 = pulseAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.backgroundContainer}>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.blurredImage}
            resizeMode="cover"
            blurRadius={8}
            accessibilityLabel="Scanned prescription image"
          />
        )}
        <View style={styles.backgroundOverlay} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentWrapper}>
          <View style={styles.scannerFrame}>
            <View style={styles.viewfinderBg} />
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <Animated.View style={[styles.scanningLine, { top: scanLineTop, opacity: scanLineOpacity }]} />
            <Animated.View style={[styles.scanningGlow, { top: scanLineTop, opacity: scanLineOpacity }]} />
            <View style={styles.centerIndicator}>
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: ringScale1 }], opacity: ringOpacity1 }]} />
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: ringScale2 }], opacity: ringOpacity2 }]} />
              <View style={styles.centerIconContainer}>
                <Text style={styles.centerIcon}>document_scanner</Text>
              </View>
            </View>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>{TITLES[stepIndex]}</Text>
            <Text style={styles.statusDesc}>{DESCRIPTIONS[stepIndex]}</Text>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.statusHelper}>Please hold steady</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
            onPress={() => router.back()}
            accessibilityLabel="Cancel scanning"
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Cancel Scan</Text>
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
    backgroundColor: '#fcf8fb', // fallback bg
  },

  // --- Blurred Background ---
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  blurredImage: {
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(252, 248, 251, 0.6)', // surface opacity gradient start
  },

  // --- Content Layout ---
  safeArea: {
    flex: 1,
    zIndex: 10,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20, // margin-mobile
    paddingBottom: 20,
  },

  // --- Scanner Frame ---
  scannerFrame: {
    width: '100%',
    maxWidth: 400, // Approximate max-w-md
    aspectRatio: 3 / 4,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 88, 188, 0.2)',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
    position: 'relative',
  },
  viewfinderBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(228, 226, 228, 0.3)', // surface-variant opacity
  },

  // --- Corners ---
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#0058bc', // primary
    borderWidth: 4,
    borderRadius: 4,
    zIndex: 10,
  },
  cornerTL: {
    top: 16,
    left: 16,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 16,
    right: 16,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 16,
    left: 16,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 16,
    right: 16,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },

  // --- Scanning Line & Glow ---
  scanningLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#0058bc', // primary
    shadowColor: '#0070eb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 20,
  },
  scanningGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 128, // h-32
    backgroundColor: 'rgba(0, 88, 188, 0.1)',
    zIndex: 10,
    transform: [{ translateY: -128 }], // -translate-y-full
  },

  // --- Center Indicator ---
  centerIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  pulseRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(0, 88, 188, 0.5)',
  },
  centerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 88, 188, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 88, 188, 0.2)',
  },
  centerIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 32,
    color: '#0058bc',
  },

  // --- Status Card ---
  statusCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  statusTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    fontWeight: '600',
    color: '#1b1b1d', // on-surface
    marginBottom: 4,
  },
  statusDesc: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    color: '#414755', // on-surface-variant
    marginBottom: 16,
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#eae7ea', // surface-container-high
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0058bc', // primary
    borderRadius: 999,
  },
  statusHelper: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#717786', // outline
  },

  // --- Cancel Button ---
  cancelButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c1c6d7', // outline-variant
  },
  cancelButtonPressed: {
    backgroundColor: 'rgba(234, 231, 234, 0.5)', // surface-container-high
    transform: [{ scale: 0.95 }],
  },
  cancelText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#414755', // on-surface-variant
  },
});
import React, { useState, useMemo, useEffect } from 'react';
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
import { useRouter } from 'expo-router';

export default function ScanPrescription() {
  const router = useRouter();
  const [flashOn, setFlashOn] = useState(false);

  // Scanning line animation
  const scanAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true, // Native driver for performance
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0, // Instantly reset (hidden state handled by interpolation)
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnim]);

  const scanLineInterpolate = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const scanOpacityInterpolate = scanAnim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Camera Feed Background (Simulated) */}
      <Image
        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUrlQxvGFFXxFpWfHBCldTEoocwKH7IPnHhnU5ExO822FGxlNZiNTaIV3ifFoeQXA2VckBqUzk3b54_tcN7pjRpdVLBNjy3lkwgTeffy26x0GT2wMZBda-3wRhictmj68hoGU6J49PNrZFs_8rZy01CjmAdTUZUymlFjKwQwVWkqAxFbUwFXUCRkD4cBKEgdePmya_xHAd4Q25bHESWq3r1Uh1mficntTrZZ_XsXfTScIMhXlr-oHgaCTQM44IIF5QaC3uWPC_XwZa' }}
        style={styles.cameraFeed}
        resizeMode="cover"
        accessibilityLabel="Camera feed"
      />

      {/* 2. Main UI Overlay Wrapper */}
      <View style={styles.overlayWrapper}>

        {/* Top Bar Overlay */}
        <View style={styles.topBar}>
          <Pressable style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Close scanner" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.icon}>close</Text>
          </Pressable>
          <Text style={styles.brandText}>MedTrack AI</Text>
          <Pressable
            style={[styles.iconButton, flashOn && styles.iconButtonActive]}
            onPress={() => setFlashOn(!flashOn)}
            accessibilityLabel="Toggle flash"
            accessibilityRole="button"
          >
            <Text style={[styles.icon, flashOn && styles.iconActive]}>
              {flashOn ? 'flash_on' : 'flash_off'}
            </Text>
          </Pressable>
        </View>

        {/* Instruction Text */}
        <View style={styles.instructionWrapper}>
          <View style={styles.instructionPill}>
            <Text style={styles.instructionText}>Position label within frame</Text>
          </View>
        </View>

        {/* 3. Viewfinder Area with Cutout */}
        <View style={styles.viewFinderWrapper}>
          <View style={styles.scanFrame}>
            {/* Corner Borders */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Scanning Animation Line */}
            <Animated.View
              style={[
                styles.scanningLine,
                {
                  top: scanLineInterpolate,
                  opacity: scanOpacityInterpolate
                }
              ]}
            />
          </View>
        </View>

        {/* 4. Bottom Controls (Flex Spacer pushes it down) */}
        <View style={styles.bottomControls}>
          {/* Gallery Button */}
          <Pressable
            style={styles.galleryButton}
            accessibilityLabel="Upload from gallery"
            accessibilityRole="button"
            onPress={async () => {
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              const ImagePicker = require('expo-image-picker');
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Required', 'Gallery access is required to upload images.');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsEditing: false,
              });
              if (!result.canceled && result.assets[0]) {
                router.push({ pathname: '/scanner/processing', params: { imageUri: result.assets[0].uri } });
              }
            }}
          >
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDR3AfQBHdcj_c4AOqesdkyc8ziLGQhl3oxqqR97Al08oLme1z1vxCsPsoRLcn2MSc-vvp87Vp7BJ1Tt-4BoyYIFoVZgtd2rTsZ8PBgPSPRmyjMgl-BwqcGip1buBDn7-JcLC6_zwhIMafxkQtIEkFtsxfzZ_islvLH_5L1QC5YSZLIQNjvTwSfC_K0hsQsBoAOXt9UeGVNXxNKv3LZB7lAQb1jh_n2RmNEd0uwcAmNtNi14LI4c0fOZukPBsHog71cd6hLREW5_oNT' }}
              style={styles.galleryThumbnail}
              accessibilityLabel="Gallery thumbnail"
            />
            <View style={styles.galleryIconOverlay}>
              <Text style={styles.galleryIcon}>photo_library</Text>
            </View>
          </Pressable>

          {/* Shutter Button */}
          <Pressable
            style={({ pressed }) => [styles.shutterOuter, pressed && styles.shutterOuterPressed]}
            onPress={() => router.push('/scanner/camera')}
            accessibilityLabel="Take photo"
            accessibilityRole="button"
          >
            <View style={[styles.shutterInner, { transform: [{ scale: 1 }] }]} />
          </Pressable>

          {/* Empty placeholder for symmetry */}
          <View style={styles.symmetryPlaceholder} />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraFeed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlayWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  // --- Top Bar ---
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, // margin-mobile
    paddingTop: Platform.OS === 'android' ? 40 : 12,
    paddingBottom: 16,
    // Gradient equivalent (simulated via 2 colors)
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18, 18, 18, 0.4)', // surface-dark/40
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(4px)',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
  },
  icon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#FFFFFF',
  },
  iconActive: {
    color: '#FF9500', // status-pending / flash on
  },
  brandText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // --- Instruction ---
  instructionWrapper: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 32,
  },
  instructionPill: {
    backgroundColor: 'rgba(18, 18, 18, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 13,
    color: '#ffffff',
  },

  // --- Viewfinder ---
  viewFinderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  scanFrame: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 3 / 4,
    position: 'relative',
    // The "Cutout" dark shadow around frame
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFFFFF',
    borderWidth: 4,
    borderRadius: 4,
  },
  cornerTL: {
    top: -4,
    left: -4,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: -4,
    right: -4,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: -4,
    left: -4,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: -4,
    right: -4,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
  },
  scanningLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#6ffb85', // secondary-container
    shadowColor: '#6ffb85',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },

  // --- Bottom Controls ---
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 48,
    paddingTop: 32,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  galleryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(18, 18, 18, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  galleryThumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  galleryIconOverlay: {
    zIndex: 2,
  },
  galleryIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterOuterPressed: {
    transform: [{ scale: 0.9 }],
  },
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
  },
  symmetryPlaceholder: {
    width: 48,
    height: 48,
  },
});
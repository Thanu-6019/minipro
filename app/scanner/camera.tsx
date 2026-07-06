import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '../../src/components/ui/Typography';
import { Button } from '../../src/components/ui/Button';
import { useTheme } from '../../src/hooks/useTheme';

const IS_NATIVE = Platform.OS !== 'web';

export default function CameraInterfaceScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  if (!IS_NATIVE) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Typography variant="title-lg" color={theme.colors['on-surface']}>Camera Not Available</Typography>
          <Typography variant="body-md" color={theme.colors['on-surface-variant']} style={styles.permissionText}>
            Camera scanning is only available on mobile devices.
          </Typography>
          <Button label="Go Back" onPress={() => router.back()} style={styles.permissionButton} accessibilityLabel="Go back" accessibilityRole="button" />
        </View>
      </SafeAreaView>
    );
  }

  return <CameraScreenInner router={router} theme={theme} />;
}

function CameraScreenInner({ router, theme }: { router: ReturnType<typeof useRouter>; theme: any }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CameraView, useCameraPermissions } = require('expo-camera');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ImagePicker = require('expo-image-picker');

  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission] = ImagePicker.useMediaLibraryPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flashOn, setFlashOn] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo) throw new Error('No photo captured');
      router.push({ pathname: '/scanner/processing', params: { imageUri: photo.uri } });
    } catch {
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setCapturing(false);
    }
  };

  const handleGalleryUpload = async () => {
    if (!mediaPermission?.granted) {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery access is required to upload images.');
        return;
      }
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]) {
        router.push({ pathname: '/scanner/processing', params: { imageUri: result.assets[0].uri } });
      }
    } catch {
      Alert.alert('Error', 'Failed to select image from gallery');
    }
  };

  const flipCamera = () => setFacing(facing === 'back' ? 'front' : 'back');

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Typography variant="title-lg" color={theme.colors['on-surface']}>Camera Permission Required</Typography>
          <Typography variant="body-md" color={theme.colors['on-surface-variant']} style={styles.permissionText}>
            Please grant camera access to scan prescriptions.
          </Typography>
          <Button label="Grant Permission" onPress={requestPermission} style={styles.permissionButton} accessibilityLabel="Grant camera permission" accessibilityRole="button" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* FIX: Changed 'torch' to 'enableTorch'. Also removed strict type from facing prop. */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={flashOn}
      >
        <View style={styles.overlay}>

          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Close scanner" accessibilityRole="button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Typography style={styles.icon}>close</Typography>
            </TouchableOpacity>

            <Typography variant="headline-md" color="#ffffff" style={styles.brandText}>
              MedTrack AI
            </Typography>

            <TouchableOpacity style={styles.iconButton} onPress={() => setFlashOn(!flashOn)} accessibilityLabel="Toggle flash" accessibilityRole="button">
              <Typography style={[styles.icon, flashOn && styles.iconActive]}>
                {flashOn ? 'flash_on' : 'flash_off'}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Instruction Pill */}
          <View style={styles.instructionWrapper}>
            <View style={styles.instructionPill}>
              <Typography variant="label-md" color="#ffffff">Position label within frame</Typography>
            </View>
          </View>

          {/* Viewfinder Area with corners */}
          <View style={styles.viewfinderContainer}>
            <View style={styles.viewfinder}>
              {/* Corners */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>

            {/* Gallery Button with optional Preview */}
            <TouchableOpacity style={styles.galleryButton} onPress={handleGalleryUpload} disabled={capturing} accessibilityLabel="Upload from gallery" accessibilityRole="button">
              <Typography style={styles.galleryIcon}>photo_library</Typography>
            </TouchableOpacity>

            {/* Shutter Button */}
            <TouchableOpacity
              style={styles.shutterOuter}
              onPress={handleCapture}
              disabled={capturing}
              accessibilityLabel="Take photo"
              accessibilityRole="button"
            >
              <View style={[styles.shutterInner, capturing && { backgroundColor: '#ccc' }]} />
            </TouchableOpacity>

            {/* Flip Camera Button */}
            <TouchableOpacity style={styles.flipButton} onPress={flipCamera} disabled={capturing} accessibilityLabel="Flip camera" accessibilityRole="button">
              <Typography style={styles.flipIcon}>flip_camera_android</Typography>
            </TouchableOpacity>
          </View>

        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#FFFFFF',
  },
  iconActive: { color: '#FF9500' },
  brandText: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Instruction
  instructionWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  instructionPill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },

  // Viewfinder & Corners
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: '80%',
    aspectRatio: 3 / 4,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFFFFF',
    borderWidth: 4,
    borderRadius: 4,
  },
  cornerTL: { top: 10, left: 10, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  cornerTR: { top: 10, right: 10, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  cornerBL: { bottom: 10, left: 10, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 10, right: 10, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },

  // Bottom Controls
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#FFFFFF',
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
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipIcon: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 24,
    color: '#FFFFFF',
  },

  // Permissions
  permissionContainer: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', gap: 16 },
  permissionText: { textAlign: 'center' },
  permissionButton: { width: '80%' },
});
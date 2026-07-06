import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/features/auth/services/auth.service';

export default function CompleteProfile() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (gender: string) => {
    if (saving) return;
    setSaving(true);
    try {
      const { data, error } = await authService.updateUserMetadata({ gender });
      if (!error && data?.user) {
        const session = useAuthStore.getState().session;
        if (session) {
          setSession({ ...session, user: data.user });
        }
      }
    } catch {
      // Proceed even if update fails — default avatar handles missing gender
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgContainer}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.logoSection}>
          <View style={styles.logoWrapper}>
            <Image source={require('../../assets/logo.png')} style={styles.logoImage} accessibilityLabel="MedTrack AI logo" />
          </View>
          <Text style={styles.logoTitle}>MedTrack AI</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Select your gender to personalize your experience.</Text>

          <View style={styles.optionsContainer}>
            <Pressable
              style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
              onPress={() => handleSelect('male')}
              disabled={saving}
              accessibilityLabel="Select Male"
              accessibilityRole="radio"
            >
              {saving ? (
                <ActivityIndicator color="#0058bc" />
              ) : (
                <>
                  <Text style={styles.optionIcon}>♂</Text>
                  <Text style={styles.optionLabel}>Male</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
              onPress={() => handleSelect('female')}
              disabled={saving}
              accessibilityLabel="Select Female"
              accessibilityRole="radio"
            >
              {saving ? (
                <ActivityIndicator color="#0058bc" />
              ) : (
                <>
                  <Text style={styles.optionIcon}>♀</Text>
                  <Text style={styles.optionLabel}>Female</Text>
                </>
              )}
            </Pressable>
          </View>

          <Pressable
            style={styles.skipButton}
            onPress={() => router.replace('/(tabs)')}
            disabled={saving}
            accessibilityLabel="Skip for now"
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8fb',
  },
  bgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  blob1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '60%',
    height: '60%',
    borderRadius: 999,
    backgroundColor: '#d8e2ff',
    opacity: 0.4,
    transform: [{ scale: 0.8 }],
  },
  blob2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '70%',
    height: '70%',
    borderRadius: 999,
    backgroundColor: '#f6d9ff',
    opacity: 0.3,
    transform: [{ scale: 0.8 }],
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#0070eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  logoTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.01,
    color: '#0058bc',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 5,
  },
  cardTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    color: '#1b1b1d',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    color: '#717786',
    marginBottom: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    backgroundColor: 'rgba(246, 243, 245, 0.6)',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 215, 0.4)',
  },
  optionButtonPressed: {
    backgroundColor: 'rgba(0, 112, 235, 0.08)',
    borderColor: '#0058bc',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
    color: '#1b1b1d',
  },
  optionLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 16,
    fontWeight: '600',
    color: '#1b1b1d',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 14,
    fontWeight: '500',
    color: '#717786',
  },
});

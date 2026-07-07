import React from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
  Platform
} from 'react-native';

export default function MedTrackAIWelcome() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>

        {/* Top App Bar */}
        <View style={styles.appBar}>
          <Text style={styles.appBarTitle}>MedTrack AI</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>

          {/* Hero Illustration Area */}
          <View style={styles.heroContainer}>
            <View style={styles.decorativeBgContainer}>
              <View style={styles.decorativeBlob1} />
              <View style={styles.decorativeBlob2} />
            </View>

            <View style={styles.glassPanel}>
              {/* FIX: Corrected relative depth to ../../assets/logo.png (2 levels up from app/(auth)/ reaches the project root assets folder). The previous ../../../ path pointed one level above the project root, which fails Metro's strict path resolution on Windows. */}
              <Image
                source={require('../../assets/logo.png')}
                style={styles.heroImage}
                resizeMode="contain"
                accessibilityLabel="MedTrack AI logo"
              />
            </View>
          </View>

          {/* Copy & Action Area */}
          <View style={styles.actionArea}>
            <Text style={styles.headline}>Your Health,{'\n'}Simplified</Text>
            <Text style={styles.subHeadline}>
              Intelligent medication tracking and seamless health insights, powered by AI.
            </Text>

            <Pressable
              onPress={() => router.push('/(auth)/register')}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              accessibilityLabel="Get Started"
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>Get Started →</Text>
            </Pressable>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => router.push('/(auth)/login')}
                  accessibilityLabel="Log in"
                >
                  Log in
                </Text>
              </Text>
            </View>
          </View>

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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  appBar: {
    width: '100%',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  appBarTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
    color: '#0058bc',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    maxWidth: 448,
    justifyContent: 'space-between',
    paddingBottom: 48,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  decorativeBgContainer: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
  },
  decorativeBlob1: {
    width: 256,
    height: 256,
    backgroundColor: '#d8e2ff',
    borderRadius: 999,
    position: 'absolute',
  },
  decorativeBlob2: {
    width: 192,
    height: 192,
    backgroundColor: '#f6d9ff',
    borderRadius: 999,
    position: 'absolute',
    transform: [{ translateX: 48 }, { translateY: -48 }],
  },
  glassPanel: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: 280,
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 32,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  actionArea: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  headline: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.01,
    color: '#1b1b1d',
    textAlign: 'center',
    marginBottom: 4,
  },
  subHeadline: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
    color: '#414755',
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#0058bc',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  primaryButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif-medium',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
    color: '#ffffff',
  },
  footerContainer: {
    marginTop: 16,
  },
  footerText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.01,
    fontWeight: '500',
    color: '#414755',
  },
  footerLink: {
    color: '#0058bc',
    fontWeight: '600',
  },
});
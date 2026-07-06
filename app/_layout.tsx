import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { supabase } from '../src/services/api/supabase';
import { queryClient } from '../src/lib/queryClient';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { logger } from '../src/utils/logger';

const IS_NATIVE = Platform.OS !== 'web';

// Helper to safely hide the splash screen
const hideSplashScreen = async () => {
  if (!IS_NATIVE) return;
  try {
    // Try to import and hide the splash screen
    const SplashScreen = require('expo-splash-screen');
    await SplashScreen.hideAsync();
  } catch (err) {
    // If the native module isn't ready or fails, we ignore it silently.
    console.warn('Splash screen hide failed (safe to ignore):', err);
  }
};

if (IS_NATIVE) {
  try {
    // Prevent auto-hide before we are ready
    const SplashScreen = require('expo-splash-screen');
    SplashScreen.preventAutoHideAsync();
  } catch (err) {
    console.error('SplashScreen.preventAutoHideAsync failed:', err);
  }
}

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const bootstrapped = useRef(false);

  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  // --- FIX START ---
  // Force hide splash screen immediately when layout mounts
  useEffect(() => {
    hideSplashScreen();
    // Second attempt after a tiny delay to catch any native race-conditions
    const timer = setTimeout(() => {
      hideSplashScreen();
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  // --- FIX END ---

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const { setSession, setLoading } = useAuthStore.getState();

    // Restore persisted session
    supabase.auth.getSession().then((resp: any) => {
      const sess = resp?.data?.session ?? null;
      setSession(sess);
      setLoading(false);
      // Double-check to hide splash screen after auth check
      hideSplashScreen();
    }).catch((err: any) => {
      console.error('getSession failed:', err);
      setSession(null);
      setLoading(false);
      hideSplashScreen();
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, sess: any) => {
      setSession(sess);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isCompleteProfile = (segments as string[]).includes('complete-profile');

    // This logic ensures that if there is NO session, it goes to (auth)/welcome
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (session && inAuthGroup && !isCompleteProfile) {
      router.replace('/(tabs)' as any);
    }
  }, [session, isLoading, segments, router]);

  useEffect(() => {
    if (!IS_NATIVE) return;
    const initNotifications = async () => {
      try {
        const { notificationService } = require('../src/services/notifications/notification.service');
        await notificationService.configure();
      } catch (err) {
        logger.error('notification init failed:', err);
      }
    };
    initNotifications();
  }, []);

  useEffect(() => {
    if (!session || !IS_NATIVE) return;

    const setupNotifications = async () => {
      try {
        const { notificationService } = require('../src/services/notifications/notification.service');
        const { reminderService } = require('../src/features/reminders/services/reminder.service');

        await notificationService.registerPushToken(session.user.id);
        const reminders = await reminderService.getUpcomingReminders(session.user.id);
        for (const reminder of reminders) {
          await notificationService.scheduleReminder(reminder);
        }
      } catch (err) {
        logger.error('setupNotifications failed:', err);
      }
    };
    setupNotifications();
  }, [session]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Slot />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
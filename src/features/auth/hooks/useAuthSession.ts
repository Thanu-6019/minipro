import { useEffect } from 'react';
import { supabase } from '@/services/api/supabase';
import { useAuthStore, AuthState } from '@/store/authStore';
import { logger } from '../../../utils/logger';

/**
 * Bootstraps Supabase auth and keeps Zustand in sync with the session.
 *
 * - Reads the persisted session on mount (covers app restarts).
 * - Subscribes to onAuthStateChange so every sign-in / sign-out / token
 *   refresh is immediately reflected in the store.
 * - Sets isLoading = false only after the initial getSession resolves,
 *   preventing the route guard in _layout.tsx from firing prematurely.
 */
export const useAuthSession = () => {
  const setSession = useAuthStore((state: AuthState) => state.setSession);
  const setLoading = useAuthStore((state: AuthState) => state.setLoading);

  useEffect(() => {
    let mounted = true;

    // 1. Restore persisted session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      if (!mounted) return;
      setSession(session);
      setLoading(false);
    }).catch((err: any) => {
      logger.error('getSession failed:', err);
      if (!mounted) return;
      setSession(null);
      setLoading(false);
    });

    // 2. Keep in sync with future auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!mounted) return;
      setSession(session);
      // Ensure loading is cleared in case getSession hasn't resolved yet
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setLoading]);
};

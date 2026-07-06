import { supabase } from '@/services/api/supabase';

export const authService = {
  signUp: async (email: string, password: string, metadata?: Record<string, unknown>): Promise<{ data: { user: import('@supabase/supabase-js').User | null }; error: Error | null }> => {
    try {
      return await supabase.auth.signUp({
        email,
        password,
        ...(metadata ? { options: { data: metadata } } : {}),
      });
    } catch (err) {
      return { data: { user: null }, error: err as Error };
    }
  },
  signIn: async (email: string, password: string): Promise<{ data: { session: import('@supabase/supabase-js').Session | null }; error: Error | null }> => {
    try {
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (err) {
      return { data: { session: null }, error: err as Error };
    }
  },
  signOut: async (): Promise<{ error: Error | null }> => {
    try {
      return await supabase.auth.signOut();
    } catch (err) {
      return { error: err as Error };
    }
  },
  forgotPassword: async (email: string): Promise<{ error: Error | null }> => {
    try {
      return await supabase.auth.resetPasswordForEmail(email);
    } catch (err) {
      return { error: err as Error };
    }
  },
  getSession: async (): Promise<{ data: { session: import('@supabase/supabase-js').Session | null }; error: Error | null }> => {
    try {
      return await supabase.auth.getSession();
    } catch (err) {
      return { data: { session: null }, error: err as Error };
    }
  },
  updateUserMetadata: async (metadata: Record<string, unknown>): Promise<{ data: { user: import('@supabase/supabase-js').User | null }; error: Error | null }> => {
    try {
      return await supabase.auth.updateUser({ data: metadata });
    } catch (err) {
      return { data: { user: null }, error: err as Error };
    }
  },
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types';

const DEMO_KEY = 'mtDemoUser';

type AuthContextValue = {
  loading: boolean;
  profile: Profile | null;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (fullName: string, email: string, password: string, role: UserRole) => Promise<string | null>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const isDemo = supabase === null;

  async function loadSupabaseProfile(userId: string) {
    const { data } = await supabase!.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data as Profile);
  }

  useEffect(() => {
    if (!supabase) {
      // Demo mode: restore the locally stored pseudo-account
      AsyncStorage.getItem(DEMO_KEY)
        .then((raw) => {
          if (raw) setProfile(JSON.parse(raw));
        })
        .finally(() => setLoading(false));
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) return loadSupabaseProfile(data.session.user.id);
      })
      .finally(() => setLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadSupabaseProfile(session.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      profile,
      isDemo,

      async signIn(email, password) {
        if (!supabase) {
          const demo: Profile = {
            id: 'demo',
            role: 'customer',
            full_name: email.split('@')[0] || 'Demo user',
            email,
            phone: null,
            avatar_url: null,
            city: 'San Francisco, CA',
          };
          setProfile(demo);
          await AsyncStorage.setItem(DEMO_KEY, JSON.stringify(demo));
          return null;
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return error.message;
        // Load the profile before returning so the caller can navigate straight
        // into the app — otherwise the redirect races the auth listener and
        // bounces back to the login screen.
        if (data.user) await loadSupabaseProfile(data.user.id);
        return null;
      },

      async signUp(fullName, email, password, role) {
        if (!supabase) {
          const demo: Profile = {
            id: 'demo',
            role,
            full_name: fullName,
            email,
            phone: null,
            avatar_url: null,
            city: 'San Francisco, CA',
          };
          setProfile(demo);
          await AsyncStorage.setItem(DEMO_KEY, JSON.stringify(demo));
          return null;
        }
        // The on_auth_user_created DB trigger creates the profile row from
        // this metadata (full_name + role).
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role } },
        });
        if (error) return error.message;
        // With email confirmation off there's a session immediately; load the
        // profile so navigation into the app doesn't race the auth listener.
        if (data.user && data.session) await loadSupabaseProfile(data.user.id);
        return null;
      },

      async signOut() {
        if (supabase) await supabase.auth.signOut();
        await AsyncStorage.removeItem(DEMO_KEY);
        setProfile(null);
      },

      async updateProfile(patch) {
        if (!profile) return;
        const next = { ...profile, ...patch };
        setProfile(next);
        if (supabase) {
          await supabase.from('profiles').update(patch).eq('id', profile.id);
        } else {
          await AsyncStorage.setItem(DEMO_KEY, JSON.stringify(next));
        }
      },
    }),
    [loading, profile, isDemo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

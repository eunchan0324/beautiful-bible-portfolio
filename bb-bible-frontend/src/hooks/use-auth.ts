'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type AuthMode = 'loading' | 'guest' | 'authenticated';

function getAuthRedirectUrl() {
  return process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || window.location.origin;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authMode: AuthMode = isLoading ? 'loading' : user ? 'authenticated' : 'guest';
  const isAuthenticated = authMode === 'authenticated';

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithKakao = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: getAuthRedirectUrl(),
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    isLoading,
    authMode,
    isAuthenticated,
    signInWithKakao,
    signOut,
  };
}

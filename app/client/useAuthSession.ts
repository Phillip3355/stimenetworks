'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export function useAuthSession() {
  const [state, setState] = useState<{ user: User | null; isAdmin: boolean; isAuthLoading: boolean }>({
    user: null, isAdmin: false, isAuthLoading: true,
  });
  useEffect(() => {
    let cancelled = false;
    let revision = 0;
    let pending: ReturnType<typeof setTimeout> | undefined;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const current = ++revision;
      clearTimeout(pending);
      setState(previous => session && previous.user?.id === session.user.id
        ? { ...previous, isAuthLoading: true }
        : { user: null, isAdmin: false, isAuthLoading: Boolean(session) });
      if (!session) return;
      pending = setTimeout(async () => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error || !user) throw new Error('Invalid session');
          const { data, error: adminError } = await supabase.rpc('is_support_admin');
          if (!cancelled && revision === current) setState({ user, isAdmin: !adminError && data === true, isAuthLoading: false });
        } catch {
          if (!cancelled && revision === current) setState({ user: null, isAdmin: false, isAuthLoading: false });
        }
      }, 0);
    });
    return () => { cancelled = true; clearTimeout(pending); subscription.unsubscribe(); };
  }, []);
  return state;
}

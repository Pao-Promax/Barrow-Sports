"use client";

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { isSchoolAccount, SCHOOL_LOGIN_MESSAGE } from './school-account';

export function useSchoolUser() {
  const [user, setUser] = useState<User | null>();
  const [error, setError] = useState('');
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(timer);
      if (!session) { setUser(null); return; }
      if (isSchoolAccount(session.user)) {
        setUser(session.user);
        setError('');
      } else {
        setUser(null);
        setError(SCHOOL_LOGIN_MESSAGE);
        // Auth operations must run outside the auth-state callback's lock.
        timer = setTimeout(() => { void supabase.auth.signOut({ scope: 'local' }); }, 0);
      }
    });
    return () => { clearTimeout(timer); subscription.unsubscribe(); };
  }, []);
  return { user, error };
}

export function signInWithSchoolGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/profile`,
      queryParams: { hd: 'cru.ac.th', prompt: 'select_account' },
    },
  });
}

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
    let revision = 0;
    const refreshUser = async () => {
      const current = ++revision;
      const { data: { user: latest }, error: refreshError } = await supabase.auth.getUser();
      if (current !== revision) return;
      if (refreshError) { setUser(null); setError('ตรวจสอบบัญชีไม่สำเร็จ กรุณารีเฟรชหน้าเว็บ'); return; }
      setUser(isSchoolAccount(latest) ? latest : null);
      setError(latest && !isSchoolAccount(latest) ? SCHOOL_LOGIN_MESSAGE : '');
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      ++revision;
      clearTimeout(timer);
      if (!session) { setUser(null); return; }
      if (isSchoolAccount(session.user)) {
        setUser(session.user);
        setError('');
        // Read current app_metadata instead of retaining roles from an older JWT.
        timer = setTimeout(() => { void refreshUser(); }, 0);
      } else {
        setUser(null);
        setError(SCHOOL_LOGIN_MESSAGE);
        // Auth operations must run outside the auth-state callback's lock.
        timer = setTimeout(() => { void supabase.auth.signOut({ scope: 'local' }); }, 0);
      }
    });
    const onFocus = () => { if (document.visibilityState === 'visible') void refreshUser(); };
    document.addEventListener('visibilitychange', onFocus);
    return () => { ++revision; clearTimeout(timer); subscription.unsubscribe(); document.removeEventListener('visibilitychange', onFocus); };
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

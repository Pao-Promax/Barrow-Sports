"use client";
import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { UserRound } from 'lucide-react';

export function ProfileAvatar({ user, className }: { user: User | null | undefined; className: string }) {
  const [failedSource, setFailedSource] = useState('');
  const source = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  return typeof source === 'string' && source.startsWith('https://') && source !== failedSource ? (
    <img src={source} alt="" referrerPolicy="no-referrer" onError={() => setFailedSource(source)} className={`${className} rounded-full object-cover shrink-0`} />
  ) : <UserRound className={`${className} shrink-0`} aria-hidden="true" />;
}

"use client";

import { useState } from 'react';
import { useSchoolUser, signInWithSchoolGoogle } from '@/lib/use-school-user';
import { ProfileAvatar } from '@/components/profile-avatar';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { ThemeToggle } from '@/components/theme-toggle';

import { isAdminUser } from '@/lib/admin-role';

export default function ProfilePage() {
  const { user, error: accountError } = useSchoolUser();
  const [error, setError] = useState('');

  async function signIn() {
    setError('');
    const { error } = await signInWithSchoolGoogle();
    if (error) setError('เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 pt-8 pb-[calc(108px+env(safe-area-inset-bottom,0px))] xl:pb-10 space-y-6">
        <h1 className="text-3xl font-semibold">โปรไฟล์</h1>
        <div className="flex items-center justify-between gap-4 xl:hidden">
          <span className="text-sm font-medium">โหมดสว่าง / มืด</span>
          <ThemeToggle />
        </div>
        {user === undefined ? <p className="t-muted" role="status">กำลังโหลดข้อมูลบัญชี…</p> : user ? (
          <section className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-4">
              <ProfileAvatar user={user} className="w-16 h-16 text-[var(--accent)]" />
              <h2 className="font-semibold text-lg break-words min-w-0">{user.user_metadata?.full_name || user.user_metadata?.name || 'บัญชีของฉัน'}</h2>
            </div>
            <dl className="space-y-4 text-sm">
              <div><dt className="t-muted mb-1">อีเมล</dt><dd className="break-all">{user.email || 'ไม่ได้ระบุ'}</dd></div>
              <div><dt className="t-muted mb-1">สิทธิ์บัญชี</dt><dd>{isAdminUser(user) ? 'Admin' : 'นักเรียน'}</dd></div>
            </dl>
            <Link href="/my-borrows" className="flex min-h-11 items-center justify-center rounded-xl glass-pill text-sm font-medium">ดูของที่ฉันยืม</Link>
          </section>
        ) : (
          <section className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">เข้าสู่ระบบเพื่อดูโปรไฟล์</h2>
            <p className="text-sm t-muted">ใช้บัญชี Google ของโรงเรียน @cru.ac.th เท่านั้น</p>
            <button onClick={signIn} className="min-h-11 px-4 py-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center gap-2 text-sm font-medium"><LogIn className="w-4 h-4" aria-hidden="true" />เข้าสู่ระบบด้วย Google</button>
          </section>
        )}
        {(error || accountError) && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error || accountError}</p>}
      </main>
    </div>
  );
}

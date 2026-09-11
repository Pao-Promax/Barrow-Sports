'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Dumbbell, Clock, ShieldCheck, UserCheck, LogIn, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const [userName, setUserName] = useState<string>('ผู้ยืม (Student)');
  const [userEmail, setUserEmail] = useState<string>('50788@cru.ac.th');

  useEffect(() => {
    // Check saved role from localStorage
    const savedRole = localStorage.getItem('barrow_user_role') as 'student' | 'admin';
    if (savedRole) setUserRole(savedRole);
    const savedName = localStorage.getItem('barrow_user_name');
    if (savedName) setUserName(savedName);
    const savedEmail = localStorage.getItem('barrow_user_email');
    if (savedEmail) setUserEmail(savedEmail);

    // Check supabase auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User');
        setUserEmail(session.user.email || '');
      }
    });
  }, []);

  const toggleRole = () => {
    const nextRole = userRole === 'student' ? 'admin' : 'student';
    setUserRole(nextRole);
    localStorage.setItem('barrow_user_role', nextRole);
    if (nextRole === 'admin') {
      setUserName('อาจารย์ผู้ดูแลอุปกรณ์ (Admin)');
    } else {
      setUserName('นักเรียน (50788@cru.ac.th)');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
  };

  const navItems = [
    { href: '/', label: 'อุปกรณ์กีฬา', icon: Dumbbell },
    { href: '/my-borrows', label: 'ของที่ฉันยืม', icon: Clock },
    { href: '/admin', label: 'จัดการสต็อก (Admin)', icon: ShieldCheck, adminOnly: false }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-400">
              BARROW<span className="text-emerald-400">.</span>SPORTS
            </span>
            <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase -mt-1">
              ระบบยืม-คืนอุปกรณ์กีฬา
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Switcher / Profile */}
        <div className="flex items-center gap-2.5">
          {/* Quick Role Switcher */}
          <button
            onClick={toggleRole}
            title="คลิกเพื่อสลับโหมดระหว่างนักเรียน และ ครูผู้ดูแลระบบ"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              userRole === 'admin'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
            }`}
          >
            {userRole === 'admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>โหมด: แอดมิน (ครู)</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>โหมด: ผู้ยืม (นักเรียน)</span>
              </>
            )}
          </button>

          {/* Google Sign In button */}
          <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700/60 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Google Login</span>
          </button>
        </div>

      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 py-2 px-2 bg-slate-950/90">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}

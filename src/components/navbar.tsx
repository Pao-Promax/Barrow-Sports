'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Dumbbell, Clock, ShieldCheck, UserCheck, LogIn, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const [userName, setUserName] = useState<string>('ผู้ยืม (Student)');
  const [userEmail, setUserEmail] = useState<string>('50788@cru.ac.th');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('barrow_user_role') as 'student' | 'admin';
    if (savedRole) setUserRole(savedRole);
    const savedName = localStorage.getItem('barrow_user_name');
    if (savedName) setUserName(savedName);
    const savedEmail = localStorage.getItem('barrow_user_email');
    if (savedEmail) setUserEmail(savedEmail);

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
    { href: '/admin', label: 'จัดการสต็อก (Admin)', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[1px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950/90 rounded-[11px] flex items-center justify-center backdrop-blur-sm">
              <Trophy className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base sm:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-300">
              BARROW<span className="text-emerald-400">.</span>SPORTS
            </span>
            <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase -mt-0.5">
              ระบบยืม-คืนอุปกรณ์กีฬา
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl glass-pill">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'glass-pill-active text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Controls */}
        <div className="flex items-center gap-2">
          {/* Role Switcher Pill */}
          <button
            onClick={toggleRole}
            title="คลิกเพื่อสลับโหมดระหว่างนักเรียน และ ครูผู้ดูแลระบบ"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              userRole === 'admin'
                ? 'glass-badge-amber hover:bg-amber-500/25'
                : 'glass-badge-emerald hover:bg-emerald-500/25'
            }`}
          >
            {userRole === 'admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">โหมด: แอดมิน (ครู)</span>
                <span className="sm:hidden">Admin</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">โหมด: ผู้ยืม (นักเรียน)</span>
                <span className="sm:hidden">นักเรียน</span>
              </>
            )}
          </button>

          {/* Google Login button */}
          <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 glass-pill hover:bg-white/10 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Google Login</span>
          </button>
        </div>

      </div>

      {/* Mobile Navigation Bar - Fixed at bottom or top bar */}
      <div className="md:hidden grid grid-cols-3 border-t border-white/10 px-2 py-1.5 bg-slate-950/80 backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-medium transition-all ${
                isActive
                  ? 'text-emerald-400 font-bold bg-white/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

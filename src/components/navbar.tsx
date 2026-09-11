'use client';

import { useSchoolUser, signInWithSchoolGoogle } from '@/lib/use-school-user';
import { isAdminUser } from '@/lib/admin-role';
import { ProfileAvatar } from './profile-avatar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Dumbbell, Clock, ShieldCheck, UserCheck, UserRound, LogIn } from 'lucide-react';
import styles from './navbar.module.css';
import { ThemeToggle } from '@/components/theme-toggle';


export function Navbar() {
  const pathname = usePathname();
  const { user } = useSchoolUser();
  const isAdmin = isAdminUser(user);
  const userRole = isAdmin ? 'admin' : 'student';

  const handleGoogleLogin = async () => {
    const { error } = await signInWithSchoolGoogle();
    if (error) alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
  };

  const navItems = [
    { href: '/', label: 'อุปกรณ์กีฬา', icon: Dumbbell },
    { href: '/my-borrows', label: 'ของที่ฉันยืม', icon: Clock },
    isAdmin
      ? { href: '/admin', label: 'จัดการสต็อก (Admin)', icon: ShieldCheck }
      : { href: '/profile', label: 'โปรไฟล์', icon: UserRound }
  ];

  return (
    <>
    <header className="hidden xl:block sticky top-0 z-40 w-full glass-panel border-b t-line backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" aria-label="Barrow Sports หน้าแรก" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 rounded-xl glass-pill p-[1px]">
            <div className="w-full h-full bg-[var(--background)] rounded-[11px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[var(--accent)] group-hover:text-[var(--foreground)] transition-colors" />
            </div>
          </div>
          <div className="hidden min-[380px]:flex flex-col">
            <span className="font-semibold text-sm sm:text-lg tracking-tight whitespace-nowrap text-[var(--foreground)]">
              BARROW<span className="text-emerald-500">.</span>SPORTS
            </span>
            <span className="text-[10px] font-medium tracking-wide whitespace-nowrap t-muted uppercase -mt-0.5">
              ระบบยืม-คืนอุปกรณ์กีฬา
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="เมนูหลัก" className="hidden xl:flex items-center gap-1.5 p-1 rounded-xl glass-pill">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'glass-pill-active'
                    : 't-muted hover:text-[var(--foreground)] hover:bg-[var(--accent-soft)]'
                }`}
              >
                {item.href === '/profile' ? <ProfileAvatar user={user} className="w-6 h-6" /> : <Icon className="w-4 h-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Role Switcher Pill */}
          <div
            title="สิทธิ์ของบัญชีปัจจุบัน"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all  ${
              userRole === 'admin'
                ? 'glass-badge-amber hover:bg-amber-500/25'
                : 'glass-badge-emerald hover:bg-emerald-500/25'
            }`}
          >
            {userRole === 'admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">สิทธิ์: แอดมิน (ครู)</span>
                <span className="sm:hidden">Admin</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">สิทธิ์: ผู้ยืม (นักเรียน)</span>
                <span className="sm:hidden">นักเรียน</span>
              </>
            )}
          </div>

          {/* Account access */}
          {user ? <Link href="/profile" aria-label="โปรไฟล์ของฉัน" className="w-11 h-11 flex items-center justify-center"><ProfileAvatar user={user} className="w-8 h-8" /></Link> : <button
            onClick={handleGoogleLogin}
            aria-label="เข้าสู่ระบบด้วย Google"
            className="flex items-center gap-1.5 px-3 py-1.5 glass-pill hover:bg-[var(--accent-soft)] rounded-xl text-xs font-semibold transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden lg:inline">Google Login</span>
          </button>}
        </div>

      </div>

    </header>

      <nav aria-label="เมนูหลักบนมือถือ" className={styles.dock}>
        {(isAdmin ? [...navItems, { href: '/profile', label: 'โปรไฟล์', icon: UserRound }] : navItems).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
                aria-current={isActive ? 'page' : undefined}
              className={styles.link}
            >
              {item.href === '/profile' ? <ProfileAvatar user={user} className="w-6 h-6" /> : <Icon className="w-5 h-5" aria-hidden="true" />}
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

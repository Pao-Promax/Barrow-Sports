'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function SubadminSettings() {
  const [admins, setAdmins] = useState<{ email: string }[]>([]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function request(body?: { email: string; action: string }) {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch('/api/subadmins', { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${session?.access_token || ''}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'ไม่สามารถเชื่อมต่อได้');
    return data;
  }
  useEffect(() => {
    request().then(data => setAdmins(data.admins)).catch(e => setError(e.message)).finally(() => setBusy(false));
  }, []);
  async function change(target: string, action: string) {
    setBusy(true); setError(''); setMessage('');
    try {
      await request({ email: target, action });
      setEmail('');
      setMessage(action === 'grant' ? 'เพิ่มสิทธิ์แล้ว ให้บัญชีดังกล่าวเข้าสู่ระบบใหม่' : 'ยกเลิกสิทธิ์แล้ว');
      setAdmins((await request()).admins);
    } catch (e) { setError(e instanceof Error ? e.message : 'กรุณาลองใหม่'); }
    finally { setBusy(false); }
  }
  return <section className="glass-card rounded-2xl p-5 space-y-4" aria-labelledby="subadmin-heading">
    <h2 id="subadmin-heading" className="text-lg font-semibold">จัดการ Subadmin</h2>
    <p className="text-sm t-muted">เพิ่มผู้ดูแลอุปกรณ์ด้วยอีเมลโรงเรียนที่เคยเข้าสู่ระบบแล้ว</p>
    <form className="space-y-3" onSubmit={e => { e.preventDefault(); void change(email, 'grant'); }}>
      <label className="block text-sm" htmlFor="subadmin-email">อีเมลผู้ดูแล</label>
      <input id="subadmin-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@cru.ac.th" className="w-full min-h-11 rounded-xl px-3 glass-input" disabled={busy} />
      <button disabled={busy} className="min-h-11 rounded-xl px-4 bg-[var(--foreground)] text-[var(--background)] disabled:opacity-50">เพิ่ม Subadmin</button>
    </form>
    {busy && <p role="status" className="text-sm t-muted">กำลังดำเนินการ…</p>}
    {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
    {message && <p role="status" className="text-sm text-[var(--accent)]">{message}</p>}
    {!busy && !error && !admins.length && <p className="text-sm t-muted">ยังไม่มี Subadmin</p>}
    <ul className="divide-y divide-[var(--glass-border)]">{admins.map(admin => <li key={admin.email} className="flex items-center justify-between gap-3 py-3 text-sm">
      <span className="min-w-0 break-all">{admin.email}</span>
      <button disabled={busy} onClick={() => void change(admin.email, 'revoke')} className="shrink-0 min-h-11 px-3 rounded-xl glass-pill disabled:opacity-50" aria-label={`ยกเลิกสิทธิ์ ${admin.email}`}>ยกเลิกสิทธิ์</button>
    </li>)}</ul>
  </section>;
}

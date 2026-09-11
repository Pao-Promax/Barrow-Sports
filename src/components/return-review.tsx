"use client";
import { useState } from 'react';
import type { BorrowRequest } from '@/types';
import { authHeaders } from '@/lib/auth-headers';

export function ReturnReview({ borrow, onSuccess }: { borrow: BorrowRequest; onSuccess: () => void }) {
  const [damaged, setDamaged] = useState(borrow.reported_damaged ?? 0);
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function review(action: 'accept' | 'reject') {
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/return', { method: 'PATCH', headers: { ...await authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ borrow_id: borrow.id, action, damaged_count: damaged, note, confirmed }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess();
    } catch (e) { setError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ'); }
    finally { setBusy(false); }
  }
  return <article className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
    <div><h3 className="font-semibold">{borrow.equipment_name}</h3><p className="text-sm t-muted">{borrow.user_name} · {borrow.quantity} ชิ้น</p><p className="text-sm t-muted">จุดคืน: {borrow.equipment?.location || 'ตรวจสอบกับผู้ยืม'}</p></div>
    {borrow.return_proof_url && <a href={borrow.return_proof_url} target="_blank" rel="noreferrer" aria-label="เปิดรูปหลักฐานขนาดเต็ม"><img src={borrow.return_proof_url} alt="หลักฐานที่ผู้ยืมแจ้งคืน" className="w-full h-48 object-contain rounded-xl bg-[var(--accent-soft)]" /></a>}
    <p className="text-sm">ผู้ยืมแจ้งชำรุด {borrow.reported_damaged ?? 0} ชิ้น{borrow.return_note && ` · ${borrow.return_note}`}</p>
    <label className="block text-sm">จำนวนชำรุดที่ตรวจพบ<input type="number" min={0} max={borrow.quantity} step={1} value={damaged} onChange={e => setDamaged(e.target.valueAsNumber)} className="glass-input rounded-xl min-h-11 p-3 w-full mt-2" /></label>
    <label className="flex items-start gap-3 text-sm min-h-11"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1 w-5 h-5 shrink-0" />ตรวจของจริงแล้ว ชนิดตรงและได้รับครบ {borrow.quantity} ชิ้น</label>
    <label className="block text-sm">หมายเหตุ / เหตุผลที่ไม่รับคืน<textarea maxLength={2000} value={note} onChange={e => setNote(e.target.value)} className="glass-input w-full rounded-xl p-3 mt-2" placeholder="เช่น ยังไม่ได้วางอุปกรณ์ที่จุดคืน หรือจำนวนไม่ครบ" /></label>
    {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
    <div className="flex flex-wrap gap-2"><button disabled={busy || !confirmed || !Number.isInteger(damaged) || damaged < 0 || damaged > borrow.quantity} onClick={() => review('accept')} className="min-h-11 flex-1 rounded-xl px-4 py-3 bg-[var(--foreground)] text-[var(--background)] disabled:opacity-40">รับคืน · พร้อมยืม {Number.isFinite(damaged) ? borrow.quantity - damaged : 0} ชิ้น</button><button disabled={busy || !note.trim()} onClick={() => review('reject')} className="min-h-11 rounded-xl px-4 py-3 glass-pill disabled:opacity-40">ไม่รับคืน</button></div>
  </article>;
}

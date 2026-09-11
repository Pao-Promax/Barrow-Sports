'use client';
import { authHeaders } from '@/lib/auth-headers';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { ReturnModal } from '@/components/return-modal';
import { BorrowRequest } from '@/types';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  ExternalLink,
  ChevronRight,
  Package,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function MyBorrowsPage() {
  const [borrows, setBorrows] = useState<BorrowRequest[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBorrowForReturn, setSelectedBorrowForReturn] = useState<BorrowRequest | null>(null);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  const fetchBorrows = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/borrow?mine=true', { headers: await authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'โหลดรายการไม่สำเร็จ');
      if (res.ok && data.borrows) {
        setBorrows(data.borrows);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดรายการไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  const activeBorrows = borrows.filter((b) => ['active', 'overdue', 'pending_verification'].includes(b.status));
  const returnedBorrows = borrows.filter((b) => b.status === 'returned');

  // Time remaining calculator
  const getTimeRemainingBadge = (dueAtString: string) => {
    const now = new Date().getTime();
    const due = new Date(dueAtString).getTime();
    const diff = due - now;

    if (diff <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl glass-badge-rose text-xs font-bold animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>เกินกำหนดส่งคืน!</span>
        </span>
      );
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl glass-badge-emerald text-xs font-bold">
        <Clock className="w-3.5 h-3.5" />
        <span>เหลือเวลา {hours > 0 ? `${hours} ชม. ` : ''}{minutes} นาที</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-[calc(108px+env(safe-area-inset-bottom,0px))] xl:pb-10 space-y-8">
        
        {/* Page Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b t-line pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">รายการยืมอุปกรณ์กีฬาของฉัน</h1>
            <p className="text-xs sm:text-sm t-muted mt-1">
              ตรวจสอบสถานะ เวลาคืน และถ่ายรูปยืนยันการนำอุปกรณ์กลับมาวางที่จุดเดิม
            </p>
          </div>
          <Link
            href="/"
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl text-xs font-bold glass-pill text-[var(--foreground)] flex items-center gap-2 hover:bg-[var(--accent-soft)] transition-colors"
          >
            <span>+ ยืมอุปกรณ์เพิ่ม</span>
            <ChevronRight className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
          </Link>
        </div>

        {error && <p role="alert" className="glass-card rounded-xl p-4">{error} · <Link href="/profile" className="underline">โปรไฟล์ / เข้าสู่ระบบ</Link></p>}

        {/* Section 1: Active Borrows (Currently In Use) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              รายการที่ยังไม่ปิด ({activeBorrows.length} รายการ)
            </h2>
          </div>

          {loading ? (
            <div className="h-40 rounded-2xl glass-card animate-pulse"></div>
          ) : activeBorrows.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl glass-card text-center space-y-3">
              <Package className="w-12 h-12 t-faint mx-auto" />
              <div className="text-sm font-bold text-[var(--foreground)]">คุณไม่มีรายการอุปกรณ์ที่กำลังยืมอยู่</div>
              <Link
                href="/"
                className="inline-block text-xs text-emerald-700 dark:text-emerald-300 hover:text-emerald-700 dark:text-emerald-300 font-bold"
              >
                เลือกยืมอุปกรณ์กีฬาคลิกที่นี่ &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {activeBorrows.map((borrow) => (
                <div
                  key={borrow.id}
                  className="glass-card p-5 sm:p-6 rounded-2xl space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-[var(--foreground)]">{borrow.equipment_name}</h3>
                      <div className="text-xs t-muted mt-0.5">ผู้ยืม: {borrow.user_name}</div>
                      <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300 mt-1">
                        จำนวนที่ยืม: {borrow.quantity} ชิ้น
                      </div>
                    </div>
                    {borrow.status === 'pending_verification' ? <span className="glass-pill rounded-xl px-3 py-2 text-xs">รอตรวจรับ</span> : getTimeRemainingBadge(borrow.due_at)}
                  </div>

                  <div className="p-3.5 glass-panel rounded-xl text-xs space-y-2 t-muted">
                    <div className="flex items-center justify-between">
                      <span className="t-muted">เวลายืม:</span>
                      <span className="text-[var(--foreground)] font-semibold">
                        {new Date(borrow.borrowed_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="t-muted">กำหนดส่งคืน:</span>
                      <span className="text-cyan-700 dark:text-cyan-300 font-bold">
                        {new Date(borrow.due_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </span>
                    </div>
                  </div>

                  {borrow.status === 'pending_verification' ? <p role="status" className="text-sm t-muted">แจ้งคืนแล้ว รอแอดมินตรวจของจริง ยังไม่ปิดรายการยืม</p> : <>
                  {borrow.review_note && <p className="text-sm text-amber-700 dark:text-amber-300">ยังไม่รับคืน: {borrow.review_note}</p>}
                  <button
                    onClick={() => setSelectedBorrowForReturn(borrow)}
                    className="w-full py-3 px-4 rounded-xl text-xs font-black bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] min-h-[44px]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>ถ่ายรูป / แจ้งคืน</span>
                  </button></>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Returned History (Responsive Table for Desktop, Cards for Mobile) */}
        <section className="space-y-4 pt-4 border-t t-line">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              ประวัติการส่งคืนเรียบร้อย ({returnedBorrows.length} รายการ)
            </h2>
          </div>

          {returnedBorrows.length === 0 ? (
            <div className="text-xs t-muted italic">ยังไม่มีประวัติการส่งคืน</div>
          ) : (
            <>
              {/* Mobile View: Clean Touch Cards */}
              <div className="md:hidden space-y-3">
                {returnedBorrows.map((row) => (
                  <div key={row.id} className="p-4 rounded-2xl glass-card space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-[var(--foreground)]">{row.equipment_name}</div>
                        <div className="text-xs t-muted">{row.user_name}</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-lg glass-badge-cyan text-xs font-bold">
                        {row.quantity} ชิ้น
                      </span>
                    </div>

                    <div className="text-[11px] t-muted flex items-center justify-between pt-1">
                      <span>เวลาคืน: {row.returned_at ? new Date(row.returned_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'} น.</span>
                      {row.return_proof_url && (
                        <button
                          onClick={() => setViewProofUrl(row.return_proof_url!)}
                          className="text-cyan-700 dark:text-cyan-300 font-bold flex items-center gap-1"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>ดูรูป</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Full Rich Table */}
              <div className="hidden md:block overflow-hidden rounded-2xl glass-panel border t-line">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--accent-soft)] border-b t-line t-muted font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">อุปกรณ์</th>
                      <th className="py-3.5 px-4">ผู้ยืม</th>
                      <th className="py-3.5 px-4">จำนวน</th>
                      <th className="py-3.5 px-4">เวลาส่งคืน</th>
                      <th className="py-3.5 px-4">รูปถ่ายยืนยัน</th>
                      <th className="py-3.5 px-4">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {returnedBorrows.map((row) => (
                      <tr key={row.id} className="hover:bg-[var(--accent-soft)] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[var(--foreground)]">{row.equipment_name}</td>
                        <td className="py-3.5 px-4 t-muted">{row.user_name}</td>
                        <td className="py-3.5 px-4 text-cyan-700 dark:text-cyan-300 font-bold">{row.quantity} ชิ้น</td>
                        <td className="py-3.5 px-4 t-muted">
                          {row.returned_at
                            ? new Date(row.returned_at).toLocaleString('th-TH')
                            : '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          {row.return_proof_url ? (
                            <button
                              onClick={() => setViewProofUrl(row.return_proof_url!)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-pill text-cyan-700 dark:text-cyan-300 hover:text-[var(--foreground)] font-semibold cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-300" />
                              <span>ดูรูปถ่าย</span>
                            </button>
                          ) : (
                            <span className="t-faint">ไม่มีรูป</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 t-muted">
                          <span className="px-2.5 py-1 rounded-lg glass-pill t-muted text-[11px]">
                            {row.return_note || 'ส่งคืนปกติ'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

      </main>

      {/* Return Modal */}
      <ReturnModal key={selectedBorrowForReturn?.id ?? "closed"}
        borrow={selectedBorrowForReturn}
        isOpen={!!selectedBorrowForReturn}
        onClose={() => setSelectedBorrowForReturn(null)}
        onSuccess={() => fetchBorrows()}
      />

      {/* Image Preview Lightbox */}
      {viewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-xl w-full glass-panel rounded-2xl overflow-hidden border t-line">
            <div className="flex items-center justify-between p-4 border-b t-line">
              <span className="text-xs font-bold text-[var(--foreground)]">รูปภาพหลักฐานการคืนอุปกรณ์</span>
              <button
                onClick={() => setViewProofUrl(null)}
                className="text-xs px-3 py-1 rounded-lg glass-pill text-[var(--foreground)] hover:text-[var(--foreground)]"
              >
                ปิด
              </button>
            </div>
            <img src={viewProofUrl} alt="รูปหลักฐาน" className="w-full max-h-[70vh] object-contain bg-[var(--background)]" />
          </div>
        </div>
      )}

    </div>
  );
}

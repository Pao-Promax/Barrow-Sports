'use client';

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
  const [loading, setLoading] = useState(true);
  const [selectedBorrowForReturn, setSelectedBorrowForReturn] = useState<BorrowRequest | null>(null);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  const fetchBorrows = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/borrow');
      const data = await res.json();
      if (res.ok && data.borrows) {
        setBorrows(data.borrows);
      }
    } catch (err) {
      console.error('Fetch borrows error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  const activeBorrows = borrows.filter((b) => b.status === 'active');
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        
        {/* Page Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">รายการยืมอุปกรณ์กีฬาของฉัน</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              ตรวจสอบสถานะ เวลาคืน และถ่ายรูปยืนยันการนำอุปกรณ์กลับมาวางที่จุดเดิม
            </p>
          </div>
          <Link
            href="/"
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl text-xs font-bold glass-pill text-slate-200 flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <span>+ ยืมอุปกรณ์เพิ่ม</span>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>

        {/* Section 1: Active Borrows (Currently In Use) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
            <h2 className="text-lg font-bold text-slate-100">
              กำลังยืมใช้งานอยู่ ({activeBorrows.length} รายการ)
            </h2>
          </div>

          {loading ? (
            <div className="h-40 rounded-2xl glass-card animate-pulse"></div>
          ) : activeBorrows.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl glass-card text-center space-y-3">
              <Package className="w-12 h-12 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-slate-200">คุณไม่มีรายการอุปกรณ์ที่กำลังยืมอยู่</div>
              <Link
                href="/"
                className="inline-block text-xs text-emerald-400 hover:text-emerald-300 font-bold"
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
                      <h3 className="font-bold text-base sm:text-lg text-slate-100">{borrow.equipment_name}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">ผู้ยืม: {borrow.user_name}</div>
                      <div className="text-xs font-bold text-cyan-400 mt-1">
                        จำนวนที่ยืม: {borrow.quantity} ชิ้น
                      </div>
                    </div>
                    {getTimeRemainingBadge(borrow.due_at)}
                  </div>

                  <div className="p-3.5 glass-panel rounded-xl text-xs space-y-2 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">เวลายืม:</span>
                      <span className="text-slate-100 font-semibold">
                        {new Date(borrow.borrowed_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">กำหนดส่งคืน:</span>
                      <span className="text-cyan-300 font-bold">
                        {new Date(borrow.due_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedBorrowForReturn(borrow)}
                    className="w-full py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] min-h-[44px]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>ถ่ายรูป / ส่งคืนอุปกรณ์นี้</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Returned History (Responsive Table for Desktop, Cards for Mobile) */}
        <section className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">
              ประวัติการส่งคืนเรียบร้อย ({returnedBorrows.length} รายการ)
            </h2>
          </div>

          {returnedBorrows.length === 0 ? (
            <div className="text-xs text-slate-400 italic">ยังไม่มีประวัติการส่งคืน</div>
          ) : (
            <>
              {/* Mobile View: Clean Touch Cards */}
              <div className="md:hidden space-y-3">
                {returnedBorrows.map((row) => (
                  <div key={row.id} className="p-4 rounded-2xl glass-card space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-slate-100">{row.equipment_name}</div>
                        <div className="text-xs text-slate-400">{row.user_name}</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-lg glass-badge-cyan text-xs font-bold">
                        {row.quantity} ชิ้น
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>เวลาคืน: {row.returned_at ? new Date(row.returned_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'} น.</span>
                      {row.return_proof_url && (
                        <button
                          onClick={() => setViewProofUrl(row.return_proof_url!)}
                          className="text-cyan-400 font-bold flex items-center gap-1"
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
              <div className="hidden md:block overflow-hidden rounded-2xl glass-panel border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 border-b border-white/10 text-slate-400 font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">อุปกรณ์</th>
                      <th className="py-3.5 px-4">ผู้ยืม</th>
                      <th className="py-3.5 px-4">จำนวน</th>
                      <th className="py-3.5 px-4">เวลาส่งคืน</th>
                      <th className="py-3.5 px-4">รูปถ่ายยืนยัน</th>
                      <th className="py-3.5 px-4">หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {returnedBorrows.map((row) => (
                      <tr key={row.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-100">{row.equipment_name}</td>
                        <td className="py-3.5 px-4 text-slate-300">{row.user_name}</td>
                        <td className="py-3.5 px-4 text-cyan-400 font-bold">{row.quantity} ชิ้น</td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {row.returned_at
                            ? new Date(row.returned_at).toLocaleString('th-TH')
                            : '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          {row.return_proof_url ? (
                            <button
                              onClick={() => setViewProofUrl(row.return_proof_url!)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-pill text-cyan-300 hover:text-white font-semibold cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5 text-cyan-400" />
                              <span>ดูรูปถ่าย</span>
                            </button>
                          ) : (
                            <span className="text-slate-500">ไม่มีรูป</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          <span className="px-2.5 py-1 rounded-lg glass-pill text-slate-300 text-[11px]">
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
      <ReturnModal
        borrow={selectedBorrowForReturn}
        isOpen={!!selectedBorrowForReturn}
        onClose={() => setSelectedBorrowForReturn(null)}
        onSuccess={() => fetchBorrows()}
      />

      {/* Image Preview Lightbox */}
      {viewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-xl w-full glass-panel rounded-2xl overflow-hidden border border-white/20">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-xs font-bold text-slate-200">รูปภาพหลักฐานการคืนอุปกรณ์</span>
              <button
                onClick={() => setViewProofUrl(null)}
                className="text-xs px-3 py-1 rounded-lg glass-pill text-slate-200 hover:text-white"
              >
                ปิด
              </button>
            </div>
            <img src={viewProofUrl} alt="รูปหลักฐาน" className="w-full max-h-[70vh] object-contain bg-slate-950" />
          </div>
        </div>
      )}

    </div>
  );
}

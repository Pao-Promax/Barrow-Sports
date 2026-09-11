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
  Calendar, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Package
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>เกินกำหนดส่งคืน!</span>
        </span>
      );
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
        <Clock className="w-3.5 h-3.5" />
        <span>เหลือเวลา {hours > 0 ? `${hours} ชม. ` : ''}{minutes} นาที</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">รายการยืมอุปกรณ์กีฬาของฉัน</h1>
            <p className="text-xs text-slate-400 mt-1">
              ตรวจสอบสถานะ เวลาคืน และถ่ายรูปยืนยันการนำอุปกรณ์กลับมาวางที่จุดเดิม
            </p>
          </div>
          <Link
            href="/"
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5"
          >
            <span>+ ยืมอุปกรณ์เพิ่ม</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Section 1: Active Borrows */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h2 className="text-lg font-bold text-slate-200">
              กำลังยืมใช้งานอยู่ ({activeBorrows.length} รายการ)
            </h2>
          </div>

          {loading ? (
            <div className="h-40 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
          ) : activeBorrows.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">คุณไม่มีรายการอุปกรณ์ที่กำลังยืมอยู่</div>
              <Link
                href="/"
                className="inline-block text-xs text-emerald-400 hover:underline font-bold"
              >
                เลือกยืมอุปกรณ์กีฬาคลิกที่นี่ &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBorrows.map((borrow) => (
                <div
                  key={borrow.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-100">{borrow.equipment_name}</h3>
                      <div className="text-xs text-slate-400 mt-1">ผู้ยืม: {borrow.user_name}</div>
                      <div className="text-xs font-semibold text-cyan-400 mt-1">
                        จำนวนที่ยืม: {borrow.quantity} ชิ้น
                      </div>
                    </div>
                    {getTimeRemainingBadge(borrow.due_at)}
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1.5 text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>เวลายืม:</span>
                      <span className="text-slate-200 font-medium">
                        {new Date(borrow.borrowed_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>กำหนดส่งคืน:</span>
                      <span className="text-cyan-300 font-semibold">
                        {new Date(borrow.due_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedBorrowForReturn(borrow)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>ถ่ายรูป / ส่งคืนอุปกรณ์นี้</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Returned History */}
        <section className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-200">
              ประวัติการส่งคืนเรียบร้อย ({returnedBorrows.length} รายการ)
            </h2>
          </div>

          {returnedBorrows.length === 0 ? (
            <div className="text-xs text-slate-500 italic">ยังไม่มีประวัติการส่งคืน</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">อุปกรณ์</th>
                    <th className="py-3 px-4">ผู้ยืม</th>
                    <th className="py-3 px-4">จำนวน</th>
                    <th className="py-3 px-4">เวลาส่งคืน</th>
                    <th className="py-3 px-4">รูปถ่ายยืนยัน</th>
                    <th className="py-3 px-4">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {returnedBorrows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-slate-200">{row.equipment_name}</td>
                      <td className="py-3 px-4 text-slate-300">{row.user_name}</td>
                      <td className="py-3 px-4 text-cyan-400 font-semibold">{row.quantity} ชิ้น</td>
                      <td className="py-3 px-4 text-slate-400">
                        {row.returned_at
                          ? new Date(row.returned_at).toLocaleString('th-TH')
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {row.return_proof_url ? (
                          <button
                            onClick={() => setViewProofUrl(row.return_proof_url!)}
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold underline"
                          >
                            <span>ดูรูปภาพ</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-slate-500">ไม่มีรูป</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                          {row.return_note || 'ส่งคืนปกติ'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="relative max-w-xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200">รูปภาพหลักฐานการคืนอุปกรณ์</span>
              <button
                onClick={() => setViewProofUrl(null)}
                className="text-slate-400 hover:text-slate-100"
              >
                ปิด
              </button>
            </div>
            <img src={viewProofUrl} alt="รูปหลักฐาน" className="w-full max-h-[70vh] object-contain bg-black" />
          </div>
        </div>
      )}

    </div>
  );
}

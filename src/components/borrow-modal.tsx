'use client';

import React, { useState } from 'react';
import { X, Clock, MapPin, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Equipment } from '@/types';

interface BorrowModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BorrowModal({ equipment, isOpen, onClose, onSuccess }: BorrowModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [durationHours, setDurationHours] = useState(2);
  const [userName, setUserName] = useState('นายธีรชัย (นักเรียน)');
  const [studentId, setStudentId] = useState('50788');
  const [userEmail, setUserEmail] = useState('50788@cru.ac.th');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !equipment) return null;

  // Calculate live preview of due time
  const getDuePreview = () => {
    const now = new Date();
    if (durationHours === -1) {
      const endOfDay = new Date(now);
      endOfDay.setHours(17, 0, 0, 0);
      if (endOfDay.getTime() <= now.getTime()) {
        endOfDay.setDate(endOfDay.getDate() + 1);
      }
      return `${endOfDay.toLocaleDateString('th-TH')} เวลา 17:00 น. (เลิกเรียน)`;
    }
    const due = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
    return `${due.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. (อีก ${durationHours} ชม.)`;
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: equipment.id,
          user_name: `${userName} (รหัส: ${studentId})`,
          user_email: userEmail,
          quantity,
          duration_hours: durationHours
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการยืมอุปกรณ์');
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Frosted Glass Modal (Bottom Sheet on Mobile, Centered on Desktop) */}
      <div className="relative w-full max-w-lg glass-panel rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-white/15">
        
        {/* Mobile Pull Bar Indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse"></span>
            <h3 className="font-bold text-base text-slate-100">ยืนยันการยืมอุปกรณ์กีฬา</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleBorrow} className="p-6 space-y-5 overflow-y-auto">
          
          {/* Equipment Glass Mini Card */}
          <div className="flex gap-4 p-3.5 glass-card rounded-xl border border-white/10">
            <img
              src={equipment.image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80'}
              alt={equipment.name}
              className="w-20 h-20 rounded-lg object-cover bg-slate-900 shrink-0"
            />
            <div className="flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-100 line-clamp-1">{equipment.name}</h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ตำแหน่ง: {equipment.location}</span>
                </div>
              </div>
              <div className="text-xs font-bold text-emerald-400">
                พร้อมให้ยืม: {equipment.available_quantity} ชิ้น
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 glass-badge-rose rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quantity Selector with Thumb-friendly Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              จำนวนที่ต้องการยืม (ชิ้น)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl glass-pill hover:bg-white/15 text-slate-100 font-black text-xl flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                -
              </button>
              <div className="w-20 h-12 rounded-xl glass-input flex items-center justify-center font-black text-emerald-300 text-lg">
                {quantity}
              </div>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(equipment.available_quantity, quantity + 1))}
                className="w-12 h-12 rounded-xl glass-pill hover:bg-white/15 text-slate-100 font-black text-xl flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                +
              </button>
              <span className="text-xs text-slate-400 ml-2">
                (มีให้ยืม {equipment.available_quantity} ชิ้น)
              </span>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              เลือกระยะเวลาการยืม
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 1, label: '1 ชั่วโมง (คาบเรียน)' },
                { value: 2, label: '2 ชั่วโมง (ฝึกซ้อม)' },
                { value: 4, label: '4 ชั่วโมง (ช่วงเย็น)' },
                { value: -1, label: 'ส่งคืนก่อน 17:00 น.' },
              ].map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => setDurationHours(slot.value)}
                  className={`p-3 rounded-xl text-xs font-medium text-left transition-all cursor-pointer min-h-[44px] ${
                    durationHours === slot.value
                      ? 'glass-pill-active'
                      : 'glass-pill text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>{slot.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Due Time Preview Glass Banner */}
          <div className="p-3.5 rounded-xl glass-badge-cyan flex items-center gap-2.5 text-xs">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-300">กำหนดส่งคืน: </span>
              <span className="font-bold text-cyan-300">{getDuePreview()}</span>
            </div>
          </div>

          {/* Borrower Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                ชื่อผู้ยืม
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                รหัสนักเรียน / บัตรประจำตัว
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 shrink-0 pb-2 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || equipment.available_quantity === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 cursor-pointer active:scale-98 min-h-[44px]"
            >
              {loading ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>ยืนยันการยืมอุปกรณ์</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

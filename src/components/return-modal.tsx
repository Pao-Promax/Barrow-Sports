'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, CheckCircle2, AlertTriangle } from 'lucide-react';
import { authHeaders } from '@/lib/auth-headers';
import { BorrowRequest } from '@/types';

interface ReturnModalProps {
  borrow: BorrowRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReturnModal({ borrow, isOpen, onClose, onSuccess }: ReturnModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDamaged, setIsDamaged] = useState(false);
  const [damagedCount, setDamagedCount] = useState(1);
  const [returnNote, setReturnNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  if (!isOpen || !borrow) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type) || selected.size > 10 * 1024 * 1024) { setError('ใช้รูป JPG, PNG หรือ WebP ไม่เกิน 10 MB'); return; }
      setError('');
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!file) throw new Error('กรุณาถ่ายรูปอุปกรณ์ที่จุดคืน');
      const headers = await authHeaders();
      let uploadedProofUrl = '';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'return-proofs');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers,
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          uploadedProofUrl = uploadData.url;
        } else { throw new Error(uploadData.error || 'อัปโหลดรูปไม่สำเร็จ'); }
      }

      const res = await fetch('/api/return', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borrow_id: borrow.id,
          return_proof_url: uploadedProofUrl,
          return_note: returnNote,
          is_damaged: isDamaged,
          damaged_count: isDamaged ? damagedCount : 0
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการส่งคืน');
      }

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
      
      {/* Frosted Glass Bottom Sheet on Mobile, Centered on Desktop */}
      <div className="relative w-full max-w-lg glass-panel rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border t-line">
        
        {/* Mobile pull indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-[var(--line)] rounded-full mx-auto mt-3"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b t-line shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
            <h3 className="font-bold text-base text-[var(--foreground)]">แจ้งคืนอุปกรณ์กีฬา</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="t-muted hover:text-[var(--foreground)] p-1.5 rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleReturn} className="p-6 space-y-5 overflow-y-auto">
          
          {/* Target item info */}
          <div className="p-3.5 glass-card rounded-xl border t-line flex justify-between items-center">
            <div>
              <div className="text-[11px] t-muted">อุปกรณ์ที่ส่งคืน:</div>
              <div className="font-bold text-sm text-[var(--foreground)] mt-0.5">{borrow.equipment_name}</div>
              <div className="text-xs t-muted mt-1">ผู้ยืม: {borrow.user_name}</div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 glass-badge-cyan text-xs font-bold rounded-lg">
                จำนวน {borrow.quantity} ชิ้น
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 glass-badge-rose rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Photo Proof Section with mobile camera capture */}
          <div>
            <label className="block text-xs font-semibold t-muted mb-2">
              ถ่ายรูป / อัปโหลดรูปวางอุปกรณ์คืนที่จุดเดิม <span className="text-rose-700 dark:text-rose-300">*</span>
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border t-line glass-panel group">
                <img
                  src={previewUrl}
                  alt="รูปถ่ายยืนยันจุดส่งคืน"
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <button
                  type="button"
                  aria-label="ลบรูปหลักฐาน"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl('');
                  }}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-rose-600 text-[var(--foreground)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>พร้อมอัปโหลดรูปภาพ</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed t-line hover:border-cyan-400/60 rounded-2xl p-6 sm:p-8 text-center cursor-pointer glass-panel hover:bg-[var(--accent-soft)] transition-all flex flex-col items-center justify-center gap-2.5 min-h-[140px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-300 shadow-lg shadow-cyan-500/10">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-[var(--foreground)]">
                  แตะเพื่อเปิดกล้องถ่ายรูป หรือเลือกรูปจากมือถือ
                </div>
                <p className="text-[11px] t-muted max-w-xs">
                  ถ่ายรูปอุปกรณ์ที่วางเก็บบนตู้หรือชั้นวาง แอดมินจะตรวจของจริงก่อนปิดรายการและคืนสต็อก
                </p>
              </button>
            )}
          </div>

          {/* Damaged Report Glass Section */}
          <div className="p-4 rounded-xl glass-card border t-line space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDamaged}
                onChange={(e) => setIsDamaged(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-[var(--accent-soft)]"
              />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                แจ้งอุปกรณ์ชำรุด / มีปัญหาขณะใช้งาน
              </span>
            </label>

            {isDamaged && (
              <div className="pt-3 border-t t-line space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs t-muted">จำนวนที่ชำรุด:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDamagedCount(Math.max(1, damagedCount - 1))}
                      className="w-8 h-8 rounded-lg glass-pill text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold px-2 text-amber-700 dark:text-amber-300">{damagedCount} ชิ้น</span>
                    <button
                      type="button"
                      onClick={() => setDamagedCount(Math.min(borrow.quantity, damagedCount + 1))}
                      className="w-8 h-8 rounded-lg glass-pill text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-[11px] font-semibold t-muted mb-1">
              หมายเหตุเพิ่มเติม (ถ้ามี)
            </label>
            <input
              type="text"
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
              placeholder="เช่น นำไปวางในตู้ A-01 เรียบร้อย"
              className="w-full px-3.5 py-2.5 glass-input rounded-xl text-xs text-[var(--foreground)] focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t t-line shrink-0 pb-2 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold t-muted hover:text-[var(--foreground)] transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              {loading ? (
                <span>กำลังบันทึกข้อมูล...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>แจ้งคืน · รอตรวจรับ</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

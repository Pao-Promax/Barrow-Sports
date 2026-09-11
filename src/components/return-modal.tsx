'use client';

import React, { useState, useRef } from 'react';
import { X, Camera, Upload, CheckCircle2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
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

  if (!isOpen || !borrow) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
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
      let uploadedProofUrl = '';

      // 1. Upload photo if provided
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'return-proofs');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          uploadedProofUrl = uploadData.url;
        }
      } else {
        // Fallback default sample proof photo for easy desktop testing
        uploadedProofUrl = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80';
      }

      // 2. Call return API
      const res = await fetch('/api/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h3 className="font-bold text-base text-slate-100">ส่งคืนอุปกรณ์กีฬา</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleReturn} className="p-6 space-y-5 overflow-y-auto">
          
          {/* Target item info */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-400">อุปกรณ์ที่ส่งคืน:</div>
              <div className="font-bold text-sm text-slate-100 mt-0.5">{borrow.equipment_name}</div>
              <div className="text-xs text-slate-400 mt-1">ผู้ยืม: {borrow.user_name}</div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold rounded-lg">
                จำนวน {borrow.quantity} ชิ้น
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Photo Capture / Upload Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              ถ่ายรูป / อัปโหลดรูปยืนยันการนำอุปกรณ์มาเก็บที่จุดเดิม <span className="text-rose-400">*</span>
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                <img
                  src={previewUrl}
                  alt="รูปถ่ายยืนยันจุดส่งคืน"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl('');
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>พร้อมอัปโหลดรูปภาพ</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  แตะเพื่อถ่ายรูป หรือ เลือกรูปจากเครื่อง
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  ถ่ายรูปอุปกรณ์ที่วางเก็บในตู้/ชั้นวางเพื่อเป็นหลักฐานการส่งคืน
                </p>
              </div>
            )}
          </div>

          {/* Damaged Report Toggle */}
          <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDamaged}
                onChange={(e) => setIsDamaged(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
              />
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                แจ้งอุปกรณ์ชำรุด / มีปัญหาขณะใช้งาน
              </span>
            </label>

            {isDamaged && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400">จำนวนที่ชำรุด:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDamagedCount(Math.max(1, damagedCount - 1))}
                      className="w-7 h-7 rounded bg-slate-800 text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold px-2 text-amber-300">{damagedCount} ชิ้น</span>
                    <button
                      type="button"
                      onClick={() => setDamagedCount(Math.min(borrow.quantity, damagedCount + 1))}
                      className="w-7 h-7 rounded bg-slate-800 text-xs font-bold"
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
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              หมายเหตุเพิ่มเติม (ถ้ามี)
            </label>
            <input
              type="text"
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
              placeholder="เช่น เก็บไว้ที่ชั้น 2 ตู้ A-01 เรียบร้อย"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>กำลังบันทึกข้อมูล...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยันส่งคืนอุปกรณ์</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

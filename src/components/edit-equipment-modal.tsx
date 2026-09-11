'use client';

import React, { useState } from 'react';
import { X, Wrench, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { Equipment } from '@/types';

interface EditEquipmentModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEquipmentModal({ equipment, isOpen, onClose, onSuccess }: EditEquipmentModalProps) {
  const [totalQuantity, setTotalQuantity] = useState(equipment?.total_quantity || 1);
  const [availableQuantity, setAvailableQuantity] = useState(equipment?.available_quantity || 1);
  const [damagedQuantity, setDamagedQuantity] = useState(equipment?.damaged_quantity || 0);
  const [location, setLocation] = useState(equipment?.location || 'ตู้ A-01');
  const [status, setStatus] = useState(equipment?.status || 'available');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !equipment) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/equipment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: equipment.id,
          total_quantity: totalQuantity,
          available_quantity: availableQuantity,
          damaged_quantity: damagedQuantity,
          location,
          status
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'อัปเดตไม่สำเร็จ');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${equipment.name}" ออกจากระบบ?`)) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/equipment?id=${equipment.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'ลบไม่สำเร็จ');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100">ปรับสต็อกและสถานะอุปกรณ์</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <div className="text-xs text-slate-400">อุปกรณ์:</div>
            <div className="text-sm font-bold text-slate-100">{equipment.name}</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                จำนวนทั้งหมด
              </label>
              <input
                type="number"
                min="0"
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                พร้อมใช้งาน
              </label>
              <input
                type="number"
                min="0"
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-rose-400 mb-1">
                ชำรุด / เสียหาย
              </label>
              <input
                type="number"
                min="0"
                value={damagedQuantity}
                onChange={(e) => setDamagedQuantity(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-rose-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ตำแหน่งตู้ / จุดเก็บ
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                สถานะอุปกรณ์
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'available' | 'maintenance' | 'out_of_stock')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
              >
                <option value="available">พร้อมใช้งาน (Available)</option>
                <option value="maintenance">กำลังซ่อมบำรุง (Maintenance)</option>
                <option value="out_of_stock">ของหมดชั่วคราว (Out of stock)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>ลบอุปกรณ์</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}

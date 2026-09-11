'use client';

import { supabase } from '@/lib/supabase';
import { isAdminUser } from '@/lib/admin-role';
import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { EquipmentPhoto } from './equipment-photo';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEquipmentModal({ isOpen, onClose, onSuccess }: AddEquipmentModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('basketball');
  const [totalQuantity, setTotalQuantity] = useState(5);
  const [location, setLocation] = useState('ตู้ A-01');
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!photo) { setError('กรุณาถ่ายรูปหรือเลือกรูป แล้วรอลบพื้นหลังให้เสร็จ'); return; }
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('กรุณาเข้าสู่ระบบ');
      const { data: { user } } = await supabase.auth.getUser();
      if (!isAdminUser(user)) throw new Error('เฉพาะ Admin เท่านั้นที่เพิ่มอุปกรณ์ได้');
      const uploadBody = new FormData(); uploadBody.append('file', photo, 'equipment.png');
      const upload = await fetch('/api/equipment-image', { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` }, body: uploadBody });
      const uploaded = await upload.json();
      if (!upload.ok) throw new Error(uploaded.error || 'อัปโหลดรูปไม่สำเร็จ');
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          name,
          category,
          total_quantity: totalQuantity,
          location,
          image_url: uploaded.url,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เพิ่มอุปกรณ์ไม่สำเร็จ');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[var(--background)] text-[var(--foreground)] border t-line rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between px-6 py-4 border-b t-line bg-[var(--accent-soft)] shrink-0">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
            <h3 className="font-bold text-base text-[var(--foreground)]">เพิ่มอุปกรณ์กีฬาใหม่เข้าระบบ</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="t-muted hover:text-[var(--foreground)] p-1 rounded-lg hover:bg-[var(--accent-soft)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <EquipmentPhoto onChange={setPhoto} disabled={loading} />
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold t-muted mb-1">
              ชื่ออุปกรณ์กีฬา <span className="text-rose-700 dark:text-rose-300">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ลูกบาสเกตบอล Molten BG3800 เบอร์ 7"
              className="w-full px-3.5 py-2.5 bg-[var(--background)] border t-line rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold t-muted mb-1">
                หมวดหมู่กีฬา
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--background)] border t-line rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
              >
                <option value="basketball">บาสเกตบอล (Basketball)</option>
                <option value="football">ฟุตบอล (Football)</option>
                <option value="badminton">แบดมินตัน (Badminton)</option>
                <option value="volleyball">วอลเลย์บอล (Volleyball)</option>
                <option value="tabletennis">เทเบิลเทนนิส / ปิงปอง</option>
                <option value="training">อุปกรณ์ฝึกซ้อมทั่วไป</option>
                <option value="other">กีฬาอื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold t-muted mb-1">
                จำนวนทั้งหมด (ชิ้น)
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2.5 bg-[var(--background)] border t-line rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold t-muted mb-1">
              ตำแหน่งจุดจัดเก็บ (Locker / Rack)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="เช่น ตู้ A-01, ห้องเก็บอุปกรณ์ 2"
              className="w-full px-3 py-2 bg-[var(--background)] border t-line rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold t-muted mb-1">
              คำอธิบายรายละเอียด
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดสภาพอุปกรณ์ หรือเงื่อนไขการใช้"
              className="w-full px-3 py-2 bg-[var(--background)] border t-line rounded-xl text-sm text-[var(--foreground)] focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t t-line shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold t-muted hover:text-[var(--foreground)]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || !photo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-all cursor-pointer"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกอุปกรณ์ใหม่'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, PlusCircle, Image as ImageIcon, MapPin, Layers } from 'lucide-react';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_IMAGES = [
  { label: 'บาสเกตบอล', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80' },
  { label: 'ฟุตบอล', url: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80' },
  { label: 'แบดมินตัน', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80' },
  { label: 'วอลเลย์บอล', url: 'https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80' },
  { label: 'ปิงปอง', url: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&q=80' },
  { label: 'กรวยซ้อม', url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&q=80' },
];

export function AddEquipmentModal({ isOpen, onClose, onSuccess }: AddEquipmentModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('basketball');
  const [totalQuantity, setTotalQuantity] = useState(5);
  const [location, setLocation] = useState('ตู้ A-01');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          total_quantity: totalQuantity,
          location,
          image_url: imageUrl,
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
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">เพิ่มอุปกรณ์กีฬาใหม่เข้าระบบ</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ชื่ออุปกรณ์กีฬา <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ลูกบาสเกตบอล Molten BG3800 เบอร์ 7"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                หมวดหมู่กีฬา
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                จำนวนทั้งหมด (ชิ้น)
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ตำแหน่งจุดจัดเก็บ (Locker / Rack)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="เช่น ตู้ A-01, ห้องเก็บอุปกรณ์ 2"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              รูปภาพอุปกรณ์ (เลือกรูปตัวอย่างด่วน หรือ ใส่ลิงก์ URL)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    imageUrl === preset.url
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              คำอธิบายรายละเอียด
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดสภาพอุปกรณ์ หรือเงื่อนไขการใช้"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 shrink-0">
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกอุปกรณ์ใหม่'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

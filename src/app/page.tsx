'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { BorrowModal } from '@/components/borrow-modal';
import { Equipment } from '@/types';
import { 
  Search, 
  Dumbbell, 
  MapPin, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Boxes
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'basketball', label: 'บาสเกตบอล' },
  { id: 'football', label: 'ฟุตบอล' },
  { id: 'badminton', label: 'แบดมินตัน' },
  { id: 'volleyball', label: 'วอลเลย์บอล' },
  { id: 'tabletennis', label: 'ปิงปอง' },
  { id: 'training', label: 'อุปกรณ์ฝึกซ้อม' },
];

export default function HomePage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItemForBorrow, setSelectedItemForBorrow] = useState<Equipment | null>(null);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/equipment', window.location.origin);
      if (selectedCategory !== 'all') url.searchParams.set('category', selectedCategory);
      if (searchQuery) url.searchParams.set('search', searchQuery);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok && data.equipment) {
        setEquipmentList(data.equipment);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEquipment();
  };

  // Quick statistics
  const totalItemsCount = equipmentList.reduce((acc, item) => acc + item.total_quantity, 0);
  const availableItemsCount = equipmentList.reduce((acc, item) => acc + item.available_quantity, 0);
  const damagedItemsCount = equipmentList.reduce((acc, item) => acc + (item.damaged_quantity || 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        
        {/* Glassmorphism Hero Section */}
        <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10 glass-panel border border-white/10">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-badge-emerald text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Barrow-Sports School Equipment Hub</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                ระบบยืม-คืนอุปกรณ์กีฬาโรงเรียน <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                  สะดวก รวดเร็ว พร้อมระบบคืนด้วยรูปถ่าย
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                เลือกอุปกรณ์กีฬาที่ต้องการใช้งาน ระบุช่วงเวลา และนำไปออกกำลังกายได้ทันที
                เมื่อเล่นเสร็จ เพียงถ่ายรูปยืนยันจุดจัดเก็บเดิมเพื่อปิดรายการ
              </p>
            </div>

            {/* Glass Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
              <div className="p-3.5 sm:p-4 rounded-2xl glass-card text-center">
                <div className="text-xl sm:text-3xl font-black text-white">{totalItemsCount}</div>
                <div className="text-[10px] sm:text-xs text-slate-400 mt-1 font-medium">อุปกรณ์ทั้งหมด</div>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl glass-card text-center border-emerald-500/30">
                <div className="text-xl sm:text-3xl font-black text-emerald-400">{availableItemsCount}</div>
                <div className="text-[10px] sm:text-xs text-emerald-300/90 mt-1 font-medium">พร้อมให้ยืม</div>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl glass-card text-center border-rose-500/30">
                <div className="text-xl sm:text-3xl font-black text-rose-400">{damagedItemsCount}</div>
                <div className="text-[10px] sm:text-xs text-rose-300/90 mt-1 font-medium">ชำรุด/ซ่อมบำรุง</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Category Filter Section */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Glass Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="ค้นหาชื่ออุปกรณ์หรือจุดเก็บ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </form>

            {/* Glass Category Pills (Responsive horizontal scroll) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    selectedCategory === cat.id
                      ? 'glass-pill-active'
                      : 'glass-pill text-slate-300 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* Equipment Grid (Responsive 1-col on mobile, 2-col tablet, 3-col desktop) */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-88 rounded-2xl glass-card animate-pulse"></div>
              ))}
            </div>
          ) : equipmentList.length === 0 ? (
            <div className="text-center py-16 rounded-3xl glass-card space-y-3">
              <Dumbbell className="w-12 h-12 text-slate-500 mx-auto" />
              <div className="text-base font-bold text-slate-200">ไม่พบอุปกรณ์กีฬาในหมวดหมู่นี้</div>
              <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูครับ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipmentList.map((item) => {
                const isAvailable = item.available_quantity > 0;
                return (
                  <div
                    key={item.id}
                    className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Photo Container with Glass Overlay */}
                      <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                        
                        {/* Location Badge */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg glass-pill text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5 shadow-md">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{item.location}</span>
                        </div>

                        {/* Stock Badge */}
                        <div className="absolute top-3 right-3">
                          {isAvailable ? (
                            <span className="px-2.5 py-1 rounded-lg glass-badge-emerald text-[11px] font-bold shadow-md">
                              พร้อมยืม {item.available_quantity} ชิ้น
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg glass-badge-rose text-[11px] font-bold shadow-md">
                              ของหมดชั่วคราว
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Equipment Info Body */}
                      <div className="p-5 space-y-2.5">
                        <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-300/80 line-clamp-2 leading-relaxed">
                          {item.description || 'อุปกรณ์กีฬามาตรฐานสำหรับการฝึกซ้อมในโรงเรียน'}
                        </p>

                        {item.damaged_quantity > 0 && (
                          <div className="pt-1 text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>มีรายงานชำรุด {item.damaged_quantity} ชิ้น</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-5 pt-0">
                      <button
                        disabled={!isAvailable}
                        onClick={() => setSelectedItemForBorrow(item)}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] ${
                          isAvailable
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 active:scale-[0.98]'
                            : 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isAvailable ? (
                          <>
                            <span>ขอยืมอุปกรณ์นี้</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          <span>อุปกรณ์ถูกยืมครบแล้ว</span>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Borrow Modal */}
      <BorrowModal
        equipment={selectedItemForBorrow}
        isOpen={!!selectedItemForBorrow}
        onClose={() => setSelectedItemForBorrow(null)}
        onSuccess={() => fetchEquipment()}
      />

    </div>
  );
}

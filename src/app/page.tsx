'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { BorrowModal } from '@/components/borrow-modal';
import { Equipment } from '@/types';
import { 
  Search, 
  Dumbbell, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  Filter
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

  // Quick stats
  const totalItemsCount = equipmentList.reduce((acc, item) => acc + item.total_quantity, 0);
  const availableItemsCount = equipmentList.reduce((acc, item) => acc + item.available_quantity, 0);
  const damagedItemsCount = equipmentList.reduce((acc, item) => acc + (item.damaged_quantity || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl p-8 sm:p-10 border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Barrow-Sports School Equipment Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                ยืมอุปกรณ์กีฬาโรงเรียน <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  สะดวก รวดเร็ว พร้อมระบบคืนด้วยรูปถ่าย
                </span>
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                เลือกอุปกรณ์ที่ต้องการ ระบุชั่วโมงการยืม และนำไปออกกำลังกายหรือฝึกซ้อมได้ทันที 
                เมื่อใช้เสร็จเพียงถ่ายรูปวางเก็บคืนที่จุดเดิมเพื่อยืนยันการคืน
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="text-2xl font-black text-white">{totalItemsCount}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-medium">อุปกรณ์ทั้งหมด</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                <div className="text-2xl font-black text-emerald-400">{availableItemsCount}</div>
                <div className="text-[11px] text-emerald-300/80 mt-0.5 font-medium">พร้อมให้ยืม</div>
              </div>
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-center">
                <div className="text-2xl font-black text-rose-400">{damagedItemsCount}</div>
                <div className="text-[11px] text-rose-300/80 mt-0.5 font-medium">ชำรุด/ซ่อมบำรุง</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="ค้นหาชื่ออุปกรณ์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </form>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-2 sm:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* Equipment Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800"></div>
              ))}
            </div>
          ) : equipmentList.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800 space-y-3">
              <Dumbbell className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-base font-bold text-slate-300">ไม่พบอุปกรณ์กีฬาในหมวดหมู่นี้</div>
              <p className="text-xs text-slate-500">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูครับ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipmentList.map((item) => {
                const isAvailable = item.available_quantity > 0;
                return (
                  <div
                    key={item.id}
                    className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between group transition-all"
                  >
                    <div>
                      {/* Photo Header */}
                      <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                        
                        {/* Location Tag */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5 shadow-md">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{item.location}</span>
                        </div>

                        {/* Stock Badge */}
                        <div className="absolute top-3 right-3">
                          {isAvailable ? (
                            <span className="px-2.5 py-1 rounded-lg sports-badge-available text-[11px] font-bold shadow-md">
                              พร้อมยืม {item.available_quantity} ชิ้น
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg sports-badge-out text-[11px] font-bold shadow-md">
                              ของหมดชั่วคราว
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info Body */}
                      <div className="p-5 space-y-2">
                        <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description || 'อุปกรณ์กีฬามาตรฐานสำหรับการฝึกซ้อมในโรงเรียน'}
                        </p>

                        {item.damaged_quantity > 0 && (
                          <div className="pt-1 text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>มีชำรุด {item.damaged_quantity} ชิ้น</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Button */}
                    <div className="p-5 pt-0">
                      <button
                        disabled={!isAvailable}
                        onClick={() => setSelectedItemForBorrow(item)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isAvailable
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
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
        onSuccess={() => {
          fetchEquipment();
        }}
      />

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { BorrowModal } from '@/components/borrow-modal';
import { Equipment } from '@/types';
import { equipmentIllustrations } from '@/lib/equipment-images';
import { 
  Search, 
  Dumbbell, 
  MapPin, 
  ArrowRight
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-[calc(108px+env(safe-area-inset-bottom,0px))] xl:pb-10 space-y-8">
        
        <section className="space-y-5 pt-2 sm:pt-6">
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-snug">
              ยืมอุปกรณ์กีฬา
            </h1>
            <p className="text-sm sm:text-base t-muted leading-relaxed">
              เลือกอุปกรณ์ที่ต้องการ แล้วคืนพร้อมรูปถ่ายเมื่อเล่นเสร็จ
            </p>
          </div>
        </section>

        {/* Search & Category Filter Section */}
        <section className="space-y-4">
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
            
            {/* Glass Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full xl:w-72 shrink-0">
              <input
                type="search"
                aria-label="ค้นหาอุปกรณ์กีฬา"
                placeholder="ค้นหาชื่ออุปกรณ์หรือจุดเก็บ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
              />
              <Search className="w-4 h-4 t-faint absolute left-3.5 top-3" />
            </form>

            {/* Glass Category Pills (Responsive horizontal scroll) */}
            <div className="flex items-center gap-2 overflow-x-auto min-w-0 pb-2 xl:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  aria-pressed={selectedCategory === cat.id}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    selectedCategory === cat.id
                      ? 'glass-pill-active'
                      : 'glass-pill t-muted'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* Floating equipment catalog */}
        <section aria-label="รายการอุปกรณ์กีฬา" aria-busy={loading}>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-88 rounded-2xl bg-[var(--accent-soft)] animate-pulse"></div>
              ))}
            </div>
          ) : equipmentList.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Dumbbell className="w-12 h-12 t-faint mx-auto" />
              <div className="text-base font-bold text-[var(--foreground)]">ไม่พบอุปกรณ์กีฬาในหมวดหมู่นี้</div>
              <p className="text-xs t-muted">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูครับ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 sm:gap-y-16">
              {equipmentList.map((item) => {
                const isAvailable = item.available_quantity > 0;
                const illustration = equipmentIllustrations[item.image_url ?? ''];
                return (
                  <article key={item.id} className="flex flex-col group" aria-label={item.name}>
                    <div className="relative flex h-56 sm:h-64 items-center justify-center mb-5">
                      {item.image_url ? (
                        <img
                          src={illustration ?? item.image_url}
                          alt={illustration ? `ภาพประกอบ ${item.name}` : item.name}
                          loading="lazy"
                          className="max-w-full w-64 h-full object-contain motion-safe:group-hover:-translate-y-1 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 t-muted text-xs">
                          <Dumbbell className="w-16 h-16" aria-hidden="true" />
                          ยังไม่มีรูปอุปกรณ์
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h2 className="font-semibold text-base leading-relaxed">{item.name}</h2>
                      <p className={`text-sm tabular-nums ${isAvailable ? 'text-[var(--accent)]' : 't-muted'}`}>
                        พร้อมยืม <strong className="text-xl font-semibold">{item.available_quantity}</strong> ชิ้น
                      </p>
                      <p className="flex items-center gap-1.5 text-xs t-muted">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        จุดรับ {item.location}
                      </p>
                    </div>
                    <button
                      disabled={!isAvailable}
                      onClick={() => setSelectedItemForBorrow(item)}
                      aria-label={`ยืม ${item.name}`}
                      className="mt-5 w-full py-3 px-4 rounded-2xl glass-pill text-sm font-medium flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAvailable ? <>ยืมอุปกรณ์ <ArrowRight className="w-4 h-4" aria-hidden="true" /></> : 'หมดชั่วคราว'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <p className="text-xs t-muted">ภาพอุปกรณ์บางรายการเป็นภาพประกอบ</p>

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

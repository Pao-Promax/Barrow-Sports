'use client';

import { equipmentIllustrations } from '@/lib/equipment-images';
import { useAdmin } from '@/lib/use-admin';
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { AddEquipmentModal } from '@/components/add-equipment-modal';
import { EditEquipmentModal } from '@/components/edit-equipment-modal';
import { Equipment, BorrowRequest } from '@/types';
import { 
  ShieldCheck, 
  PlusCircle, 
  Wrench, 
  Package, 
  Search,
  ExternalLink,
  MapPin,
  Camera
} from 'lucide-react';

const BORROW_STATUS = {
  active: 'ยืมอยู่',
  pending_verification: 'รอตรวจสอบ',
  returned: 'คืนแล้ว',
  overdue: 'เกินกำหนด',
  cancelled: 'ยกเลิกแล้ว',
};

export default function AdminPage() {
  const isAdmin = useAdmin();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [borrowList, setBorrowList] = useState<BorrowRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'borrows'>('inventory');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eqRes, bRes] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/borrow')
      ]);

      const [eqData, bData] = await Promise.all([
        eqRes.json(),
        bRes.json()
      ]);

      if (eqRes.ok && eqData.equipment) setEquipmentList(eqData.equipment);
      if (bRes.ok && bData.borrows) setBorrowList(bData.borrows);
    } catch (err) {
      console.error('Fetch admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalStock = equipmentList.reduce((sum, item) => sum + item.total_quantity, 0);
  const availableStock = equipmentList.reduce((sum, item) => sum + item.available_quantity, 0);
  const damagedStock = equipmentList.reduce((sum, item) => sum + (item.damaged_quantity || 0), 0);
  const activeBorrowsCount = borrowList.filter((b) => b.status === 'active').length;

  const filteredEquipment = equipmentList.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-[calc(108px+env(safe-area-inset-bottom,0px))] xl:pb-10 space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b t-line pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 shrink-0 rounded-2xl glass-badge-amber flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-700 dark:text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">จัดการอุปกรณ์กีฬา</h1>
              <p className="text-xs sm:text-sm t-muted mt-0.5">
                จัดการสต็อกอุปกรณ์กีฬา ปรับปรุงจำนวนชำรุด และตรวจสอบรูปถ่ายการส่งคืน
              </p>
            </div>
          </div>

          {isAdmin && <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black bg-[var(--foreground)] text-[var(--background)] transition-all cursor-pointer min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ เพิ่มอุปกรณ์กีฬาใหม่</span>
          </button>}
        </div>

        {/* Glass Metrics Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card flex flex-col p-4 sm:p-5 rounded-2xl text-center">
            <div className="text-xs font-semibold t-muted">อุปกรณ์ทั้งหมดในระบบ</div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--foreground)] mt-auto pt-2 tabular-nums">{totalStock} <span className="text-xs font-normal t-faint">ชิ้น</span></div>
          </div>
          <div className="glass-card flex flex-col p-4 sm:p-5 rounded-2xl text-center border-emerald-500/30">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">พร้อมให้ยืมใช้งาน</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-auto pt-2 tabular-nums">{availableStock} <span className="text-xs font-normal t-faint">ชิ้น</span></div>
          </div>
          <div className="glass-card flex flex-col p-4 sm:p-5 rounded-2xl text-center border-cyan-500/30">
            <div className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">กำลังถูกยืมอยู่</div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-700 dark:text-cyan-300 mt-auto pt-2 tabular-nums">{activeBorrowsCount} <span className="text-xs font-normal t-faint">รายการ</span></div>
          </div>
          <div className="glass-card flex flex-col p-4 sm:p-5 rounded-2xl text-center border-rose-500/30">
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">ชำรุด / ซ่อมบำรุง</div>
            <div className="text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-300 mt-auto pt-2 tabular-nums">{damagedStock} <span className="text-xs font-normal t-faint">ชิ้น</span></div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b t-line">
          <div className="grid grid-cols-2 sm:flex items-stretch sm:items-center gap-3">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-700 dark:text-emerald-300'
                  : 'border-transparent t-muted hover:text-[var(--foreground)]'
              }`}
            >
              สต็อก ({equipmentList.length})
            </button>
            <button
              onClick={() => setActiveTab('borrows')}
              className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'borrows'
                  ? 'border-cyan-700 dark:border-cyan-300 text-cyan-800 dark:text-cyan-700 dark:text-cyan-300'
                  : 'border-transparent t-muted hover:text-[var(--foreground)]'
              }`}
            >
              ประวัติยืม-คืน ({borrowList.length})
            </button>
          </div>

          {activeTab === 'inventory' && (
            <div className="relative pb-2">
              <input
                type="search"
                aria-label="ค้นหาอุปกรณ์หรือจุดเก็บ"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาอุปกรณ์ / จุดเก็บ..."
                className="w-full sm:w-64 pl-8 pr-3 py-2.5 rounded-xl glass-input text-xs text-[var(--foreground)] focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 t-muted absolute left-2.5 top-3" />
            </div>
          )}
        </div>

        {/* Tab 1: Inventory (Cards on Mobile, Table on Desktop) */}
        {activeTab === 'inventory' && (
          <>
            {/* Compact inventory cards keep identity, stock, and action together. */}
            <div className="md:hidden space-y-3">
              {filteredEquipment.map((item) => (
                <article key={item.id} aria-label={item.name} className="relative grid grid-cols-[112px_minmax(0,1fr)] min-[480px]:grid-cols-[128px_minmax(0,1fr)] gap-x-4 gap-y-4 p-4 rounded-2xl glass-card">
                  <img
                    src={equipmentIllustrations[item.image_url ?? ''] ?? item.image_url ?? undefined}
                    alt={item.name}
                    className="w-28 h-28 min-[480px]:w-32 min-[480px]:h-32 min-[480px]:row-span-2 object-contain"
                  />
                  <div className="min-w-0 self-start pt-11 min-[480px]:pt-0 min-[480px]:pr-12">
                    <h2 className="font-semibold text-base text-[var(--foreground)] leading-snug break-words">{item.name}</h2>
                    <p className="text-xs t-muted flex items-center gap-1 mt-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{item.location}</span>
                    </p>
                  </div>
                  <dl aria-label="จำนวนสต็อก" className="col-span-2 min-[480px]:col-span-1 min-[480px]:col-start-2 grid grid-cols-3 gap-3 tabular-nums">
                    <div>
                      <dt className="text-xs t-muted">ทั้งหมด</dt>
                      <dd className="mt-1 text-xl leading-6 font-semibold">{item.total_quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-xs t-muted">พร้อมยืม</dt>
                      <dd className="mt-1 text-xl leading-6 font-semibold text-[var(--accent)]">{item.available_quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-xs t-muted">ชำรุด</dt>
                      <dd className="mt-1 text-xl leading-6 font-semibold">{item.damaged_quantity || 0}</dd>
                    </div>
                  </dl>
                  <button
                    onClick={() => setEditingItem(item)}
                    aria-label={`ปรับสต็อก ${item.name}`}
                    title="ปรับสต็อก"
                    className="absolute top-3 right-3 w-11 h-11 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-soft)] transition-colors"
                  >
                    <Wrench className="w-5 h-5" aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-2xl glass-panel border t-line">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--accent-soft)] border-b t-line t-muted font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">รูปภาพ & ชื่ออุปกรณ์</th>
                    <th className="py-3.5 px-4">หมวดหมู่</th>
                    <th className="py-3.5 px-4">จุดจัดเก็บ</th>
                    <th className="py-3.5 px-4">ทั้งหมด</th>
                    <th className="py-3.5 px-4">พร้อมยืม</th>
                    <th className="py-3.5 px-4">ชำรุด</th>
                    <th className="py-3.5 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {filteredEquipment.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--accent-soft)] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={equipmentIllustrations[item.image_url ?? ''] ?? item.image_url ?? undefined}
                            alt={item.name}
                            className="w-10 h-10 object-contain shrink-0"
                          />
                          <div>
                            <div className="font-bold text-[var(--foreground)]">{item.name}</div>
                            <div className="text-[11px] t-muted line-clamp-1">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-lg glass-pill t-muted text-[11px] font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 t-muted">
                        <div className="flex items-center gap-1 text-cyan-700 dark:text-cyan-300">
                          <MapPin className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-300" />
                          <span>{item.location}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[var(--foreground)]">{item.total_quantity}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">{item.available_quantity}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${item.damaged_quantity > 0 ? 'text-rose-700 dark:text-rose-300' : 't-faint'}`}>
                          {item.damaged_quantity || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-pill text-amber-700 dark:text-amber-300 hover:text-[var(--foreground)] font-semibold transition-colors cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                          <span>ปรับสต็อก</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab 2: Borrow Audit */}
        {activeTab === 'borrows' && (
          <>
          <section aria-label="ประวัติยืมคืนบนมือถือ" className="lg:hidden space-y-3">
            {borrowList.length === 0 && <p className="py-8 text-center text-sm t-muted">ยังไม่มีประวัติการยืม-คืน</p>}
            {borrowList.map((row) => (
              <article key={row.id} className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold leading-snug break-words">{row.equipment_name}</h2>
                    <p className="text-sm t-muted mt-1">จำนวน {row.quantity} ชิ้น</p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium glass-pill">{BORROW_STATUS[row.status]}</span>
                </div>
                <div className="text-sm leading-relaxed break-words">
                  <p><span className="t-muted">ผู้ยืม · </span>{row.user_name}</p>
                  {row.user_email && <p className="text-xs t-muted break-all mt-1">{row.user_email}</p>}
                </div>
                <dl className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 border-t t-line pt-4 text-sm">
                  <div>
                    <dt className="text-xs t-muted mb-1">เวลายืม</dt>
                    <dd className="tabular-nums">{new Date(row.borrowed_at).toLocaleString('th-TH')}</dd>
                  </div>
                  <div>
                    <dt className="text-xs t-muted mb-1">กำหนดคืน</dt>
                    <dd className="font-medium tabular-nums">{new Date(row.due_at).toLocaleString('th-TH')}</dd>
                  </div>
                </dl>
                {row.return_proof_url ? (
                  <button onClick={() => setViewProofUrl(row.return_proof_url!)} className="min-h-11 w-full flex items-center justify-center gap-2 glass-pill rounded-xl text-sm font-medium">
                    <Camera className="w-4 h-4" aria-hidden="true" />ดูรูปยืนยัน
                  </button>
                ) : <p className="text-xs t-muted">ยังไม่มีรูปยืนยันการคืน</p>}
              </article>
            ))}
          </section>
          <div className="hidden lg:block overflow-x-auto rounded-2xl glass-panel border t-line">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-[var(--accent-soft)] border-b t-line t-muted font-semibold">
                <tr>
                  <th className="py-3.5 px-4">อุปกรณ์</th>
                  <th className="py-3.5 px-4">ผู้ยืม</th>
                  <th className="py-3.5 px-4">จำนวน</th>
                  <th className="py-3.5 px-4">เวลายืม</th>
                  <th className="py-3.5 px-4">กำหนดคืน</th>
                  <th className="py-3.5 px-4">สถานะ</th>
                  <th className="py-3.5 px-4">รูปถ่ายหลักฐาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {borrowList.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--accent-soft)] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[var(--foreground)]">{row.equipment_name}</td>
                    <td className="py-3.5 px-4 t-muted">
                      <div>{row.user_name}</div>
                      <div className="text-xs t-faint">{row.user_email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-cyan-700 dark:text-cyan-300 font-bold">{row.quantity} ชิ้น</td>
                    <td className="py-3.5 px-4 t-muted">
                      {new Date(row.borrowed_at).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3.5 px-4 t-muted">
                      {new Date(row.due_at).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg glass-pill text-xs font-medium whitespace-nowrap">{BORROW_STATUS[row.status]}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {row.return_proof_url ? (
                        <button
                          onClick={() => setViewProofUrl(row.return_proof_url!)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-pill text-cyan-700 dark:text-cyan-300 hover:text-[var(--foreground)] font-semibold cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-300" />
                          <span>ดูรูปยืนยัน</span>
                        </button>
                      ) : (
                        <span className="t-faint">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

      </main>

      {/* Add Equipment Modal */}
      <AddEquipmentModal
        isOpen={isAdmin && isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchData()}
      />

      {/* Edit Equipment Modal */}
      <EditEquipmentModal
        equipment={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSuccess={() => {
          setEditingItem(null);
          fetchData();
        }}
      />

      {/* Proof Photo Modal */}
      {viewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-xl w-full glass-panel rounded-2xl overflow-hidden border t-line">
            <div className="flex items-center justify-between p-4 border-b t-line">
              <span className="text-xs font-bold text-[var(--foreground)]">รูปถ่ายยืนยันจุดจัดเก็บส่งคืน</span>
              <button
                onClick={() => setViewProofUrl(null)}
                className="text-xs px-3 py-1 rounded-lg glass-pill text-[var(--foreground)] hover:text-[var(--foreground)]"
              >
                ปิด
              </button>
            </div>
            <img src={viewProofUrl} alt="รูปยืนยัน" className="w-full max-h-[70vh] object-contain bg-[var(--background)]" />
          </div>
        </div>
      )}

    </div>
  );
}

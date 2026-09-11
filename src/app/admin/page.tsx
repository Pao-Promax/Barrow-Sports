'use client';

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

export default function AdminPage() {
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl glass-badge-amber flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">แผงควบคุมผู้ดูแลระบบ (Admin)</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                จัดการสต็อกอุปกรณ์กีฬา ปรับปรุงจำนวนชำรุด และตรวจสอบรูปถ่ายการส่งคืน
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ เพิ่มอุปกรณ์กีฬาใหม่</span>
          </button>
        </div>

        {/* Glass Metrics Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card p-4 sm:p-5 rounded-2xl text-center">
            <div className="text-xs font-semibold text-slate-400">อุปกรณ์ทั้งหมดในระบบ</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">{totalStock} <span className="text-xs font-normal text-slate-500">ชิ้น</span></div>
          </div>
          <div className="glass-card p-4 sm:p-5 rounded-2xl text-center border-emerald-500/30">
            <div className="text-xs font-semibold text-emerald-400">พร้อมให้ยืมใช้งาน</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">{availableStock} <span className="text-xs font-normal text-slate-500">ชิ้น</span></div>
          </div>
          <div className="glass-card p-4 sm:p-5 rounded-2xl text-center border-cyan-500/30">
            <div className="text-xs font-semibold text-cyan-400">กำลังถูกยืมอยู่</div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-300 mt-1">{activeBorrowsCount} <span className="text-xs font-normal text-slate-500">รายการ</span></div>
          </div>
          <div className="glass-card p-4 sm:p-5 rounded-2xl text-center border-rose-500/30">
            <div className="text-xs font-semibold text-rose-400">ชำรุด / ซ่อมบำรุง</div>
            <div className="text-2xl sm:text-3xl font-black text-rose-300 mt-1">{damagedStock} <span className="text-xs font-normal text-slate-500">ชิ้น</span></div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              สต็อกอุปกรณ์ ({equipmentList.length} ชนิด)
            </button>
            <button
              onClick={() => setActiveTab('borrows')}
              className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'borrows'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              ประวัติการยืม-คืนทั้งหมด ({borrowList.length} รายการ)
            </button>
          </div>

          {activeTab === 'inventory' && (
            <div className="relative pb-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาอุปกรณ์ / จุดเก็บ..."
                className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          )}
        </div>

        {/* Tab 1: Inventory (Cards on Mobile, Table on Desktop) */}
        {activeTab === 'inventory' && (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredEquipment.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl glass-card space-y-3">
                  <div className="flex gap-3 items-center">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&q=80'}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-900 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-slate-100 truncate">{item.name}</div>
                      <div className="text-[11px] text-cyan-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs p-2 rounded-xl glass-panel">
                    <div>
                      <div className="text-[10px] text-slate-400">ทั้งหมด</div>
                      <div className="font-bold text-slate-100">{item.total_quantity}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-400">พร้อมยืม</div>
                      <div className="font-bold text-emerald-300">{item.available_quantity}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-rose-400">ชำรุด</div>
                      <div className="font-bold text-rose-300">{item.damaged_quantity || 0}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingItem(item)}
                    className="w-full py-2 rounded-xl text-xs font-bold glass-pill text-amber-300 hover:text-white flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>ปรับสต็อก / รายละเอียด</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-2xl glass-panel border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-white/10 text-slate-400 font-semibold">
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
                <tbody className="divide-y divide-white/5">
                  {filteredEquipment.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&q=80'}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-900 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-100">{item.name}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-lg glass-pill text-slate-300 text-[11px] font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1 text-cyan-300">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{item.location}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">{item.total_quantity}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-400">{item.available_quantity}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${item.damaged_quantity > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                          {item.damaged_quantity || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-pill text-amber-300 hover:text-white font-semibold transition-colors cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5 text-amber-400" />
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
          <div className="overflow-x-auto rounded-2xl glass-panel border border-white/10">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-950/70 border-b border-white/10 text-slate-400 font-semibold">
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
              <tbody className="divide-y divide-white/5">
                {borrowList.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-100">{row.equipment_name}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{row.user_name}</div>
                      <div className="text-[10px] text-slate-500">{row.user_email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-cyan-400 font-bold">{row.quantity} ชิ้น</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(row.borrowed_at).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {new Date(row.due_at).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.status === 'active' ? (
                        <span className="px-2.5 py-0.5 rounded-lg glass-badge-cyan text-xs font-bold">
                          ยืมอยู่
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg glass-badge-emerald text-xs font-bold">
                          คืนแล้ว
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.return_proof_url ? (
                        <button
                          onClick={() => setViewProofUrl(row.return_proof_url!)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-pill text-cyan-300 hover:text-white font-semibold cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-cyan-400" />
                          <span>ดูรูปยืนยัน</span>
                        </button>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* Add Equipment Modal */}
      <AddEquipmentModal
        isOpen={isAddModalOpen}
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
          <div className="relative max-w-xl w-full glass-panel rounded-2xl overflow-hidden border border-white/20">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-xs font-bold text-slate-200">รูปถ่ายยืนยันจุดจัดเก็บส่งคืน</span>
              <button
                onClick={() => setViewProofUrl(null)}
                className="text-xs px-3 py-1 rounded-lg glass-pill text-slate-200 hover:text-white"
              >
                ปิด
              </button>
            </div>
            <img src={viewProofUrl} alt="รูปยืนยัน" className="w-full max-h-[70vh] object-contain bg-slate-950" />
          </div>
        </div>
      )}

    </div>
  );
}

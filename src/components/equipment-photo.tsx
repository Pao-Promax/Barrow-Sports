'use client';
import { useEffect, useRef, useState } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

export function EquipmentPhoto({ onChange, disabled }: { onChange: (blob: Blob | null) => void; disabled: boolean }) {
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const cancel = useRef<() => void>(() => {});
  useEffect(() => () => { cancel.current(); onChange(null); }, [onChange]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function select(file?: File) {
    if (!file) return;
    cancel.current(); onChange(null); setPreview(''); setError(''); setProcessing(false);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) {
      setError('เลือกรูป JPG, PNG หรือ WebP ไม่เกิน 15 MB'); return;
    }
    setProcessing(true); setStatus('กำลังเตรียมรูป…');
    const worker = new Worker('/bg/worker.js');
    let active = true;
    const timeout = setTimeout(() => fail('ประมวลผลนานเกินไป กรุณาลองรูปใหม่'), 120000);
    const stop = () => { active = false; clearTimeout(timeout); worker.terminate(); };
    cancel.current = stop;
    function fail(message: string) { if (!active) return; stop(); setProcessing(false); setError(message); }
    worker.onerror = () => fail('ไม่สามารถลบพื้นหลังได้ กรุณาลองใหม่');
    worker.onmessage = ({ data }) => {
      if (!active) return;
      if (data.status) setStatus(data.status);
      if (data.error) fail(data.error);
      if (data.blob) {
        stop(); onChange(data.blob); setPreview(URL.createObjectURL(data.blob)); setProcessing(false);
        setStatus('ลบพื้นหลังแล้ว ตรวจรูปก่อนบันทึก');
      }
    };
    worker.postMessage(file);
  }
  return <section className="space-y-3" aria-label="รูปอุปกรณ์">
    <input ref={camera} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={e => { select(e.target.files?.[0]); e.target.value = ''; }} />
    <input ref={gallery} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { select(e.target.files?.[0]); e.target.value = ''; }} />
    <div className="min-h-40 flex items-center justify-center rounded-xl border t-line bg-[var(--accent-soft)] p-4" aria-busy={processing}>
      {preview ? <img src={preview} alt="ภาพอุปกรณ์หลังลบพื้นหลัง" className="h-40 w-full object-contain" /> : <p className="text-sm text-center t-muted" role="status">{processing ? status : 'ถ่ายอุปกรณ์ให้ครบชิ้น พื้นหลังเรียบ และมีแสงเพียงพอ'}</p>}
    </div>
    <div className="grid grid-cols-2 gap-3">
      <button type="button" disabled={disabled} onClick={() => camera.current?.click()} className="min-h-11 rounded-xl glass-pill flex items-center justify-center gap-2"><Camera className="w-4 h-4" />ถ่ายรูป</button>
      <button type="button" disabled={disabled} onClick={() => gallery.current?.click()} className="min-h-11 rounded-xl glass-pill flex items-center justify-center gap-2"><ImageIcon className="w-4 h-4" />เลือกรูป</button>
    </div>
    {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
    <p className="text-xs t-muted" role="status">{preview ? status : 'ลบพื้นหลังอัตโนมัติ • JPG, PNG, WebP สูงสุด 15 MB'}</p>
  </section>;
}

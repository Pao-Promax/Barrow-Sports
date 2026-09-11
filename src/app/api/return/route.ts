import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requestUser } from '@/lib/request-user';

export async function POST(request: Request) {
  try {
    const auth = await requestUser(request);
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const body = await request.json();
    if (typeof body.borrow_id !== 'string' || typeof body.return_proof_url !== 'string' || typeof body.return_note !== 'string' || body.return_note.length > 2000 || !Number.isInteger(body.damaged_count) || body.damaged_count < 0) return NextResponse.json({ error: 'ข้อมูลแจ้งคืนไม่ถูกต้อง' }, { status: 400 });
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/return-proofs/${auth.user.id}/`;
    if (!body.return_proof_url.startsWith(prefix)) return NextResponse.json({ error: 'กรุณาอัปโหลดรูปหลักฐานของคุณ' }, { status: 400 });
    const filename = body.return_proof_url.slice(prefix.length);
    if (!/^[0-9a-f-]{36}\.(jpeg|png|webp)$/.test(filename)) return NextResponse.json({ error: 'รูปหลักฐานไม่ถูกต้อง' }, { status: 400 });
    const { data: files, error: fileError } = await supabaseAdmin.storage.from('return-proofs').list(auth.user.id, { search: filename });
    if (fileError || !files?.some(file => file.name === filename)) return NextResponse.json({ error: 'ไม่พบรูปที่อัปโหลด กรุณาลองใหม่' }, { status: 400 });
    const { error } = await supabaseAdmin.rpc('submit_equipment_return', {
      p_id: body.borrow_id, p_user: auth.user.id, p_email: auth.user.email,
      p_proof: body.return_proof_url, p_note: body.return_note, p_damaged: body.damaged_count,
    });
    if (error) return NextResponse.json({ error: 'แจ้งคืนไม่ได้ กรุณาตรวจสอบเจ้าของรายการและสถานะ แล้วลองใหม่' }, { status: 409 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'แจ้งคืนไม่สำเร็จ' }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requestUser(request, true);
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const body = await request.json();
    if (typeof body.borrow_id !== 'string' || !['accept', 'reject'].includes(body.action) || !Number.isInteger(body.damaged_count) || body.damaged_count < 0 || typeof body.note !== 'string' || body.note.length > 2000 || (body.action === 'reject' && !body.note.trim()) || (body.action === 'accept' && body.confirmed !== true)) return NextResponse.json({ error: 'กรุณายืนยันการตรวจของจริง หรือระบุเหตุผลที่ไม่รับคืน' }, { status: 400 });
    const { error } = await supabaseAdmin.rpc('review_equipment_return', {
      p_id: body.borrow_id, p_reviewer: auth.user.id, p_accept: body.action === 'accept',
      p_damaged: body.damaged_count, p_note: body.note.trim(),
    });
    if (error) return NextResponse.json({ error: 'ตรวจรับไม่ได้ รายการอาจถูกดำเนินการแล้ว หรือจำนวนไม่ถูกต้อง กรุณารีเฟรช' }, { status: 409 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'บันทึกการตรวจรับไม่สำเร็จ' }, { status: 500 }); }
}

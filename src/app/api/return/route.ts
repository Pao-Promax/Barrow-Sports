import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      borrow_id, 
      return_proof_url, 
      return_note, 
      is_damaged, 
      damaged_count 
    } = body;

    if (!borrow_id) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสการยืม (borrow_id)' }, { status: 400 });
    }

    // 1. Fetch borrow request
    const { data: borrow, error: fetchError } = await supabaseAdmin
      .from('borrow_requests')
      .select('*')
      .eq('id', borrow_id)
      .single();

    if (fetchError || !borrow) {
      return NextResponse.json({ error: 'ไม่พบรายการยืม' }, { status: 404 });
    }

    if (borrow.status === 'returned') {
      return NextResponse.json({ error: 'รายการนี้ได้รับการส่งคืนแล้ว' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // 2. Update borrow_requests
    const { data: updatedBorrow, error: updateBorrowError } = await supabaseAdmin
      .from('borrow_requests')
      .update({
        status: 'returned',
        returned_at: now,
        return_proof_url: return_proof_url || null,
        return_note: return_note || (is_damaged ? 'มีรายงานอุปกรณ์ชำรุด' : 'ส่งคืนเรียบร้อย')
      })
      .eq('id', borrow_id)
      .select()
      .single();

    if (updateBorrowError) {
      return NextResponse.json({ error: updateBorrowError.message }, { status: 500 });
    }

    // 3. Fetch equipment to restore stock
    const { data: item } = await supabaseAdmin
      .from('equipment')
      .select('*')
      .eq('id', borrow.equipment_id)
      .single();

    if (item) {
      const dmgCount = is_damaged ? Math.min(parseInt(damaged_count, 10) || 1, borrow.quantity) : 0;
      const returnedUsable = borrow.quantity - dmgCount;
      const newAvailable = item.available_quantity + returnedUsable;
      const newDamaged = item.damaged_quantity + dmgCount;

      await supabaseAdmin
        .from('equipment')
        .update({
          available_quantity: newAvailable,
          damaged_quantity: newDamaged,
          status: newAvailable > 0 ? 'available' : 'out_of_stock'
        })
        .eq('id', borrow.equipment_id);
    }

    return NextResponse.json({ success: true, borrow: updatedBorrow });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

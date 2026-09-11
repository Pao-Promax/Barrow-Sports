import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET borrow requests (all or filtered by user email)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('borrow_requests')
      .select(`
        *,
        equipment:equipment_id (*)
      `)
      .order('borrowed_at', { ascending: false });

    if (userEmail) {
      query = query.eq('user_email', userEmail);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ borrows: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Create borrow request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { equipment_id, user_name, user_email, quantity, duration_hours } = body;

    if (!equipment_id || !user_name) {
      return NextResponse.json({ error: 'กรุณาระบุอุปกรณ์และชื่อผู้ยืม' }, { status: 400 });
    }

    const qty = parseInt(quantity, 10) || 1;
    const hours = parseFloat(duration_hours) || 2;

    // 1. Fetch current equipment to verify available stock
    const { data: item, error: itemError } = await supabaseAdmin
      .from('equipment')
      .select('*')
      .eq('id', equipment_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: 'ไม่พบอุปกรณ์ที่เลือก' }, { status: 404 });
    }

    if (item.available_quantity < qty) {
      return NextResponse.json({ 
        error: `อุปกรณ์คงเหลือไม่เพียงพอ (เหลือ ${item.available_quantity} ชิ้น)` 
      }, { status: 400 });
    }

    // 2. Calculate due date
    const now = new Date();
    let dueAt: Date;
    if (hours === -1) {
      // End of school day (today at 17:00)
      dueAt = new Date(now);
      dueAt.setHours(17, 0, 0, 0);
      if (dueAt.getTime() <= now.getTime()) {
        dueAt.setDate(dueAt.getDate() + 1);
      }
    } else {
      dueAt = new Date(now.getTime() + hours * 60 * 60 * 1000);
    }

    // 3. Insert borrow request
    const { data: borrowRecord, error: borrowError } = await supabaseAdmin
      .from('borrow_requests')
      .insert([
        {
          equipment_id,
          equipment_name: item.name,
          user_name,
          user_email: user_email || 'student@school.ac.th',
          quantity: qty,
          duration_hours: hours,
          borrowed_at: now.toISOString(),
          due_at: dueAt.toISOString(),
          status: 'active'
        }
      ])
      .select()
      .single();

    if (borrowError) {
      return NextResponse.json({ error: borrowError.message }, { status: 500 });
    }

    // 4. Decrement available quantity
    const newAvailable = item.available_quantity - qty;
    await supabaseAdmin
      .from('equipment')
      .update({ 
        available_quantity: newAvailable,
        status: newAvailable === 0 ? 'out_of_stock' : 'available'
      })
      .eq('id', equipment_id);

    return NextResponse.json({ success: true, borrow: borrowRecord });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

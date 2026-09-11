import { requestUser } from '@/lib/request-user';
import { isAdminUser } from '@/lib/admin-role';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET borrow requests (all or filtered by user email)
export async function GET(request: Request) {
  try {
    const auth = await requestUser(request);
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
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

    if (!isAdminUser(auth.user) || searchParams.get("mine") === "true") {
      query = query.eq("user_email", auth.user.email!);
    } else if (userEmail) {
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

export async function POST(request: Request) {
  try {
    const auth = await requestUser(request);
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { equipment_id, quantity, duration_hours } = await request.json();
    if (typeof equipment_id !== 'string' || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000 || typeof duration_hours !== 'number' || !Number.isFinite(duration_hours) || (duration_hours !== -1 && (duration_hours <= 0 || duration_hours > 168))) return NextResponse.json({ error: 'จำนวนหรือระยะเวลายืมไม่ถูกต้อง' }, { status: 400 });
    const now = Date.now();
    let due = now + duration_hours * 3600000;
    if (duration_hours === -1) {
      const bangkokDay = new Date(now + 7 * 3600000).toISOString().slice(0, 10);
      due = Date.parse(`${bangkokDay}T17:00:00+07:00`);
      if (due <= now) due += 86400000;
    }
    const { error } = await supabaseAdmin.rpc('create_equipment_borrow', {
      p_equipment: equipment_id, p_user: auth.user.id, p_email: auth.user.email,
      p_name: auth.user.user_metadata?.full_name || auth.user.email,
      p_quantity: quantity, p_hours: duration_hours, p_due: new Date(due).toISOString(),
    });
    if (error) return NextResponse.json({ error: 'ยืมไม่สำเร็จ กรุณาตรวจสอบสต็อกแล้วลองใหม่' }, { status: 409 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'ยืมไม่สำเร็จ' }, { status: 500 }); }
}

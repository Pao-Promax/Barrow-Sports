import { requestUser } from '@/lib/request-user';
import { isSchoolAccount, SCHOOL_LOGIN_MESSAGE } from '@/lib/school-account';
import { isAdminUser } from '@/lib/admin-role';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all equipment
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('equipment')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ equipment: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Add new equipment (Admin)
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
    if (!token) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
    if (!isSchoolAccount(user)) return NextResponse.json({ error: SCHOOL_LOGIN_MESSAGE }, { status: 403 });
    if (!isAdminUser(user)) return NextResponse.json({ error: 'เฉพาะ Admin เท่านั้นที่เพิ่มอุปกรณ์ได้' }, { status: 403 });

    const body = await request.json();
    const { name, category, description, image_url, total_quantity, location } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'ชื่อและหมวดหมู่อุปกรณ์จำเป็นต้องระบุ' }, { status: 400 });
    }

    const qty = parseInt(total_quantity, 10) || 1;

    const { data, error } = await supabaseAdmin
      .from('equipment')
      .insert([
        {
          name,
          category,
          description: description || '',
          image_url: image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
          total_quantity: qty,
          available_quantity: qty,
          damaged_quantity: 0,
          location: location || 'ตู้เก็บอุปกรณ์ทั่วไป',
          status: 'available'
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, equipment: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Update equipment (Stock adjustment, Damage count, etc.)
export async function PATCH(request: Request) {
  try {
    const auth = await requestUser(request, true);
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('equipment')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, equipment: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove equipment
export async function DELETE(request: Request) {
  try {
    const auth = await requestUser(request, true);
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('equipment')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

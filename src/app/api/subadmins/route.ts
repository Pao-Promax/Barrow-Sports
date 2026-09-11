import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminUser, isSuperAdminUser } from '@/lib/admin-role';
import { isSchoolAccount } from '@/lib/school-account';

async function authorize(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
  if (!isSchoolAccount(user) || !isSuperAdminUser(user)) return NextResponse.json({ error: 'เฉพาะ Super Admin เท่านั้น' }, { status: 403 });
}

async function users() {
  const result: User[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    result.push(...data.users);
    if (data.users.length < 1000) return result;
  }
}

export async function GET(request: Request) {
  try {
    const denied = await authorize(request);
    if (denied) return denied;
    return NextResponse.json({ admins: (await users()).filter(u => isAdminUser(u) && !isSuperAdminUser(u)).map(u => ({ email: u.email })) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'โหลดรายชื่อไม่สำเร็จ กรุณาลองใหม่' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const denied = await authorize(request);
    if (denied) return denied;
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!/^[^@\s]+@cru\.ac\.th$/.test(email) || !['grant', 'revoke'].includes(body?.action)) return NextResponse.json({ error: 'กรุณาระบุอีเมล @cru.ac.th และคำสั่งที่ถูกต้อง' }, { status: 400 });
    if (email === '50788@cru.ac.th') return NextResponse.json({ error: 'ไม่สามารถเปลี่ยนสิทธิ์ Super Admin ผ่านหน้านี้' }, { status: 400 });
    const target = (await users()).find(u => u.email?.toLowerCase() === email);
    if (!target || !isSchoolAccount(target)) return NextResponse.json({ error: 'ให้เจ้าของอีเมลเข้าสู่ระบบด้วย Google บนเว็บนี้ก่อน แล้วจึงเพิ่มสิทธิ์' }, { status: 400 });
    if (target.app_metadata?.super_admin) return NextResponse.json({ error: 'ไม่สามารถเปลี่ยนสิทธิ์บัญชีนี้' }, { status: 403 });
    const { error } = await supabaseAdmin.auth.admin.updateUserById(target.id, { app_metadata: { ...target.app_metadata, role: body.action === 'grant' ? 'admin' : 'student' } });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'เปลี่ยนสิทธิ์ไม่สำเร็จ กรุณาลองใหม่' }, { status: 500 });
  }
}

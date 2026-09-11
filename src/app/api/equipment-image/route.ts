import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminUser } from '@/lib/admin-role';
import { isSchoolAccount } from '@/lib/school-account';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
    if (!token) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
    if (!isSchoolAccount(user) || !isAdminUser(user)) return NextResponse.json({ error: 'เฉพาะผู้ดูแลอุปกรณ์' }, { status: 403 });
    const file = (await request.formData()).get('file');
    if (!(file instanceof File) || file.type !== 'image/png' || file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'ต้องเป็นภาพ PNG ไม่เกิน 4 MB' }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return NextResponse.json({ error: 'ไฟล์ภาพไม่ถูกต้อง' }, { status: 400 });
    const path = `${user.id}/${crypto.randomUUID()}.png`;
    const { error: uploadError } = await supabaseAdmin.storage.from('equipment-images').upload(path, bytes, { contentType: 'image/png', upsert: false });
    if (uploadError) throw uploadError;
    return NextResponse.json({ url: supabaseAdmin.storage.from('equipment-images').getPublicUrl(path).data.publicUrl });
  } catch {
    return NextResponse.json({ error: 'อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่' }, { status: 500 });
  }
}

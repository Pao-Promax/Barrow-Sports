import { requestUser } from '@/lib/request-user';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const auth = await requestUser(request);
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'return-proofs';
    if (bucket !== 'return-proofs') return NextResponse.json({ error: 'ไม่อนุญาตให้อัปโหลดไปยังพื้นที่นี้' }, { status: 403 });

    if (!(file instanceof File) || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'ใช้รูป JPG, PNG หรือ WebP ไม่เกิน 10 MB' }, { status: 400 });
    }

    const fileName = `${auth.user.id}/${crypto.randomUUID()}.${file.type.split('/')[1]}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const valid = file.type === 'image/png' ? buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : file.type === 'image/jpeg' ? buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255 : buffer.toString('ascii',0,4) === 'RIFF' && buffer.toString('ascii',8,12) === 'WEBP';
    if (!valid) return NextResponse.json({ error: 'ไฟล์ภาพไม่ถูกต้อง' }, { status: 400 });

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      success: true, 
      url: publicUrlData.publicUrl 
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

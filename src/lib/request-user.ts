import { supabaseAdmin } from './supabase';
import { isSchoolAccount } from './school-account';
import { isAdminUser } from './admin-role';

export async function requestUser(request: Request, admin = false) {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return { error: 'กรุณาเข้าสู่ระบบ', status: 401 } as const;
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return { error: 'กรุณาเข้าสู่ระบบใหม่', status: 401 } as const;
  if (!isSchoolAccount(user) || (admin && !isAdminUser(user))) return { error: 'ไม่มีสิทธิ์ดำเนินการ', status: 403 } as const;
  return { user } as const;
}

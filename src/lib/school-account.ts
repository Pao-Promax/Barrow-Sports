export const SCHOOL_LOGIN_MESSAGE = 'เข้าสู่ระบบได้เฉพาะบัญชี Google @cru.ac.th เท่านั้น';

export function isSchoolAccount(user: { email?: string; email_confirmed_at?: string; app_metadata?: Record<string, unknown> } | null | undefined): boolean {
  return !!user?.email_confirmed_at && /^[^@\s]+@cru\.ac\.th$/i.test(user.email ?? '') &&
    (user.app_metadata?.provider === 'google' || (Array.isArray(user.app_metadata?.providers) && user.app_metadata.providers.includes('google')));
}

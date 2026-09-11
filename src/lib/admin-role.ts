// app_metadata is managed by trusted server-side administrators, unlike user_metadata.
export function isAdminUser(user: { app_metadata?: Record<string, unknown> } | null | undefined): boolean {
  return user?.app_metadata?.role === 'admin';
}

export function isSuperAdminUser(user: { email?: string; app_metadata?: Record<string, unknown> } | null | undefined): boolean {
  return isAdminUser(user) && user?.app_metadata?.super_admin === true && user.email?.toLowerCase() === '50788@cru.ac.th';
}

// app_metadata is managed by trusted server-side administrators, unlike user_metadata.
export function isAdminUser(user: { app_metadata?: Record<string, unknown> } | null | undefined): boolean {
  return user?.app_metadata?.role === 'admin';
}

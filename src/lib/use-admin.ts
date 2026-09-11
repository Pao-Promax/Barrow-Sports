"use client";
import { useSchoolUser } from './use-school-user';
import { isAdminUser } from './admin-role';

export function useAdmin() {
  const { user } = useSchoolUser();
  return isAdminUser(user);
}

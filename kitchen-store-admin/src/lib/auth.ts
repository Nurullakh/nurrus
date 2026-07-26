import { ADMIN_USER_KEY } from './api';

export type AdminRole = 'admin' | 'seller' | 'manager' | 'customer';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  status?: string;
}

export const getCurrentAdminUser = (): AdminUser | null => {
  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
};

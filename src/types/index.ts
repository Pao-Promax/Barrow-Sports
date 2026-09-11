export type EquipmentCategory = 
  | 'basketball' 
  | 'football' 
  | 'badminton' 
  | 'volleyball' 
  | 'tabletennis' 
  | 'training' 
  | 'other';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory | string;
  description: string | null;
  image_url: string | null;
  total_quantity: number;
  available_quantity: number;
  damaged_quantity: number;
  location: string;
  status: 'available' | 'maintenance' | 'out_of_stock';
  created_at?: string;
  updated_at?: string;
}

export type BorrowStatus = 'active' | 'pending_verification' | 'returned' | 'overdue' | 'cancelled';

export interface BorrowRequest {
  id: string;
  user_id?: string | null;
  user_name: string;
  user_email?: string | null;
  equipment_id: string;
  equipment_name: string;
  quantity: number;
  duration_hours: number;
  borrowed_at: string;
  due_at: string;
  returned_at?: string | null;
  status: BorrowStatus;
  return_proof_url?: string | null;
  return_note?: string | null;
  verified_by?: string | null;
  created_at?: string;
  equipment?: Equipment;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'admin' | 'staff';
  student_id?: string;
  avatar_url?: string;
}

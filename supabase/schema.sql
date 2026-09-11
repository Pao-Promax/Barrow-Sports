-- Barrow-Sports Supabase Schema
-- Run this script in the Supabase SQL Editor if setting up a new environment.

-- 1. Profiles Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'student', -- 'student' | 'admin' | 'staff'
    student_id TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Equipment Table
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'basketball' | 'football' | 'badminton' | 'volleyball' | 'tabletennis' | 'training' | 'other'
    description TEXT,
    image_url TEXT,
    total_quantity INT NOT NULL DEFAULT 1,
    available_quantity INT NOT NULL DEFAULT 1,
    damaged_quantity INT NOT NULL DEFAULT 0,
    location TEXT DEFAULT 'ตู้ A-01',
    status TEXT DEFAULT 'available', -- 'available' | 'maintenance' | 'out_of_stock'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Borrow Requests Table
CREATE TABLE IF NOT EXISTS public.borrow_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    equipment_name TEXT,
    quantity INT NOT NULL DEFAULT 1,
    duration_hours NUMERIC DEFAULT 2,
    borrowed_at TIMESTAMPTZ DEFAULT now(),
    due_at TIMESTAMPTZ NOT NULL,
    returned_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active', -- 'active' | 'pending_verification' | 'returned' | 'overdue' | 'cancelled'
    return_proof_url TEXT,
    return_note TEXT,
    verified_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow all write profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read equipment" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Allow all write equipment" ON public.equipment FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all read borrow_requests" ON public.borrow_requests FOR SELECT USING (true);
CREATE POLICY "Allow all write borrow_requests" ON public.borrow_requests FOR ALL USING (true) WITH CHECK (true);

-- 5. Storage Buckets for Equipment Photos and Return Proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('equipment-images', 'equipment-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('return-proofs', 'return-proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Equipment Images" ON storage.objects FOR SELECT USING (bucket_id = 'equipment-images');
CREATE POLICY "Public Upload Equipment Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'equipment-images');
CREATE POLICY "Public Read Return Proofs" ON storage.objects FOR SELECT USING (bucket_id = 'return-proofs');
CREATE POLICY "Public Upload Return Proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'return-proofs');

-- Restrictive policy also constrains the existing permissive write policy.
CREATE POLICY "Only admins can insert equipment"
ON public.equipment AS RESTRICTIVE FOR INSERT TO anon, authenticated
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

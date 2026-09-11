-- Enable this function as the Custom Access Token hook after applying this migration.
-- Supabase calls it before issuing tokens, including sign-in and refresh.
CREATE OR REPLACE FUNCTION public.cru_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE SET search_path = '' AS $$
BEGIN
  IF coalesce(event->'claims'->>'email', '') !~* '^[^@[:space:]]+@cru[.]ac[.]th$'
     OR NOT (coalesce(event->'claims'->'app_metadata'->>'provider', '') = 'google'
       OR coalesce(event->'claims'->'app_metadata'->'providers', '[]'::jsonb) @> '["google"]'::jsonb) THEN
    RETURN jsonb_build_object('error', jsonb_build_object('http_code', 403, 'message', 'Only Google accounts with @cru.ac.th emails may sign in.'));
  END IF;
  RETURN jsonb_build_object('claims', event->'claims');
END;
$$;
REVOKE ALL ON FUNCTION public.cru_access_token_hook(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cru_access_token_hook(jsonb) TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

-- Run after the migration. No user records are created or changed.
BEGIN;
DO $$
DECLARE
  email text;
  result jsonb;
BEGIN
  IF NOT has_function_privilege('supabase_auth_admin', 'public.cru_access_token_hook(jsonb)', 'EXECUTE')
     OR has_function_privilege('anon', 'public.cru_access_token_hook(jsonb)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.cru_access_token_hook(jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Incorrect hook permissions';
  END IF;
  FOREACH email IN ARRAY ARRAY['student@cru.ac.th', 'student@CRU.AC.TH'] LOOP
    result := public.cru_access_token_hook(jsonb_build_object('claims', jsonb_build_object('email', email, 'app_metadata', jsonb_build_object('provider', 'google'))));
    IF NOT (result ? 'claims') THEN RAISE EXCEPTION 'School account rejected'; END IF;
  END LOOP;
  FOREACH email IN ARRAY ARRAY['student@gmail.com', 'student@sub.cru.ac.th', 'student@cru.ac.th.evil.com', 'a@b@cru.ac.th', ''] LOOP
    result := public.cru_access_token_hook(jsonb_build_object('claims', jsonb_build_object('email', email, 'app_metadata', jsonb_build_object('provider', 'google'))));
    IF result->'error'->>'http_code' IS DISTINCT FROM '403' THEN RAISE EXCEPTION 'Outside account accepted'; END IF;
  END LOOP;
  result := public.cru_access_token_hook('{"claims":{"email":"student@cru.ac.th","app_metadata":{"provider":"email"}}}');
  IF result->'error'->>'http_code' IS DISTINCT FROM '403' THEN RAISE EXCEPTION 'Non-Google account accepted'; END IF;
END;
$$;
ROLLBACK;

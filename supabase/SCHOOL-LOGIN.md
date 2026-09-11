# School-only Google login

Application changes:
- Google login uses `hd=cru.ac.th` and account selection; hd is a picker hint, not access control.
- Profile, navbar and admin UI accept only confirmed Google accounts whose email ends in the exact domain `@cru.ac.th`. Other sessions are signed out locally.
- The authenticated equipment creation API also checks the domain and provider after server-side `getUser` verification.
- Profile images use the signed-in account's avatar_url/picture, with an icon fallback.

Supabase setup status (2026-09-11, project ukklvfeuwndspvhtokdg):
1. Applied `migrations/20260911_cru_auth_hook.sql` to the live database.
2. Enabled `public.cru_access_token_hook` as the Custom Access Token hook and verified the configuration by reading it back. No previous hook was configured.
3. Added `http://localhost:3000/profile` to the redirect allowlist.
4. Ran `check-cru-auth-hook.sql` successfully against the live function: exact school domains accepted, outside domains and non-Google accounts rejected, execution grants checked. The management database role cannot SET ROLE supabase_auth_admin, so these are function and grant checks, not an end-to-end Auth invocation.

Remaining: Google is disabled and has no OAuth Client ID or Client Secret configured. Create a Google OAuth Web application with origin `http://localhost:3000` and redirect URI `https://ukklvfeuwndspvhtokdg.supabase.co/auth/v1/callback`. Configure the credentials in Supabase's Google provider, enable Google and disable other unused login providers, then test real school and outside accounts. Credentials can be supplied locally as GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local; never commit them.

Existing access tokens remain valid until expiry; existing sessions were not revoked. Existing unauthenticated endpoints and permissive RLS policies are separate, previously documented access-control gaps.

Run `node scripts/check-school-account.mjs` for the local domain/provider checks. Real Google login has not been exercised with live accounts.

Official reference: https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook

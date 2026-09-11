# Admin permission for equipment creation

The app checks `user.app_metadata.role === "admin"`. This field must be assigned through a trusted Supabase administrator or Admin API. Profile rows, user-editable metadata, and localStorage do not grant this permission. Sign in again after a role change so the client receives updated metadata.

Apply `migrations/20260911_admin_equipment_insert.sql` in the project's Supabase SQL editor. This migration was prepared but NOT applied: the connected Supabase tool denied access to this project. Until applied, the existing permissive database policy still allows direct inserts outside this application's protected POST endpoint.

Run `node scripts/check-admin-role.mjs` with the development server on port 3000 to check role handling and rejection of unauthenticated requests. A real signed-in admin insert has not been tested; the checks do not create inventory.

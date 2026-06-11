# Supabase Setup

## 1. Create a project

Create a Supabase project and copy:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Use the service role key only on the backend.

## 2. Apply schema

Run the SQL in:

```txt
supabase/schema.sql
```

This creates:

- `projects`
- `subscriptions`
- Indexes
- Row Level Security policies

## 3. Auth integration

The schema policies assume authenticated JWTs expose the user id at:

```sql
auth.jwt() ->> 'sub'
```

If Clerk is your auth source, configure Supabase JWT integration or use backend service-role writes while enforcing user ownership in your API.

## 4. Production hardening

- Keep RLS enabled.
- Never expose the service role key to dashboard or extension bundles.
- Add backups and PITR for production.
- Add retention policies if reports may contain customer-sensitive page content.

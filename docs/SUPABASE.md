# Supabase Setup Guide

## 1. Create a Supabase project

1. Open `https://supabase.com/dashboard`.
2. Click **New project**.
3. Select your organization.
4. Project name: `micro-saas-scout`.
5. Generate and save a strong database password.
6. Choose the closest region.
7. Click **Create new project**.

## 2. Apply SQL schema and RLS policies

1. In the Supabase left sidebar, click **SQL Editor**.
2. Click **New query**.
3. Open `supabase/schema.sql` in this repository.
4. Copy the full SQL file.
5. Paste it into the SQL editor.
6. Click **Run**.

This creates:

- `projects`
- `subscriptions`
- indexes
- Row Level Security policies

## 3. Verify tables

1. Click **Table Editor** in the left sidebar.
2. Confirm you see:
   - `projects`
   - `subscriptions`

## 4. Verify Row Level Security

1. Click **Authentication**.
2. Click **Policies**.
3. Confirm RLS is enabled for:
   - `projects`
   - `subscriptions`
4. Confirm these policies exist:
   - Users can read their projects
   - Users can insert their projects
   - Users can update their projects
   - Users can read their subscription

## 5. Copy API keys for Render

1. Click **Project Settings**.
2. Click **API**.
3. Copy **Project URL** into Render as:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
```

4. Copy **service_role secret** into Render as:

```env
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Never add the service role key to Vercel or the Chrome extension.

## 6. Authentication setup

The app is Clerk-ready. For production:

1. Open `https://dashboard.clerk.com`.
2. Click **Create application**.
3. Enable email login.
4. Copy Clerk keys into Render and Vercel.

The RLS policies expect authenticated JWT user IDs at:

```sql
auth.jwt() ->> 'sub'
```

If you do not configure Supabase JWT integration immediately, the backend still writes reports through the service role key and enforces user ownership in API logic.

## 7. Storage bucket setup

Optional but recommended for future generated PDFs and screenshots:

1. In Supabase, click **Storage**.
2. Click **New bucket**.
3. Bucket name:

```txt
reports
```

4. Keep **Public bucket** disabled.
5. Click **Create bucket**.

## 8. Production hardening

- Keep RLS enabled.
- Keep `SUPABASE_SERVICE_ROLE_KEY` only on Render.
- Add backups before launch.
- Do not log raw website snapshots in production.
- Add a report retention policy if users may analyze sensitive websites.

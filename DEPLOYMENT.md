# Micro-SaaS Scout Complete Deployment Guide

This guide deploys:

1. Dashboard on **Vercel**
2. Backend API on **Render**
3. Database on **Supabase**
4. Chrome Extension production build + zip package

The app already includes:

- `vercel.json`
- `render.yaml`
- production environment templates
- Supabase SQL schema
- Chrome extension packaging script

## Final deployment URLs you will create

You will end with URLs similar to:

- Dashboard: `https://micro-saas-scout.vercel.app`
- Backend API: `https://micro-saas-scout-api.onrender.com`
- Supabase: `https://YOUR_PROJECT_REF.supabase.co`
- Chrome extension zip: `deploy/chrome/micro-saas-scout-extension.zip`

---

## 1. Supabase database setup

### Create the project

1. Go to `https://supabase.com/dashboard`.
2. Click **New project**.
3. Choose your organization.
4. Project name: `micro-saas-scout`.
5. Database password: click **Generate a password** and save it somewhere safe.
6. Region: choose the closest region.
7. Click **Create new project**.
8. Wait until the project dashboard opens.

### Run SQL schema

1. In Supabase left sidebar, click **SQL Editor**.
2. Click **New query**.
3. Open this repo file: `supabase/schema.sql`.
4. Copy the entire SQL file.
5. Paste it into Supabase SQL Editor.
6. Click **Run**.
7. You should see success messages for tables, policies, and indexes.

### Copy Supabase environment values

1. In Supabase left sidebar, click **Project Settings**.
2. Click **API**.
3. Copy **Project URL**.
   - This becomes `SUPABASE_URL`.
4. Copy **service_role secret**.
   - This becomes `SUPABASE_SERVICE_ROLE_KEY`.
   - Keep it secret. Never put it in Vercel browser variables.

### Authentication setup

This project is Clerk-ready. For beginner deployment you can run in demo auth mode first.

For production auth:

1. Go to `https://dashboard.clerk.com`.
2. Click **Create application**.
3. Name: `Micro-SaaS Scout`.
4. Enable email login.
5. Copy:
   - Publishable key -> `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY`
   - Secret key -> `CLERK_SECRET_KEY`

### Storage bucket setup

The current app stores reports in Supabase tables and Chrome local storage. If you want future PDF/screenshot storage:

1. In Supabase left sidebar, click **Storage**.
2. Click **New bucket**.
3. Bucket name: `reports`.
4. Keep **Public bucket** turned off.
5. Click **Create bucket**.

---

## 2. Render backend API deployment

### Create Render account

1. Go to `https://render.com`.
2. Click **Get Started**.
3. Sign in with GitHub.
4. Authorize Render to access this GitHub repository.

### Deploy using Blueprint

1. Go to `https://dashboard.render.com`.
2. Click **New +**.
3. Click **Blueprint**.
4. Select the GitHub repository: `Micro-SaaS-Scout`.
5. Branch: `cursor/build-micro-saas-scout-75dd` for this PR branch, or `main` after merge.
6. Render will detect `render.yaml`.
7. Click **Apply**.
8. Render creates a web service named `micro-saas-scout-api`.

### Render settings if you deploy manually instead of Blueprint

Use these exact settings:

- Service type: **Web Service**
- Runtime: **Node**
- Plan: **Free**
- Root Directory: leave blank or `.`
- Build Command:

```bash
npm install && npm run build:server
```

- Start Command:

```bash
npm run start -w server
```

- Health Check Path:

```txt
/health
```

### Render environment variables

In Render:

1. Open the `micro-saas-scout-api` service.
2. Click **Environment** in the left menu.
3. Click **Add Environment Variable** for each item below.
4. Click **Save, rebuild, and deploy**.

Required:

```env
NODE_ENV=production
PORT=10000
DASHBOARD_ORIGIN=https://micro-saas-scout.vercel.app
ADDITIONAL_CORS_ORIGINS=https://micro-saas-scout.vercel.app
EXTENSION_ORIGIN=chrome-extension://
CHROME_EXTENSION_ID=
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
FREE_ANALYSIS_LIMIT=5
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

AI provider keys. Add at least one:

```env
OPENAI_API_KEY=sk-your-openai-key
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
```

Auth and payments:

```env
CLERK_PUBLISHABLE_KEY=pk_live_or_test_key
CLERK_SECRET_KEY=sk_live_or_test_key
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_replace_after_webhook_setup
```

### Copy Render backend URL

1. Open the Render service.
2. At the top, copy the service URL.
3. It looks like:

```txt
https://micro-saas-scout-api.onrender.com
```

4. Open:

```txt
https://micro-saas-scout-api.onrender.com/health
```

5. Confirm it returns:

```json
{ "ok": true, "service": "micro-saas-scout-api" }
```

---

## 3. Vercel dashboard deployment

### Create Vercel account

1. Go to `https://vercel.com`.
2. Click **Start Deploying**.
3. Sign in with GitHub.
4. Authorize Vercel to access this GitHub repository.

### Import project

1. Go to `https://vercel.com/new`.
2. Select repository: `Micro-SaaS-Scout`.
3. Click **Import**.
4. Framework Preset: Vercel should detect **Vite**.
5. Root Directory: leave as repository root.
6. Build Command should show:

```bash
npm run build:dashboard
```

7. Output Directory should show:

```txt
dashboard/dist
```

These values come from `vercel.json`.

### Vercel environment variables

Before clicking Deploy:

1. Expand **Environment Variables**.
2. Add:

```env
VITE_API_URL=https://micro-saas-scout-api.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_or_test_key
VITE_STRIPE_PRO_PRICE_ID=price_replace_me
```

Replace `VITE_API_URL` with your real Render URL if it is different.

3. Click **Deploy**.

### Vercel domain setup

For the free Vercel domain:

1. Open the deployed Vercel project.
2. Click **Domains**.
3. Copy the generated domain, for example:

```txt
https://micro-saas-scout.vercel.app
```

For a custom domain:

1. Click **Add Domain**.
2. Enter your domain, for example:

```txt
microsaas-scout.com
```

3. Click **Add**.
4. Vercel shows DNS records.
5. Go to your domain registrar.
6. Add the DNS records exactly as Vercel shows.
7. Return to Vercel and wait until the domain status says **Valid Configuration**.

### Update Render CORS after Vercel deploy

1. Copy your final Vercel dashboard URL.
2. Go to Render -> `micro-saas-scout-api` -> **Environment**.
3. Set:

```env
DASHBOARD_ORIGIN=https://YOUR_FINAL_VERCEL_DOMAIN
ADDITIONAL_CORS_ORIGINS=https://YOUR_FINAL_VERCEL_DOMAIN
```

4. Click **Save, rebuild, and deploy**.

---

## 4. Chrome Extension production build

### Configure production API URL

Use your Render URL:

```bash
export VITE_API_URL=https://micro-saas-scout-api.onrender.com
```

### Generate production extension zip

Run:

```bash
npm run package:extension
```

This creates:

```txt
extension/dist
deploy/chrome/micro-saas-scout-extension.zip
```

Upload this exact zip:

```txt
deploy/chrome/micro-saas-scout-extension.zip
```

### Test the extension locally before store submission

1. Open Chrome.
2. Go to:

```txt
chrome://extensions
```

3. Turn on **Developer mode** in the top-right.
4. Click **Load unpacked**.
5. Select this folder:

```txt
extension/dist
```

6. Open any SaaS website.
7. Click the Micro-SaaS Scout extension icon.
8. Click **Analyze current website**.

---

## 5. Chrome Web Store submission

### Open developer dashboard

1. Go to `https://chrome.google.com/webstore/devconsole`.
2. Pay the one-time Chrome Developer registration fee if asked.
3. Click **New Item**.
4. Upload:

```txt
deploy/chrome/micro-saas-scout-extension.zip
```

### Store listing fields

Use the template in:

```txt
docs/CHROME_STORE_LISTING.md
```

### Privacy policy

Use the template in:

```txt
docs/PRIVACY_POLICY.md
```

Host it on a public URL, for example:

- Vercel page
- Notion public page
- GitHub Pages
- Your own website

### Screenshots

Screenshot placeholders are listed in:

```txt
deploy/screenshots/README.md
```

Upload at least:

- Popup screenshot
- Side panel screenshot
- Dashboard screenshot

### Chrome Web Store privacy answers

Data usage:

- Website content: yes, only when user clicks Analyze
- Authentication information: yes, if Clerk is enabled
- User activity: no broad browsing history collection
- Personal communications: no
- Financial/payment info: handled by Stripe, not stored in the extension

Remote code:

- Answer **No**. The extension does not execute remote code.

Single purpose:

```txt
Micro-SaaS Scout analyzes the active website selected by the user and generates AI-powered SaaS opportunity reports.
```

### After Chrome assigns extension ID

1. Chrome Web Store gives your extension an ID.
2. Copy it.
3. Go to Render -> `micro-saas-scout-api` -> **Environment**.
4. Set:

```env
CHROME_EXTENSION_ID=your_extension_id
```

5. Click **Save, rebuild, and deploy**.

---

## 6. Stripe setup

1. Go to `https://dashboard.stripe.com`.
2. Click **Product catalog**.
3. Click **Add product**.
4. Name: `Micro-SaaS Scout Pro`.
5. Pricing: recurring monthly.
6. Amount: `$29`.
7. Copy the Price ID starting with `price_`.
8. Add it to Vercel:

```env
VITE_STRIPE_PRO_PRICE_ID=price_replace_me
```

9. Go to **Developers** -> **API keys**.
10. Copy Secret key into Render:

```env
STRIPE_SECRET_KEY=sk_live_or_test_key
```

11. Go to **Developers** -> **Webhooks**.
12. Click **Add endpoint**.
13. Endpoint URL:

```txt
https://micro-saas-scout-api.onrender.com/api/billing/webhook
```

14. Select events:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_failed`
15. Copy webhook signing secret into Render:

```env
STRIPE_WEBHOOK_SECRET=whsec_replace_me
```

---

## 7. One-command local deployment preparation

Run this before uploading the Chrome extension:

```bash
npm run deploy:prepare
```

It generates:

- Dashboard build: `dashboard/dist`
- Server build: `server/dist`
- Extension build: `extension/dist`
- Chrome upload zip: `deploy/chrome/micro-saas-scout-extension.zip`

---

## 8. Troubleshooting

### Dashboard says API failed

1. Open Vercel project -> **Settings** -> **Environment Variables**.
2. Confirm:

```env
VITE_API_URL=https://your-render-api.onrender.com
```

3. Redeploy Vercel.

### Render says origin not allowed

1. Copy your Vercel URL.
2. Open Render -> Environment.
3. Set:

```env
DASHBOARD_ORIGIN=https://your-vercel-domain.vercel.app
ADDITIONAL_CORS_ORIGINS=https://your-vercel-domain.vercel.app
```

4. Rebuild Render.

### Extension points to localhost

Rebuild with:

```bash
VITE_API_URL=https://your-render-api.onrender.com npm run package:extension
```

Then upload the new zip.

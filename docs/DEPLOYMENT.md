# Deployment Guide

## Recommended architecture

- **Dashboard:** Vercel, Netlify, or Cloudflare Pages
- **API:** Render, Fly.io, Railway, AWS ECS, or a Node.js container platform
- **Database:** Supabase Postgres
- **Auth:** Clerk
- **Payments:** Stripe Checkout + webhooks
- **Extension:** Chrome Web Store

## Build

```bash
npm install
npm run generate:assets
npm run build
```

## API deployment

Deploy `server/` as a Node.js service:

```bash
npm install --workspaces
npm run build -w shared
npm run build -w server
npm run start -w server
```

Set:

- `NODE_ENV=production`
- `PORT`
- `DASHBOARD_ORIGIN`
- `OPENAI_API_KEY` or another provider key
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`

## Dashboard deployment

Set:

- `VITE_API_URL=https://your-api.example.com`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_STRIPE_PRO_PRICE_ID`

Build command:

```bash
npm run build -w shared && npm run build -w dashboard
```

Output directory:

```txt
dashboard/dist
```

## Extension deployment build

Set `VITE_API_URL` to your production API URL and run:

```bash
npm run build -w shared
npm run build -w extension
```

Upload `extension/dist` to Chrome Web Store.

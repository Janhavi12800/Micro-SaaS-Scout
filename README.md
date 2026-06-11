# Micro-SaaS Scout

**Discover SaaS opportunities on any website using AI.**

Micro-SaaS Scout is a production-ready AI Chrome Extension + SaaS dashboard starter. It scans the current website, extracts business and UX signals, captures screenshot context, and generates actionable startup reports: problems, missing features, competitor gaps, Micro-SaaS ideas, revenue estimates, monetization, tech stack, MVP roadmap, growth loops, and exportable reports.

## What is included

- **Chrome Extension MV3** in `extension/`
  - Popup analysis UI
  - Intelligent content script scraper
  - Background service worker for API calls, storage, screenshot capture, and side panel orchestration
  - Side panel AI report + chat assistant
- **SaaS Dashboard** in `dashboard/`
  - Home/landing dashboard
  - Reports
  - Saved Ideas
  - Trend Analysis
  - Pricing
  - Settings
  - Premium glassmorphism UI with Tailwind, Framer Motion, and local shadcn-style primitives
- **Backend API** in `server/`
  - Node.js + Express
  - OpenAI, Gemini, Claude, and demo-mode AI provider support
  - Validation, rate limiting, security headers, CORS
  - Supabase persistence hooks
  - Stripe checkout-ready endpoint
  - PDF/Markdown/JSON/Notion-style exports
- **Shared package** in `shared/`
  - Zod schemas
  - TypeScript report contracts
  - Prompt engineering
  - Demo report data

## Folder structure

```txt
.
├── dashboard/          # React/Vite SaaS dashboard
├── extension/          # Chrome Extension MV3 popup, side panel, scripts
├── server/             # Express API, AI services, exports, billing
├── shared/             # Shared schemas, prompts, demo data
├── supabase/           # SQL schema and RLS policies
├── scripts/            # Logo/icon asset generator
├── docs/               # Deployment and platform guides
├── .env.example
└── package.json
```

## Quick start

```bash
npm install
cp .env.example .env
npm run generate:assets
npm run build
npm run dev
```

Local services:

- Dashboard: `http://localhost:5173`
- Extension watch build: `extension/dist`
- API: `http://localhost:8787`

If no AI keys are configured, the API runs in polished demo mode with realistic sample data.

## Load the Chrome extension locally

1. Run `npm install`.
2. Run `npm run build -w extension` or `npm run dev:extension`.
3. Open Chrome: `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select `extension/dist`.
7. Open any website and click the Micro-SaaS Scout extension icon.

## Environment variables

See `.env.example`.

Important security rule: AI provider keys, Supabase service role keys, Clerk secret keys, and Stripe secret keys belong only on the server. The extension and dashboard call your backend; they never receive provider secrets.

## AI providers

Supported:

- OpenAI (`OPENAI_API_KEY`)
- Gemini (`GEMINI_API_KEY`)
- Claude (`ANTHROPIC_API_KEY`)
- Demo fallback (`provider: "demo"` or missing keys)

The prompt system lives in `shared/src/prompts.ts` and enforces structured JSON output with startup-focused analysis.

## Production checklist

- Configure Clerk auth and verify JWTs in the API middleware.
- Apply `supabase/schema.sql` and confirm RLS policies.
- Set `DASHBOARD_ORIGIN` to the deployed dashboard URL.
- Set `VITE_API_URL` for dashboard and extension builds.
- Add Stripe price IDs and webhook handling.
- Generate production extension assets with `npm run generate:assets`.
- Zip `extension/dist` for Chrome Web Store submission.

## Commands

```bash
npm run dev              # run dashboard, extension watcher, and API
npm run build            # build all workspaces
npm run typecheck        # typecheck all workspaces
npm run generate:assets  # regenerate SVG logo/icon variants
```

## Premium feature model

Free:

- Limited analyses
- Demo/fallback data
- Basic saved reports

Pro:

- Unlimited scans
- Exports
- Deep competitor analysis
- Screenshot intelligence
- AI roadmap generation
- Priority provider routing

## License

Proprietary starter code for Micro-SaaS Scout.
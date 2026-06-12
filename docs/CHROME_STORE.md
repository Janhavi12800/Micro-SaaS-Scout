# Chrome Store Deployment Guide

## Prepare assets

```bash
npm run generate:assets
VITE_API_URL=https://micro-saas-scout-api.onrender.com npm run package:extension
```

Chrome Store listing assets to prepare:

- 128x128 app icon from `extension/public/icons/icon-128.svg`
- Screenshots listed in `deploy/screenshots/README.md`
- Promo tile with tagline: "Discover SaaS opportunities on any website using AI."
- Privacy policy based on `docs/PRIVACY_POLICY.md`
- Listing copy based on `docs/CHROME_STORE_LISTING.md`

## Permissions explanation

- `activeTab`: Analyze the current page only when the user clicks the extension.
- `scripting`: Coordinate page scraping.
- `storage`: Save reports locally.
- `tabs`: Identify current tab.
- `sidePanel`: Open the AI dashboard panel.
- `host_permissions <all_urls>`: Allow analysis on any website.

## Privacy notes

The extension sends extracted page text, metadata, CTA/pricing signals, and optional screenshot data to your configured backend only after user action. API keys are never stored in the extension.

## Package

Run:

```bash
npm run package:extension
```

Upload this zip in the Chrome Web Store Developer Dashboard:

```txt
deploy/chrome/micro-saas-scout-extension.zip
```

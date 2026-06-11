# Chrome Store Deployment Guide

## Prepare assets

```bash
npm run generate:assets
npm run build -w extension
```

Chrome Store listing assets to prepare:

- 128x128 app icon from `extension/public/icons/icon-128.svg`
- Screenshots of popup and side panel
- Promo tile with tagline: "Discover SaaS opportunities on any website using AI."
- Privacy policy URL

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

From `extension/dist`, create a zip:

```bash
cd extension/dist
zip -r ../../micro-saas-scout-extension.zip .
```

Upload the zip in the Chrome Web Store Developer Dashboard.

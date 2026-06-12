# Windows Local Chrome Extension Testing

Use this guide to download the latest Micro-SaaS Scout code, build the Chrome extension, and load it in Chrome with **Load unpacked**.

## Verified extension folder

Chrome must load this folder:

```txt
extension/dist
```

This folder contains:

```txt
extension/dist/manifest.json
```

Do not select the root project folder. Do not select `extension/`. Select `extension/dist`.

## 1. Install required software

Install these first:

1. Git for Windows: `https://git-scm.com/download/win`
2. Node.js LTS: `https://nodejs.org`
3. Google Chrome: `https://www.google.com/chrome`

After installing Node.js, open **Command Prompt** or **PowerShell** and check:

```powershell
node -v
npm -v
git --version
```

## 2. Download the updated repo

Open **PowerShell** and run:

```powershell
cd $HOME\Downloads
git clone -b cursor/build-micro-saas-scout-75dd https://github.com/Janhavi12800/Micro-SaaS-Scout.git
cd Micro-SaaS-Scout
```

If you already downloaded the repo before:

```powershell
cd $HOME\Downloads\Micro-SaaS-Scout
git pull
```

## 3. Install dependencies

Run from inside the project folder:

```powershell
npm install
```

## 4. Build the extension for local testing

If you want to use the hosted Render API:

```powershell
$env:VITE_API_URL="https://micro-saas-scout-api.onrender.com"
npm run package:extension
```

If you want to use a local backend instead:

Open a second PowerShell window:

```powershell
cd $HOME\Downloads\Micro-SaaS-Scout
npm run dev:server
```

Then in the first PowerShell window:

```powershell
cd $HOME\Downloads\Micro-SaaS-Scout
$env:VITE_API_URL="http://localhost:8787"
npm run build:extension:local
```

## 5. Confirm manifest exists

Run:

```powershell
Test-Path .\extension\dist\manifest.json
```

It should print:

```txt
True
```

## 6. Load unpacked in Chrome

1. Open Chrome.
2. Go to:

```txt
chrome://extensions
```

3. Turn on **Developer mode** in the top-right.
4. If an old Micro-SaaS Scout extension is already loaded, click **Remove**.
5. Click **Load unpacked**.
6. Select this folder:

```txt
C:\Users\YOUR_WINDOWS_USERNAME\Downloads\Micro-SaaS-Scout\extension\dist
```

Example:

```txt
C:\Users\Blocksone\Downloads\Micro-SaaS-Scout\extension\dist
```

7. Click **Select Folder**.

## 7. Test the extension

1. Open a website, for example:

```txt
https://stripe.com
```

2. Click the puzzle icon in Chrome toolbar.
3. Pin **Micro-SaaS Scout**.
4. Click the Micro-SaaS Scout icon.
5. Click **Analyze current website**.

## 8. If it does not update

1. Go to `chrome://extensions`.
2. Remove old Micro-SaaS Scout.
3. Run again:

```powershell
cd $HOME\Downloads\Micro-SaaS-Scout
git pull
npm run build:extension:local
```

4. Click **Load unpacked** again.
5. Select:

```txt
Micro-SaaS-Scout\extension\dist
```

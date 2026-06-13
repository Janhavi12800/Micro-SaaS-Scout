# Payment Setup — Sirf Aapko Ye Steps Karne Hain

Code side pe payment already ready hai. Neeche **sirf woh steps** hain jo aapko manually karne padenge.

Pehle project folder me ye chalao:

```bash
npm install
npm run setup:payment
```

Ye `server/.env` aur `extension/.env.production` files bana dega (agar missing hon).

---

## Step 1 — Razorpay account banao

**Kab:** Pehle din, 10 minute  
**Kahan:** Browser me [https://dashboard.razorpay.com](https://dashboard.razorpay.com)

1. Sign up karo
2. Phone verify karo
3. **KYC** complete karo (PAN + bank account)
4. Abhi **Test Mode** me raho (baad me Live karna)

**Done jab:** Razorpay dashboard khul jaye

---

## Step 2 — ₹50 Payment Link banao (sabse easy)

**Kab:** Razorpay account ke baad, 5 minute  
**Kahan:** Razorpay Dashboard → **Payment Links** → **Create Payment Link**

1. Amount: **₹50**
2. Description: `Micro-SaaS Scout lifetime unlock`
3. **Create** dabao
4. Jo URL mile (jaise `https://rzp.io/i/abc123`) — **copy karo**

**Done jab:** Aapke paas `https://rzp.io/i/...` link ho

---

## Step 3 — Supabase project banao

**Kab:** Step 2 ke baad, 10 minute  
**Kahan:** [https://supabase.com](https://supabase.com)

1. **New project** banao
2. Project name + password set karo
3. **SQL Editor** kholo
4. Apne repo ki file `supabase/schema.sql` kholo — poora SQL copy karke Supabase me **Run** karo
5. **Settings → API** se ye copy karo:
   - Project URL → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

**Done jab:** Supabase me `licenses` table dikhe

---

## Step 4 — Backend (Render) par env vars lagao

**Kab:** Supabase + Razorpay link ready hone ke baad  
**Kahan:** [https://render.com](https://render.com) → apna API service → **Environment**

Agar backend abhi deploy nahi hai:
1. GitHub repo connect karo
2. New **Web Service** banao
3. Build: `npm install && npm run build:server`
4. Start: `npm run start -w server`

Phir ye values **paste** karo:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

RAZORPAY_PAYMENT_LINK_URL=https://rzp.io/i/apna-link
RAZORPAY_AMOUNT_PAISE=5000
RAZORPAY_CURRENCY=INR
LICENSE_UNLOCK_CODES=SCOUT50-APNA-SECRET-CODE
```

`SCOUT50-APNA-SECRET-CODE` ko apna koi secret code rakho — ye paid users ko doge.

**Save** karo → Render **redeploy** hone do (2-3 min)

**Done jab:** Ye URL kholo:

```txt
https://apna-api.onrender.com/health
```

Response me aisa dikhe:

```json
{
  "ok": true,
  "payment": {
    "ready": true,
    "mode": "static-link"
  }
}
```

---

## Step 5 — Extension build karo

**Kab:** Render `/health` me `payment.ready: true` dikhe  
**Kahan:** Apne computer par project folder

1. File kholo: `extension/.env.production`
2. Ye line update karo:

```env
VITE_API_URL=https://apna-api.onrender.com
```

3. Terminal me chalao:

```bash
npm run package:extension:production
```

**Done jab:** Folder `extension/dist` me `manifest.json` ho

---

## Step 6 — Chrome me extension load karo

**Kab:** Build ke turant baad  
**Kahan:** Chrome browser

1. `chrome://extensions` kholo
2. **Developer mode** ON
3. **Load unpacked**
4. Folder select karo: `extension/dist`
5. Extension icon **pin** karo toolbar me

**Done jab:** Micro-SaaS Scout icon dikhe

---

## Step 7 — Payment test karo

**Kab:** Extension load hone ke baad  
**Kahan:** Chrome extension popup

Trial khatam simulate karne ke liye (3 din wait nahi karna):

1. `chrome://extensions` → Micro-SaaS Scout → **Service worker** → **Inspect**
2. Console me paste karo:

```javascript
chrome.storage.local.set({
  trialStartedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
});
```

3. Extension popup band karke dubara kholo
4. **Pay ₹50 with Razorpay** dabao → Razorpay page khulna chahiye
5. Test mode me payment karo
6. Apna unlock code enter karo: `SCOUT50-APNA-SECRET-CODE`
7. **Unlock** dabao → **Lifetime** dikhna chahiye

**Done jab:** Badge "Lifetime" ho aur scan dubara kaam kare

---

## Step 8 — Live payments (jab real users aayein)

**Kab:** Sab test pass ho jaye  
**Kahan:** Razorpay + Render

1. Razorpay me **Test Mode** se **Live Mode** switch karo
2. Naya live payment link banao (₹50)
3. Render env me live link update karo
4. Extension dubara build + Chrome me reload karo

---

## Agar kuch fail ho

| Problem | Solution |
|--------|----------|
| Pay button error | `VITE_API_URL` sahi hai? Extension dubara build kiya? |
| Invalid unlock code | Render me `LICENSE_UNLOCK_CODES` exact same code ho |
| License reset ho jata hai | Supabase keys Render me set karo |
| `/health` me `ready: false` | `npm run setup:payment` chalao, missing values dekho |

---

## Baad me automatic unlock chahiye?

Jab manual code se kaam chal jaye, tab ye optional upgrade karo:

1. Razorpay → **API Keys** generate karo
2. Render me `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` add karo
3. Webhook URL: `https://apna-api.onrender.com/api/billing/razorpay/webhook`
4. Event: `payment_link.paid`

Details: `docs/RAZORPAY_TRIAL_SETUP.md`

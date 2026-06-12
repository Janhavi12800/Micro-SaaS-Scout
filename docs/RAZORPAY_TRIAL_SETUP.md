# Razorpay ₹50 Lifetime Unlock Setup

Micro-SaaS Scout supports:

- 3-day free trial in the Chrome extension
- ₹50 one-time lifetime unlock
- Razorpay payment link flow
- Manual unlock-code fallback

## 1. Create Razorpay account

1. Open `https://dashboard.razorpay.com`.
2. Create an account.
3. Complete KYC.
4. Add your bank account for settlements.

## 2. Beginner setup: static payment link

This is easiest.

1. Razorpay dashboard -> **Payment Links**.
2. Click **Create Payment Link**.
3. Amount: `₹50`.
4. Description: `Micro-SaaS Scout lifetime unlock`.
5. Copy the generated payment URL.
6. Add it to Render:

```env
RAZORPAY_PAYMENT_LINK_URL=https://rzp.io/i/your-link
RAZORPAY_AMOUNT_PAISE=5000
RAZORPAY_CURRENCY=INR
LICENSE_UNLOCK_CODES=SCOUT50-YOUR-SECRET-CODE
```

After a user pays, send them your unlock code manually.

## 3. Better setup: automatic Razorpay links

Add these to Render:

```env
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
RAZORPAY_AMOUNT_PAISE=5000
RAZORPAY_CURRENCY=INR
LICENSE_UNLOCK_CODES=SCOUT50-YOUR-SECRET-CODE
```

Backend endpoint used by the extension:

```txt
POST /api/billing/razorpay/create-link
```

Webhook endpoint:

```txt
POST /api/billing/razorpay/webhook
```

Recommended Razorpay event:

```txt
payment_link.paid
```

## 4. Extension behavior

1. User installs extension.
2. Extension stores local install date and device ID.
3. User gets 3 days free.
4. After 3 days, scans are blocked.
5. Popup shows **Pay ₹50 with Razorpay**.
6. User pays.
7. User enters unlock code, or webhook activates license automatically if configured.

## 5. Supabase

Run `supabase/schema.sql`. It creates:

```txt
licenses
```

The backend service role writes licenses by `device_id`.

# Stripe Setup

## 1. Products and prices

Create Stripe products:

- Pro - monthly subscription
- Studio - monthly subscription

Copy price IDs into your dashboard environment:

```env
VITE_STRIPE_PRO_PRICE_ID=price_...
```

Set backend secrets:

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 2. Checkout

The API route is:

```txt
POST /api/billing/checkout
```

Body:

```json
{
  "priceId": "price_...",
  "successUrl": "https://app.example.com/settings?billing=success",
  "cancelUrl": "https://app.example.com/pricing?billing=cancelled"
}
```

## 3. Webhooks

Wire Stripe events to:

```txt
POST /api/billing/webhook
```

Recommended events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Persist subscription state in `public.subscriptions`.

## 4. Entitlements

Suggested plan gates:

- Free: limited analyses and basic reports
- Pro: unlimited scans, exports, deep competitor analysis, roadmap generation
- Studio: team workspaces, white-label reports, API access

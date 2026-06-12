import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { config } from "../config.js";
import { validateBody } from "../middleware/validate.js";
import {
  activateLicense,
  getLicenseStatus,
  isValidManualCode,
  verifyRazorpayWebhookSignature,
} from "../services/licenses.js";

const checkoutSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

const licenseSchema = z.object({
  deviceId: z.string().min(8),
});

const manualUnlockSchema = licenseSchema.extend({
  code: z.string().min(3),
  email: z.string().email().optional(),
});

const razorpayLinkSchema = licenseSchema.extend({
  email: z.string().email().optional(),
});

export const billingRouter = Router();

billingRouter.post("/checkout", validateBody(checkoutSchema), async (req, res, next) => {
  try {
    if (!config.stripeSecretKey) {
      return res.json({
        url: req.body.successUrl,
        demo: true,
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY to enable checkout.",
      });
    }

    const stripe = new Stripe(config.stripeSecretKey);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: req.body.priceId, quantity: 1 }],
      success_url: req.body.successUrl,
      cancel_url: req.body.cancelUrl,
      client_reference_id: req.userId,
      allow_promotion_codes: true,
    });

    return res.json({ url: session.url });
  } catch (error) {
    return next(error);
  }
});

billingRouter.post("/webhook", async (req, res) => {
  // Configure raw body parsing in a dedicated deployment path before enabling webhooks.
  // This placeholder documents the endpoint expected by Stripe setup.
  res.json({ received: true });
});

billingRouter.post("/license/status", validateBody(licenseSchema), async (req, res, next) => {
  try {
    const license = await getLicenseStatus(req.body.deviceId);
    res.json({ license });
  } catch (error) {
    next(error);
  }
});

billingRouter.post("/license/activate", validateBody(manualUnlockSchema), async (req, res, next) => {
  try {
    if (!isValidManualCode(req.body.code)) {
      return res.status(403).json({ error: "Invalid unlock code" });
    }

    const license = await activateLicense({
      deviceId: req.body.deviceId,
      email: req.body.email,
      source: "manual",
    });

    return res.json({ license });
  } catch (error) {
    return next(error);
  }
});

billingRouter.post("/razorpay/create-link", validateBody(razorpayLinkSchema), async (req, res, next) => {
  try {
    if (config.razorpayPaymentLinkUrl) {
      return res.json({
        url: config.razorpayPaymentLinkUrl,
        mode: "static",
      });
    }

    if (!config.razorpayKeyId || !config.razorpayKeySecret) {
      return res.status(501).json({
        error:
          "Razorpay is not configured. Add RAZORPAY_PAYMENT_LINK_URL or RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    const credentials = Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: {
        authorization: `Basic ${credentials}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amount: config.razorpayAmountPaise,
        currency: config.razorpayCurrency,
        description: "Micro-SaaS Scout lifetime unlock",
        customer: req.body.email ? { email: req.body.email } : undefined,
        notify: { email: Boolean(req.body.email), sms: false },
        reminder_enable: true,
        notes: {
          device_id: req.body.deviceId,
          product: "micro-saas-scout",
          license: "lifetime",
        },
      }),
    });

    const payload = (await response.json()) as { short_url?: string; error?: { description?: string } };

    if (!response.ok || !payload.short_url) {
      return res.status(502).json({
        error: payload.error?.description ?? "Could not create Razorpay payment link",
      });
    }

    return res.json({
      url: payload.short_url,
      mode: "razorpay",
    });
  } catch (error) {
    return next(error);
  }
});

billingRouter.post("/razorpay/webhook", async (req, res, next) => {
  try {
    const signature = req.header("x-razorpay-signature") ?? "";
    const rawBody = JSON.stringify(req.body);

    if (config.razorpayWebhookSecret && !verifyRazorpayWebhookSignature(rawBody, signature)) {
      return res.status(401).json({ error: "Invalid Razorpay signature" });
    }

    const paymentLink = req.body?.payload?.payment_link?.entity;
    const payment = req.body?.payload?.payment?.entity;
    const deviceId = paymentLink?.notes?.device_id ?? payment?.notes?.device_id;

    if (req.body?.event === "payment_link.paid" && typeof deviceId === "string") {
      await activateLicense({
        deviceId,
        email: payment?.email ?? paymentLink?.customer?.email,
        source: "razorpay",
        paymentId: payment?.id,
      });
    }

    return res.json({ received: true });
  } catch (error) {
    return next(error);
  }
});

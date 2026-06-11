import { Router } from "express";
import Stripe from "stripe";
import { z } from "zod";
import { config } from "../config.js";
import { validateBody } from "../middleware/validate.js";

const checkoutSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
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

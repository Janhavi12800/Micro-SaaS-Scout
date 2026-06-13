import { config, hasSupabase } from "../config.js";

export type PaymentMode = "static-link" | "razorpay-api" | "unconfigured";

export type PaymentReadiness = {
  ready: boolean;
  mode: PaymentMode;
  amountInr: number;
  currency: string;
  unlockCodeConfigured: boolean;
  supabaseConfigured: boolean;
  webhookConfigured: boolean;
  nextSteps: string[];
};

export function getPaymentReadiness(): PaymentReadiness {
  const hasStaticLink = Boolean(config.razorpayPaymentLinkUrl);
  const hasRazorpayApi = Boolean(config.razorpayKeyId && config.razorpayKeySecret);
  const unlockCodeConfigured = config.licenseUnlockCodes.length > 0;
  const webhookConfigured = Boolean(config.razorpayWebhookSecret);
  const supabaseConfigured = hasSupabase;

  let mode: PaymentMode = "unconfigured";
  if (hasStaticLink) mode = "static-link";
  else if (hasRazorpayApi) mode = "razorpay-api";

  const nextSteps: string[] = [];

  if (mode === "unconfigured") {
    nextSteps.push("Add RAZORPAY_PAYMENT_LINK_URL or RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET on the server.");
  }

  if (!unlockCodeConfigured) {
    nextSteps.push("Set LICENSE_UNLOCK_CODES so paid users can unlock manually if needed.");
  }

  if (!supabaseConfigured) {
    nextSteps.push("Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY so licenses survive server restarts.");
  }

  if (mode === "razorpay-api" && !webhookConfigured) {
    nextSteps.push("Add RAZORPAY_WEBHOOK_SECRET and configure payment_link.paid webhook for auto-unlock.");
  }

  if (mode === "static-link") {
    nextSteps.push("After payment, share your LICENSE_UNLOCK_CODES value with the user.");
  }

  const ready = mode !== "unconfigured" && unlockCodeConfigured;

  return {
    ready,
    mode,
    amountInr: config.razorpayAmountPaise / 100,
    currency: config.razorpayCurrency,
    unlockCodeConfigured,
    supabaseConfigured,
    webhookConfigured,
    nextSteps,
  };
}

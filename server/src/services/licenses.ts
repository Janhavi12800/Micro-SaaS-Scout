import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";
import { supabase } from "../lib/supabase.js";

export type LicenseStatus = {
  deviceId: string;
  active: boolean;
  status: "free" | "active";
  source?: "manual" | "razorpay" | "admin";
  email?: string;
  unlockedAt?: string;
};

type LicenseRecord = LicenseStatus & {
  paymentId?: string;
};

const memoryLicenses = new Map<string, LicenseRecord>();

export async function getLicenseStatus(deviceId: string): Promise<LicenseStatus> {
  if (supabase) {
    const { data, error } = await supabase
      .from("licenses")
      .select("device_id,email,status,source,unlocked_at")
      .eq("device_id", deviceId)
      .maybeSingle();

    if (error) throw error;

    if (data?.status === "active") {
      return {
        deviceId,
        active: true,
        status: "active",
        source: data.source as LicenseStatus["source"],
        email: data.email as string | undefined,
        unlockedAt: data.unlocked_at as string | undefined,
      };
    }
  } else {
    const stored = memoryLicenses.get(deviceId);
    if (stored?.active) return stored;
  }

  return { deviceId, active: false, status: "free" };
}

export async function activateLicense(input: {
  deviceId: string;
  email?: string;
  source: LicenseStatus["source"];
  paymentId?: string;
}) {
  const unlockedAt = new Date().toISOString();
  const status: LicenseRecord = {
    deviceId: input.deviceId,
    active: true,
    status: "active",
    source: input.source,
    email: input.email,
    unlockedAt,
    paymentId: input.paymentId,
  };

  if (supabase) {
    const { error } = await supabase.from("licenses").upsert(
      {
        device_id: input.deviceId,
        email: input.email,
        status: "active",
        source: input.source,
        payment_id: input.paymentId,
        unlocked_at: unlockedAt,
      },
      { onConflict: "device_id" },
    );
    if (error) throw error;
  } else {
    memoryLicenses.set(input.deviceId, status);
  }

  return status;
}

export function isValidManualCode(code: string) {
  const normalized = code.trim();
  return config.licenseUnlockCodes.some((unlockCode) => unlockCode === normalized);
}

export function verifyRazorpayWebhookSignature(body: string, signature: string) {
  if (!config.razorpayWebhookSecret) return false;
  const expected = createHmac("sha256", config.razorpayWebhookSecret)
    .update(body)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

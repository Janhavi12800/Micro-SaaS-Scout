#!/usr/bin/env node
import { existsSync, copyFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const serverEnvPath = resolve(root, "server/.env");
const serverExamplePath = existsSync(resolve(root, "server/.env.local.example"))
  ? resolve(root, "server/.env.local.example")
  : resolve(root, "server/.env.production.example");
const extensionEnvPath = resolve(root, "extension/.env.production");
const extensionExamplePath = resolve(root, "extension/.env.production.example");

function ensureEnv(targetPath, examplePath, label) {
  if (existsSync(targetPath)) {
    console.log(`✓ ${label} already exists: ${targetPath}`);
    return;
  }

  if (!existsSync(examplePath)) {
    console.log(`! ${label} example missing: ${examplePath}`);
    return;
  }

  copyFileSync(examplePath, targetPath);
  console.log(`+ Created ${label}: ${targetPath}`);
}

function readEnvValue(filePath, key) {
  if (!existsSync(filePath)) return "";
  const content = readFileSync(filePath, "utf8");
  const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match?.[1]?.trim() ?? "";
}

function status(ok, label, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
}

console.log("Micro-SaaS Scout payment setup check\n");

ensureEnv(serverEnvPath, serverExamplePath, "server env");
ensureEnv(extensionEnvPath, extensionExamplePath, "extension env");

const paymentLink = readEnvValue(serverEnvPath, "RAZORPAY_PAYMENT_LINK_URL");
const keyId = readEnvValue(serverEnvPath, "RAZORPAY_KEY_ID");
const keySecret = readEnvValue(serverEnvPath, "RAZORPAY_KEY_SECRET");
const unlockCodes = readEnvValue(serverEnvPath, "LICENSE_UNLOCK_CODES");
const supabaseUrl = readEnvValue(serverEnvPath, "SUPABASE_URL");
const supabaseKey = readEnvValue(serverEnvPath, "SUPABASE_SERVICE_ROLE_KEY");
const webhookSecret = readEnvValue(serverEnvPath, "RAZORPAY_WEBHOOK_SECRET");
const apiUrl = readEnvValue(extensionEnvPath, "VITE_API_URL") || readEnvValue(resolve(root, ".env"), "VITE_API_URL");

console.log("\nServer payment config:");
const hasStaticLink = Boolean(paymentLink && !paymentLink.includes("replace") && !paymentLink.includes("your-link"));
const hasRazorpayApi =
  Boolean(keyId && keySecret) && !keyId.includes("replace") && keySecret !== "replace_me";
status(hasStaticLink || hasRazorpayApi, "Razorpay configured", hasStaticLink ? "static link" : hasRazorpayApi ? "API keys" : "missing");
status(Boolean(unlockCodes && !unlockCodes.includes("CHANGE")), "Unlock code configured");
status(Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project")), "Supabase configured");
status(Boolean(webhookSecret && webhookSecret !== "replace_me"), "Razorpay webhook secret configured");

console.log("\nExtension config:");
status(Boolean(apiUrl && !apiUrl.includes("localhost")), "Production API URL set", apiUrl || "missing");

console.log("\nNext manual steps:");
if (!hasStaticLink && !hasRazorpayApi) {
  console.log("1. Razorpay dashboard se ₹50 payment link banao.");
  console.log("2. server/.env me RAZORPAY_PAYMENT_LINK_URL paste karo.");
}
if (!unlockCodes || unlockCodes.includes("CHANGE")) {
  console.log("3. server/.env me LICENSE_UNLOCK_CODES=SCOUT50-APNA-CODE set karo.");
}
if (!supabaseUrl || supabaseUrl.includes("your-project")) {
  console.log("4. Supabase project banao aur SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY add karo.");
}
if (!apiUrl || apiUrl.includes("localhost")) {
  console.log("5. extension/.env.production me VITE_API_URL apna Render API URL set karo.");
}
console.log("6. npm run package:extension:production");
console.log("7. Chrome me extension/dist load karo.");
console.log("\nFull guide: docs/PAYMENT_SETUP_HINDI.md");

#!/usr/bin/env node
import { existsSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const serverEnv = resolve(root, "server/.env");
const serverExample = existsSync(resolve(root, "server/.env.local.example"))
  ? resolve(root, "server/.env.local.example")
  : resolve(root, "server/.env.production.example");
const extensionEnv = resolve(root, "extension/.env.production");
const extensionExample = resolve(root, "extension/.env.production.example");

if (!existsSync(serverEnv) && existsSync(serverExample)) {
  copyFileSync(serverExample, serverEnv);
  console.log("Created server/.env from example.");
}

if (!existsSync(extensionEnv) && existsSync(extensionExample)) {
  copyFileSync(extensionExample, extensionEnv);
  console.log("Created extension/.env.production from example.");
}

const result = spawnSync("node", ["scripts/check-payment-setup.mjs"], {
  cwd: root,
  stdio: "inherit",
});

process.exit(result.status ?? 1);

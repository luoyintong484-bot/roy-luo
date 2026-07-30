#!/usr/bin/env node
import { createVerify } from "node:crypto";
import { readFileSync } from "node:fs";

const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/verify-alipay-url.mjs '<alipay-gateway-url>'");
  process.exit(1);
}

const publicKeyPath = process.env.ALIPAY_APP_PUBLIC_KEY_FILE || ".secrets/alipay_app_public_key.pem";
const publicKey = readFileSync(publicKeyPath, "utf8");
const parsed = new URL(url);
const params = Object.fromEntries(parsed.searchParams.entries());
const signature = params.sign || "";
delete params.sign;

const canonical = Object.entries(params)
  .filter(([, value]) => value !== "")
  .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  .map(([key, value]) => `${key}=${value}`)
  .join("&");

const verifier = createVerify("RSA-SHA256");
verifier.update(canonical, "utf8");
verifier.end();

const ok = Boolean(signature && verifier.verify(publicKey, signature, "base64"));

console.log("======================================");
console.log(" Alipay URL Signature Verification");
console.log("======================================");
console.log(`App ID          : ${params.app_id || "(missing)"}`);
console.log(`Out trade no    : ${params.biz_content ? safeBiz(params.biz_content).out_trade_no || "(unknown)" : "(missing)"}`);
console.log(`Public key file : ${publicKeyPath}`);
console.log(`Signature valid : ${ok ? "✅ yes" : "❌ no"}`);
console.log("");
console.log("Canonical string:");
console.log(canonical);

if (!ok) {
  console.log("");
  console.log("Likely cause:");
  console.log("- This URL was not signed by the private key matching this public key file; or");
  console.log("- The production server is using a different ALIPAY_APP_PRIVATE_KEY_FILE than this repository; or");
  console.log("- Alipay Open Platform has a different application public key than the server private key expects.");
}

function safeBiz(value) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

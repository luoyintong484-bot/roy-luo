#!/usr/bin/env node
/**
 * 支付宝签名诊断脚本
 * 用法: node scripts/diagnose-alipay.mjs
 *
 * 输出：
 *  1. 当前 .secrets 下三个密钥文件的健康度自检
 *  2. 私钥 ↔ 应用公钥 配对自检（必通过）
 *  3. 把"应该上传到支付宝平台的应用公钥"打印出来（5 段格式）
 */
import { readFileSync } from "node:fs";
import { createSign, createVerify, createPublicKey } from "node:crypto";

const ROOT = process.cwd();
const SECRETS = `${ROOT}/.secrets`;

function safeRead(p) {
  try { return readFileSync(p, "utf8"); } catch { return ""; }
}

const priv = safeRead(`${SECRETS}/alipay_app_private_key.pem`);
const pubInApp = safeRead(`${SECRETS}/alipay_app_public_key.pem`);
const pubAlipay = safeRead(`${SECRETS}/alipay_public_key.pem`);

console.log("======================================");
console.log(" 1. 密钥文件状态");
console.log("======================================");
console.log("应用私钥 (alipay_app_private_key.pem)  :", priv ? "✅ 存在" : "❌ 缺失");
console.log("应用公钥 (alipay_app_public_key.pem)  :", pubInApp ? "✅ 存在" : "❌ 缺失");
console.log("支付宝公钥 (alipay_public_key.pem)    :", pubAlipay ? "✅ 存在" : "❌ 缺失");
console.log("");

if (!priv) { console.log("❌ 缺少应用私钥，无法继续"); process.exit(1); }

// 2. 派生公钥
const derivedPub = createPublicKey(priv).export({ type: "spki", format: "pem" });
console.log("======================================");
console.log(" 2. 应用私钥 ↔ 应用公钥 自检");
console.log("======================================");
// PEM 格式允许换行不同，所以比较时统一去掉换行
const normalize = (s) => s.replace(/\r?\n/g, "");
const priv2pub = normalize(derivedPub) === normalize(pubInApp);
console.log(".secrets/alipay_app_public_key.pem 是不是从当前私钥派生的？");
console.log(priv2pub ? "✅ 是的，本地公私钥配对正确" : "❌ 不是！本地就有问题");
console.log("");

// 3. 测试签名 + 用派生公钥验证
const canonical = "app_id=test&biz_content=test&charset=utf-8&method=alipay.trade.page.pay&sign_type=RSA2&timestamp=2026-07-29+00%3A00%3A00&version=1.0";
const s = createSign("RSA-SHA256");
s.update(canonical, "utf8");
s.end();
const sig = s.sign(priv, "base64");
const v = createVerify("RSA-SHA256");
v.update(canonical, "utf8");
v.end();
const okDerived = v.verify(derivedPub, sig, "base64");
console.log("======================================");
console.log(" 3. 用派生公钥验证测试签名");
console.log("======================================");
console.log(okDerived ? "✅ 通过" : "❌ 失败");
console.log("");

// 4. 提取支付宝平台要的应用公钥（去掉头尾标记和换行，得到"一长串"）
const stripped = derivedPub
  .replace(/-----BEGIN [^-]+-----/g, "")
  .replace(/-----END [^-]+-----/g, "")
  .replace(/\n/g, "");
console.log("======================================");
console.log(" 4. 你应该上传到支付宝平台的应用公钥（一长串）");
console.log("======================================");
console.log(stripped);
console.log("");

// 5. 提取带换行的 5 段格式（有些平台要求这种格式）
const lines = stripped.match(/.{1,64}/g) || [];
const formatted = [
  "-----BEGIN PUBLIC KEY-----",
  ...lines,
  "-----END PUBLIC KEY-----",
].join("\n");
console.log("======================================");
console.log(" 5. 或者 PEM 格式（5 段）");
console.log("======================================");
console.log(formatted);
console.log("");

// 6. 关键操作提示
console.log("======================================");
console.log(" 6. 现在的根本问题");
console.log("======================================");
console.log(`
支付宝 invalid-signature 错误的 90% 原因：
  → 支付宝平台上的「应用公钥」与本服务器上 .secrets/alipay_app_private_key.pem 不配对

你现在应该做的：
  1. 登录 https://open.alipay.com/develop/manage
  2. 找到你的应用 → 「开发设置」→ 「接口加签方式」→ 「查看/替换应用公钥」
  3. 把上面第 4 步或第 5 步的内容粘贴进去（替换现有的应用公钥）
  4. 支付宝会让你"验证"——这一步要把应用私钥的内容也粘贴进去以确认配对
  5. 保存后重新在本机走一遍支付流程

注意：
  - alipay_public_key.pem（Alipay 公钥）是给支付宝回调验签用的，**不要**上传到平台
  - 改完平台上的应用公钥，不需要改本服务器任何东西，私钥保持不变
  - 改完后再走一次 redeploy 流程，付款就能通了
`);

#!/usr/bin/env bash
# =============================================================
# 支付宝签名诊断脚本 — 用于定位 invalid-signature 错误根因
# 用法: 在项目根目录 (与 api/ 同级) 运行此脚本
# =============================================================
set -e

cd "$(dirname "$0")/.."

# 1) 读取 .env 或环境变量
if [ -f .env ]; then
  set -a; source .env; set +a
fi
if [ -f .env.local ]; then
  set -a; source .env.local; set +a
fi

echo "======================================"
echo " 1. 检查服务端配置"
echo "======================================"
echo "ALIPAY_ENABLED       = ${ALIPAY_ENABLED:-<未设置>}"
echo "ALIPAY_APP_ID        = ${ALIPAY_APP_ID:-<未设置>}"
echo "ALIPAY_SELLER_ID     = ${ALIPAY_SELLER_ID:-<未设置>}"
echo "ALIPAY_PUBLIC_KEY    长度 = ${#ALIPAY_PUBLIC_KEY} 字符"
echo "ALIPAY_APP_PRIVATE_KEY 长度 = ${#ALIPAY_APP_PRIVATE_KEY} 字符"
echo "ALIPAY_WAP_ENABLED   = ${ALIPAY_WAP_ENABLED:-<未设置>}"
echo ""

if [ -z "$ALIPAY_APP_PRIVATE_KEY" ] || [ -z "$ALIPAY_PUBLIC_KEY" ]; then
  echo "❌ 私钥或公钥未配置"
  exit 1
fi

# 2) 写入临时 key 文件
PRIV_TMP=$(mktemp)
PUB_TMP=$(mktemp)
printf '%b' "${ALIPAY_APP_PRIVATE_KEY//\\\\n/\\n}" > "$PRIV_TMP"
printf '%b' "${ALIPAY_PUBLIC_KEY//\\\\n/\\n}" > "$PUB_TMP"

echo "======================================"
echo " 2. 私钥文件头"
echo "======================================"
head -3 "$PRIV_TMP"
echo "..."
tail -2 "$PRIV_TMP"
echo ""

echo "======================================"
echo " 3. 公钥文件头"
echo "======================================"
head -3 "$PUB_TMP"
echo "..."
tail -2 "$PUB_TMP"
echo ""

# 4) 从私钥派生公钥（用 Node 的 crypto）
echo "======================================"
echo " 4. 从私钥派生公钥（与支付宝平台公钥对比用）"
echo "======================================"
DERIVED_PUB=$(/Users/iran/.workbuddy/binaries/node/versions/22.22.2/bin/node -e "
const fs = require('fs');
const { createPublicKey } = require('crypto');
try {
  const priv = fs.readFileSync('$PRIV_TMP', 'utf8');
  const pub = createPublicKey(priv).export({ type: 'spki', format: 'pem' });
  process.stdout.write(pub);
} catch (e) {
  process.stderr.write('❌ 无法从私钥派生公钥: ' + e.message);
  process.exit(1);
}
")
echo "$DERIVED_PUB"
echo ""

# 5) 签名一个测试串，验证私钥 + 签名函数工作正常
echo "======================================"
echo " 5. 测试签名 (key1=value1&key2=value2)"
echo "======================================"
TEST_CANONICAL="app_id=${ALIPAY_APP_ID}&biz_content=test&charset=utf-8&method=alipay.trade.page.pay&sign_type=RSA2&timestamp=2026-07-29+00%3A00%3A00&version=1.0"
TEST_SIGN=$(/Users/iran/.workbuddy/binaries/node/versions/22.22.2/bin/node -e "
const fs = require('fs');
const { createSign } = require('crypto');
const priv = fs.readFileSync('$PRIV_TMP', 'utf8');
const s = createSign('RSA-SHA256');
s.update(process.argv[1], 'utf8');
s.end();
process.stdout.write(s.sign(priv, 'base64'));
" "$TEST_CANONICAL")
echo "签名字符串: $TEST_CANONICAL"
echo "签名结果:   $TEST_SIGN"
echo ""

# 6) 验证公钥（用 test_can 验证 test_sign 是否能用 ALIPAY_PUBLIC_KEY 验通）
echo "======================================"
echo " 6. 验证 ALIPAY_PUBLIC_KEY 能否解开测试签名（自检）"
echo "======================================"
VERIFY_RESULT=$(/Users/iran/.workbuddy/binaries/node/versions/22.22.2/bin/node -e "
const fs = require('fs');
const { createVerify } = require('crypto');
const pub = fs.readFileSync('$PUB_TMP', 'utf8');
const v = createVerify('RSA-SHA256');
v.update(process.argv[1], 'utf8');
v.end();
const ok = v.verify(pub, process.argv[2], 'base64');
process.stdout.write(ok ? 'OK: 公钥可以验通私钥签的测试串' : '❌ FAIL: ALIPAY_PUBLIC_KEY 与 ALIPAY_APP_PRIVATE_KEY 不匹配');
" "$TEST_CANONICAL" "$TEST_SIGN")
echo "$VERIFY_RESULT"
echo ""

# 7) 清理
rm -f "$PRIV_TMP" "$PUB_TMP"

echo "======================================"
echo " 7. 给支付宝平台用的公钥（从私钥派生）"
echo "======================================"
echo "请把上面第 4 步的公钥内容，复制到支付宝开放平台 → 应用信息 → 接口加签方式 → 查看/替换应用公钥"
echo "在支付宝平台查看现有公钥，与此处对比：字符应该完全一致（除了头尾的 -----BEGIN/END----- 和换行）"

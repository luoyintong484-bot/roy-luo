#!/usr/bin/env bash
# r7fortune 一键重部署脚本（在宝塔服务器上运行）
# 用法: bash <(curl -sL https://raw.githubusercontent.com/luoyintong484-bot/roy-luo/main/server/redeploy.sh)
set -e

echo "========== r7fortune redeploy =========="

# 0. 确保 node/npm/pm2 在 PATH（宝塔 node 安装路径）
for d in /www/server/nodejs/*/bin /usr/local/bin /usr/bin; do
  [ -d "$d" ] && export PATH="$d:$PATH"
done
echo "node: $(command -v node) $(node -v 2>/dev/null)"
echo "pm2 : $(command -v pm2)"

# 1. 找到服务器上的 git 仓库目录
REPO_DIR=""
for base in /www/wwwroot /root /home; do
  hit=$(find "$base" -maxdepth 3 -type d -name ".git" 2>/dev/null | head -1)
  if [ -n "$hit" ]; then REPO_DIR=$(dirname "$hit"); break; fi
done
if [ -z "$REPO_DIR" ]; then
  echo "!! 未找到 git 仓库，改为全新克隆到 /www/wwwroot/roy-luo"
  git clone --depth 1 https://github.com/luoyintong484-bot/roy-luo.git /www/wwwroot/roy-luo
  REPO_DIR=/www/wwwroot/roy-luo
fi
echo "repo: $REPO_DIR"
cd "$REPO_DIR"

# 2. 拉最新代码
git fetch origin main
git reset --hard origin/main
echo "HEAD: $(git log --oneline -1)"

# 3. 安装依赖并构建（前端 vite + 后端 esbuild）
npm install --no-audit --no-fund 2>&1 | tail -2
npm run build 2>&1 | tail -5
[ -f dist/boot.js ] || { echo "!! 构建失败：dist/boot.js 不存在"; exit 1; }
echo "build OK: $(ls -la dist/boot.js | awk '{print $5" bytes "$6" "$7" "$8}')"

# 4. 找到 PM2 正在跑的脚本路径和工作目录
PM2_SCRIPT=$(pm2 info r7fortune 2>/dev/null | awk -F'│' '/script path/{gsub(/^[ \t]+|[ \t]+$/,"",$3);print $3}')
PM2_CWD=$(pm2 info r7fortune 2>/dev/null | awk -F'│' '/exec cwd/{gsub(/^[ \t]+|[ \t]+$/,"",$3);print $3}')
echo "pm2 script: $PM2_SCRIPT"
echo "pm2 cwd   : $PM2_CWD"

# 5. 把新构建覆盖到 PM2 实际使用的位置
if [ -n "$PM2_SCRIPT" ] && [ -f "$PM2_SCRIPT" ] && [ "$PM2_SCRIPT" != "$REPO_DIR/dist/boot.js" ]; then
  cp "$PM2_SCRIPT" "$PM2_SCRIPT.bak.$(date +%Y%m%d%H%M%S)"
  cp dist/boot.js "$PM2_SCRIPT"
  echo "已覆盖后端: $PM2_SCRIPT"
  # 静态资源：boot.js 相对 cwd 找 dist/public 或同目录 public
  for pubdir in "$PM2_CWD/dist/public" "$(dirname "$PM2_SCRIPT")/public" "$PM2_CWD/public"; do
    if [ -d "$pubdir" ]; then
      rm -rf "$pubdir".bak 2>/dev/null || true
      cp -r "$pubdir" "$pubdir".bak 2>/dev/null || true
      cp -r dist/public/* "$pubdir"/
      echo "已覆盖前端: $pubdir"
      break
    fi
  done
else
  echo "PM2 直接使用仓库内 dist/boot.js（或未找到脚本路径），无需复制"
fi

# 6. 重启
pm2 restart r7fortune
sleep 3
pm2 list | head -8

# 7. 验证：金额必须是 9.90 而不是 29.90
echo "========== 验证 =========="
RESP=$(curl -s --max-time 15 -X POST http://localhost:3000/api/alipay/create \
  -H 'Content-Type: application/json' \
  -d '{"reportType":"tarot","reportKey":"redeploy_check","amount":9.90}')
echo "$RESP" | head -c 300; echo ""
# 用 node 精准解析 JSON 的 amount 字段，避免 grep 子串误判
AMOUNT=$(echo "$RESP" | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
  try{const j=JSON.parse(s);process.stdout.write(String(j.amount??""))}catch{process.stdout.write("PARSE_ERR")}
});' 2>/dev/null)
echo "解析得到 amount = $AMOUNT"
if [ "$AMOUNT" = "9.90" ]; then
  echo "✅✅✅ 部署成功：金额已是 9.90，新代码生效"
elif [ "$AMOUNT" = "29.90" ]; then
  echo "❌ 仍是旧值 29.90，请把本输出发给助手排查"
elif [ "$AMOUNT" = "PARSE_ERR" ] || [ -z "$AMOUNT" ]; then
  echo "⚠️ API 响应无法解析（可能服务未起或路由变化），请把本输出发给助手"
else
  echo "⚠️ 金额异常：$AMOUNT，请把本输出发给助手"
fi
echo "========== done =========="

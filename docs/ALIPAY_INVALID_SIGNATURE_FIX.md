# 支付宝 invalid-signature 修复记录

最后更新：2026-07-29

## 当前问题

支付宝网关页面提示：

```text
invalid-signature
验签出错
```

用户点击站内「确认支付」后跳转到支付宝，但支付宝在收银台前直接拒绝该请求。

这不是前端路由崩溃，也不是 `return_url` 页面问题；错误发生在支付宝网关验签阶段，付款尚未开始。

## 本地诊断结论

已执行：

```bash
node scripts/diagnose-alipay.mjs
```

结果：

- 本地应用私钥存在
- 本地应用公钥存在
- 本地应用私钥与应用公钥配对正确
- 使用本地应用公钥可验证本地测试签名

但用户提供的线上支付宝 URL 用当前本地应用公钥验签失败：

```bash
node scripts/verify-alipay-url.mjs '<支付宝网关 URL>'
```

结果：

```text
Signature valid : ❌ no
```

这说明线上生成该支付 URL 的私钥，与当前仓库 `.secrets/alipay_app_public_key.pem` 不配对。

## 必须统一的三处密钥

支付宝电脑网站支付要同时满足：

1. 服务器环境变量 `ALIPAY_APP_PRIVATE_KEY_FILE` 指向的应用私钥
2. 支付宝开放平台「接口加签方式」中上传的应用公钥
3. 本地/部署文档中保存的应用公钥备份

这三者必须属于同一对 RSA 密钥。

## 当前应该上传到支付宝后台的应用公钥

如果服务器将继续使用当前仓库的：

```text
.secrets/alipay_app_private_key.pem
```

则支付宝开放平台应上传以下应用公钥：

```text
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkoj5sAde6PelZpTqSMehJWJGaE+LfaIBBPCt6sOLJBBezKb/29xOBip+sdZwnhs74J6vJPmudNXOD1XOsZ1gvbGa2yLQX28xXOJkklcvtUK7XSqLiqxJzhrB0QmFYGja6gp6vVI5sbgCW8jmTGKdIuxK6SIdjvJHhwTf/5mc1q0dYGCXGqyWz44pjkkd91T57TRvPY9C25dPgY5hf+Frwtfxin1p0LrcfBOA6WVM3g8jWpOYqvVvHoFp93bQTJMZQZs/j7OBWrS7kdeIJcJh/N+sVWiikFQrtw+0JxKlf9U4xLmkaHCBZoFvrnS9vvSnJu/GFwDDaif744zZK03YVQIDAQAB
```

不要上传 `alipay_public_key.pem`。那个是「支付宝公钥」，只用于服务器验证支付宝回调。

## 支付宝后台操作

1. 登录支付宝开放平台。
2. 进入应用 `2021006176630120`。
3. 打开「开发设置」。
4. 找到「接口加签方式」。
5. 选择「查看 / 替换应用公钥」。
6. 粘贴上面的应用公钥。
7. 保存后重新发起一笔小额订单测试。

## 服务器侧必须确认

在宝塔 Node 项目环境变量中确认：

```env
PUBLIC_SITE_URL=https://www.r7fortune.com
ALIPAY_ENABLED=true
ALIPAY_WAP_ENABLED=false
ALIPAY_APP_ID=2021006176630120
ALIPAY_APP_PRIVATE_KEY_FILE=/www/server/secrets/r7fortune/alipay_app_private_key.pem
ALIPAY_PUBLIC_KEY_FILE=/www/server/secrets/r7fortune/alipay_public_key.pem
```

并确认服务器上的：

```text
/www/server/secrets/r7fortune/alipay_app_private_key.pem
```

与本地当前 `.secrets/alipay_app_private_key.pem` 是同一份，或者至少能派生出同一份应用公钥。

## 服务器上自检

把本仓库的诊断脚本同步到服务器后执行：

```bash
node scripts/diagnose-alipay.mjs
```

如果服务器输出的应用公钥和本文件中的公钥不同，说明服务器正在用另一把私钥。

## 验收

修复后重新点击站内支付按钮，预期结果：

1. 不再出现支付宝 `invalid-signature`。
2. 能进入支付宝官方收银台。
3. 付款后支付宝异步通知 `/payment/notify`。
4. 订单状态变为 `completed`。
5. 前端成功页轮询 `/api/alipay/status` 后解锁报告。

# 支付宝电脑网站支付部署说明

## 已接入的链路

1. 前端统一付款入口调用 `POST /api/alipay/create`。
2. 服务端从固定产品目录读取金额，创建 `pending` 订单并生成 RSA2 支付链接。
3. 浏览器跳转至支付宝官方收银台。
4. 支付宝异步通知 `POST /payment/notify`。
5. 服务端验证支付宝签名、App ID、可选 Seller ID、订单号和金额，验证成功后才将订单改为 `completed`。
6. 支付宝同步返回 `GET /payment/return`，该接口只负责跳回前端，不负责解锁。
7. 前端支付成功页调用 `GET /api/alipay/status` 查询服务端订单；仅在服务端已确认付款后解锁原报告。

兼容核验清单的接口别名：

- `POST /payment/create` 与 `POST /api/alipay/create` 调用同一服务端建单逻辑。
- `GET /api/user/status` 读取现有用户表的会员状态，不会把单份报告订单误判成全站会员。
- R7 的商品是按报告解锁，不新增另一个重复的用户会员表。

## 宝塔需要配置

在 Node 项目的环境变量中配置：

```env
PUBLIC_SITE_URL=https://www.r7fortune.com
ALIPAY_ENABLED=true
ALIPAY_WAP_ENABLED=false
ALIPAY_APP_ID=支付宝开放平台正式应用AppID
ALIPAY_APP_PRIVATE_KEY_FILE=/www/server/secrets/r7fortune/alipay_app_private_key.pem
ALIPAY_PUBLIC_KEY_FILE=/www/server/secrets/r7fortune/alipay_public_key.pem
ALIPAY_SELLER_ID=可选的支付宝PID
```

私钥只能放服务器环境变量，不能放在 `public/`、前端源码或 Git 仓库中。

当前只确认电脑网站支付时保持 `ALIPAY_WAP_ENABLED=false`。手机访问会安全回退到 `alipay.trade.page_pay`；待支付宝后台确认“手机网站支付”已签约后，改成 `true` 即会按 User-Agent 使用 `alipay.trade.wap_pay`。

## 数据库迁移

在目标数据库执行：

```bash
mysql -u USER -p DATABASE < db/migrations/0001_alipay_provider_orders.sql
```

也可以在宝塔数据库管理的 SQL 窗口粘贴该文件内容执行。

## 支付宝后台确认

- 产品：电脑网站支付
- 正式网关：`https://openapi.alipay.com/gateway.do`
- 异步通知：`https://www.r7fortune.com/payment/notify`
- 同步跳转：`https://www.r7fortune.com/payment/return`
- 签名方式：RSA2
- 上述两个地址必须通过公网 HTTPS 访问，不能被登录、WAF 人机验证或前端路由拦截。

## 网站支付开关

凭证和回调未验证前，保持 `src/const.ts` 中：

```ts
export const PAYMENT_COMING_SOON = true;
```

完成数据库迁移、环境变量配置和 0.01 元正式测试后，再改为 `false` 并重新构建部署。紧急回滚时改回 `true`，后端也可将 `ALIPAY_ENABLED=false` 立即停用支付宝下单。

`PAYMENT_COMING_SOON=true` 时，前端不会创建订单或解锁报告；后端的
`ALIPAY_ENABLED=false` 是第二层紧急停机开关。正式切换前必须同时确认：

1. 数据库迁移已执行。
2. 公网回调返回 HTTP 200，且没有被登录页、CDN 验证或 WAF 拦截。
3. 支付宝公钥与应用私钥方向配置正确。
4. 用真实小额订单验证异步通知后，订单状态才由 `pending` 变为 `completed`。

## 安全说明

- 金额来自服务端产品目录，浏览器提交的金额不会作为支付宝订单金额。
- `return_url` 不会发货或解锁。
- `notify_url` 验签通过且订单金额一致后才更新付款状态。
- 通知处理为幂等逻辑，支付宝重复通知不会重复开通。
- 每个订单使用随机查询令牌，不能只凭订单号查询和解锁报告。
- 浏览器同步返回即使验签成功，也只进入等待页；最终权限仍以异步通知落库状态为准。
- 旧的客户端 `complete` / `paymentWebhook` 入口已禁止修改付款与会员状态，避免伪造浏览器请求解锁。

## 上线验收

```bash
# 未携带订单令牌时必须拒绝
curl -i 'https://www.r7fortune.com/api/alipay/status'

# 会员状态接口（游客应返回 is_logged_in=false）
curl -i 'https://www.r7fortune.com/api/user/status'

# 回调地址应能到达 Node 服务；GET 返回 404/405 可以接受，不能被前端 index.html 接管
curl -i 'https://www.r7fortune.com/payment/notify'
```

真实付款验收顺序：创建订单 -> 支付宝收银台付款 -> `/payment/notify`
验签落库 -> 成功页轮询 `/api/alipay/status` -> 原报告解锁。仅看到
`/payment/return` 跳回并不代表付款成功。

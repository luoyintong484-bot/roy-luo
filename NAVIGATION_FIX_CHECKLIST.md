# R7 Fortune 跳转问题修复清单

更新时间：2026-06-15

## 一、本次直接修复的问题

| 位置 | 原问题 | 修复方案 | 修复后目标地址 |
|---|---|---|---|
| 支付成功页 | `createCheckout()` 已跳转 `/payment-success`，但前端没有该路由，可能 404 | 新增 `src/pages/PaymentSuccessPage.tsx` 并在 `src/App.tsx` 注册路由 | `/payment-success?session=...&return=...&report=...` |
| 支付成功回调 | 成功页不存在，无法统一校验 session、写入订单和解锁报告 | 成功页调用 `verifyPayment()` 与 `handlePaymentSuccess()`，成功后返回原报告页 | 用户原来的报告页或 `/profile?tab=payments` |
| 支付取消页 | 真实支付取消只到 `/payment?cancelled=1`，不知道用户从哪里来 | `createCheckout()` 追加 `return` 和 `report` 参数；`PaymentPage` 读取后展示取消状态 | `/payment?cancelled=1&return=原页面` |
| 支付页返回按钮 | 原来固定返回首页，用户可能从报告页过来后丢失上下文 | 改为读取 query/state/localStorage 中的来源路径 | 原报告页；无来源时 `/` |
| 本命完整报告页 | `navigate(-1)` 直链进入时可能无有效上一页 | 增加 `goBack()` 兜底 | 有历史回上一页；否则 `/destiny` |
| 合盘完整报告页 | `navigate(-1)` 直链进入时可能无有效上一页 | 增加 `goBack()` 兜底 | 有历史回上一页；否则 `/destiny` |
| 命盘结果页 | `window.history.back()` 直链/刷新后不可控 | 改为 `goBack()` | 有历史回上一页；否则 `/destiny` |
| 个人中心 | 顶部返回按钮直链进入时可能无有效上一页 | 增加 `goBack()` 兜底 | 有历史回上一页；否则 `/` |
| 错误页 | ErrorBoundary 的 Go Back 可能回到空历史或错误来源 | 判断 `window.history.length`，无历史时回首页 | 有历史回上一页；否则 `/` |
| 付款记录 | 订单记录保存了来源但没有入口返回报告 | 订单项存在 `accessUrl` 时显示「查看报告」链接 | 对应订单的报告页 |

## 二、支付/报告跳转预期链路

### 1. 用户点击付费按钮
- 页面：塔罗、星宿、旧合盘完整报告等使用 `PayModal`。
- 动作：`PayModal -> initiatePayment() -> createCheckout()`。
- 来源路径：写入 `returnPath = window.location.pathname + window.location.search`。

### 2. 测试模式支付成功
- 弹窗模拟成功时：当前页面直接调用 `onPaid()`，报告原地解锁。
- 页面跳转式支付按钮：跳转 `/payment-success?session=test_xxx&return=原页面`。

### 3. 真实支付成功
- 支付平台回调前端成功页：
  - `/payment-success?session={session_id}&return=原页面&report=reportKey`
- 成功页校验 session，写入解锁状态，显示「返回查看报告」。

### 4. 真实支付取消
- 支付平台返回：
  - `/payment?cancelled=1&return=原页面&report=reportKey`
- 支付页显示「支付已取消，报告尚未解锁」，提供「返回测算页」和「返回首页」。

## 三、全站返回/关闭/退出排查结论

### 已确认正常
- 弹窗关闭类按钮：`PayModal`、`ShareModal`、`SharePoster`、个人中心退出确认弹窗均为关闭当前弹窗，不触发页面跳转。
- 爱豆资料页返回：固定回 `/idol` 或对应艺人详情页。
- 爱豆合盘详情页返回：固定回 `/idol-compatibility`。
- 登录页返回：固定回 `/`；登录成功后读取 `return` 参数。
- 404 页返回：首页 `/`。
- 导航栏：所有主导航均使用已注册路由。

### 保留现状
- `DestinyDetail.tsx` 内旧合盘付费成功后仍跳转 `/synastry-full-report`，这是当前旧完整合盘报告入口，路由有效。
- `ProfessionalAstrologyReport.tsx` 的新版本命盘/合盘报告是本地模拟解锁卡，未走 `/payment-success`，这是当前预览逻辑。

## 四、涉及文件

- `src/App.tsx`
- `src/pages/PaymentSuccessPage.tsx`
- `src/pages/PaymentPage.tsx`
- `src/lib/payment.ts`
- `src/lib/payment-service.ts`
- `src/pages/DestinyFullReport.tsx`
- `src/pages/SynastryFullReport.tsx`
- `src/pages/DestinyDetail.tsx`
- `src/pages/Profile.tsx`
- `src/components/ErrorBoundary.tsx`

## 五、后续接真实支付时只需重点确认

1. 将 `src/lib/payment.ts` 中 `IS_TEST` 改为 `false`。
2. 替换真实 `CREEM_BASE` 和 `TEST_API_KEY`。
3. 确认支付平台后台允许以下回调地址：
   - `https://r7fortune.com/payment-success?session={session_id}&return=...`
   - `https://r7fortune.com/payment?cancelled=1&return=...`
4. 如果改为后端 DB 权限体系，需要让报告组件从后端权益接口读取 `reportKey` 权限，而不是只读 localStorage。

# R7 Fortune 付费报告开通逻辑清单

更新时间：2026-06-15

## 一、全站共用解锁机制

### 核心存储
- 解锁状态存储在浏览器 `localStorage` 的 `r7_unlocked_reports`。
- 当前规则：支付/模拟支付成功后解锁 7 天。
- 兼容旧记录：旧版布尔值 `true` 仍视为已解锁，避免本地预览历史权限丢失。
- 代码位置：`src/lib/payment-service.ts`

### 共用支付组件
- 弹窗支付组件：`src/components/PayModal.tsx`
- 通用支付服务：`src/lib/payment-service.ts`
- 底层支付封装：`src/lib/payment.ts`
- 支付成功承接页：`src/pages/PaymentSuccessPage.tsx`
- 支付取消/占位页：`src/pages/PaymentPage.tsx`

### 标准链路
1. 用户点击「解锁完整报告」。
2. 页面生成唯一 `reportKey`。
3. 前端检查 `isReportPaid(reportKey)`。
4. 未解锁时打开 `PayModal` 或展示内嵌解锁卡。
5. `PayModal` 调用 `initiatePayment(config)`。
6. `initiatePayment` 调用 `createCheckout()`，并写入：
   - `r7_pending_report`：待解锁报告信息
   - `r7_pending_payment`：待支付订单信息
7. 测试模式下弹窗内模拟支付成功；真实跳转模式下进入 `/payment-success?session=...&return=...&report=...`。
8. 支付成功后调用 `handlePaymentSuccess(sessionId)`。
9. `unlockReport(reportKey)` 写入 7 天有效期。
10. 报告组件重新渲染完整版内容。

### 异常限制
- session 不匹配：`handlePaymentSuccess()` 返回失败，不解锁。
- 支付校验失败：`PaymentSuccessPage` 显示失败状态，不写入权限。
- 权限过期：`isReportPaid()` 自动删除过期记录，恢复免费版。
- 取消支付：跳转 `/payment?cancelled=1&return=原页面`，用户可返回原报告页。

## 二、本命盘完整报告

### 当前页面/组件
- 主组件：`src/components/ProfessionalAstrologyReport.tsx`
- 旧完整报告页：`src/pages/DestinyFullReport.tsx`
- 结果页入口：`src/pages/DestinyDetail.tsx`

### 开通逻辑
- `ProfessionalAstrologyReport.tsx` 中的本命盘使用：
  - `reportKey = natal_paid_${birthDate}_${birthTime}`
  - 初始判断：`isReportPaid(reportKey)`
  - 解锁动作：`unlockReport(reportKey)`
- 目前该新版报告的 `UnlockCard` 是本地模拟解锁：点击后直接写入 7 天权限，不经过外部支付接口。
- 旧结果页 `DestinyDetail.tsx` 使用 `PayModal` 触发合盘完整版入口时，会走共用支付弹窗。

### 渲染规则
- 未解锁：显示基础信息、免费预览和底部解锁模块。
- 已解锁：显示完整付费报告模块、顶部「已解锁」提示和 PDF 按钮。

## 三、双人合盘完整报告

### 当前页面/组件
- 主组件：`src/components/ProfessionalAstrologyReport.tsx`
- 旧完整报告页：`src/pages/SynastryFullReport.tsx`
- 结果页入口：`src/pages/DestinyDetail.tsx`

### 开通逻辑
- `ProfessionalAstrologyReport.tsx` 中的双人合盘使用：
  - `reportKey = synastry_paid_${person1.birthDate}_${person2.birthDate}`
  - 初始判断：`isReportPaid(reportKey)`
  - 解锁动作：`unlockReport(reportKey)`
- 旧完整报告页 `SynastryFullReport.tsx` 使用固定 key：
  - `reportKey = synastry_full_report`
  - 未付费时打开 `PayModal`
  - `onPaid` 后执行 `unlockReport("synastry_full_report")`

### 渲染规则
- 未解锁：显示匹配度、关系定位、基础吸引力和付费解锁模块。
- 已解锁：显示完整深度报告。

## 四、星宿关系完整报告

### 当前页面/组件
- 主组件：`src/components/StarLodgeReport.tsx`

### 开通逻辑
- 生成 key：
  - `star_lodge_paid_${person1.birthDate || p1Name}_${person2?.birthDate || p2Name}_${rel?.type || "single"}`
- 初始判断：
  - `PREVIEW_FREE_REPORTS || isReportPaid(reportKey)`
- 未解锁时：
  - 点击按钮打开 `PayModal`
  - `config.reportKey = reportKey`
- 支付成功后：
  - `unlockReport(reportKey)`
  - `setIsPaid(true)`

### 渲染规则
- 未解锁：显示基础关系类型、基础解读和解锁按钮。
- 已解锁：显示完整星宿关系报告、重点关系卡片和 PDF 按钮。

## 五、塔罗完整报告

### 当前页面/组件
- 页面：`src/pages/TarotPage.tsx`
- 主业务组件：`src/sections/TarotSection.tsx`

### 开通逻辑
- 抽牌后生成稳定 key：
  - 由模式、爱豆分类、用户问题、抽到的牌组合生成 `tarotReportKey`
- 初始判断：
  - `isReportPaid(tarotReportKey)`
- 未解锁时：
  - 点击解锁按钮打开 `PayModal`
  - `config.reportKey = tarotReportKey`
- 支付成功后：
  - `unlockReport(tarotReportKey)`
  - `setIsUnlocked(true)`

### 渲染规则
- 未解锁：显示牌面、基础牌意和付费钩子。
- 已解锁：显示完整感情/问题解读。

## 六、爱豆/CP/泛变现入口

### 当前页面/组件
- 用户与爱豆合盘：`src/pages/IdolMatchPage.tsx`
- CP 报告：`src/pages/CpReportPage.tsx`
- 通用变现组件：`src/components/Monetization.tsx`

### 开通逻辑
- `MonetizationButton` 根据产品生成：
  - `reportKey = ${product.key}_${source}_${Date.now()}`
- 支付成功后：
  - `unlockReport(config.reportKey)`
- 这些入口当前更偏「付费意向/产品购买」记录，不一定直接绑定某个固定报告渲染状态。

## 七、后台支付接口说明

### 前端当前实际使用
- 当前站内主要使用 `localStorage + PayModal + payment-service` 模拟支付/解锁。

### 预留后端接口
- `api/payment-router.ts`
- 包含：
  - 创建订单
  - 完成订单
  - webhook
  - 订单列表
  - 订单详情
- 后端完成订单后会更新 DB 内 `payments.status` 和用户 `isPremium`。
- 当前前端报告解锁尚未完全切到该 DB 权限体系，后续接真实支付时建议统一为：后端订单成功 -> 前端查询订单/权益 -> 渲染完整版。

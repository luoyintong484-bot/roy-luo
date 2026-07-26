# 前端页面结构与数据交互说明

## 1. 推荐路由

```text
/                         首页
/lp/:reportId             社媒专属落地页
/reports                  报告列表
/reports/:reportId/start  问卷页
/reports/:reportId/preview 免费预览
/checkout                 单次支付
/reports/:reportId/full   完整报告
/reports/:reportId/companion AI 情感陪伴
/privacy                  隐私政策
/terms                    使用条款
/refund                   退款政策
```

当前 MVP 使用单页 modal，后续上线可拆路由。

## 2. 组件

```text
components/
  LocaleProvider.tsx
  LuxuryHero.tsx
  ReportCard.tsx
  ReportGrid.tsx
  PremiumQuestionnaire.tsx
  FreePreview.tsx
  PaywallPanel.tsx
  FullReport.tsx
  CompanionPanel.tsx
  ComplianceDisclaimer.tsx
  LanguageToggle.tsx
  PriceDisplay.tsx
  PrivacyControls.tsx
```

## 3. API

```text
POST /api/report
body:
{
  reportType,
  gender,
  name?,
  relationshipContext?,
  answers: [{ question, score }]
}

POST /api/payment-link
body:
{
  reportType
}

POST /api/companion
body:
{
  message,
  reportType,
  reportTitle,
  sectionSummary,
  turn
}
```

## 4. 状态流

```text
landing_view
-> report_selected
-> questionnaire_started
-> questionnaire_submitted
-> preview_ready
-> checkout_started
-> payment_confirmed
-> full_report_viewed
-> companion_opened
-> companion_turn_sent
-> related_report_clicked
```

## 5. 埋点字段

```text
source_platform
campaign_id
report_id
gender
language
country_guess
preview_conversion_rate
checkout_click_rate
payment_success_rate
companion_open_rate
companion_turn_depth
related_report_click_rate
```

## 6. 数据模型

```ts
type PremiumReportProduct = {
  id: string;
  title: { en: string; ar: string };
  subtitle: { en: string; ar: string };
  hook: { en: string; ar: string };
  priceUsd: number;
  priceSar: number;
  anchorPriceUsd: number;
  genderVariants: {
    male: string;
    female: string;
  };
  modules: string[];
};
```

## 7. 当前已实现 MVP

文件：

- `web/public/index.html`
- `web/server.ts`
- `services/ai-generator.ts`
- `services/payments.ts`
- `config.ts`

已实现：

- EN/AR 切换。
- RTL。
- 6 款高端报告。
- 性别必选 + 昵称选填。
- 24 道结构化题。
- 免费预览。
- 单次支付链接。
- 完整报告。
- 8 轮 AI 情感陪伴入口。


# R7 Fortune 现有功能与内容清单

更新时间：2026-07-06

本清单用于执行 `codex-instruction-r7fortune` 前的保护性盘点。后续新增能力必须以“增量新增”为原则，不覆盖已存在页面、路由、报告、支付锁定逻辑和现有视觉体系。

## 1. 当前路由与页面

| 路由 | 页面/组件 | 当前用途 | 状态 |
| --- | --- | --- | --- |
| `/` | `Home` | 首页、主入口、功能分区 | 已存在，保留 |
| `/login` | `Login` | 登录/注册入口 | 已存在，保留 |
| `/profile` | `Profile` | 个人中心、历史、收藏、付款记录、设置 | 已存在，保留 |
| `/tarot` | `TarotPage` | 经典塔罗、爱豆塔罗、抽牌结果 | 已存在，保留 |
| `/ziwei-tarot` | `ZiweiTarotPage` | 紫微塔罗双牌模块 | 已存在，保留 |
| `/destiny` | `DestinyPage` / `DestinySection` | 本命盘/双人合盘输入入口 | 已存在，保留 |
| `/destiny-result` | `DestinyDetail` | 免费命理结果、命盘展示、报告入口 | 已存在，保留 |
| `/destiny-full-report` | `DestinyFullReport` | 紫微/命盘完整版报告 | 已存在，保留 |
| `/synastry-full-report` | `SynastryFullReport` | 双人合盘完整版报告 | 已存在，保留 |
| `/idol` | `IdolPage` | 爱豆玄学入口、艺人库入口 | 已存在，保留 |
| `/idol-match` | `IdolMatchPage` | 生日追星推荐 | 已存在，保留 |
| `/idol-compatibility` | `IdolCompatibilityPage` | 用户与爱豆合盘榜单 | 已存在，保留 |
| `/idol-compatibility/:id` | `IdolCompatibilityDetailPage` | 单个爱豆合盘详情 | 已存在，保留 |
| `/artist/:id` | `ArtistDetail` | 艺人档案详情 | 已存在，保留 |
| `/artist/:id/reading` | `ArtistReading` | 艺人解读 | 已存在，保留 |
| `/artist/:id/compatibility` | `ArtistCompatibilityPage` | 与指定艺人 1:1 合盘 | 已存在，保留 |
| `/cp-report` | `CpReportPage` | CP 缘分合盘报告与分享 | 已存在，保留 |
| `/payment` | `PaymentPage` | 付款页/手动收款码/即将上线锁 | 已存在，保留 |
| `/payment-success` | `PaymentSuccessPage` | 付款成功页 | 已存在，保留 |
| `/admin` | `AdminPage` | 本地后台管理 | 已存在，保留 |
| `/privacy-policy` | `PrivacyPolicy` | 隐私政策 | 本轮新增 |

项目使用 `HashRouter`，线上 URL 会以 `/#/route` 形式访问。旧的 `/wellness` 路由已重定向到首页。

## 2. 当前核心功能

| 功能 | 文件/模块 | 说明 | 处理策略 |
| --- | --- | --- | --- |
| 登录与用户态 | `src/hooks/useAuth.ts`, `api/auth-router.ts` | 已有登录、退出、Mock/本地用户态 | 不重写，后续仅补第三方登录 |
| 个人中心 | `src/pages/Profile.tsx` | 历史、收藏、付款、设置、出生档案 | 保留并补数据导出/清除 |
| 出生档案缓存 | `src/hooks/useBirthProfile.ts` | localStorage 保存出生资料并自动推导日柱、星宿、星座 | 保留，后续可接后端加密存储 |
| 本命/合盘输入 | `src/sections/DestinySection.tsx` | 支持出生日期、时间、地点、时区、伴侣信息 | 保留，补统一隐私提示 |
| 紫微排盘 | `src/lib/ziwei-doushu.ts`, `src/components/ZiweiDoushuPanel.tsx` | 已有自研紫微斗数盘面和报告模板 | 不替换引擎；若引入库需单独验证 |
| 紫微话术 | `src/lib/ziwei-report-templates.ts`, `docs/ziwei-*` | 已有文献基准、模板映射、规则文档 | 保留并迭代 |
| 塔罗 | `src/pages/TarotPage.tsx`, `src/data/tarot*` | 经典塔罗、爱豆塔罗、AI Prompt、图片牌面 | 保留 |
| 紫微塔罗 | `src/pages/ZiweiTarotPage.tsx`, `src/data/ziweiTarot.ts` | 双牌模块已有雏形 | 保留 |
| 艺人库 | `src/data/artists.ts` | 本地艺人数据、星座、五行、星宿、团体等 | 保留，后续增量校验/补充 |
| 爱豆匹配 | `src/lib/idol-match-engine.ts`, `api/idol-match-engine.ts` | 生日推荐、匹配分、分项评分 | 保留 |
| CP/合盘 | `src/pages/CpReportPage.tsx`, `src/lib/compatibility-algo.ts` | CP 缘分报告、分享入口 | 保留 |
| 分享海报 | `src/components/SharePoster.tsx`, `src/components/ShareModal.tsx` | 已有分享/海报组件 | 保留，可扩展模板 |
| 客服按钮 | `src/components/CustomerService.tsx` | 悬浮客服、微信/Ins | 保留 |

## 3. 当前支付与价格状态

| 项目 | 文件 | 当前状态 |
| --- | --- | --- |
| 全局支付锁 | `src/const.ts` | `PAYMENT_COMING_SOON = true`，付费入口统一“即将上线” |
| 手动收款码 | `src/const.ts`, `src/pages/PaymentPage.tsx` | 已支持微信/支付宝二维码展示与放大预览 |
| 价格配置 | `src/lib/pricing.ts` | 已有 CNY/USD、塔罗/紫微塔罗/本命/合盘/CP 定价 |
| 付款记录 | `src/lib/payment.ts`, `src/pages/Profile.tsx` | 本地订单记录、会员状态、自续费展示 |
| 后端支付路由 | `api/payment-router.ts` | 已有 create/complete/webhook 框架，锁定状态下禁下单 |
| Stripe | 暂无 | 未安装/未配置；需要正式密钥后再接入 |

现有要求中“所有抽牌免费、解析付费”与当前支付锁定策略不冲突。上线前仍保持 `PAYMENT_COMING_SOON = true`。

## 4. 已存在与跳过项

| 指令项 | 当前判断 | 本轮动作 |
| --- | --- | --- |
| 扫描全站功能 | 必做 | 已完成并落此清单 |
| 隐私政策页 | 缺失 | 新增 `/privacy-policy` |
| 出生表单隐私提示 | 部分页面已有局部文案 | 抽成统一组件并补到主要出生信息表单 |
| 用户数据导出/删除 | 未形成统一入口 | 在个人中心隐私设置补本地导出/清除入口 |
| Google/Apple/WeChat 登录 | 尚无正式 OAuth 配置 | 暂不硬接，待密钥/应用审核 |
| Stripe | 尚无密钥 | 暂不接生产链路，保留现有 Coming Soon 锁 |
| iztro/lunar-typescript | 未安装 | 暂不安装，避免扰动现有紫微引擎 |

## 5. 后续增量实施顺序建议

1. 账户与隐私：正式后端出生资料加密、云端多档案、服务器端导出/删除账号。
2. 爱豆库：建立可追溯数据源字段、补官方来源、增加 100+ 头部艺人数据校验。
3. 分享卡：按 Idol Match / CP / Tarot 增加独立 1080×1920、1080×1080、1200×630 模板。
4. 付费架构：在现有 Coming Soon 锁外层接入 Stripe/PayPal，保留国内二维码兜底。
5. SEO 与多语言：为公开内容页补 `title/meta/og`，细化 CN/TW/HK/MO/SG 中文，其余默认英文。

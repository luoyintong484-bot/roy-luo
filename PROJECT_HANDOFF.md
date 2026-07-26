# R7 Fortune / R7 Wellness — 项目交接文档

> 生成日期：2026-06-29 | 目标：交给 Codex 继续开发

---

## 一、项目概况

用户拥有两个产品线：

| 产品线 | 定位 | 目标市场 | 状态 |
|---|---|---|---|
| **R7 Fortune** | 塔罗/占星/八字玄学网站 | 国内 + 华语用户 | 已部署 (r7fortune.com) |
| **R7 Wellness** | 心理学化人格分析 Bot | 中东 GCC（阿联酋/沙特） | 开发中（Web 测试可用） |

**用户档案**：
- 所在地：佛山，粤语母语
- 语言：粤语、中文、英语、少量韩语
- 技能：塔罗/星盘专业咨询、网站搭建（0到1）、视频剪辑、乐器演奏
- 目标：做成事业，愿意学编程和 SEO
- 预算：0 成本启动
- 不露脸

---

## 二、核心战略决策

### 中东市场的关键洞察

1. **不能用「玄学」话术**：伊斯兰教禁止占卜 (divination = haram)。所有内容必须用「心理学」「人格分析」「自我探索」框架
2. **付费意愿极高**：GCC 用户订阅付费比全球平均高 2-3 倍
3. **匿名是核心卖点**：60% 有心理健康需求的人因污名化不求助，匿名 AI 服务是解决方案
4. **Telegram > App**：中东用户习惯用 Telegram/WhatsApp，不愿下载新 App
5. **没有外国手机号**：用户无法注册 Telegram，当前用 Web 界面开发测试

### 产品策略

- **定价**：人格蓝图 $9.99/次、关系分析 $14.99/次、AI 对话 $4.99/月
- **支付**：Stripe Payment Links（最简单，Bot 发链接，用户浏览器付款）
- **AI 引擎**：Moonshot/Kimi API（已有账号，未填 Key），Prompt 融合紫微斗数的结构化框架
- **话语体系**：所有内容禁止出现 fortune/destiny/predict/divination/luck/fate/zodiac/星座/命运/占卜/算命

---

## 三、已完成的代码

### A. 网站端 (src/) — r7fortune.com

**新增的 Wellness 频道**（中东版心理疗愈页面）：

| 文件 | 功能 |
|---|---|
| `src/data/wellness-content.ts` | 心理学化文本：品牌话术、CTA、表单文案、报告 Section、合规声明。中英双语 |
| `src/sections/WellnessSection.tsx` | Wellness 首页 Hero（青蓝色调 #5ec8b2） |
| `src/sections/WellnessSelfDiscovery.tsx` | 人格蓝图输入表单（含中东国家列表） |
| `src/pages/WellnessPage.tsx` | 页面包装 |
| `src/pages/WellnessSelfDiscoveryReport.tsx` | 4 Section 人格报告 + ReportLock 付费墙 + 合规声明 |
| `src/pages/WellnessRelationshipReport.tsx` | 5 Section 关系报告 + 付费墙 + 合规声明 |

**修改的文件**：
- `src/App.tsx` — 添加 4 条 `/wellness/*` 路由
- `src/components/Navbar.tsx` — 添加 WELLNESS 导航项（NEW 角标）
- `src/sections/Footer.tsx` — 添加 Wellness 链接
- `src/contexts/I18nContext.tsx` — 添加 `nav.wellness` 翻译

**网站现状**：
- `TEST_MODE = true` → 所有付费墙被绕过（未关闭）
- 支付未接入（Creem API Key 为空）
- 报告内容是硬编码模板，非 AI 实时生成
- 已有 `tarot-ai-reader.ts` 本地规则引擎
- 已有 `synastry-ai-router.ts` API 层

### B. Bot 端 (bot/) — Telegram 替代品

**完整目录结构**：

```
独立站/bot/
├── package.json          # grammy + stripe + express + dotenv
├── tsconfig.json
├── .env                  # BOT_TOKEN, STRIPE_SECRET, MOONSHOT_API_KEY（均未填）
├── config.ts             # 价格、免费次数、API 地址
├── index.ts              # Telegram Bot 入口（grammY polling）
├── content/
│   └── messages.ts       # 全部 Bot 话术（HTML parse mode，心理学化）
├── handlers/
│   ├── start.ts          # /start 欢迎 + 三按钮菜单
│   ├── self-discovery.ts # 人格蓝图：4 步收集 → AI 生成 → 预览 + 付费墙
│   ├── relationship.ts   # 关系分析：8 步收集 → AI 生成 → 预览 + 付费墙
│   ├── chat.ts           # AI 疗愈对话：5 条免费 → 引导订阅
│   └── payment.ts        # Stripe deep-link 回调 → 解锁报告
├── services/
│   ├── ai-generator.ts   # **核心引擎**：14 Archetypes + 12 Dimensions + 4 Dynamics Prompt
│   └── stripe.ts         # Stripe Payment Link 生成 + 回调解析
└── web/
    ├── server.ts          # Express 开发服务器（端口 3000）
    └── public/
        └── index.html     # Web 测试界面（模拟 Bot 对话）
```

### C. 核心 AI 引擎 (bot/services/ai-generator.ts)

这是整个产品的核心技术资产。基于紫微斗数框架改造：

**14 种人格原型**（对应 14 颗主星）：
The Anchor, The Strategist, The Illuminator, The Executor, The Harmonizer, The Intensifier, The Stabilizer, The Reflector, The Explorer, The Depth-Seeker, The Diplomat, The Guardian, The Challenger, The Pioneer

**12 个生命维度**（对应 12 宫位）：
Core Self, Close Circle, Partnership Style, Creative Expression, Resource Approach, Body-Mind Connection, External Engagement, Social Dynamics, Work Orientation, Inner Sanctuary, Inner World, Early Influence

**4 种行为动态**（对应四化）：
Flow Pattern, Drive Pattern, Expression Pattern, Growth Edge

**System Prompt**：严格的心理学化语言，禁止所有 divination 词汇，中东合规。

**Fallback 模式**：当 `MOONSHOT_API_KEY` 为空时，返回高质量静态报告（无需 API 也能测）。

### D. 状态文件

- `.money-state.json` — 用户画像（T3 专业级），已选「中东心理疗愈」路线
- 计划文件：`/Users/iran/.claude/plans/immutable-swimming-church.md`

---

## 四、当前可运行

```bash
# Web 测试界面（无需 Telegram）
cd /Users/iran/Desktop/独立站/bot
npm run dev:web
# 浏览器打开 http://localhost:3000

# Telegram Bot（需要 Token）
# 1. 编辑 bot/.env → BOT_TOKEN=xxx
# 2. cd bot && npm run dev
# 3. Telegram 搜索你的 Bot → /start

# 网站 Wellness 频道
cd /Users/iran/Desktop/独立站
npm run dev
# 访问 http://localhost:5173/#/wellness
```

---

## 五、待办事项（按优先级）

### P0 — 立即可做
1. **填入 AI API Key**：编辑 `bot/.env` → `MOONSHOT_API_KEY=xxx` → 报告变成 AI 实时生成
2. **创建 Telegram Bot**：@BotFather → 获取 Token → 填入 `.env` → 启动 `npm run dev`
3. **关闭网站 TEST_MODE**：`src/const.ts` → `TEST_MODE = false`

### P1 — 验证后做
4. **接入 Stripe 支付**：注册 Stripe → 创建 Product → 填 Price ID 到 `.env`
5. **部署 Bot**：Vercel（免费）或 Railway（$5/月）→ 设置 webhook
6. **中东用户测试**：Reddit r/dubai, r/saudiarabia 找 10-20 个测试用户

### P2 — 增长
7. **阿拉伯语版本**：`bot/content/messages.ts` 添加 `ar` locale
8. **WhatsApp Bot**：用 WhatsApp Business API
9. **网站 AI 化**：报告从硬编码模板改为 AI 实时生成
10. **SEO 出海**：HashRouter → BrowserRouter + 多语言 SEO 页面

### 其他蓝海方向（已研究未开发）
- 粤语玄学 YouTube/TikTok（零竞争）
- 韩英双语塔罗服务（HelloBot 未做英文）
- 东方神话塔罗牌 Kickstarter
- 塔罗师 B2B 工具 Etsy 店铺
- 实体水晶/塔罗牌外贸（佛山近广州供应链）

---

## 六、关键文件快速索引

| 用途 | 路径 |
|---|---|
| Bot 入口 | `bot/index.ts` |
| AI 引擎（核心） | `bot/services/ai-generator.ts` |
| Bot 话术 | `bot/content/messages.ts` |
| Web 测试界面 | `bot/web/server.ts` + `bot/web/public/index.html` |
| 价格配置 | `bot/config.ts` |
| 环境变量 | `bot/.env` |
| 网站 Wellness 文本 | `src/data/wellness-content.ts` |
| 网站 Wellness 首页 | `src/sections/WellnessSection.tsx` |
| 网站人格报告 | `src/pages/WellnessSelfDiscoveryReport.tsx` |
| 网站关系报告 | `src/pages/WellnessRelationshipReport.tsx` |
| 网站路由 | `src/App.tsx` |
| 网站导航 | `src/components/Navbar.tsx` |
| 支付逻辑 | `src/lib/payment.ts` (TEST_MODE=true) |
| 用户状态 | `.money-state.json` |
| 计划文件 | `.claude/plans/immutable-swimming-church.md` |
| 本项目文档 | `PROJECT_HANDOFF.md`（本文件） |

---

## 七、给 Codex 的提示

1. **用户的核心诉求**：把中东心理疗愈产品线跑通——先 Web 测试 → 接 AI → 接支付 → 部署 → 找中东用户验证
2. **产品话语体系严禁**：fortune/destiny/predict/divination/luck/fate/命运/占卜/算命/前世/灵魂/星座预测
3. **产品话语体系应该用**：pattern/tendency/inclination/self-discovery/personality/wellbeing/心理模式/人格分析/自我探索
4. **AI 引擎不依赖真实星盘计算**：靠出生日期的数字模式 + Prompt 工程生成「看起来个性化」的报告。不需要接入天文 API
5. **Web 界面是临时方案**：最终目标是 Telegram Bot，Web 只是方便开发测试
6. **用户在中国大陆**：Telegram 被墙，开发阶段用 Web 界面测试
7. **支付用 Stripe Payment Links**：Bot 生成链接 → 用户浏览器打开 → 付款 → 回调 Bot 解锁报告。不需要写支付前端

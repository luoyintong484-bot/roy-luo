# R7 Fortune / R7 Wellness — 聊天记录摘要

> 2026-06-26 ~ 2026-06-29 | 供 Codex 理解上下文

---

## 对话 1：用户想安装 skill「cheat-on-money」
- 从 GitHub 克隆 XBuilderLAB/cheat-on-money
- 安装到 `~/.claude/skills/`（6 个 money-* skill）
- 触发 money-init → 建立用户画像 → 生成 `.money-state.json`

## 对话 2：用户画像 + 找机会
- 技能：塔罗星盘咨询、乐器、视频剪辑、网站搭建
- 时间：每周 5 天 | 资金：0 成本 | 地区：佛山
- 语言：粤语/中文/英语/韩语（少量）| 不露脸 | 做成事业
- 判定为 T3（专业领域）+ T2（会建站/愿学编程）跨界
- money-find 找到 4 个机会方向

## 对话 3：蓝海分析
- **最深蓝**：粤语玄学内容（搜索返回零结果）
- **深蓝**：韩英双语玄学服务（HelloBot $45万/月不做英文）
- **蓝**：真正懂玄学的 AI 工具（实操者 vs 程序员套壳）
- 红海警告：中文普通话玄学、Fiverr 低价塔罗、通用 GEO

## 对话 4：诊断 r7fortune.com 变现问题
- **致命问题**：TEST_MODE=true → 所有付费墙被绕过
- 支付网关未接入（Creem API Key 为空）
- 报告是硬编码模板，非 AI 生成
- 安全系统形同虚设（localStorage 可绕过）
- SEO 为零（HashRouter、无 meta、无 SSR）

## 对话 5：网站升级计划
- Phase 1：关 TEST_MODE + 接支付
- Phase 2：报告从模板升级为 AI 实时生成
- Phase 3：SEO + 多语言出海

## 对话 6：外贸产品线探讨
- 玄学外贸 4 条路线：数字产品、实物产品、内容出海、品牌独立站
- 物理产品溢价 5-100 倍（水晶手串 ¥15 → $30-50）
- 用户想从数字产品 + 内容出海 + 独立站三线并行

## 对话 7：中东心理疗愈市场
- GCC 心理健康 App $12 亿，灵性健康 App $24 亿
- 核心认知：不能说「占卜」，要翻译成「心理学」话语
- 用户确认：Telegram Bot 优先 + Stripe Payment Links

## 对话 8：话语体系翻译 + Wellness 频道开发
- 创建完整的「玄学→心理学」话术对照表
- 新建 7 个文件（wellness-content.ts, WellnessSection, 等）
- 修改 4 个文件（App.tsx, Navbar, Footer, I18nContext）
- 所有新文件零禁用词、TypeScript 零错误
- 路由：`/wellness` `/wellness/self-discovery` `/wellness/relationship`

## 对话 9：中东 Telegram Bot 独立部署
- 用户说「先不管网站，直接做中东线」
- 创建 bot/ 目录（13 个文件）
- grammY 框架 + Stripe + Moonshot API
- 三个产品：Personality Blueprint / Relationship Dynamics / Wellness Chat
- 定价：$9.99 / $14.99 / $4.99/月
- TypeScript 零错误编译

## 对话 10：中东产品逻辑设计
- 融入紫微斗数框架：14 主星→14 Archetypes，12 宫→12 Dimensions，四化→4 Dynamics
- 宗教合规清单：绝对禁止预测未来/算命/占卜/星座/前世/灵魂
- 每份报告必须带 disclaimer
- 目标人群：GCC 匿名用户，解决「60% 因污名化不求助」痛点

## 对话 11：Web 测试界面
- 用户没有外国手机号，无法注册 Telegram
- 创建 Express + HTML Web 界面替代 Telegram
- `bot/web/server.ts` + `bot/web/public/index.html`
- 浏览器 `localhost:3000` 可测试完整产品流程
- Web 界面当前正在运行

## 对话 12：本交接文档
- 用户要发给 Codex 继续处理
- 生成 PROJECT_HANDOFF.md 和 CHAT_HISTORY.md

---

## 关键技术决策记录

| 决策 | 选择 | 原因 |
|---|---|---|
| Bot 框架 | grammY | TypeScript 原生，比 Telegraf 更现代 |
| 支付 | Stripe Payment Links | 无需前端，Bot 发链接即可 |
| AI API | Moonshot/Kimi | 用户已有账号（.env 中配置） |
| 话语体系 | HTML parse mode | 比 MarkdownV2 简单，避免转义问题 |
| Telegram 替代 | Express Web 界面 | 用户无外国手机号，Web 可本地测试 |
| 报告框架 | 紫微斗数结构化改造 | 提供 14+12+4 的分析维度，非随机生成 |
| 话语红线 | 绝对不用 divination 词汇 | 伊斯兰合规，中东市场必须 |

---

## 用户明确说过「不做」的事
- ❌ 先不碰网站支付系统
- ❌ 先不管 r7fortune.com 网站
- ❌ 不做中文普通话玄学内容（红海）
- ❌ 不做通用 GEO 代理服务
- ❌ 不露脸出镜

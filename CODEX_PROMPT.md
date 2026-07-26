# 发给 Codex 的指令（直接复制粘贴）

---

先阅读这两份文档，理解整个项目背景和当前状态：
- `/Users/iran/Desktop/独立站/PROJECT_HANDOFF.md`
- `/Users/iran/Desktop/独立站/CHAT_HISTORY.md`

然后按以下优先级继续开发：

## P0：立即可做（不依赖外部服务）

1. **检查 Web 测试界面是否还在运行**
   - 如果没运行：`cd /Users/iran/Desktop/独立站/bot && npm run dev:web`
   - 确认 `http://localhost:3000` 可以访问
   - 走一遍完整流程：Personality Blueprint → 输入测试数据 → 看报告 → Unlock → Relationship Dynamics → Wellness Chat

2. **帮我注册 Moonshot/Kimi API Key 并接入**
   - 去 https://platform.moonshot.cn 注册
   - 获取 API Key
   - 写入 `bot/.env` 的 `MOONSHOT_API_KEY=`
   - 重启 Web server
   - 再测一遍报告生成，确认 AI 实时生成的内容质量
   - 如果 AI 生成的内容有「算命」「运势」「预测」相关的表述，修改 `bot/services/ai-generator.ts` 的 System Prompt 来纠正

## P1：验证后做

3. **创建 Telegram Bot**
   - 我去搞一个能注册 Telegram 的外国手机号（或者你帮我找一个虚拟号服务）
   - 拿到号码后：@BotFather → /newbot → 获取 Token
   - 写入 `bot/.env` → `BOT_TOKEN=`
   - `npm run dev` → 在 Telegram 里测试 Bot

4. **接入 Stripe 支付**
   - 注册 Stripe 账号
   - 创建 3 个 Product + Price：
     - Self-Discovery Report — $9.99 (one-time)
     - Relationship Dynamics Report — $14.99 (one-time)
     - Wellness Chat Monthly — $4.99/month (recurring)
   - 复制 Price ID 到 `bot/.env`
   - 测试支付流程：Stripe 测试卡 4242 4242 4242 4242

## P2：上线

5. **部署到 Vercel 或 Railway**
   - 把 bot 部署到公开服务器
   - 获得公开 URL
   - 设置 Telegram webhook

6. **找中东用户测试**
   - 在 Reddit r/dubai、r/saudiarabia 发帖
   - 找 10-20 个测试用户
   - 收集反馈，迭代

---

## 重要规则（每次改代码前确认）

1. **绝对禁止的词汇**（出现在用户看到的任何地方都是红线）：
   fortune, destiny, predict, divination, luck, fate, zodiac, horoscope, star sign, karma, past life, soul, universe energy, 命运, 占卜, 算命, 运势, 星座, 前世, 灵魂

2. **应该用的词汇**：
   pattern, tendency, inclination, self-discovery, personality insight, wellbeing, growth, 人格模式, 自我探索, 心理分析

3. **不碰网站的支付系统**（用户明确要求）

4. **不要假设我能用 Telegram**（我在中国大陆，Telegram 被墙）

---

## 我的背景（方便你理解我的需求）

- 人在佛山，粤语母语，会英语/中文/少量韩语
- 专业塔罗师/占星师，有自己的玄学网站 r7fortune.com
- 会建站（0到1），愿意学编程
- 0 成本启动，目标是做成事业（不是补贴小钱）
- 不露脸
- 对中东市场、出海、跨境外贸都有兴趣
- 偏好 Telegram Bot + Stripe Payment Links 这种轻量方案
- 觉得紫微斗数的结构化框架可以用来做 AI 报告的产品逻辑

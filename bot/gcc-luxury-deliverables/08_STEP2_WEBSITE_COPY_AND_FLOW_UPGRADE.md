# Step 2：网站页面、内容、转化链路改版落地细则

日期：2026-06-30  
基础：`07_STEP1_GCC_TRAFFIC_COMPETITOR_RESEARCH.md` 调研结论  
执行状态：已同步改入本地 Web MVP 与报告生成层

---

## 1. 改版核心方向

调研后确认，GCC 高客单用户最适合的路径不是“泛测评官网”，而是：

```text
短视频 / Story 情感痛点
-> 单款报告专属落地页感
-> 24 题私密测评
-> 15% 免费预览
-> 单次付费
-> 完整深度报告
-> 8 轮 AI 私密情感陪伴
```

本次改版围绕 5 个目标：

1. 首页首屏更像社媒流量承接终端。
2. 男女分版价值在页面前置说明。
3. 产品卡片从“报告列表”升级为“高端交付卡”。
4. 免费预览更强截断，付费价值更清楚。
5. 报告正文与 AI 陪伴话术更精准击中“外表富足、内心空缺”。

---

## 2. 首页改版

已新增模块：

- Hero 下方 3 个社媒承接钩子：
  - From Reels to report
  - 15% private preview
  - No personal identity trail

目的：

- 承接 TikTok / Reels / Snapchat Story 流量。
- 强调无多余导航、私密预览、无身份轨迹。
- 将“广告点击后马上进入报告”的心智提前建立。

---

## 3. 男女分版模块

已新增页面模块：

### For men carrying responsibility quietly

页面强调：

- 成功压力。
- 私密孤独。
- 工作意义。
- 长期可靠背后的疲惫。

语气：

- 克制。
- 稳定。
- 行动导向。

### For women whose needs deserve to be seen

页面强调：

- 情感缺位。
- 关系安全感。
- 自我价值。
- 日常情绪劳动。

语气：

- 柔和。
- 接纳。
- 先看见，再引导。

目的：

- 把调研里的男女差异转化为页面信任。
- 让用户在填性别前已经理解“为什么要选择性别”。

---

## 4. 产品卡片升级

每张卡片新增：

- 交付物标签。
- 男性/女性适配角度，进入弹窗后展示。
- 更明确的价格锚点。
- 更强情感钩子。

示例：

Relationship 产品：

- Attachment pattern
- Emotional absence source
- Long-term closeness manual

目的：

- 支撑 $49-$129 价格。
- 把“报告很深”变成卡片上可见的价值。

---

## 5. 免费预览截断升级

已将免费预览改成：

- 顶部报告封面。
- 3 条可视化 signal bars：
  - Emotional clarity
  - Hidden need visibility
  - Action plan depth
- 仅展示第一层报告内容。
- 付费对比框：
  - Free preview
  - Complete report

免费版强调：

- 只看到表层状态。
- 不能看到深层情感需求。
- 不能看到行动方案。

完整版强调：

- 7-module depth report。
- Inner richness action plan。
- 8 AI companion turns。

---

## 6. 完整报告展示升级

已新增：

- 完整报告封面。
- 3 条完整度 signal bars：
  - Emotional clarity 91%
  - Hidden need visibility 86%
  - Action plan depth 88%
- 报告章节独立卡片化。
- AI Private Emotional Companion。
- Recommended next exploration 软复购卡片。

目的：

- 提升“付费后真的升级了”的感知。
- 把原来的段落报告变成更像高端数字报告。

---

## 7. AI 情感陪伴升级

提示词已升级为固定回应弧线：

1. 命名用户话语下的情绪。
2. 正常化，但不轻描淡写。
3. 反映一个隐藏需求。
4. 给出未来 24 小时的温和小行动。

语气：

- 私密。
- 克制。
- 高端。
- 情绪精准。
- 不过度亲密。
- 不使用诊断、治疗承诺、宗教指引或预测表达。

---

## 8. 报告正文话术升级

已升级：

- AI 生成 prompt。
- 关系报告 fallback。
- 职业意义报告 fallback。
- 情绪报告 fallback 第一款。

新增要求：

- 每节 190-260 词。
- 每节包含：
  - 1 个精准情绪洞察。
  - 1 个 GCC 场景。
  - 1 个自我成长建议。
- 避免泛泛 wellness 套话。
- 明确男女性别语气差异。

---

## 9. 已修改代码文件

- `/Users/iran/Desktop/独立站/bot/web/public/index.html`
- `/Users/iran/Desktop/独立站/bot/services/ai-generator.ts`

---

## 10. 后续可继续做的增强

下一轮建议：

1. 把单页 modal 拆成真实 `/lp/:reportId` 社媒落地页。
2. 为每款报告生成独立 Open Graph 分享图。
3. 增加 PDF 导出。
4. 接入 iPayLinks / PayPal 正式链接。
5. 增加 Privacy / Refund / Terms 独立页面。
6. 为男女性别生成完全不同的问题顺序与结果场景。

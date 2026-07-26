# 结构化知识库标签体系 + 素材调用规则

目标：让 6 款高客单报告从“AI 自由写作”升级为“标签匹配 + 场景素材 + 理论支撑 + AI 润色”的内容生产系统。

## 1. 用户标签体系

### 属性标签

| 标签 | 取值 | 来源 |
|---|---|---|
| gender | male / female | 用户选择 |
| report_type | 6 款报告 ID | 用户点击入口 |
| market | Saudi / UAE / Qatar / GCC | 默认或投放来源 |
| language | en / ar | 页面语言 |

### 程度标签

| 标签 | 取值 | 计算逻辑 |
|---|---|---|
| intensity | light / moderate / strong | 24 题平均分：<2.8 轻，2.8-3.9 中，>=4 强 |
| trait_strength | light / medium / obvious | 某类题组平均分 |
| emotional_load | low / medium / high | 情绪压抑 + 身心耗竭题组 |
| relationship_need | low / medium / high | 亲密、安全、被看见题组 |
| meaning_gap | low / medium / high | 成就、意义、外部认可题组 |

### 核心痛点标签

| 标签 | 触发题目关键词 | 解释 |
|---|---|---|
| restrained-emotion | composed, hold back, manage pain, strong | 外在稳定、内在压抑 |
| inner-emptiness | inner fullness, privately alone, gap, hollow | 富足生活下的空缺感 |
| relationship-absence | deeper connection, emotional safety, affection, attention | 亲密关系中的情感缺位 |
| body-depletion | body, tiredness, fatigue, rest, sleep | 身体先承载情绪压力 |
| role-pressure | responsible, family, reliable, work, successful | 家庭 / 职场角色压力 |
| self-neglect | generous with others, needs unnamed, validation | 自我需求后置 |
| meaning-gap | achievement, meaningful, successful, work | 成就与意义脱节 |

### 场景标签

| 场景领域 | 本土场景 |
|---|---|
| 职场 | 家族企业、接班压力、高压管理岗、投资决策、商务应酬、跨国团队 |
| 家庭 | 家族期待、多代同堂、家庭责任、女性角色期待、男性供养责任 |
| 社交 | Majlis、婚礼 / 家族聚会、高端社交、礼貌性寒暄、社交假面 |
| 亲密关系 | 物质付出替代表达、冲突沉默、夫妻空间被压缩、情感回应不足 |
| 自我 | 独处空虚、深夜疲惫、意义感下降、身体耗竭、自我价值感模糊 |

### 理论标签

| 标签 | 对应理论 | 用途 |
|---|---|---|
| existential-meaning | 存在主义心理学 | 空虚感、孤独、意义感下降 |
| self-determination | 自我决定理论 | 自主感、胜任感、关系感、职业动力 |
| emotion-granularity | 情绪粒度 / 情绪识别 | 情绪命名、压抑、调节 |
| attachment | 成人依恋理论 | 亲密关系安全感、回避、焦虑、修复 |
| self-compassion | 自我关怀 | 自我接纳、内在批评、情绪修复 |
| big-five | 大五人格 | 人格双面性、行为倾向 |
| perma | PERMA 积极心理学模型 | 内在丰盈、行动清单 |
| flow | 心流理论 | 意义重建、精神寄托、沉浸体验 |

## 2. 素材最小单元

每条素材必须使用以下结构：

```json
{
  "id": "material-care-expression-gap",
  "report_type": "relationship-emotional-growth",
  "gender": "male",
  "signals": ["relationship-absence", "restrained-emotion", "role-pressure"],
  "scene_domain": ["intimate_relationship", "family"],
  "local_scene": "material care replacing emotional expression",
  "intensity": ["moderate", "strong"],
  "theory": ["attachment", "emotion-granularity"],
  "conclusion": "Your state may lean toward expressing care through responsibility.",
  "scenario": "You may provide, solve, and protect while emotional words remain rare.",
  "behavior": "During conflict, you may become silent or busy rather than emotionally present.",
  "suggestion": "Pair one practical act with one emotional sentence.",
  "compliance_status": "safe"
}
```

## 3. 调用优先级

素材匹配顺序：

1. report_type 必须一致
2. gender 必须一致；通用素材可作为补充
3. signal 标签重合度优先
4. scene_domain 与用户高分题组优先
5. intensity 匹配优先
6. theory 标签覆盖当前报告核心理论

调用阈值：

- 多标签重合度 >= 80%：可直接调用
- 60%-79%：可调用，但必须做弱化表达
- <60%：不得调用，重新匹配

## 4. 拼接规则

每个报告模块固定拼接：

1. 结论句：来自最高匹配素材 conclusion
2. 本土场景：调用 1-2 条 scenario
3. 行为表现：调用 behavior，结合用户答题强度调整语气
4. 调节建议：调用 suggestion，必须可执行
5. 理论支撑：调用 theory 标签对应通俗解释

AI 允许做的事：

- 衔接语句
- 调整语气为男性 / 女性版
- 将多个素材自然串联
- 翻译成当前页面语言

AI 不允许做的事：

- 自行添加未匹配的核心结论
- 添加未入库的宗教、命理、医疗诊断解释
- 添加承诺性结果
- 引导重大人生决定

## 5. 双重校验机制

### 合规校验

自动扫描四类：

- 宗教敏感：宗教指引、教法评论、挑战宗教权威
- 命理玄学：未来判断、改运、吉凶、宿命化表达
- 医疗诊断：疾病诊断、治疗承诺、药物建议
- 价值观违规：婚外关系指导、酒精赌博、自伤引导

命中动作：

- 轻度：自动替换为合规表达
- 中度：重新生成该段
- 重度：整份报告拦截并进入人工审核

### 精准度校验

| 检查项 | 通过标准 |
|---|---|
| 标签匹配度 | >=60% |
| 场景覆盖 | 每份报告至少 3 个 GCC 本土场景 |
| 理论覆盖 | 每个核心模块至少 1 个理论标签 |
| 性别适配 | 男性行动导向 / 女性接纳导向 |
| 建议可执行 | 每节至少 1 个 24 小时或 7 天内可执行动作 |

## 6. 当前代码落地状态

已在 `services/ai-generator.ts` 中加入：

- `SIGNAL_RULES`：答题到痛点标签映射
- `SCENE_LIBRARY`：6 款报告 GCC 场景素材
- `REPORT_THEORIES`：报告到理论标签映射
- `buildStructuredProfile()`：用户标签、强度、场景、理论匹配
- `getCompanionScenarioPrompt()`：AI 陪伴场景锚定

后续数据库化时，可将这些常量迁移为 `materials` 表或 JSON 素材包。

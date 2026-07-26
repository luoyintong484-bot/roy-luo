# 专业知识库与报告生成方案

## 1. 知识库目标

所有报告与 AI 陪伴内容必须基于素材库匹配调用，禁止无依据自由发挥。

生成链路：

```text
用户性别 + 24 题答案 + 私密描述
-> 标签化
-> 知识库检索
-> 报告模板填充
-> 性别语气适配
-> GCC 文化适配
-> 合规过滤
-> 输出免费预览 / 完整报告 / 陪伴回应
```

## 2. 心理学专业知识库

来源方向：

- APA：情绪、压力、关系、积极心理学公开资料。
- British Psychological Society：心理测评伦理、测试使用规范。
- IPIP：人格特质公共领域题项。
- 依恋理论：成人依恋、亲密关系安全感。
- 自我决定理论：自主、胜任、关系需要。
- 存在主义心理学：意义感、空虚感、价值感。
- 正念、自我关怀、人本主义心理学公开资料。

素材字段：

```ts
type KnowledgeItem = {
  id: string;
  sourceUrl: string;
  sourceType: "official" | "academic" | "public_psychology" | "cultural";
  theory: string;
  dimension: string;
  genderFit?: "male" | "female" | "neutral";
  gccFit?: "saudi" | "uae" | "qatar" | "gcc";
  riskLevel: "low" | "medium" | "blocked";
  snippet: string;
  allowedUsage: string;
  forbiddenUsage: string;
  lastCheckedAt: string;
};
```

## 3. 中东本土文化适配库

采集方向：

- GCC 家庭结构与情绪表达习惯。
- 高净值群体的角色压力、成就压力、隐私需求。
- 阿拉伯家庭关系、婚恋沟通、责任表达方式。
- 高端心理健康平台公开表达方式。

使用原则：

- 强调家庭、责任、体面、隐私、稳定关系。
- 不挑战宗教与社会伦理。
- 不写政治、宗教敏感话题。
- 不把欧美个人主义表达直接套用到 GCC。

## 4. 治愈系话术库

分类：

- 男性责任压抑型。
- 男性成功后空虚型。
- 女性情感缺位型。
- 女性自我价值迷茫型。
- 关系安全感缺失型。
- 身心耗竭型。
- 职业意义缺失型。

话术标准：

- 真诚、克制、精准。
- 不鸡汤，不夸张。
- 不说“你应该”。
- 多用“你可能正在承受”“这可以被理解”“一个温和的小步骤是”。

## 5. 违禁词过滤

三级过滤：

1. 宗教违禁：宗教指引、教法判断、替代宗教权威。
2. 命理玄学：预测、改运、吉凶、宿命、占卜、星盘、塔罗、风水、八字、紫微斗数。
3. 价值观违规：婚外关系指导、性取向判断、自伤引导、酒精赌博。

处理：

- 强红线：拒绝输出。
- 中风险：自动改写 + 标记审核。
- 医疗诊断：改为“自我反思信号”。

## 6. 报告模板

每份完整报告 7 模块：

1. 状态表层画像。
2. 情感满足度/空缺等级。
3. 深层情感需求。
4. 多场景表现。
5. 性别适配解释。
6. 内在丰盈行动方案。
7. AI 陪伴开启语。

免费版只展示模块 1 的 15%。

## 7. 评分标签

示例：

```text
emotional_emptiness.high
expression_restraint.medium
relationship_absence.high
inner_richness.low
achievement_meaning_gap.medium
body_emotion_depletion.high
family_role_pressure.medium
privacy_need.high
```


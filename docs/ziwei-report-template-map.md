# 紫微斗数完整版报告话术与字段映射

本文档记录 r7fortune.com 紫微斗数「个人本命盘完整版报告」与「双人合盘完整版报告」的生成逻辑。报告文本为原创模板，参考行业公开报告的结构层级，不复制第三方站点文案。

## 个人本命盘报告

生成入口：`src/lib/ziwei-report-templates.ts` 的 `buildZiweiNatalReport(chart)`

数据来源：`src/lib/ziwei-doushu.ts` 的 `ZiweiChart`

模块字段映射：

- 命格核心总览：`chart.mingPalace`、`chart.shenPalace`、`chart.palaces[命宫]`、`chart.palaces[福德]`、`chart.patterns`、`chart.palaces[].four`
- 事业发展格局：`chart.palaces[官禄]`、`chart.palaces[命宫]`、`chart.palaces[财帛]`、`chart.palaces[迁移]`
- 财富积累模式：`chart.palaces[财帛]`、`chart.palaces[田宅]`、`chart.palaces[福德]`、相关宫位四化
- 感情婚姻特质：`chart.palaces[夫妻]`、`chart.palaces[福德]`、`chart.palaces[迁移]`、`chart.palaces[子女]`
- 人际、家庭与身心状态：`chart.palaces[交友]`、`chart.palaces[兄弟]`、`chart.palaces[田宅]`、`chart.palaces[父母]`、`chart.palaces[疾厄]`
- 十二宫全维度补充：`chart.palaces[]` 全量循环
- 大运流年趋势指引：`chart.palaces[].four`、`chart.patterns`、核心宫位联动
- 综合人生规划建议：`chart.mainStar`、核心宫位结论汇总

## 双人合盘报告

生成入口：`src/lib/ziwei-report-templates.ts` 的 `buildZiweiSynastryReport(chartA, chartB, synastry)`

数据来源：`ZiweiChart` × 2 + `ZiweiSynastry`

模块字段映射：

- 关系总评与核心定位：`chartA.mainStar`、`chartB.mainStar`、`synastry.score`、`synastry.label`、`synastry.chemistry`
- 性格特质互补与冲突：双方 `palaces[命宫]` 的主星、辅星、庙旺利陷
- 情感需求与相处模式：双方 `palaces[夫妻]`、`palaces[福德]`
- 价值观与人生节奏：双方 `palaces[官禄]`、`palaces[财帛]`
- 现实生活磨合：双方 `palaces[田宅]`、`palaces[交友]`、`palaces[子女]`
- 关系关键风险点预警：双方 `palaces[].four` 中的化忌信息、`synastry.risk`
- 长期相处优化建议：`synastry.advice` 与前述模块结论汇总

## 合规话术边界

- 使用「东方传统性格分析与人生规划参考」包装。
- 避免「注定」「改命」「绝对吉凶」等确定性表述。
- 不输出医疗、法律、投资等高风险决策结论，只提供趋势参考与现实行动建议。

## 更新报告内容的位置

- 修改报告生成逻辑：`src/lib/ziwei-report-templates.ts`
- 修改排盘字段或星曜规则：`src/lib/ziwei-doushu.ts`
- 修改个人完整版页面视觉：`src/pages/DestinyFullReport.tsx`
- 修改合盘完整版页面视觉：`src/pages/SynastryFullReport.tsx`

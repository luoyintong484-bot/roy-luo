# R7 Fortune Ziwei Doushu Rules

This document records the local implementation baseline for the Ziwei Doushu chart module.

## Product Positioning

- Public-facing wording: "东方传统性格分析与人生规划参考工具".
- Avoid high-risk commercial wording such as guaranteed fortune telling, destiny changing, or medical/legal/financial certainty.
- Free layer: visual chart, traceable birth parameters, palace and star distribution.
- Paid layer: structured interpretation and PDF-style long report.
- Current pricing: personal report CNY 79, synastry report CNY 109.

## Public Reference Baseline

The implementation uses public rule-level references only, not copied commercial copywriting:

- Local literature baseline: see `docs/ziwei-literature-baseline.md`.
- Canonical doctrine layer: `src/data/ziweiDoctrine.ts`.
- Twelve-palace framework: 命宫、兄弟、夫妻、子女、财帛、疾厄、迁移、交友、事业、田宅、福德、父母.
- Square 4x4 chart layout: twelve outer cells and center information block.
- Time calibration: true solar time is treated as a traceable parameter; missing longitude falls back to standard birth time with a visible note.
- Early/late Zi hour: 23:00-24:00 and 00:00-01:00 are flagged separately for manual verification.
- Four transformations use birth-year heavenly stem.

## Birth-Year Four Transformations

Order: 化禄、化权、化科、化忌.

- 甲: 廉贞、破军、武曲、太阳
- 乙: 天机、天梁、紫微、太阴
- 丙: 天同、天机、文昌、廉贞
- 丁: 太阴、天同、天机、巨门
- 戊: 贪狼、太阴、右弼、天机
- 己: 武曲、贪狼、天梁、文曲
- 庚: 太阳、武曲、太阴、天同
- 辛: 巨门、太阳、文曲、文昌
- 壬: 天梁、紫微、左辅、武曲
- 癸: 破军、巨门、太阴、贪狼

## Current Engine Coverage

Implemented:

- Fourteen main stars
- Six auspicious/six malefic support set subset: 左辅、右弼、文昌、文曲、禄存、天魁、天钺、擎羊、陀罗、火星、铃星
- Misc stars: 天马、红鸾、天喜、天姚、天刑、天虚、天哭、三台、八座、恩光、天贵、台辅、封诰
- Twelve growth phases
- Birth-year four transformations
- Palace-level brightness label
- Basic pattern tags: 紫府同宫、杀破狼格、机月同梁、三奇嘉会
- Synastry score and relationship summary from both charts
- Report interpretation now routes through `src/data/ziweiDoctrine.ts`, which standardizes star meanings, palace linkage rules, four-transformation language, compliance wording, and Ziwei Tarot body-use logic.

## Accuracy Notes

The current browser-side engine is a deployable product baseline, but "100% matching Wenmo Tianji professional edition" requires a validation dataset and exact calendar conversion parameters:

- Gregorian/lunar conversion source
- Leap-month handling option
- True solar longitude/latitude from selected birth city
- Day boundary and early/late Zi-hour selected convention
- A set of sample charts exported from the target reference tool

After sample charts are provided, the rule tables can be calibrated without changing the UI layer.

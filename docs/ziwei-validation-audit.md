# 紫微斗数排盘与话术专项校验报告

更新时间：2026-07-02

## 结论摘要

本次校验覆盖当前代码库内实际存在的紫微斗数模块：

- 核心排盘逻辑：`src/lib/ziwei-doushu.ts`
- 个人/合盘话术映射：`src/lib/ziwei-report-templates.ts`
- 前端命盘展示：`src/components/ZiweiDoushuPanel.tsx`
- 完整版报告页面：`src/pages/DestinyFullReport.tsx`、`src/pages/SynastryFullReport.tsx`

当前项目没有独立的紫微后台数据库表，规则库以内置 TypeScript 常量形式存在。本次已将核心规则常量显式导出，并新增自动校验测试，方便后续迁移到 MySQL 或后台规则表。

## 已完成修正

### 1. 规则库可校验化

已在 `src/lib/ziwei-doushu.ts` 中导出：

- `PALACE_NAMES`
- `BRANCHES`
- `STEMS`
- `MAIN_STARS`
- `ASSISTANT_STARS`
- `FOUR_TRANSFORMATIONS`
- `FOUR_BY_STEM`
- `BRIGHTNESS_SEED`
- `ZIWEI_RULE_TABLES`
- `validateZiweiRuleTables()`

自动校验项：

- 十二宫数量与去重
- 十二地支数量与去重
- 十天干数量与去重
- 十四主星数量与去重
- 十天干生年四化完整性
- 四化引用星曜是否存在于主星/辅星库
- 十四主星庙旺利陷是否覆盖 12 地支

### 2. 边界场景基础测试

新增测试文件：`api/ziwei-doushu.spec.ts`

已覆盖：

- 真太阳时有经度时会写入 trace
- 未提供经纬度时有明确降级说明
- 夜子时 `23:00-24:00` 与早子时 `00:00-01:00` 分别标注
- 每张盘输出 12 宫
- 每张盘输出 4 个生年四化

### 3. 话术映射修正

修正 `ZIWEI_REPORT_FIELD_MAP` 中的宫位命名：

- 旧：`chart.palaces[夫妻宫]`
- 新：`chart.palaces[夫妻]`

原因：当前 `ZiweiPalace.name` 的真实枚举为 `命宫、兄弟、夫妻、子女、财帛、疾厄、迁移、交友、官禄、田宅、福德、父母`。映射字段必须与真实枚举一致，否则后续做后台配置或自动生成时会错配。

### 4. 合规词扫描

测试已扫描个人报告与合盘报告生成文本，避免出现：

- 算命
- 改命
- 注定
- 必发
- 必婚
- 必定发财
- 一定离婚

## 当前准确率边界说明

目前可以保证：

- 代码内规则表结构完整性通过自动测试
- 生成结果字段结构稳定
- 报告话术能正确读取当前命盘字段
- 页面不会因空字段崩溃
- 合规高风险词未出现在核心报告模板中

目前不能严谨宣称：

- 与文墨天机专业版逐项 100% 一致
- 与《紫微斗数全书》所有安星细节完全一致
- 90+ 格局全部覆盖

原因：这些需要一组外部标准样本作为 expected fixture，例如从文墨天机专业版导出的 10-30 组命盘结果，包含命宫、身宫、主星、辅星、四化、庙旺利陷和格局。拿到样本后，可补充逐项快照测试。

## 建议的下一阶段校准流程

1. 选取 10 组样本：
   - 不同年份
   - 不同时辰
   - 男女各半
   - 包含 23:00、00:30、闰月、海外经度等边界样本
2. 在文墨天机专业版导出每组结果。
3. 建立 `api/fixtures/ziwei-reference/*.json`。
4. 增加逐项对比测试：
   - 十二宫主星
   - 辅星与杂曜
   - 生年四化
   - 身宫
   - 庙旺利陷
   - 格局
5. 按测试差异逐项修正规则表。

## 本次验证命令

```bash
npm test -- --run api/ziwei-doushu.spec.ts
npm run build
```

当前结果：

- `api/ziwei-doushu.spec.ts`：5 tests passed
- `npm run build`：passed

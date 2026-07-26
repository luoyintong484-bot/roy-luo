# R7 Fortune 命理专区链路说明

更新时间：2026-07-07

## 当前上线形态

命理专区采用「免费排盘 + 回溯验证 + 免费基础报告 + 完整版即将上线」的结构。

用户可以免费输入生辰资料并生成紫微命盘或双人合盘。完整深度报告入口保留，但统一显示 Coming Soon，不触发支付或下单。

## 页面路由

| 页面 | 路由 | 说明 |
| --- | --- | --- |
| 命理专区首页 | `/astrology` | 汇总个人命盘和双人合盘入口 |
| 个人排盘输入 | `/astrology/birth-chart/new` | 输入出生日期、时间、性别、地点 |
| 个人回溯验证 | `/astrology/birth-chart/:id/verify` | 展示命盘、真太阳时、3 条回溯验证 |
| 个人资料不符页 | `/astrology/birth-chart/:id/error` | 引导返回修改或继续看参考报告 |
| 个人免费报告 | `/astrology/birth-chart/:id/basic-report` | 展示免费基础解读与 Coming Soon |
| 个人完整版桥接 | `/astrology/birth-chart/:id/full-report` | 写入旧报告 localStorage 后进入旧完整版页面 |
| 合盘输入 | `/astrology/synastry/new` | 输入双方出生资料 |
| 合盘回溯验证 | `/astrology/synastry/:id/verify` | 展示双方命盘摘要与合盘验证 |
| 合盘资料不符页 | `/astrology/synastry/:id/error` | 引导返回修改或继续看参考报告 |
| 合盘免费报告 | `/astrology/synastry/:id/basic-report` | 展示免费合盘解读与 Coming Soon |
| 合盘完整版桥接 | `/astrology/synastry/:id/full-report` | 写入旧合盘 localStorage 后进入旧完整版页面 |

## 核心文件

| 文件 | 用途 |
| --- | --- |
| `src/App.tsx` | 注册 `/astrology` 新路由 |
| `src/components/Navbar.tsx` | 将命理导航和搜索结果指向 `/astrology` |
| `src/pages/astrology/AstrologyHome.tsx` | 命理专区首页 |
| `src/pages/astrology/BirthChartNew.tsx` | 个人排盘输入页 |
| `src/pages/astrology/SynastryNew.tsx` | 双人合盘输入页 |
| `src/pages/astrology/BirthChartVerify.tsx` | 个人回溯验证页 |
| `src/pages/astrology/SynastryVerify.tsx` | 合盘回溯验证页 |
| `src/pages/astrology/AstrologyReports.tsx` | 免费报告与完整版桥接 |
| `src/pages/astrology/AstrologyError.tsx` | 验证不符兜底页 |
| `src/pages/astrology/astrology-storage.ts` | 生成、保存、读取排盘记录 |
| `src/lib/astrology/true-solar-time.ts` | 真太阳时、时辰校准、城市经纬度 |
| `src/lib/astrology/retro-verification.ts` | 回溯验证文案生成 |
| `src/lib/astrology/knowledge-base/*.json` | 紫微、印度占星、星宿等知识库占位 |

## 真太阳时逻辑

当前公式：

```text
真太阳时 = 北京时间 + (出生地经度 - 120) * 4 分钟 + 均时差
```

说明：

- 默认中国标准时区经度为东经 120 度。
- 城市经纬度由 `CITY_COORDINATES` 提供。
- 未匹配到城市时，默认使用上海坐标，并在页面显示校准提醒。
- 23:00-24:00 会标注晚子时提示，00:00-01:00 会标注早子时提示。

## 数据保存

当前本地预览阶段使用 `localStorage` 保存临时记录：

| Key | 内容 |
| --- | --- |
| `r7_astrology_birth_records_v1` | 个人命盘记录 |
| `r7_astrology_synastry_records_v1` | 双人合盘记录 |
| `r7_ziwei_natal_report` | 旧个人完整版报告兼容入口 |
| `r7_ziwei_synastry_report` | 旧双人合盘完整版报告兼容入口 |

上线后如果需要账号内长期保存，应把这些记录迁移到后端订单/报告表。

## 后续可调位置

| 需求 | 修改位置 |
| --- | --- |
| 增加城市经纬度 | `src/lib/astrology/true-solar-time.ts` 的 `CITY_COORDINATES` |
| 调整回溯验证文案 | `src/lib/astrology/retro-verification.ts` |
| 调整免费报告模块 | `src/pages/astrology/AstrologyReports.tsx` |
| 打开付费完整版入口 | `src/pages/astrology/AstrologyReports.tsx` 中 Coming Soon 区块与 full-report 路由 |
| 更新知识库 | `src/lib/astrology/knowledge-base/*.json` |

## 验证结果

2026-07-07 本地验证：

- `npm run build` 通过。
- `/astrology` 可打开。
- 个人命盘：输入资料 -> 回溯验证 -> 免费基础报告，全链路可用。
- 双人合盘：输入双方资料 -> 回溯验证 -> 免费合盘报告，全链路可用。
- 完整版报告按钮保持 Coming Soon 状态，不触发支付。


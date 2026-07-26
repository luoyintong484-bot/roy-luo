# R7 Fortune 上线核验清单（2026-07-02）

## 本次上线锁定结论

付费模块已统一切换为「即将上线 Coming Soon」状态。当前版本不会生成订单、不会进入收款码/PayPal/支付回调流程，也不会通过支付成功页解锁报告。

## 核验表

| 检查大类 | 检查项明细 | 检查结果 | 问题说明 | 修复状态 |
|---|---|---:|---|---|
| 付费模块锁定 | `TEST_MODE=false`，`PAYMENT_COMING_SOON=true` | 通过 | 测试自动解锁已关闭，付费总开关已打开锁定 | 已完成 |
| 付费模块锁定 | 完整版报告按钮替换为「即将上线 Coming Soon」 | 通过 | 个人命盘、双人合盘等统一走 `ReportLock` / `PayModal` | 已完成 |
| 付费模块锁定 | 点击付费按钮不进入支付页 | 通过 | 弹出 Coming Soon 提示，不跳转收款流程 | 已完成 |
| 支付直达拦截 | 直接访问 `/#/payment` | 通过 | 显示 Coming Soon 页面，不展示收款码、不生成订单 | 已完成 |
| 支付直达拦截 | 直接访问 `/#/payment-success` | 通过 | 支付校验被拦截，不调用解锁逻辑 | 已完成 |
| 后端兜底 | `api/payment-router.ts` 创建订单接口 | 通过 | 返回 `coming_soon`，不写入付款记录 | 已完成 |
| 后端兜底 | 支付完成 / Webhook 接口 | 通过 | 不更新会员或付费权限 | 已完成 |
| 订单与会员 | 个人中心会员开通入口 | 通过 | 显示「会员即将上线」，不跳转支付 | 已完成 |
| 路由连通 | 主要页面 HTTP 可访问 | 通过 | `/`、`/tarot`、`/destiny`、`/idol-match`、`/payment` 等返回 200 | 已完成 |
| 构建 | `npm run build` | 通过 | 产物已输出到 `dist/public`；仅有 chunk 体积提醒 | 已完成 |
| 类型检查 | `npm run check` | 未通过 | 存在历史遗留 TS 错误，本次触碰文件未新增相关报错 | 待专项清理 |
| 生产域名 | `r7fortune.com` 解析与 HTTPS | 未执行 | 需在宝塔部署后核验 DNS、SSL、Nginx fallback | 待线上执行 |
| 数据备份 | 源码 + 数据库备份 | 未执行 | 需在正式上传宝塔前生成当前线上回滚包 | 待线上执行 |
| 日志排查 | 服务器访问日志 / 错误日志 | 未执行 | 需在宝塔站点运行后查看 Nginx 与 Node 日志 | 待线上执行 |
| 多浏览器 | Chrome / Safari / Edge / 微信 / 夸克 | 部分通过 | 本地 in-app browser 已验，其他真实浏览器需线上复核 | 待线上执行 |

## 本地已验证路径

```text
/                                                          200
/tarot                                                     200
/ziwei-tarot                                               200
/destiny                                                   200
/destiny-result                                            200
/destiny-full-report                                       200
/synastry-full-report                                      200
/idol-match                                                200
/cp-report                                                 200
/profile?tab=payments                                      200
/payment                                                   200
/payment-success?session=test_lock&return=%2Fdestiny-full-report 200
```

## 当前上线注意事项

- 当前路由使用 `HashRouter`，线上访问应优先使用 `https://r7fortune.com/#/页面路径`。
- 宝塔 Nginx 仍建议保留 SPA fallback，避免用户访问普通路径时出现首页或 404 混乱。
- 正式开启收款前，需要把 `src/const.ts` 中 `PAYMENT_COMING_SOON` 改为 `false`，并重新核验支付全链路。

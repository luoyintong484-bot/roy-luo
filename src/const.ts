export const LOGIN_PATH = "/login";

// ============================================================
// 🚀 生产环境配置 (PRODUCTION)
// 回滚: TEST_MODE=true, PAYMENT_COMING_SOON=true 即可降级
// ============================================================
export const TEST_MODE = false; // true=本地预览放开权限；上线前改回 false
export const PAYMENT_COMING_SOON = false; // 生产支付宝链路已启用；紧急关闭时改回 true

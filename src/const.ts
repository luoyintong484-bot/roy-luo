export const LOGIN_PATH = "/login";

// ============================================================
// 🚀 生产环境配置 (PRODUCTION)
// 回滚: TEST_MODE=true, PAYMENT_COMING_SOON=true 即可降级
// ============================================================
export const TEST_MODE = false;            // true=本地预览放开权限；上线前改回 false
export const PAYMENT_COMING_SOON = false;  // 生产支付宝链路已启用；紧急关闭时改回 true
export const MANUAL_PAYMENT_PREVIEW = false; // 已切换至服务端支付宝订单，不再展示手工收款码

// 收款码图片路径：图片放在 public/payment/ 下，前端用根路径读取
// 裁剪版（仅二维码区域，无海报白边）：用于页面展示
// 原版完整海报保留为 wechat.jpg / alipay.jpg，便于后续替换
export const MANUAL_PAYMENT_QR_SRC = "";
export const MANUAL_PAYMENT_WECHAT_QR_SRC = "/payment/wechat-qr-crop.jpg";
export const MANUAL_PAYMENT_ALIPAY_QR_SRC = "/payment/alipay-qr-crop.jpg";

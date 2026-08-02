import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { handlePaymentSuccess } from "@/lib/payment-service";
import { verifyPayment } from "@/lib/payment";
import { addReportHistory } from "@/lib/report-history";
import { PAYMENT_COMING_SOON } from "@/const";
import {
  CheckCircle2,
  Home,
  Loader2,
  RotateCcw,
  XCircle,
  Sparkles,
  Clock3,
  FileText,
  Share2,
} from "lucide-react";

type Status = "checking" | "success" | "failed";

function safeReturnPath(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//"))
    return "/profile?tab=payments";
  return path;
}

export default function PaymentSuccessPage() {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("");
  const [autoRedirectLeft, setAutoRedirectLeft] = useState(2);
  const [autoRedirectEnabled, setAutoRedirectEnabled] = useState(true);

  const sessionId =
    searchParams.get("session") || searchParams.get("session_id") || "";
  const alipayToken = searchParams.get("alipay_token") || "";
  const returnPath = useMemo(
    () =>
      safeReturnPath(
        searchParams.get("return") || localStorage.getItem("r7_pay_return"),
      ),
    [searchParams],
  );

  // Extract order details for receipt
  const orderDetails = useMemo(() => {
    try {
      const pending = JSON.parse(
        localStorage.getItem("r7_pending_report") || "{}",
      );
      return {
        productName: pending.productNameZh || pending.productName || "",
        amount: pending.amount || 0,
        reportType: pending.reportType || "",
        orderNo: sessionId,
      };
    } catch {
      return { productName: "", amount: 0, reportType: "", orderNo: sessionId };
    }
  }, [sessionId]);

  useEffect(() => {
    let alive = true;

    async function settlePayment() {
      if (PAYMENT_COMING_SOON) {
        setStatus("failed");
        setMessage(
          isZh
            ? "付費功能即將開放，當前不會校驗訂單或解鎖報告。"
            : "Paid access is coming soon. Orders are not verified and reports are not unlocked right now.",
        );
        return;
      }

      if (!sessionId) {
        setStatus("failed");
        setMessage(
          isZh
            ? "缺少支付會話信息，無法校驗訂單。"
            : "Missing checkout session. Unable to verify order.",
        );
        return;
      }

      const verification = await verifyPayment(sessionId, alipayToken);
      if (!alive) return;

      if (!verification.success) {
        setStatus("failed");
        setMessage(
          isZh
            ? "支付尚未完成或校驗失敗。"
            : "Payment is not completed or verification failed.",
        );
        return;
      }

      const unlockResult = handlePaymentSuccess(sessionId, {
        reportKey: verification.reportKey,
        reportType: verification.reportType,
        amount: verification.amount,
        returnPath: verification.returnPath,
      });
      if (!unlockResult.success) {
        setStatus("failed");
        setMessage(
          isZh
            ? "訂單已付款，但找不到對應報告，請聯繫客服並提供訂單號。"
            : "Payment is complete, but the report could not be matched. Please contact support with the order ID.",
        );
        return;
      }
      try {
        const pendingPayment = JSON.parse(
          localStorage.getItem("r7_pending_payment") || "{}",
        );
        if (pendingPayment?.sessionId === sessionId)
          localStorage.removeItem("r7_pending_payment");
      } catch {
        // Ignore malformed legacy pending-payment state.
      }
      try {
        localStorage.removeItem("r7_blocked_from");
      } catch {
        /* Storage can be unavailable in privacy mode. */
      }

      setStatus("success");
      try {
        if (verification.success && verification.reportKey) {
          addReportHistory({
            reportKey: verification.reportKey,
            reportType: verification.reportType || "report",
            route: verification.returnPath,
          });
        }
      } catch {
        /* history recording is best-effort */
      }
      setMessage(
        isZh
          ? "支付寶付款已由服務端校驗，完整內容已解鎖。"
          : "Alipay payment was verified by the server. Full content is unlocked.",
      );
    }

    settlePayment();
    return () => {
      alive = false;
    };
  }, [alipayToken, isZh, returnPath, sessionId]);

  // Auto-redirect countdown — 2 seconds, user can cancel
  useEffect(() => {
    if (status !== "success" || !autoRedirectEnabled) return;
    if (autoRedirectLeft <= 0) {
      navigate(returnPath, { replace: true });
      return;
    }
    const timer = window.setTimeout(() => {
      setAutoRedirectLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [autoRedirectEnabled, autoRedirectLeft, navigate, returnPath, status]);

  const handleShare = async () => {
    const shareText = isZh
      ? `我在 R7 Fortune 解鎖了一份完整命理報告，快來測測你的吧！`
      : `I just unlocked my full astrology report on R7 Fortune! Come try yours!`;
    const shareUrl = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "R7 Fortune",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      } catch {
        /* clipboard unavailable */
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="glass rounded-2xl p-7 border border-[#FFB6C115] text-center space-y-5">
            {status === "checking" && (
              <>
                <div className="w-16 h-16 rounded-full bg-[#FFB6C108] flex items-center justify-center mx-auto border border-[#FFB6C115]">
                  <Loader2 className="w-7 h-7 text-[#FFB6C1] animate-spin" />
                </div>
                <h1 className="font-display text-xl font-bold text-[#f0e6d3]">
                  {isZh ? "正在校驗支付" : "Verifying Payment"}
                </h1>
                <p className="text-sm text-[#8a8aad]">
                  {isZh
                    ? "請稍等，正在確認你的訂單狀態。"
                    : "Please wait while we confirm your order."}
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto border border-green-400/20">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h1 className="font-display text-xl font-bold text-[#f0e6d3]">
                  {isZh ? "解鎖成功！" : "Unlocked Successfully!"}
                </h1>
                <p className="text-sm text-[#8a8aad]">{message}</p>

                {/* Order Receipt Card */}
                {orderDetails.productName && (
                  <div className="rounded-2xl border border-[#d4a85322] bg-[#0a0710]/60 p-4 text-left space-y-3">
                    <div className="flex items-center gap-2 border-b border-[#d4a85315] pb-2">
                      <FileText className="h-4 w-4 text-[#d4a853]" />
                      <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#d4a853]">
                        {isZh ? "訂單回執" : "Order Receipt"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8a8aad]">
                          {isZh ? "產品" : "Product"}
                        </span>
                        <span className="font-semibold text-[#f0e6d3]">
                          {orderDetails.productName}
                        </span>
                      </div>
                      {orderDetails.amount > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-[#8a8aad]">
                            {isZh ? "金額" : "Amount"}
                          </span>
                          <span className="font-bold text-[#ffd36a]">
                            ¥{orderDetails.amount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {orderDetails.orderNo && (
                        <div className="flex justify-between text-xs">
                          <span className="text-[#8a8aad]">
                            {isZh ? "訂單號" : "Order ID"}
                          </span>
                          <span className="font-mono text-[#c9bdd8]">
                            {orderDetails.orderNo}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8a8aad]">
                          {isZh ? "有效期" : "Validity"}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-green-300">
                          <Clock3 className="h-3 w-3" />
                          {isZh ? "30 天" : "30 days"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unlocked content summary */}
                <div className="rounded-xl border border-[#FFB6C118] bg-[#FFB6C108] px-4 py-3">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#FFB6C1]" />
                    <span className="text-[11px] font-bold text-[#ffd6e8]">
                      {isZh ? "你已解鎖完整版內容" : "Full content unlocked"}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#c9bdd8]">
                    {isZh
                      ? "返回報告頁即可查看完整深度解析，30 天內有效。"
                      : "Return to the report page to view the full analysis, valid for 30 days."}
                  </p>
                </div>

                {/* Auto-redirect notice */}
                <div className="flex items-center justify-center gap-2">
                  {autoRedirectEnabled ? (
                    <>
                      <p className="text-[11px] text-[#d4a853]">
                        {isZh
                          ? `${autoRedirectLeft} 秒後自動返回報告頁`
                          : `Auto-redirect in ${autoRedirectLeft}s`}
                      </p>
                      <button
                        onClick={() => setAutoRedirectEnabled(false)}
                        className="text-[10px] text-[#8a8aad] hover:text-[#FFB6C1] transition-colors underline underline-offset-2"
                      >
                        {isZh ? "停止跳轉" : "Cancel"}
                      </button>
                    </>
                  ) : (
                    <p className="text-[10px] text-[#8a8aad]">
                      {isZh ? "已停止自動跳轉" : "Auto-redirect cancelled"}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => navigate(returnPath, { replace: true })}
                    className="w-full py-3 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {isZh ? "查看完整報告" : "View Full Report"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleShare}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-[#FFB6C128] text-[#f0e6d3] hover:border-[#FFB6C144] hover:bg-[#FFB6C108] transition-all flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      {isZh ? "分享給朋友" : "Share"}
                    </button>
                    <Link
                      to="/my-reports"
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-[#FFB6C128] text-[#f0e6d3] hover:border-[#FFB6C144] hover:bg-[#FFB6C108] transition-all flex items-center justify-center gap-1.5"
                    >
                      📚 {isZh ? "我的報告庫" : "My Reports"}
                    </Link>
                  </div>
                  <Link
                    to="/"
                    className="flex w-full items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border border-[#FFB6C128] text-[#f0e6d3] hover:border-[#FFB6C144] hover:bg-[#FFB6C108] transition-all"
                  >
                    <Home className="h-3.5 w-3.5" />
                    {isZh ? "首頁" : "Home"}
                  </Link>
                </div>
              </>
            )}

            {status === "failed" && (
              <>
                <div className="w-16 h-16 rounded-full bg-rose-400/10 flex items-center justify-center mx-auto border border-rose-400/20">
                  <XCircle className="w-8 h-8 text-rose-300" />
                </div>
                <h1 className="font-display text-xl font-bold text-[#f0e6d3]">
                  {isZh ? "支付未完成" : "Payment Not Completed"}
                </h1>
                <p className="text-sm text-[#8a8aad]">{message}</p>
                <button
                  onClick={() => navigate(returnPath, { replace: true })}
                  className="w-full py-3 bg-[#151520] border border-[#FFB6C118] text-[#f0e6d3] rounded-xl text-sm font-semibold hover:border-[#FFB6C144] transition-all"
                >
                  {isZh ? "返回報告重新支付" : "Return to report"}
                </button>
              </>
            )}

            {status === "failed" && (
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 text-xs text-[#8a8aad] hover:text-[#FFB6C1] transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                {isZh ? "返回首頁" : "Back to Home"}
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

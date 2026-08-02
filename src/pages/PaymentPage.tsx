import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import { useI18n } from "@/contexts/I18nContext";

function safeReturnPath(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

/**
 * Legacy route kept only so old bookmarks fail safely. New orders are created by
 * the report paywall and sent directly to Alipay's signed web checkout.
 */
export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const query = new URLSearchParams(location.search);
  const returnPath = safeReturnPath(
    query.get("return") ||
      localStorage.getItem("r7_pay_return") ||
      localStorage.getItem("r7_blocked_from"),
  );

  return (
    <div className="min-h-screen payment-mobile-polish">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <button
            onClick={() => navigate(returnPath, { replace: true })}
            className="mb-5 flex items-center gap-1.5 text-xs text-[#c9b7d8] transition-colors hover:text-[#FFB6C1]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {isZh ? "返回原頁面" : "Back to report"}
          </button>

          <section className="glass rounded-2xl border border-[#FFB6C115] p-7 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#1677ff35] bg-[#1677ff12]">
              <ShieldCheck className="h-8 w-8 text-[#5fa0ff]" />
            </div>
            <h1 className="font-display text-xl font-bold text-[#f0e6d3]">
              {isZh ? "請從報告頁發起支付" : "Start payment from your report"}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#8a8aad]">
              {isZh
                ? "本站已統一使用支付寶官方收銀台。返回原報告並點擊解鎖，系統會建立服務端簽名訂單，不再使用收款碼。"
                : "All payments now use Alipay's official signed checkout. Return to your report and tap Unlock to create a server-verified order; QR-code collection is no longer used."}
            </p>
            <button
              onClick={() => navigate(returnPath, { replace: true })}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#1677ff] to-[#4096ff] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              {isZh ? "返回報告並支付" : "Return to report"}
            </button>
          </section>
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

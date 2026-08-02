import { useState } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { createCheckout, detectRegion, PAYMENT_METHODS } from "@/lib/payment";
import { PAYMENT_COMING_SOON } from "@/const";
import { Clock3, CreditCard, Loader2 } from "lucide-react";

interface PayButtonProps {
  amount: number;
  productName: string;
  productNameZh: string;
  className?: string;
  onSuccess?: () => void;
}

export default function PayButton({
  amount,
  productName,
  productNameZh,
  className,
  onSuccess,
}: PayButtonProps) {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const isZh = locale === "zh-TW";
  const region = detectRegion();
  const methods = PAYMENT_METHODS[region];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (PAYMENT_COMING_SOON) {
      setError(
        isZh
          ? "完整版报告功能即将开放，敬请期待"
          : "Full report access is coming soon.",
      );
      return;
    }

    setLoading(true);
    setError("");
    const result = await createCheckout({ amount, productName, productNameZh });
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    if (result.url.startsWith("/")) {
      // Local flow — use navigate for hash-router compat
      navigate(result.url);
    } else {
      // Official Alipay checkout
      window.open(result.url, "_blank");
    }
    onSuccess?.();
  };

  return (
    <div className={className}>
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : PAYMENT_COMING_SOON ? (
          <Clock3 className="w-4 h-4" />
        ) : (
          <CreditCard className="w-4 h-4" />
        )}
        {PAYMENT_COMING_SOON
          ? isZh
            ? "即將上線"
            : "Coming Soon"
          : isZh
            ? `支付 ¥${amount.toFixed(2)}`
            : `Pay ¥${amount.toFixed(2)}`}
      </button>
      <div className="flex justify-center gap-2 mt-2">
        {methods.map((m) => (
          <span
            key={m.id}
            className="text-[10px] text-[#8a8aad44] flex items-center gap-0.5"
          >
            <span className="text-sm">{m.icon}</span> {isZh ? m.nameZh : m.name}
          </span>
        ))}
      </div>
      {error && (
        <p className="text-[10px] text-rose-400 text-center mt-1">{error}</p>
      )}
    </div>
  );
}

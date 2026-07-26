/* ============================================================
   R7 Fortune — Report Lock Component
   Unified paywall UI for: 单人命盘 / CP合盘 / 双人合盘
   Shows gradient blur mask + unlock button when locked.
   Renders children when unlocked with 0.3s transition.
   ============================================================ */

import { useState, useMemo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import PayModal, { PAYWALL_CONFIGS, type PayModalConfig } from "@/components/PayModal";
import { unlockReport, isReportPaid } from "@/lib/payment-service";
import { getLocalPrice, type CnyPriceKey } from "@/lib/pricing";
import { PAYMENT_COMING_SOON } from "@/const";
import { Lock, ShieldCheck, Sparkles, Users } from "lucide-react";

interface ReportLockProps {
  isUnlocked: boolean;
  reportType: CnyPriceKey; // "natal" | "synastry" | "cp"
  reportKey: string;
  onUnlocked: () => void;
  children: React.ReactNode;
}

export default function ReportLock({ isUnlocked, reportType, reportKey, onUnlocked, children }: ReportLockProps) {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const [showPayModal, setShowPayModal] = useState(false);
  const price = getLocalPrice(reportType);

  // Map reportType to PayModal config
  const paywallConfig: PayModalConfig = (() => {
    const baseConfig = PAYWALL_CONFIGS[reportType as keyof typeof PAYWALL_CONFIGS] || PAYWALL_CONFIGS.natal;
    return { ...baseConfig, reportKey } as PayModalConfig;
  })();

  const handleUnlocked = () => {
    if (PAYMENT_COMING_SOON) return;
    unlockReport(reportKey);
    onUnlocked();
  };

  // Manual refresh: re-check localStorage for payment status
  const handleManualRefresh = () => {
    if (PAYMENT_COMING_SOON) return;
    if (isReportPaid(reportKey)) {
      onUnlocked();
    }
  };

  // Social proof: deterministic pseudo-random unlock count per report type
  const unlockCount = useMemo(() => {
    const base: Record<string, number> = { natal: 3287, synastry: 2156, cp: 1893, tarot: 4521, ziweiTarot: 2104, idol: 1678 };
    const seed = reportType.charCodeAt(0) + reportKey.length;
    const baseNum = base[reportType] || 1000;
    return baseNum + (seed % 200);
  }, [reportType, reportKey]);

  if (isUnlocked) {
    return (
      <div className="transition-all duration-300 ease-in-out opacity-100">
        {children}
        {/* Unlocked badge */}
        <div className="flex items-center justify-center mt-4 gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-green-400/20 bg-green-400/8 px-3 py-1 text-[10px] font-medium text-green-300">
            <ShieldCheck className="w-3 h-3" />
            {isZh ? "已解鎖" : "Unlocked"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Locked preview area — teaser only, no paid content in DOM */}
      <div className="relative">
        <div className="relative overflow-hidden rounded-2xl border border-[#d4a85322] bg-gradient-to-b from-[#1a1530]/60 to-[#0d0a16]/95 p-6">
          {/* Teaser preview with locked icon */}
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d4a85340] bg-[#d4a8530d]">
              <Lock className="h-6 w-6 text-[#d4a853]" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-[#d4a853]">
                {PAYMENT_COMING_SOON
                  ? (isZh ? "即將上線" : "Coming Soon")
                  : (isZh ? "完整版報告已就緒" : "Full Report Ready")}
              </p>
              <p className="mt-2 max-w-xs text-[11px] leading-relaxed text-[#8a8aad]">
                {isZh
                  ? (PAYMENT_COMING_SOON
                    ? "完整版報告功能即將開放，敬請期待"
                    : "解鎖後可查看完整深度解析，30 天內有效查看")
                  : (PAYMENT_COMING_SOON
                    ? "Full report access is opening soon"
                    : "Unlock to view the complete in-depth report, valid for 30 days")}
              </p>
            </div>
          </div>

          {/* Unlock button */}
          <div className="relative z-10 flex flex-col items-center gap-3 pb-2">
            <button
              onClick={() => setShowPayModal(true)}
              className="group relative inline-flex flex-col items-center gap-2 rounded-2xl border border-[#d4a853]/40 bg-gradient-to-b from-[#1a1530]/95 to-[#0d0a16]/98 px-8 py-5 shadow-[0_8px_40px_rgba(212,168,83,0.15),0_0_0_1px_rgba(212,168,83,0.08)_inset] hover:shadow-[0_12px_48px_rgba(212,168,83,0.25),0_0_0_1px_rgba(212,168,83,0.15)_inset] hover:border-[#d4a853]/60 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#d4a853] group-hover:text-[#f7d9a8] transition-colors" />
                <span className="font-display text-base font-bold text-[#d4a853] group-hover:text-[#f7d9a8] transition-colors tracking-wide">
                  {PAYMENT_COMING_SOON
                    ? (isZh ? "即將上線" : "Coming Soon")
                    : (isZh ? "解鎖完整版報告" : "Unlock Full Report")}
                </span>
                <Sparkles className="w-4 h-4 text-[#d4a853] group-hover:text-[#f7d9a8] transition-colors" />
              </span>
              <span className="text-[11px] text-[#8a8aad] group-hover:text-[#b0a8c8] transition-colors">
                {isZh
                  ? (PAYMENT_COMING_SOON ? "敬請期待" : `支付 ${price.display} · 30 天有效查看`)
                  : (PAYMENT_COMING_SOON ? "Stay tuned" : `Pay ${price.display} · 30-day access`)}
              </span>
            </button>

            {/* Fallback: manual refresh for delayed payment callbacks */}
            {!PAYMENT_COMING_SOON && (
              <button
                onClick={handleManualRefresh}
                className="text-[10px] text-[#8a8aad55] hover:text-[#d4a85388] transition-colors underline underline-offset-2"
              >
                {isZh ? "我已支付，刷新權限" : "I paid — refresh status"}
              </button>
            )}

            {/* Social proof */}
            {!PAYMENT_COMING_SOON && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#8a8aad]">
                <Users className="w-3 h-3 text-[#d4a85355]" />
                <span>
                  {isZh
                    ? `已有 ${unlockCount.toLocaleString()} 人解鎖此報告`
                    : `${unlockCount.toLocaleString()} people have unlocked this report`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pay Modal */}
      <PayModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onPaid={handleUnlocked}
        config={paywallConfig}
      />
    </>
  );
}

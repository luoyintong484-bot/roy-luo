/* ============================================================
   R7 Fortune — Unified Payment Modal
   Shared by all paywalls: Synastry / CP / Idol / Tarot.
   Handles: payment method display, checkout redirect, unlock.
   ============================================================ */

import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/hooks/useAuth";
import { initiatePayment, type ReportType } from "@/lib/payment-service";
import { detectRegion, PAYMENT_METHODS } from "@/lib/payment";
import { Lock, Loader2, X, ShieldCheck, CreditCard, Check, AlertTriangle, LogIn, ArrowRight } from "lucide-react";

export interface PayModalConfig {
  reportType: ReportType;
  reportKey: string;
  amount: number;
  title: string;
  titleZh: string;
  desc: string;
  descZh: string;
  includes: string;
  includesZh: string;
}

interface PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaid: () => void;
  config: PayModalConfig;
}

export default function PayModal({ isOpen, onClose, onPaid, config }: PayModalProps) {
  const { locale } = useI18n();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isZh = locale === "zh-TW";
  const region = detectRegion();
  const methods = PAYMENT_METHODS[region];
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");
  const payingRef = useRef(false);

  if (!isOpen) return null;

  // Auth gate: redirect to login if not logged in
  if (!isAuthenticated) {
    localStorage.setItem("r7_pay_return", window.location.pathname + window.location.search);
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#151520]/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass rounded-2xl p-8 max-w-sm w-full border border-[#d4a85320] shadow-2xl animate-fade-in-up text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-[#8a8aad] hover:text-[#f0e6d3]">
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 rounded-full bg-[#FFB6C110] flex items-center justify-center mx-auto mb-4 border border-[#FFB6C120]">
            <LogIn className="w-7 h-7 text-[#FFB6C1]" />
          </div>
          <h3 className="text-lg font-bold text-[#f0e6d3] mb-2">
            {isZh ? "請先登錄" : "Please Login First"}
          </h3>
          <p className="text-xs text-[#8a8aad] mb-6">
            {isZh ? "登錄後即可解鎖完整版報告內容" : "Login to unlock the full report"}
          </p>
          <button
            onClick={() => { onClose(); navigate("/login"); }}
            className="w-full py-3 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all flex items-center justify-center gap-2"
          >
            {isZh ? "前往登錄" : "Go to Login"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handlePay = useCallback(async () => {
    // Debounce: prevent double-clicks
    if (payingRef.current) return;
    payingRef.current = true;
    setPaying(true);
    setError("");

    try {
      const result = await initiatePayment({
        reportType: config.reportType,
        reportKey: config.reportKey,
        amount: config.amount,
        productName: config.title,
        productNameZh: config.titleZh,
      });

      if ("error" in result) {
        setError(result.error);
        payingRef.current = false;
        setPaying(false);
        return;
      }

      // Test flow or production checkout
      if (result.url.startsWith("/")) {
        setTimeout(() => {
          setPaying(false);
          setPaid(true);
          setTimeout(() => {
            onPaid();
            setPaid(false);
            onClose();
            payingRef.current = false;
          }, 800);
        }, 1200);
      } else {
        window.open(result.url, "_blank");
        payingRef.current = false;
        setPaying(false);
      }
    } catch (err: any) {
      setError(err?.message || "Payment failed, please try again");
      payingRef.current = false;
      setPaying(false);
    }
  }, [config, onPaid, onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#151520]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-[#d4a85320] shadow-2xl animate-fade-in-up">
        {paid ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-4 border border-green-400/20">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#f0e6d3] mb-1">
              {isZh ? "解鎖成功" : "Unlocked!"}
            </h3>
            <p className="text-xs text-[#8a8aad]">
              {isZh ? "完整解讀已為您展示" : "Full reading is now available"}
            </p>
          </div>
        ) : (
          <>
            <button onClick={onClose} className="absolute top-4 right-4 text-[#8a8aad] hover:text-[#f0e6d3] transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-[#d4a85310] flex items-center justify-center mx-auto mb-3 border border-[#d4a85320]">
                <Lock className="w-6 h-6 text-[#d4a853]" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#f0e6d3]">
                {isZh ? config.titleZh : config.title}
              </h3>
              <p className="text-xs text-[#8a8aad] mt-1">
                {isZh ? config.descZh : config.desc}
              </p>
            </div>

            <div className="bg-[#151520] rounded-lg p-4 mb-5 border border-[#d4a85308]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#8a8aad]">
                  {isZh ? "服務內容" : "Service Content"}
                </span>
                <span className="text-xs text-[#f0e6d3]">
                  {isZh ? config.titleZh : config.title}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#8a8aad]">
                  {isZh ? "包含" : "Includes"}
                </span>
                <span className="text-xs text-[#8a8aad55]">
                  {isZh ? config.includesZh : config.includes}
                </span>
              </div>
              <div className="border-t border-[#d4a85306] pt-3 flex items-center justify-between">
                <span className="text-sm text-[#f0e6d3] font-medium">
                  {isZh ? "合計" : "Total"}
                </span>
                <span className="text-2xl font-display font-bold text-[#d4a853]">
                  ${config.amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {methods.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#d4a85315]">
                  <CreditCard className="w-4 h-4 text-[#d4a853]" />
                  <span className="text-xs text-[#f0e6d3]">{isZh ? m.nameZh : m.name}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full py-3 bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] rounded-lg text-sm font-bold hover:from-[#e0b860] hover:to-[#d4a853] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {isZh ? `確認支付 $${config.amount.toFixed(2)}` : `Confirm Payment $${config.amount.toFixed(2)}`}
            </button>

            {error && <p className="text-[10px] text-rose-400 text-center mt-2">{error}</p>}

            <p className="text-[9px] text-[#8a8aad33] text-center mt-3">
              {isZh ? "安全加密支付 · 即時解鎖" : "Secure encrypted payment · Instant unlock"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Pre-built configs for each report type ----
export const PAYWALL_CONFIGS: Record<ReportType, Omit<PayModalConfig, "reportKey">> = {
  tarot: {
    reportType: "tarot",
    amount: 1.99,
    title: "Unlock Full Tarot Reading",
    titleZh: "解鎖完整塔羅深度解讀",
    desc: "Deep card analysis · Element interaction · Scene guidance · Actionable advice",
    descZh: "深層牌義分析 · 元素互動 · 場景指引 · 行動建議",
    includes: "Past · Present · Future × Full Dimension Deep Analysis",
    includesZh: "過去 · 現在 · 未來 × 全維度深度分析",
  },
  synastry: {
    reportType: "synastry",
    amount: 10.00,
    title: "Unlock Full Synastry Report",
    titleZh: "解鎖完整雙人合盤報告",
    desc: "6-Dimension Deep Analysis · Bazi×Natal×Vedic Cross-Validation",
    descZh: "6大維度深度解讀 · 八字×星盤×印度占星交叉驗證",
    includes: "Core Attraction · Daily Mode · Conflicts · Destiny · Cautions · Long-Term",
    includesZh: "核心吸引力 · 日常相處 · 矛盾課題 · 緣分解析 · 注意事項 · 長期建議",
  },
  natal: {
    reportType: "natal",
    amount: 9.99,
    title: "Unlock Full Natal Report",
    titleZh: "解鎖完整本命星盤報告",
    desc: "Bazi 4-Pillars · Natal Chart · Vedic Cross-Validation",
    descZh: "八字四柱 · 本命星盤 · 印度占星交叉驗證",
    includes: "Career · Wealth · Love · Health · Full Destiny Analysis",
    includesZh: "事業發展 · 財富運勢 · 感情姻緣 · 健康狀況 · 全盤命運解析",
  },
  cp: {
    reportType: "cp",
    amount: 10.00,
    title: "Unlock Full CP Deep Report",
    titleZh: "解鎖完整深度報告",
    desc: "8 Deep Sections · Hidden Feelings · Full Fate Trajectory",
    descZh: "8 項深度解析 · 隱藏內心 · 緣分完整走勢",
    includes: "Magnetic Attraction · Venus Complement · First Impression · Mutual Feelings · Destiny Bond · Strengths · Fate Trajectory · Encounter Probability",
    includesZh: "先天磁場 · 金星互補 · 潛意識印象 · 真實本心 · 宿命羈絆 · 優缺點 · 緣分走勢 · 相遇概率",
  },
  idol: {
    reportType: "idol",
    amount: 9.99,
    title: "Unlock Full Idol Compatibility",
    titleZh: "解鎖完整愛豆合盤報告",
    desc: "Multi-Dimension Analysis · Synastry × Bazi × Star Mansion",
    descZh: "多維度分析 · 星盤×八字×星宿關係",
    includes: "Western Synastry · Bazi Elements · Star Mansion · Overall Summary",
    includesZh: "西方合盤 · 八字五行 · 星宿關係 · 綜合總結",
  },
};

// VIP monthly subscription config
export const VIP_CONFIG = {
  amount: 12.99,
  title: "R7 Fortune Monthly VIP",
  titleZh: "R7 Fortune 月度會員",
  desc: "Unlimited access to ALL readings: Tarot · Synastry · Natal · CP · Idol",
  descZh: "無限次暢享全部功能：塔羅 · 雙人合盤 · 本命星盤 · CP合盤 · 愛豆合盤",
};

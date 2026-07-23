/* ============================================================
   R7 Fortune — Unified Payment Modal
   Shared by all paywalls: Synastry / CP / Idol / Tarot.
   Handles: payment method display, checkout redirect, unlock.
   ============================================================ */

import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { initiatePayment, type ReportType } from "@/lib/payment-service";
import { detectRegion, PAYMENT_METHODS } from "@/lib/payment";
import { getLocalPrice, type CnyPriceKey } from "@/lib/pricing";
import { PAYMENT_COMING_SOON, TEST_MODE } from "@/const";
import { trackEvent } from "@/lib/analytics";
import { Lock, Loader2, X, ShieldCheck, CreditCard, Clock3 } from "lucide-react";

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
  const navigate = useNavigate();
  const isZh = locale === "zh-TW";
  const region = detectRegion();
  const methods = PAYMENT_METHODS[region];
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const payingRef = useRef(false);

  useEffect(() => {
    if (!isOpen || PAYMENT_COMING_SOON || !TEST_MODE) return;
    onPaid();
    onClose();
  }, [isOpen, onPaid, onClose]);

  // ⚠️ ALL hooks must be called before any conditional return (React rule of hooks)
  const handlePay = useCallback(async () => {
    // Debounce: prevent double-clicks
    if (payingRef.current) return;
    payingRef.current = true;
    setPaying(true);
    setError("");

    trackEvent("payment_started", {
      scene_type: config.reportType,
      price: config.amount,
      session_id: config.reportKey,
      source_page: "pay_modal",
    });

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
        trackEvent("payment_failed", {
          scene_type: config.reportType,
          price: config.amount,
          session_id: config.reportKey,
          source_page: "pay_modal",
        });
        payingRef.current = false;
        setPaying(false);
        return;
      }

      trackEvent("order_created", {
        scene_type: config.reportType,
        price: config.amount,
        order_id: result.sessionId,
        session_id: config.reportKey,
        source_page: "pay_modal",
      });

      // Test flow or production checkout
      if (result.url.startsWith("/")) {
        navigate(result.url);
      } else {
        // External payment URL — must use window.location for cross-origin redirect
        window.location.href = result.url;
      }
    } catch (err: any) {
      setError(err?.message || "Payment failed, please try again");
      trackEvent("payment_failed", {
        scene_type: config.reportType,
        price: config.amount,
        session_id: config.reportKey,
        source_page: "pay_modal",
      });
      payingRef.current = false;
      setPaying(false);
    }
  }, [config, navigate]);

  // Conditional returns — AFTER all hooks per React rules
  if (!isOpen) return null;

  if (PAYMENT_COMING_SOON) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#151520]/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-[#d4a85320] shadow-2xl animate-fade-in-up text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-[#8a8aad] hover:text-[#f0e6d3] transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 rounded-full bg-[#d4a85310] flex items-center justify-center mx-auto mb-4 border border-[#d4a85320]">
            <Clock3 className="w-7 h-7 text-[#d4a853]" />
          </div>
          <p className="text-[10px] text-[#d4a853] tracking-[0.18em] uppercase mb-2">
            {isZh ? "Coming Soon" : "Coming Soon"}
          </p>
          <h3 className="font-display text-lg font-bold text-[#f0e6d3] mb-2">
            {isZh ? config.titleZh : config.title}
          </h3>
          <p className="text-xs text-[#8a8aad] leading-relaxed mb-5">
            {isZh
              ? `預計價格 ¥${config.amount.toFixed(1)}。功能即將開放，當前不會生成訂單，也不會進入付款流程。`
              : `Expected price ¥${config.amount.toFixed(1)}. This feature is coming soon; no order or payment will be created.`}
          </p>
          <button
            onClick={() => {
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] text-sm font-bold hover:from-[#e0b860] hover:to-[#d4a853] transition-all"
          >
            {isZh ? "知道了" : "Got it"}
          </button>
        </div>
      </div>
    );
  }

  if (TEST_MODE) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#151520]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-[#d4a85320] shadow-2xl animate-fade-in-up">
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
                  {(() => {
                    const priceKey = config.reportType as CnyPriceKey;
                    return getLocalPrice(priceKey in {tarot:1,ziweiTarot:1,natal:1,synastry:1,cp:1} ? priceKey : "tarot").display;
                  })()}
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
              {(() => {
                const priceKey = config.reportType as CnyPriceKey;
                const price = getLocalPrice(priceKey in {tarot:1,ziweiTarot:1,natal:1,synastry:1,cp:1} ? priceKey : "tarot");
                return isZh ? `確認支付 ${price.display}` : `Confirm Payment ${price.display}`;
              })()}
            </button>

            {error && <p className="text-[10px] text-rose-400 text-center mt-2">{error}</p>}

            <p className="text-[9px] text-[#8a8aad33] text-center mt-3">
              {isZh ? "安全加密支付 · 即時解鎖" : "Secure encrypted payment · Instant unlock"}
            </p>
        </>
      </div>
    </div>
  );
}

// ---- Pre-built configs for each report type ----
export const PAYWALL_CONFIGS: Record<ReportType, Omit<PayModalConfig, "reportKey">> = {
  tarot: {
    reportType: "tarot",
    amount: 29.90,
    title: "Unlock Full Tarot Reading",
    titleZh: "解鎖完整塔羅深度解讀",
    desc: "Deep card analysis · Element interaction · Scene guidance · Actionable advice",
    descZh: "深層牌義分析 · 元素互動 · 場景指引 · 行動建議",
    includes: "Past · Present · Future × Full Dimension Deep Analysis",
    includesZh: "過去 · 現在 · 未來 × 全維度深度分析",
  },
  ziweiTarot: {
    reportType: "ziweiTarot",
    amount: 39.90,
    title: "Unlock Ziwei Tarot Dual Reading",
    titleZh: "解鎖紫微塔羅雙牌解讀",
    desc: "Ziwei body × Tarot action · Matrix judgment · Focused advice",
    descZh: "紫微定體 × 塔羅定用 · 吉凶矩陣 · 問題行動指引",
    includes: "Dual-card matrix · Deep linked reading · Practical next step",
    includesZh: "雙牌卦象 · 體用聯動深讀 · 可執行下一步",
  },
  synastry: {
    reportType: "synastry",
    amount: 109.00,
    title: "Unlock Ziwei Doushu Synastry Report",
    titleZh: "解鎖紫微斗數雙人合盤解析",
    desc: "Dual Ziwei charts · Spouse palace · Main-star resonance · Relationship timing",
    descZh: "雙方命盤 · 夫妻宮互照 · 主星共振 · 關係走勢",
    includes: "Attraction · Spouse Palaces · Conflict Pattern · Long-Term Advice",
    includesZh: "吸引力來源 · 夫妻宮互照 · 矛盾模式 · 長期相處建議",
  },
  natal: {
    reportType: "natal",
    amount: 79.00,
    title: "Unlock Ziwei Doushu Natal Report",
    titleZh: "解鎖紫微斗數個人完整解析",
    desc: "12 Palaces · Life & Body Palaces · Main Stars · Four Transformations",
    descZh: "十二宮位 · 命宮身宮 · 主星四化 · 人生主軸",
    includes: "Life Palace · Career · Wealth · Love · Health · Timing",
    includesZh: "命宮身宮 · 事業財帛 · 感情姻緣 · 健康提醒 · 流年節點",
  },
  cp: {
    reportType: "cp",
    amount: 69.90,
    title: "Unlock Full CP Deep Report",
    titleZh: "解鎖完整CP深度報告",
    desc: "8 Deep Sections · Hidden Feelings · Full Fate Trajectory",
    descZh: "8 項深度解析 · 隱藏內心 · 緣分完整走勢",
    includes: "Magnetic Attraction · Venus Complement · First Impression · Mutual Feelings · Destiny Bond · Strengths · Fate Trajectory · Encounter Probability",
    includesZh: "先天磁場 · 金星互補 · 潛意識印象 · 真實本心 · 宿命羈絆 · 優缺點 · 緣分走勢 · 相遇概率",
  },
  idol: {
    reportType: "idol",
    amount: 69.90,
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

import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { getSubscription, getAvailableReadings, applyReferral, type SubscriptionState } from "@/lib/subscription";
import { getInviteProgress } from "@/lib/share-points";
import { PAYMENT_COMING_SOON } from "@/const";
import { Crown, Gift, Copy, Check, Users, Zap, Share2 } from "lucide-react";

/** Inline subscription info + referral bar — shown in Tarot / CP Report pages */
export default function SubscriptionCard({ onPurchase }: { onPurchase?: (type: "single" | "monthly") => void }) {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const [sub, setSub] = useState<SubscriptionState>(getSubscription);
  const [refInput, setRefInput] = useState("");
  const [refMsg, setRefMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const available = getAvailableReadings();
  const hasUnlimited = sub.plan !== "free" && sub.expiresAt && new Date(sub.expiresAt) > new Date();

  const handleApplyRef = () => {
    const result = applyReferral(refInput.trim().toUpperCase());
    setRefMsg(result.message);
    if (result.success) { setSub(getSubscription()); setRefInput(""); }
    setTimeout(() => setRefMsg(""), 3000);
  };

  const handleCopyRef = () => {
    const link = `${window.location.origin}/?ref=${sub.referralCode}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Status bar */}
      <div className="glass rounded-xl p-3 border border-[#FFB6C115]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Crown className={`w-4 h-4 ${hasUnlimited ? "text-[#FFB6C1]" : "text-[#8a8aad44]"}`} />
            <span className="text-xs font-semibold text-[#f0e6d3]">
              {hasUnlimited
                ? (isZh ? "✨ 月度會員 · 無限次數" : "✨ Monthly Member · Unlimited")
                : available > 0
                ? (isZh ? `剩餘 ${available} 次免費解讀` : `${available} free readings left`)
                : (isZh ? "免費次數已用完" : "No free readings left")}
            </span>
          </div>

          {!hasUnlimited && (
            <div className="flex gap-2">
              <button
                onClick={() => onPurchase?.("single")}
                className="px-3 py-1.5 text-[10px] font-medium rounded-lg border border-[#FFB6C115] text-[#FFB6C1] hover:bg-[#FFB6C108] transition-all"
              >
                {PAYMENT_COMING_SOON ? (isZh ? "單次即將上線" : "Single Coming Soon") : `$2.99 ${isZh ? "單次" : "Single"}`}
              </button>
              <button
                onClick={() => onPurchase?.("monthly")}
                className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-[#FFB6C1] text-[#0a0a0f] hover:bg-[#f0a0b8] transition-all flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                {PAYMENT_COMING_SOON ? (isZh ? "會員即將上線" : "VIP Soon") : `$9.90 ${isZh ? "月度" : "/mo"}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Referral section */}
      <details className="glass rounded-xl p-3 border border-[#FFB6C110] group">
        <summary className="flex items-center gap-2 cursor-pointer text-xs text-[#8a8aad] hover:text-[#f0e6d3] transition-colors">
          <Gift className="w-3.5 h-3.5 text-[#FFB6C1]" />
          {isZh ? "邀請好友 · 雙方各得 3 次免費塔羅" : "Invite a friend · Both get 3 free readings"}
        </summary>
        <div className="mt-3 space-y-2">
          {/* My referral code */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8a8aad66]">{isZh ? "我的邀請碼" : "My code"}</span>
            <code className="text-xs font-bold text-[#FFB6C1] tracking-widest">{sub.referralCode}</code>
            <button onClick={handleCopyRef} className="text-[10px] text-[#FFB6C1] hover:text-[#f0a0b8] transition-colors flex items-center gap-1">
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? (isZh ? "已複製" : "Copied") : (isZh ? "複製連結" : "Copy link")}
            </button>
          </div>

          {/* Invite progress */}
          {(() => {
            const progress = getInviteProgress();
            return (
              <div className="bg-[#151520] rounded-lg p-2 text-center">
                <p className="text-[10px] text-[#8a8aad]">
                  {isZh
                    ? `已邀請 ${progress.count} 人，再邀請 ${progress.remainingToNext} 人即可獲得 1 次免費占卜`
                    : `Invited ${progress.count} friends, invite ${progress.remainingToNext} more to get 1 free divination`}
                </p>
                <p className="text-[10px] text-[#FFB6C1] mt-0.5">
                  {isZh ? `剩餘免費次數：${available}` : `Remaining free times: ${available}`}
                </p>
              </div>
            );
          })()}

          {/* Apply referral code */}
          <div className="flex gap-2">
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value.toUpperCase())}
              placeholder={isZh ? "輸入好友邀請碼" : "Enter referral code"}
              maxLength={9}
              className="flex-1 bg-[#0a0a0f] border border-[#FFB6C118] rounded-lg px-3 py-2 text-xs text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#FFB6C144]"
            />
            <button
              onClick={handleApplyRef}
              disabled={refInput.length < 5}
              className="px-3 py-2 text-[10px] font-medium rounded-lg bg-[#FFB6C1] text-[#0a0a0f] hover:bg-[#f0a0b8] transition-all disabled:opacity-40"
            >
              {isZh ? "兌換" : "Apply"}
            </button>
          </div>
          {refMsg && (
            <p className={`text-[10px] ${refMsg.includes("成功") || refMsg.includes("生效") ? "text-green-400" : "text-rose-400"}`}>
              {refMsg}
            </p>
          )}
        </div>
      </details>

      {/* Social login buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { name: "LINE", icon: "💚", color: "hover:bg-green-500/10 hover:text-green-400" },
          { name: "Google", icon: "🔵", color: "hover:bg-blue-500/10 hover:text-blue-400" },
          { name: "微信", icon: "💬", color: "hover:bg-green-400/10 hover:text-green-300" },
          { name: "微博", icon: "🔴", color: "hover:bg-red-500/10 hover:text-red-400" },
        ].map((p) => (
          <button
            key={p.name}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] text-[#8a8aad44] border border-[#FFB6C108] ${p.color} transition-all`}
            title={`${isZh ? "使用" : "Login with"} ${p.name}`}
          >
            <span className="text-sm">{p.icon}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

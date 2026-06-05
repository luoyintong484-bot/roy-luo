import { useState } from "react";
import { X, Share2, Link, Check, Copy, AlertTriangle } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import SharePoster, { type PosterData } from "@/components/SharePoster";

export default function ShareModal({
  open, onClose, title, subtitle, score, tag, posterData, sharePath, shareText,
}: {
  open: boolean; onClose: () => void; title: string; subtitle?: string;
  score?: string; tag?: string; posterData?: PosterData;
  sharePath?: string; shareText?: string;
}) {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const shareLink = typeof window !== "undefined"
    ? `${window.location.origin}${sharePath || window.location.pathname}`
    : "";
  const shareBody = shareText || title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true); setError("");
      setTimeout(() => setCopied(false), 2000);
    } catch { setError(isZh ? "複製失敗" : "Copy failed"); }
  };

  const handleWechat = () => {
    try {
      navigator.clipboard.writeText(`${shareBody}\n${shareLink}`).catch(() => {});
      setCopied(true); setError("");
      setTimeout(() => setCopied(false), 2000);
    } catch { setError(isZh ? "連結生成失敗，請稍後重試" : "Link generation failed, please retry"); }
  };

  const handleFacebook = () => {
    try {
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(shareBody)}`;
      window.open(fbUrl, "_blank", "width=600,height=400");
    } catch { setError(isZh ? "連結生成失敗，請稍後重試" : "Link generation failed, please retry"); }
  };

  const handleInstagram = () => {
    try {
      navigator.clipboard.writeText(`${shareBody}\n${shareLink}`).catch(() => {});
      setCopied(true); setError("");
      setTimeout(() => setCopied(false), 2000);
    } catch { setError(isZh ? "連結生成失敗，請稍後重試" : "Link generation failed, please retry"); }
  };

  if (!open) return null;

  // Full poster mode
  if (posterData) {
    return <SharePoster data={posterData} visible={open} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl p-6 max-w-sm w-full border border-[#FFB6C120] shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8a8aad] hover:text-[#f0e6d3]"><X className="w-4 h-4" /></button>

        <div className="text-center mb-5">
          <Share2 className="w-8 h-8 text-[#FFB6C1] mx-auto mb-2" />
          <h3 className="font-display text-lg font-bold text-[#f0e6d3]">{isZh ? "分享你的解讀" : "Share Your Reading"}</h3>
          <p className="text-[10px] text-[#8a8aad44] mt-1">{title}</p>
          {score && <p className="text-2xl font-bold text-[#FFB6C1] mt-2">{score}</p>}
          {tag && <p className="text-xs text-[#8a8aad] mt-1">{tag}</p>}
          {subtitle && <p className="text-[9px] text-[#8a8aad44] mt-1">{subtitle}</p>}
        </div>

        {/* Social share buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { icon: "💬", label: isZh ? "微信" : "WeChat", action: handleWechat, color: "hover:bg-green-500/10 hover:text-green-400" },
            { icon: "📘", label: "Facebook", action: handleFacebook, color: "hover:bg-blue-500/10 hover:text-blue-400" },
            { icon: "📷", label: "Instagram", action: handleInstagram, color: "hover:bg-pink-500/10 hover:text-pink-400" },
            { icon: <Copy className="w-3.5 h-3.5 inline mr-1" />, label: isZh ? "複製連結" : "Copy Link", action: handleCopyLink, color: "hover:bg-[#d4a853]/10 hover:text-[#d4a853]" },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action}
              className={`py-2.5 glass rounded-lg text-xs text-[#8a8aad] border border-[#d4a85310] ${btn.color} transition-all flex items-center justify-center gap-1`}>
              <span className="text-sm">{typeof btn.icon === "string" ? btn.icon : btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>

        {/* Copy feedback */}
        {copied && <p className="text-[11px] text-green-400 text-center mb-2"><Check className="w-3 h-3 inline" /> {isZh ? "已複製到剪貼板" : "Copied to clipboard"}</p>}
        {error && <p className="text-[11px] text-rose-400 text-center mb-2"><AlertTriangle className="w-3 h-3 inline" /> {error}</p>}
      </div>
    </div>
  );
}

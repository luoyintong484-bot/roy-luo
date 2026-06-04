import { useState } from "react";
import { X, Share2, Link, Check } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import SharePoster, { type PosterData } from "@/components/SharePoster";

/** Global share modal — unified across all pages.
 *  When posterData is provided, renders the full SharePoster.
 *  Otherwise shows basic share options (link copy). */
export default function ShareModal({
  open,
  onClose,
  title,
  subtitle,
  score,
  tag,
  posterData,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  score?: string;
  tag?: string;
  posterData?: PosterData;
}) {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const [copied, setCopied] = useState(false);
  const [showPoster, setShowPoster] = useState(false);

  const shortLink = typeof window !== "undefined" ? `${window.location.origin}/s/${btoa(title).slice(0, 8)}` : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shortLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (!open) return null;

  // Full poster mode
  if (posterData) {
    return (
      <SharePoster
        data={posterData}
        visible={open}
        onClose={onClose}
      />
    );
  }

  // Simple share mode (no poster data)
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl p-6 max-w-sm w-full border border-[#FFB6C120] shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8a8aad] hover:text-[#f0e6d3] transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <Share2 className="w-8 h-8 text-[#FFB6C1] mx-auto mb-2" />
          <h3 className="font-display text-lg font-bold text-[#f0e6d3]">{isZh ? "分享你的解讀" : "Share Your Reading"}</h3>
          <p className="text-[10px] text-[#8a8aad44] mt-1">{title}</p>
          {score && <p className="text-2xl font-bold text-[#FFB6C1] mt-2">{score}</p>}
          {tag && <p className="text-xs text-[#8a8aad] mt-1">{tag}</p>}
          {subtitle && <p className="text-[9px] text-[#8a8aad44] mt-1">{subtitle}</p>}
        </div>

        {/* Copy link */}
        <button onClick={handleCopyLink}
          className="w-full py-2.5 glass rounded-lg text-xs text-[#FFB6C1] border border-[#FFB6C115] hover:border-[#FFB6C140] transition-colors flex items-center justify-center gap-1">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Link className="w-3.5 h-3.5" />}
          {copied ? (isZh ? "已複製！" : "Copied!") : (isZh ? "複製分享鏈接" : "Copy Share Link")}
        </button>
      </div>
    </div>
  );
}

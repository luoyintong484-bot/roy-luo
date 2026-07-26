import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

type PrivacyNoticeProps = {
  compact?: boolean;
  className?: string;
};

export default function PrivacyNotice({ compact = false, className = "" }: PrivacyNoticeProps) {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const text = isZh
    ? "🔒 您的出生信息经过加密安全存储，我们绝不会向第三方分享您的个人信息。数据仅用于生成您的个性化报告，您可随时在设置中删除数据。"
    : "🔒 Your birth data is encrypted and stored securely. We never share your personal information with third parties. Your data is used solely for generating your personalized reports. You can delete your data at any time in Settings.";

  return (
    <div
      className={`rounded-2xl border border-[#d4a85324] bg-[#d4a8530d] ${
        compact ? "p-3" : "p-3.5"
      } flex items-start gap-2 ${className}`}
    >
      <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#d4a853]" />
      <p className={`${compact ? "text-[10px]" : "text-[11px]"} leading-relaxed text-[#d9d0ef]`}>
        {text}
      </p>
    </div>
  );
}

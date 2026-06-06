import { useI18n } from "@/contexts/I18nContext";
import { Link } from "react-router";

export default function NotFound() {
  const { locale } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass rounded-2xl p-8 max-w-sm w-full text-center border border-[#FFB6C115]">
        <h1 className="font-display text-4xl font-bold text-[#f0e6d3]">404</h1>
        <p className="text-[#8a8aad] mt-3">
          {locale === "zh-TW" ? "頁面未找到" : "Page not found"}
        </p>
        <Link to="/" className="inline-block mt-4 px-5 py-2.5 bg-[#FFB6C1] text-[#0a0a0f] rounded-lg text-sm font-medium hover:bg-[#f0a0b8] transition-colors">
          {locale === "zh-TW" ? "返回首頁" : "Back to Home"}
        </Link>
      </div>
    </div>
  );
}

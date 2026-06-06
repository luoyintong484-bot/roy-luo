import { useI18n } from "@/contexts/I18nContext";
import { Sparkles } from "lucide-react";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-[#14142a] border-t border-[#d4a85311] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4a853]" />
            <span className="font-display text-sm font-bold text-[#f0e6d3]">{t("app.name")}</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })} className="text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors">{t("nav.home")}</button>
            <button onClick={() => document.getElementById("idol")?.scrollIntoView({ behavior: "smooth" })} className="text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors">{t("nav.idol")}</button>
            <button onClick={() => document.getElementById("destiny")?.scrollIntoView({ behavior: "smooth" })} className="text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors">{t("nav.destiny")}</button>
            <button onClick={() => document.getElementById("tarot")?.scrollIntoView({ behavior: "smooth" })} className="text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors">{t("nav.tarot")}</button>
          </div>
          <div className="text-xs text-[#8a8aad55]">
            &copy; 2025 {t("app.name")}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

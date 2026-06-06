import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { MessageCircle, X } from "lucide-react";

const SUPPORT_EMAIL = "943767606@qq.com";

export default function CustomerService() {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-4 z-50 w-12 h-12 bg-[#FFB6C1] text-[#0a0a0f] rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform shadow-[#FFB6C130]"
        title={isZh ? "客服" : "Support"}>
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 glass rounded-2xl border border-[#FFB6C120] shadow-2xl animate-fade-in-up overflow-hidden">
          <div className="bg-[#FFB6C1] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#0a0a0f]" />
              <span className="text-sm font-bold text-[#0a0a0f]">{isZh ? "R7 Fortune 客服" : "R7 Support"}</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#0a0a0f]/60 hover:text-[#0a0a0f]"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-6 text-center">
            <p className="text-[15px] font-medium text-[#f0e6d3] leading-relaxed">
              {isZh ? "如需業務諮詢，請發送郵件：" : "For business inquiries, please email: "}
              <br />
              <span className="text-[#FFB6C1] font-bold" style={{ fontSize: "20px", fontWeight: 500 }}>{SUPPORT_EMAIL}</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Check, Copy, Instagram, MessageCircle, X } from "lucide-react";

const SUPPORT_EMAIL = "943767606@qq.com";
const SUPPORT_WECHAT = "R7roybe";
const SUPPORT_INS = "r7_fortune";

export default function CustomerService() {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (value: string, key: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  };

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
          <div className="p-5 space-y-3">
            <p className="text-sm font-medium text-[#f0e6d3] text-center">
              {isZh ? "需要諮詢占星師，可以從這裡聯繫我" : "Need a reading? Contact me here"}
            </p>

            <button
              onClick={() => copyText(SUPPORT_WECHAT, "wechat")}
              className="w-full rounded-xl border border-[#FFB6C118] bg-[#151520]/80 px-4 py-3 text-left hover:border-[#FFB6C144] transition-all flex items-center justify-between gap-3"
            >
              <span>
                <span className="block text-[10px] text-[#8a8aad]">WeChat</span>
                <span className="block text-sm font-bold text-[#f0e6d3]">{SUPPORT_WECHAT}</span>
              </span>
              {copied === "wechat" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[#FFB6C1]" />}
            </button>

            <button
              onClick={() => copyText(SUPPORT_INS, "ins")}
              className="w-full rounded-xl border border-[#FFB6C118] bg-[#151520]/80 px-4 py-3 text-left hover:border-[#FFB6C144] transition-all flex items-center justify-between gap-3"
            >
              <span>
                <span className="block text-[10px] text-[#8a8aad]">Instagram</span>
                <span className="block text-sm font-bold text-[#f0e6d3]">{SUPPORT_INS}</span>
              </span>
              {copied === "ins" ? <Check className="w-4 h-4 text-green-400" /> : <Instagram className="w-4 h-4 text-[#FFB6C1]" />}
            </button>

            <button
              onClick={() => copyText(SUPPORT_EMAIL, "email")}
              className="w-full rounded-xl border border-[#FFB6C118] bg-[#151520]/80 px-4 py-3 text-left hover:border-[#FFB6C144] transition-all flex items-center justify-between gap-3"
            >
              <span>
                <span className="block text-[10px] text-[#8a8aad]">Email</span>
                <span className="block text-sm font-bold text-[#f0e6d3]">{SUPPORT_EMAIL}</span>
              </span>
              {copied === "email" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[#FFB6C1]" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

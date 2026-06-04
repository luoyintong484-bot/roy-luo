import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { MessageCircle, X, Send, Check, Mail } from "lucide-react";

const SUPPORT_EMAIL = "943767606@qq.com";
const TICKET_TYPES = [
  { key: "payment", zh: "充值問題", en: "Payment" },
  { key: "tarot", zh: "抽牌問題", en: "Tarot Issue" },
  { key: "member", zh: "會員問題", en: "Membership" },
  { key: "other", zh: "其他", en: "Other" },
];

export default function CustomerService() {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [type, setType] = useState("other");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    const tickets = JSON.parse(localStorage.getItem("r7_tickets") || "[]");
    tickets.push({ email: email.trim(), type, message: message.trim(), date: new Date().toISOString(), status: "unread" });
    localStorage.setItem("r7_tickets", JSON.stringify(tickets));
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setEmail(""); setMessage(""); }, 3000);
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
          {sent ? (
            <div className="p-6 text-center">
              <Check className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#f0e6d3]">{isZh ? "留言已送出！" : "Message sent!"}</p>
              <p className="text-[10px] text-[#8a8aad44] mt-1">{isZh ? `我們會盡快回覆到 ${email}` : `We'll reply to ${email} soon`}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] text-[#8a8aad66] mb-1">{isZh ? "郵箱（必填）" : "Email (required)"}</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44]" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder={isZh ? "輸入你的郵箱地址" : "your@email.com"}
                    className="w-full bg-[#0a0a0f] border border-[#FFB6C118] rounded-lg pl-8 pr-3 py-2 text-xs text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#FFB6C144]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-[#8a8aad66] mb-1">{isZh ? "問題類型" : "Issue Type"}</label>
                <select value={type} onChange={e => setType(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-[#FFB6C118] rounded-lg px-3 py-2 text-xs text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144]">
                  {TICKET_TYPES.map(t => (<option key={t.key} value={t.key}>{isZh ? t.zh : t.en}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#8a8aad66] mb-1">{isZh ? "問題描述（必填）" : "Description (required)"}</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={3}
                  placeholder={isZh ? "請描述你遇到的問題..." : "Describe your issue..."}
                  className="w-full bg-[#0a0a0f] border border-[#FFB6C118] rounded-lg px-3 py-2 text-xs text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#FFB6C144] resize-none" />
              </div>
              <button type="submit"
                className="w-full py-2.5 bg-[#FFB6C1] text-[#0a0a0f] rounded-lg text-xs font-bold hover:bg-[#f0a0b8] transition-colors flex items-center justify-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> {isZh ? "提交留言" : "Send Message"}
              </button>
              <p className="text-[9px] text-[#8a8aad33] text-center">
                {isZh ? `或直接發送郵件至 ${SUPPORT_EMAIL}` : `Or email us at ${SUPPORT_EMAIL}`}
              </p>
            </form>
          )}
        </div>
      )}
    </>
  );
}

import { useNavigate } from "react-router";
import { ArrowRight, Layers2, Sparkles } from "lucide-react";

export default function ZiweiTarotEntry() {
  const navigate = useNavigate();

  return (
    <section className="relative py-12 sm:py-16">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/ziwei-tarot")}
          className="group relative w-full overflow-hidden rounded-[32px] border border-[#d4a8532c] bg-gradient-to-br from-[#18121b]/94 via-[#0e0d16]/96 to-[#050507]/98 p-5 text-left shadow-[0_26px_90px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-0.5 hover:border-[#d4a85366] sm:p-7"
        >
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#d4a85318] blur-3xl transition-opacity group-hover:opacity-90" />
          <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-[#d49ab214] blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] border border-[#d4a85333] bg-[#d4a85312] text-[#d4a853] shadow-[0_16px_40px_rgba(212,168,83,0.12)]">
                <Layers2 className="h-7 w-7" />
              </div>
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#d49ab230] bg-[#d49ab210] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#ffd7e5]">
                  <Sparkles className="h-3 w-3" />
                  New Dual Reading
                </div>
                <h2 className="font-display text-2xl font-black text-[#f7ecd8] sm:text-3xl">
                  紫微塔羅雙牌 · 一問雙證
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b8b2d0]">
                  一個問題，兩套體系。紫微牌看事件根基，塔羅牌看近期走向。
                </p>
                <p className="mt-1 text-xs text-[#8f89aa]">先免費完成雙牌占卜，再選擇自助解讀或完整報告。</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["雙牌驗證", "抽牌免費", "按需解讀"].map((label) => (
                    <span key={label} className="rounded-full border border-[#d4a85324] bg-[#090910]/55 px-2.5 py-1 text-[10px] font-bold text-[#d9c7a0]">{label}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="sm:text-right">
              <span className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4a853] to-[#c9953a] px-5 py-3 text-sm font-black text-[#08080f] shadow-[0_14px_34px_rgba(212,168,83,0.18)]">
                免費開始體驗 <ArrowRight className="h-4 w-4" />
              </span>
              <p className="mt-2 max-w-xs text-[10px] leading-5 text-[#8f89aa]">抽牌與查看牌面免費，完整解讀按需解鎖。</p>
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}

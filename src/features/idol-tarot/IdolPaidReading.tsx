import { useEffect, useState } from "react";
import { Check, Clock3, FileText, LockKeyhole, ShieldCheck, Sparkles, X } from "lucide-react";
import { PAYMENT_COMING_SOON } from "@/const";
import { trackEvent } from "@/lib/analytics";
import { formatCny, getPaidReadingPlan } from "@/features/paid-reading/config";
import { getIdolTarotScene, type IdolSingleReadingType, type IdolTarotLocale } from "./config";

type Props = {
  locale: IdolTarotLocale;
  sceneType: IdolSingleReadingType;
  question: string;
  freeSummary: string;
  unresolvedQuestion: string;
  cards: { ziwei: string; tarot: string; orientation: string };
  sessionId: string;
  isFirstPurchase: boolean;
  isPaid: boolean;
  onUnlock: () => void;
  onFollowup: (question: string) => void;
};

export function IdolPaidReading(props: Props) {
  const [sampleOpen, setSampleOpen] = useState(false);
  const scene = getIdolTarotScene(props.sceneType);
  const plan = getPaidReadingPlan(props.isFirstPurchase);
  const zh = props.locale === "zh-TW";
  const analytics = {
    scene_type: props.sceneType,
    spread_type: "one",
    is_first_purchase: props.isFirstPurchase,
    price: plan.priceCny,
    session_id: props.sessionId,
    question_length: props.question.length,
    source_page: "idol_tarot_result",
  };

  useEffect(() => {
    trackEvent(props.isPaid ? "idol_full_report_viewed" : "idol_paywall_viewed", {
      scene_type: props.sceneType,
      spread_type: "one",
      is_first_purchase: props.isFirstPurchase,
      price: plan.priceCny,
      session_id: props.sessionId,
      question_length: props.question.length,
      source_page: "idol_tarot_result",
    });
  }, [plan.priceCny, props.isFirstPurchase, props.isPaid, props.question.length, props.sceneType, props.sessionId]);

  if (props.isPaid) {
    return (
      <section className="mt-6 rounded-[26px] border border-[#d7b86b55] bg-gradient-to-b from-[#fffaf0] to-[#f2e2c5] p-5 text-[#3f3428] shadow-[0_18px_52px_rgba(83,52,18,0.14)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full border border-emerald-700/20 bg-emerald-50 text-emerald-700"><Check className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Full report ready</p>
              <h3 className="font-display text-2xl font-bold text-[#6d401b]">{zh ? "完整報告已解鎖" : "Your Full Reading Is Ready"}</h3>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-700/30 bg-emerald-50 px-3 py-1.5 text-[10px] font-black tracking-[0.08em] text-emerald-700 sm:self-auto">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{zh ? "已為本會話解鎖 · 重新整理可恢復" : "Unlocked for this session · Restores after refresh"}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const reportText = [
                `【${zh ? "追星事件深度報告" : "Idol Event Deep Report"}】`,
                `問題：${props.question}`,
                `紫微塔羅：${props.cards.ziwei}`,
                `韋特塔羅：${props.cards.tarot} · ${props.cards.orientation}`,
                `本次核心：${props.freeSummary}`,
                `解鎖時間：${new Date().toLocaleString(zh ? "zh-TW" : "en-US")}`,
              ].join("\n");
              navigator.clipboard?.writeText(reportText).then(
                () => trackEvent("idol_report_copied", analytics),
                () => trackEvent("idol_report_copy_failed", analytics)
              );
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ba95534f] bg-[#fffdf8] px-3 py-1.5 text-xs font-bold text-[#7a5227] hover:border-[#a97835] hover:bg-[#fff3db]"
          >
            <FileText className="h-3.5 w-3.5" /> {zh ? "複製報告" : "Copy report"}
          </button>
          <a
            href="/profile?tab=reports"
            onClick={() => trackEvent("idol_view_history_clicked", analytics)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ba95534f] bg-[#fffdf8] px-3 py-1.5 text-xs font-bold text-[#7a5227] hover:border-[#a97835] hover:bg-[#fff3db]"
          >
            <Clock3 className="h-3.5 w-3.5" /> {zh ? "查看歷史報告" : "View history"}
          </a>
        </div>
        <div className="mt-5 border-t border-[#b9986330] pt-5">
          <p className="text-xs font-black tracking-[0.12em] text-[#91652f]">{zh ? "繼續探索" : "Continue Exploring"}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {scene.followups[props.locale].map((item, index) => (
              <button key={item} type="button" onClick={() => { trackEvent("idol_followup_clicked", { ...analytics, followup_index: index }); props.onFollowup(item); }} className="min-h-12 rounded-xl border border-[#ba95534f] bg-[#fffdf8] px-3 py-2.5 text-left text-sm font-semibold leading-5 text-[#5b4632] hover:border-[#a97835] hover:bg-[#fff3db]">
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mt-6 overflow-hidden rounded-[28px] border border-[#c8a15e70] bg-gradient-to-b from-[#fffaf0] via-[#f8ecd8] to-[#efdfc3] text-[#3d3328] shadow-[0_24px_70px_rgba(70,42,14,0.18)]">
        <div className="p-5 sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a77a3f]">Free reading</p>
          <h3 className="mt-1 font-display text-2xl font-bold text-[#6f3f16]">{zh ? "本次免費解讀" : "Your Free Reading"}</h3>
          <p className="mt-3 text-sm leading-7 text-[#55483c]">{props.freeSummary}</p>
          <div className="mt-4 rounded-2xl border border-[#c78f6260] bg-[#fff3df] p-4">
            <div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#a86132]" /><div><p className="text-xs font-black text-[#9a542c]">{zh ? "仍未解開的關鍵點" : "The Key Question Still Open"}</p><p className="mt-1.5 text-sm font-semibold leading-7 text-[#5b3e2c]">{props.unresolvedQuestion}</p></div></div>
          </div>
        </div>
        <div className="border-t border-[#a8793438] bg-[#fffaf0]/85 p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><div className="inline-flex items-center gap-2 rounded-full border border-[#ad7d3d45] bg-[#fff3d7] px-3 py-1.5 text-[10px] font-black text-[#8b5c26]"><LockKeyhole className="h-3.5 w-3.5" />{props.isFirstPurchase ? (zh ? "新人首次深度解讀" : "First Deep Reading") : (zh ? "標準單次深度解讀" : "Standard Deep Reading")}</div><h3 className="mt-3 font-display text-2xl font-bold text-[#6f3f16]">{scene.paywallTitle[props.locale]}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#746556]">{zh ? "結合你的原問題、背景與本次雙牌，繼續分析尚未揭開的答案。" : "Continue with your original question, context, and both cards to uncover the remaining answer."}</p></div>
            <button type="button" onClick={() => { setSampleOpen(true); trackEvent("idol_report_sample_opened", analytics); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#a8793455] bg-[#fffdf8] px-4 text-sm font-bold text-[#7a5227]"><FileText className="h-4 w-4" />{zh ? "查看報告樣例" : "View Report Sample"}</button>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">{scene.benefits[props.locale].map((item) => <div key={item} className="flex items-start gap-2 rounded-xl border border-[#c9aa7238] bg-[#fffdf8] px-3.5 py-3 text-sm font-semibold text-[#55483c]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#a97835]" />{item}</div>)}</div>
          <div className="mt-5 rounded-2xl border border-[#b9915040] bg-[#fff7e8] p-4"><div className="flex items-start gap-2.5"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#8f642d]" /><p className="text-sm leading-6 text-[#65513e]">{zh ? "報告只依據你的問題、紫微塔羅與韋特塔羅牌面生成，不使用與問題無關的通用套話。" : "Your report is generated from your question and both cards, without unrelated generic filler."}</p></div><p className="mt-3 text-xs leading-6 text-[#756655]">{zh ? "支付後在目前頁面解鎖 · 不需重新抽牌 · 約 6–10 分鐘閱讀 · 重新整理可恢復" : "Unlocks on this page · No redraw · 6–10 min read · Restores after refresh"}</p></div>
          <button type="button" onClick={() => { trackEvent("idol_unlock_clicked", analytics); props.onUnlock(); }} className="mt-5 flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-[#b9853f] via-[#d6ad67] to-[#aa7535] px-4 text-base font-black text-[#21160d] shadow-[0_12px_30px_rgba(143,93,35,0.22)] transition hover:brightness-105 sm:px-5">
            <span className="flex min-w-0 items-center gap-2">
              {PAYMENT_COMING_SOON ? <Clock3 className="h-5 w-5 shrink-0" /> : <LockKeyhole className="h-5 w-5 shrink-0" />}
              <span className="truncate text-left">{PAYMENT_COMING_SOON ? `${scene.cta[props.locale]}${zh ? "（即將上線）" : " (Coming Soon)"}` : scene.cta[props.locale]}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-1.5">
              {props.isFirstPurchase && !PAYMENT_COMING_SOON && (
                <span className="text-xs font-bold text-[#21160d]/55 line-through">{formatCny(19.9)}</span>
              )}
              <span className="text-xl font-black tracking-tight">{formatCny(plan.priceCny)}</span>
            </span>
          </button>
          <p className="mt-2 text-center text-xs text-[#7d6a56]">{PAYMENT_COMING_SOON ? (zh ? "支付通道接通後即可在目前頁面完成解鎖" : "Payment access is coming soon") : (props.isFirstPurchase ? (zh ? `新人首單 ${formatCny(plan.priceCny)} · 本次問題、本次雙牌、本會話綁定` : `First-time order ${formatCny(plan.priceCny)} · tied to this question, both cards, and this session`) : (zh ? "支付後立即在目前頁面查看完整報告 · 同一會話內有效" : "Unlocks immediately on this page after payment · Valid within this session"))}</p>
        </div>
      </section>
      {sampleOpen && <div className="fixed inset-0 z-[260] flex items-end justify-center bg-[#211811]/55 backdrop-blur-sm sm:items-center sm:p-6"><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] bg-[#fffaf0] p-5 text-[#3d3328] sm:rounded-[28px] sm:p-7"><div className="flex justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a77a3f]">Sample report</p><h3 className="mt-1 font-display text-2xl font-bold text-[#6f3f16]">{zh ? "完整報告樣例" : "Full Report Sample"}</h3><p className="mt-2 text-sm leading-6 text-[#746556]">{zh ? "以下為示例，實際報告會依你的問題與本次雙牌生成。" : "This is a sample. Your actual report is generated from your question and both cards."}</p></div><button onClick={() => setSampleOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-[#b9986340]"><X className="h-4 w-4" /></button></div><div className="mt-5 grid gap-3">{[
            [zh ? "問題" : "Question", (props.question?.length > 60 ? props.question.slice(0, 60) + "…" : props.question) || (zh ? "（本次未輸入自定義問題）" : "(no custom question entered)")],
            [zh ? "紫微塔羅｜核心局勢" : "Zi Wei Tarot | Core Situation", props.cards.ziwei],
            [zh ? "韋特塔羅｜情緒與行動" : "Rider-Waite | Emotion and Action", `${props.cards.tarot} · ${props.cards.orientation}`],
            [zh ? "雙牌共同判斷" : "Cross-Card Reading", props.freeSummary || (zh ? "牌面顯示在現實條件上仍有可推進的空間。" : "The cards indicate there is still room to act on the real-world conditions.")],
            [zh ? "行動建議" : "Action", zh ? "先做一個低成本、可觀察回饋的準備，並以現實結果調整下一步。" : "Take one low-cost, observable step and adjust based on real feedback."],
          ].map(([title,text]) => <div key={title as string} className="rounded-2xl border border-[#c9aa7238] bg-[#fffdf8] p-4"><p className="text-xs font-black text-[#a06e31]">{title}</p><p className="mt-1.5 text-sm leading-7 text-[#55483c]">{text}</p></div>)}<div className="rounded-2xl border border-dashed border-[#b9986355] bg-[#fff7e8] p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8b5c26]">Locked Section · {zh ? "解鎖後可見" : "Visible after unlock"}</p><p className="mt-1.5 text-sm font-semibold leading-6 text-[#5b3e2c]">{props.unresolvedQuestion}</p><p className="mt-2 text-xs leading-6 text-[#7d6a56]">{zh ? "支付後即可看到這條內容的完整解讀，以及 5 項詳細分析 + 7–10 條具體行動建議。" : "After payment, you will see the full interpretation of this question, plus 5 detailed analyses and 7–10 specific action suggestions."}</p></div></div></section></div>}
    </>
  );
}

export function IdolFullReportContent({
  locale,
  sceneType,
  question,
  ziweiName,
  ziweiMeaning,
  tarotName,
  tarotOrientation,
  tarotSignal,
  headline,
  crossReading,
  actions,
}: {
  locale: IdolTarotLocale;
  sceneType: IdolSingleReadingType;
  question: string;
  ziweiName: string;
  ziweiMeaning: string;
  tarotName: string;
  tarotOrientation: string;
  tarotSignal: string;
  headline: string;
  crossReading: string[];
  actions: string[];
}) {
  const zh = locale === "zh-TW";
  const sections = [
    [zh ? "一句話核心答案" : "Core Answer", headline],
    [zh ? `紫微塔羅｜整體格局 · ${ziweiName}` : `Zi Wei Tarot | Core Pattern · ${ziweiName}`, ziweiMeaning],
    [zh ? `韋特塔羅｜情緒與行動 · ${tarotName} ${tarotOrientation}` : `Rider–Waite | Emotion & Action · ${tarotName} ${tarotOrientation}`, tarotSignal],
    [zh ? "雙牌共同訊息" : "Cross-Card Message", crossReading.join("\n\n")],
    [zh ? "當前最大的機會" : "Strongest Opportunity", actions[0] || (zh ? "把準備集中在最能觀察到現實回饋的一步。" : "Focus preparation on one step that produces observable feedback.")],
    [zh ? "當前最大的阻礙" : "Main Obstacle", zh ? "期待容易跑在現實條件前面；請把判斷放在規則、時間與實際回饋上。" : "Expectation can move faster than reality; ground decisions in rules, timing, and observable feedback."],
    [zh ? "未來 30 天趨勢" : "Next 30 Days", zh ? "牌面呈現的是一段需要邊行動、邊校準的週期。前半段先處理資訊與準備，後半段再依回饋調整投入。" : "The cards point to a period of acting and recalibrating. Use the first half for information and preparation, then adjust your investment from real feedback."],
    [zh ? "具體行動建議" : "Practical Actions", actions.map((item, index) => `${index + 1}. ${item}`).join("\n")],
    [zh ? "需要保持理性的地方" : "Where to Stay Grounded", zh ? "本次解讀反映的是你與追星事件之間的能量傾向，不代表 Idol 本人的私人想法，也不保證現實結果。" : "This reading reflects your relationship with the fandom situation. It does not represent an idol’s private thoughts or guarantee real-world outcomes."],
  ];

  return (
    <section className="mt-6 rounded-[28px] border border-[#d6b56755] bg-gradient-to-b from-[#fffaf0] to-[#f4e6cf] p-5 text-[#40352b] shadow-[0_22px_65px_rgba(76,48,18,0.14)] sm:p-7">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#98703b]">Idol Destiny · Full report</p>
      <h3 className="mt-1 font-display text-3xl font-bold text-[#6c3f1c]">{getIdolTarotScene(sceneType).paywallTitle[locale]}</h3>
      <div className="mt-4 rounded-2xl border border-[#c9aa7240] bg-[#fffdf8] p-4"><p className="text-xs font-black text-[#9a6b31]">{zh ? "本次問題" : "Your Question"}</p><p className="mt-1.5 text-sm leading-7">{question}</p></div>
      <div className="mt-4 grid gap-3">
        {sections.map(([title, text], index) => <article key={title} className={`rounded-2xl border p-4 sm:p-5 ${index === 0 ? "border-[#b7864260] bg-[#fff0cf]" : "border-[#c9aa7238] bg-[#fffdf8]"}`}><p className="text-xs font-black tracking-[0.08em] text-[#9a6b31]">{title}</p><p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#55483c]">{text}</p></article>)}
      </div>
    </section>
  );
}

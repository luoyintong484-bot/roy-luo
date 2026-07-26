import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Clock3, FileText, LockKeyhole, ShieldCheck, Sparkles, X } from "lucide-react";
import { PAYMENT_COMING_SOON } from "@/const";
import { trackEvent } from "@/lib/analytics";
import { isReportPaid } from "@/lib/payment-service";
import PayModal, { PAYWALL_CONFIGS } from "@/components/PayModal";
import {
  SCENE_COPY,
  formatCny,
  getPaidReadingPlan,
  type PaidReadingScene,
} from "./config";

const FREE_FOLLOWUP_LIMIT = 1;
const FOLLOWUP_PACK_SIZE = 3;

function followupUsedKey(sessionId: string) { return `r7_followup_used_${sessionId}`; }
function getFollowupUsed(sessionId: string): number {
  try { return parseInt(localStorage.getItem(followupUsedKey(sessionId)) || "0", 10) || 0; } catch { return 0; }
}
function saveFollowupUsed(sessionId: string, used: number) {
  try { localStorage.setItem(followupUsedKey(sessionId), String(used)); } catch {}
}

type CardSnapshot = {
  name: string;
  orientation: string;
  position?: string;
};

type PaidReadingConversionProps = {
  scene: PaidReadingScene;
  question: string;
  freeSummary: string;
  unresolvedQuestion?: string;
  cards: CardSnapshot[];
  sessionId: string;
  spreadType: string;
  isFirstPurchase: boolean;
  isPaid: boolean;
  onUnlock: () => void;
  onFollowup: (question: string) => void;
};

function ReportSample({ scene, cards, question, freeSummary, unresolvedQuestion, onClose }: { scene: PaidReadingScene; cards: CardSnapshot[]; question: string; freeSummary: string; unresolvedQuestion: string; onClose: () => void }) {
  const copy = SCENE_COPY[scene];
  const sampleCards = cards.length ? cards : [{ name: "圣杯二", orientation: "正位", position: "当前关系" }];

  // 用用户本次的牌、问题、未解项动态拼出预览（保留脱敏后占位）
  const cardLine = sampleCards.map((card) => `${card.position ? `${card.position}：` : ""}${card.name}（${card.orientation}）`).join("；");
  const userQuestion = question?.trim() ? question : copy.sampleQuestion;
  const previewQuestion = userQuestion.length > 60 ? userQuestion.slice(0, 60) + "…" : userQuestion;
  const previewSummary = freeSummary?.trim() ? (freeSummary.length > 110 ? freeSummary.slice(0, 110) + "…" : freeSummary) : "牌面显示连接仍在，但情绪投入与现实行动并不同步。";

  return (
    <div className="fixed inset-0 z-[260] flex items-end justify-center bg-[#211811]/55 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-[#c9aa724d] bg-[#fffaf0] p-5 text-[#3d3328] shadow-[0_30px_100px_rgba(50,32,15,0.32)] sm:rounded-[28px] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a77a3f]">Report Sample</p>
            <h3 className="mt-1 font-display text-2xl font-bold text-[#6f3f16]">深度报告样例</h3>
            <p className="mt-2 text-sm leading-6 text-[#746556]">以下为示例报告，实际结果会根据你的问题和本次抽牌生成。</p>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭报告样例" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#b9986340] text-[#765f47] hover:bg-[#f3e4c9]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <SampleSection title="用户问题" text={previewQuestion} highlight />
          <SampleSection title="本次牌面" text={cardLine} />
          <SampleSection title="当前状态" text={previewSummary} />
          <SampleSection title={scene === "relationship" ? "对方态度" : "事件倾向"} text="核心牌保留了关注与靠近意愿，但辅助位置出现节奏受阻，说明态度尚未完全转化为连续行动。" />
          <SampleSection title="未来 30 天趋势" text="前半段以试探、小幅反馈为主；后半段是否推进，取决于现实安排与双方回应是否形成连续性。" />
          <SampleSection title="最大阻碍" text="阻碍不在于完全没有机会，而在于期待、时间和行动成本没有被说清楚，容易出现各自猜测。" />
          <SampleSection title="行动建议" text="先做一次低压力、可观察反馈的行动；把判断依据放在持续回应上，而不是单次情绪信号。" highlight />
          <div className="rounded-2xl border border-dashed border-[#b9986355] bg-[#fff7e8] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8b5c26]">Locked Section · 解锁后可见</p>
            <p className="mt-1.5 text-sm font-semibold leading-6 text-[#5b3e2c]">
              {unresolvedQuestion?.trim() ? unresolvedQuestion : copy.unresolvedLabel}
            </p>
            <p className="mt-2 text-xs leading-6 text-[#7d6a56]">支付后即可看到这条内容的完整解读，以及 5 项详细分析 + 7–10 条具体行动建议。</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SampleSection({ title, text, highlight = false }: { title: string; text: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${highlight ? "border-[#bd8e4570] bg-[#fff0cf]" : "border-[#c9aa7238] bg-[#fffdf8]"}`}>
      <p className="text-xs font-black tracking-[0.08em] text-[#a06e31]">{title}</p>
      <p className="mt-1.5 text-sm leading-7 text-[#55483c]">{text}</p>
    </div>
  );
}

export function PaidReadingConversion({
  scene,
  question,
  freeSummary,
  unresolvedQuestion,
  cards,
  sessionId,
  spreadType,
  isFirstPurchase,
  isPaid,
  onUnlock,
  onFollowup,
}: PaidReadingConversionProps) {
  const [sampleOpen, setSampleOpen] = useState(false);
  const copy = SCENE_COPY[scene];
  const plan = getPaidReadingPlan(isFirstPurchase);

  const followupReportKey = `${sessionId}_followup`;
  const [followupUsed, setFollowupUsed] = useState(() => getFollowupUsed(sessionId));
  const [followupPackPaid, setFollowupPackPaid] = useState(() => isReportPaid(followupReportKey));
  const [showFollowupPaywall, setShowFollowupPaywall] = useState(false);
  const followupRemaining = FREE_FOLLOWUP_LIMIT + (followupPackPaid ? FOLLOWUP_PACK_SIZE : 0) - followupUsed;

  useEffect(() => {
    const paid = isReportPaid(followupReportKey);
    if (paid !== followupPackPaid) setFollowupPackPaid(paid);
    const stored = getFollowupUsed(sessionId);
    if (stored !== followupUsed) setFollowupUsed(stored);
  }, [sessionId, followupReportKey]);

  const commonAnalytics = useMemo(() => ({
    scene_type: scene,
    spread_type: spreadType,
    is_first_purchase: isFirstPurchase,
    price: plan.priceCny,
    session_id: sessionId,
    question_length: question.trim().length,
    source_page: "tarot_result",
  }), [isFirstPurchase, plan.priceCny, question, scene, sessionId, spreadType]);

  useEffect(() => {
    if (isPaid) return;
    trackEvent("free_result_viewed", commonAnalytics);
    trackEvent("paywall_viewed", commonAnalytics);
  }, [commonAnalytics, isPaid]);

  if (isPaid) {
    return (
      <>
      <section className="mt-6 rounded-[26px] border border-[#c6a05b55] bg-gradient-to-b from-[#fffaf0] to-[#f4e7cf] p-5 text-[#3d3328] shadow-[0_18px_52px_rgba(83,52,18,0.14)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full border border-emerald-700/20 bg-emerald-50 text-emerald-700"><Check className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Full Report Ready</p>
              <h3 className="font-display text-xl font-bold text-[#6f3f16]">完整报告已解锁</h3>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-700/30 bg-emerald-50 px-3 py-1.5 text-[10px] font-black tracking-[0.08em] text-emerald-700 sm:self-auto">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>已为本会话解锁 · 刷新可恢复</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const reportText = [
                `【${copy.subject}深度报告】`,
                `问题：${question || "本次未输入自定义问题"}`,
                `当前核心趋势：${freeSummary}`,
                `本次牌面：${cards.map((c) => `${c.position ? `${c.position}：` : ""}${c.name}（${c.orientation}）`).join("；")}`,
                `解锁时间：${new Date().toLocaleString("zh-CN")}`,
              ].join("\n");
              navigator.clipboard?.writeText(reportText).then(
                () => trackEvent("report_copied", commonAnalytics),
                () => trackEvent("report_copy_failed", commonAnalytics)
              );
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ba95534f] bg-[#fffdf8] px-3 py-1.5 text-xs font-bold text-[#7a5227] hover:border-[#a97835] hover:bg-[#fff3db]"
          >
            <FileText className="h-3.5 w-3.5" /> 复制报告
          </button>
          <a
            href="/profile?tab=reports"
            onClick={() => trackEvent("view_history_clicked", commonAnalytics)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ba95534f] bg-[#fffdf8] px-3 py-1.5 text-xs font-bold text-[#7a5227] hover:border-[#a97835] hover:bg-[#fff3db]"
          >
            <Clock3 className="h-3.5 w-3.5" /> 查看历史报告
          </a>
        </div>
        <div className="mt-5 border-t border-[#b9986330] pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[0.12em] text-[#9a6b31]">继续追问</p>
              <p className="mt-1 text-sm text-[#746556]">沿用当前对象、关系背景和本次牌面，不需要重新填写资料。</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${followupRemaining > 0 ? "bg-[#e8f0e0] text-[#3b6d11]" : "bg-[#fff3df] text-[#9a542c]"}`}>
              {followupRemaining > 0 ? `还可追问 ${followupRemaining} 次` : "免费额度已用完"}
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {copy.followups.map((item, index) => (
              <button key={item} type="button" onClick={() => {
                trackEvent("followup_question_clicked", { ...commonAnalytics, followup_index: index, remaining_before: followupRemaining });
                if (followupRemaining > 0) {
                  const newUsed = followupUsed + 1;
                  setFollowupUsed(newUsed);
                  saveFollowupUsed(sessionId, newUsed);
                  trackEvent("followup_used", { ...commonAnalytics, followup_index: index, remaining_after: followupRemaining - 1 });
                  onFollowup(item);
                } else {
                  setShowFollowupPaywall(true);
                  trackEvent("followup_paywall_shown", { ...commonAnalytics, followup_index: index });
                }
              }} className="min-h-12 rounded-xl border border-[#ba95534f] bg-[#fffdf8] px-3 py-2.5 text-left text-sm font-semibold leading-5 text-[#5b4632] transition hover:border-[#a97835] hover:bg-[#fff3db]">
                {item}
              </button>
            ))}
          </div>
          {followupRemaining <= 0 && (
            <button type="button" onClick={() => setShowFollowupPaywall(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b9853f] via-[#d6ad67] to-[#aa7535] px-4 py-3 text-sm font-black text-[#21160d] shadow-[0_8px_24px_rgba(143,93,35,0.18)] transition hover:brightness-105">
              <Sparkles className="h-4 w-4" /> ¥9.9 解锁 3 次追问额度
            </button>
          )}
        </div>
      </section>
      {showFollowupPaywall && (
        <PayModal
          isOpen={showFollowupPaywall}
          onClose={() => setShowFollowupPaywall(false)}
          onPaid={() => { setFollowupPackPaid(true); setShowFollowupPaywall(false); }}
          config={{ ...PAYWALL_CONFIGS.followupPack, reportKey: followupReportKey }}
        />
      )}
      </>
    );
  }

  return (
    <>
      <section className="mt-6 overflow-hidden rounded-[28px] border border-[#c8a15e70] bg-gradient-to-b from-[#fffaf0] via-[#f8ecd8] to-[#efdfc3] text-[#3d3328] shadow-[0_24px_70px_rgba(70,42,14,0.18)]">
        <div className="p-5 sm:p-7">
          <div className="rounded-2xl border border-[#c9aa7245] bg-[#fffdf8] p-4 sm:p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a77a3f]">Your Question</p>
            <h3 className="mt-1 font-display text-lg font-bold text-[#6f3f16]">用户原问题</h3>
            <p className="mt-2 text-sm leading-7 text-[#55483c]">{question || "本次未输入自定义问题，系统将按所选场景解读。"}</p>
          </div>

          <div className="mt-3 rounded-2xl border border-[#c9aa7245] bg-[#fffdf8] p-4 sm:p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a77a3f]">Core Trend</p>
            <h3 className="mt-1 font-display text-lg font-bold text-[#6f3f16]">当前核心趋势</h3>
            <p className="mt-2 text-sm leading-7 text-[#55483c]">{freeSummary}</p>
          </div>

          <div className="mt-3 rounded-2xl border border-[#c78f6260] bg-[#fff3df] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#a86132]" />
              <div>
                <p className="text-xs font-black tracking-[0.08em] text-[#9a542c]">仍未解开的关键点</p>
                <p className="mt-1.5 text-sm font-semibold leading-7 text-[#5b3e2c]">{unresolvedQuestion || copy.unresolvedLabel}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#a8793438] bg-[#fffaf0]/80 p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ad7d3d45] bg-[#fff3d7] px-3 py-1.5 text-[10px] font-black tracking-[0.12em] text-[#8b5c26]">
                <LockKeyhole className="h-3.5 w-3.5" /> {isFirstPurchase ? "新人首次深度解读" : "标准单次深度解读"}
              </div>
              <h3 className="mt-3 font-display text-2xl font-bold text-[#6f3f16]">{copy.paywallTitle}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#746556]">{copy.subtitle}</p>
            </div>
            <button type="button" onClick={() => { setSampleOpen(true); trackEvent("report_sample_opened", commonAnalytics); }} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#a8793455] bg-[#fffdf8] px-4 text-sm font-bold text-[#7a5227] hover:bg-[#fff2d7]">
              <FileText className="h-4 w-4" /> 查看报告样例
            </button>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {copy.benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-2 rounded-xl border border-[#c9aa7238] bg-[#fffdf8] px-3.5 py-3 text-sm font-semibold leading-5 text-[#55483c]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#a97835]" /> {benefit}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-[#b9915040] bg-[#fff7e8] p-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#8f642d]" />
              <p className="text-sm leading-6 text-[#65513e]">本次解读会结合你的原问题、抽到的牌及正逆位生成，不使用与问题无关的通用套话。</p>
            </div>
            <div className="mt-3 grid gap-2 text-xs leading-5 text-[#756655] sm:grid-cols-2">
              <span>• 支付后当前页面立即解锁</span><span>• 不需要重复抽牌或填写问题</span>
              <span>• 约 8–12 分钟阅读内容</span><span>• 生成失败可免费重新生成</span>
              <span>• 订单与会话绑定，刷新后可恢复</span><span>• 支付取消后可重新发起</span>
            </div>
          </div>

          <button type="button" onClick={() => { trackEvent("unlock_button_clicked", commonAnalytics); onUnlock(); }} className="mt-5 flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-[#b9853f] via-[#d6ad67] to-[#aa7535] px-4 text-base font-black text-[#21160d] shadow-[0_12px_30px_rgba(143,93,35,0.22)] transition hover:brightness-105 disabled:opacity-50 sm:px-5">
            <span className="flex min-w-0 items-center gap-2">
              {PAYMENT_COMING_SOON ? <Clock3 className="h-5 w-5 shrink-0" /> : <LockKeyhole className="h-5 w-5 shrink-0" />}
              <span className="truncate text-left">{PAYMENT_COMING_SOON ? `${copy.cta}（即将上线）` : copy.cta}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-1.5">
              {isFirstPurchase && !PAYMENT_COMING_SOON && (
                <span className="text-xs font-bold text-[#21160d]/55 line-through">{formatCny(19.9)}</span>
              )}
              <span className="text-xl font-black tracking-tight">{formatCny(plan.priceCny)}</span>
            </span>
          </button>
          <p className="mt-2 text-center text-xs text-[#7d6a56]">
            {PAYMENT_COMING_SOON
              ? "支付通道接通后即可在当前页面完成解锁"
              : isFirstPurchase
                ? `新人首单 ${formatCny(plan.priceCny)} · 本次问题、本次牌面、本会话绑定`
                : `支付后立即在当前页面查看完整报告 · 同一会话内有效`}
          </p>

          <details className="mt-4 rounded-xl border border-[#c9aa7233] bg-[#fffdf8] px-4 py-3 text-xs text-[#756655]">
            <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-[#6f5336]">交付与合规说明 <ChevronDown className="h-4 w-4" /></summary>
            <p className="mt-2 leading-6">占卜内容仅供娱乐与自我探索参考，不构成医疗、法律、投资或其他专业建议。报告描述的是牌面趋势，不对现实事件作百分百保证。</p>
          </details>
        </div>
      </section>

      {sampleOpen && <ReportSample scene={scene} cards={cards} question={question} freeSummary={freeSummary} unresolvedQuestion={unresolvedQuestion || copy.unresolvedLabel} onClose={() => setSampleOpen(false)} />}
    </>
  );
}

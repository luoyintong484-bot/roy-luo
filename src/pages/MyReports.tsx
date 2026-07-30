import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "@/components/CustomerService";
import { getMergedReportHistory, removeReportHistory, type ReportHistoryItem } from "@/lib/report-history";
import { isReportPaid } from "@/lib/payment-service";
import { ArrowRight, Trash2, Clock3, Sparkles, FileSearch, ShieldCheck } from "lucide-react";

const isZh = (() => {
  try {
    return (localStorage.getItem("r7-locale") || "zh-TW") === "zh-TW";
  } catch {
    return true;
  }
})();

function daysLeft(expiresAt: string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000));
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

export default function MyReports() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ReportHistoryItem[]>(() => getMergedReportHistory());

  const refresh = () => setItems(getMergedReportHistory());

  const open = (it: ReportHistoryItem) => {
    // Re-confirm the unlock is still valid before navigating.
    if (!isReportPaid(it.reportKey)) {
      refresh();
      return;
    }
    navigate(it.route);
  };

  const remove = (key: string) => {
    removeReportHistory(key);
    refresh();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-[#FFB6C122] bg-[#FFB6C108] px-3 py-1 text-[11px] font-bold text-[#ffd6e8]">
              <Sparkles className="h-3.5 w-3.5 text-[#FFB6C1]" />
              {isZh ? "已解鎖內容" : "Unlocked Reports"}
            </div>
            <h1 className="font-display text-2xl font-bold text-[#f0e6d3] sm:text-3xl">
              {isZh ? "我的報告庫" : "My Reports"}
            </h1>
            <p className="mt-2 text-sm text-[#8a8aad]">
              {isZh
                ? "這裡收錄你已付費解鎖的完整報告，30 天內可隨時回看，無需重複付費。"
                : "All reports you've unlocked. Revisit any time within 30 days — no re-payment needed."}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="rounded-3xl border border-[#FFB6C114] bg-[#151520] p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FFB6C120] bg-[#FFB6C108]">
                <FileSearch className="h-6 w-6 text-[#FFB6C1]" />
              </div>
              <p className="text-sm font-semibold text-[#f0e6d3]">
                {isZh ? "尚無已解鎖的報告" : "No unlocked reports yet"}
              </p>
              <p className="mt-1 text-xs text-[#8a8aad]">
                {isZh ? "解鎖任意完整版報告後，會自動出現在這裡。" : "Reports you unlock will appear here automatically."}
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] px-5 py-2.5 text-xs font-bold text-[#0a0a0f] hover:brightness-110 transition-all"
              >
                {isZh ? "去探索報告" : "Explore reports"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => {
                const left = daysLeft(it.expiresAt);
                const active = isReportPaid(it.reportKey);
                return (
                  <div
                    key={it.reportKey}
                    className="group flex items-center gap-4 rounded-2xl border border-[#FFB6C112] bg-[#151520] px-4 py-4 transition-colors hover:border-[#FFB6C130]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#FFB6C118] bg-[#FFB6C108] text-2xl">
                      {it.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#f0e6d3]">{it.titleZh}</p>
                      <p className="truncate text-[11px] text-[#8a8aad]">{it.title}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#8a8aad]">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3 w-3" />
                          {isZh ? "解鎖於" : "Unlocked"} {formatDate(it.unlockedAt)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                            active
                              ? "bg-green-400/10 text-green-300"
                              : "bg-rose-400/10 text-rose-300"
                          }`}
                        >
                          {active
                            ? `${isZh ? "剩餘" : ""} ${left} ${isZh ? "天" : "d left"}`
                            : (isZh ? "已過期" : "Expired")}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => open(it)}
                        disabled={!active}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] px-3.5 py-2 text-xs font-bold text-[#0a0a0f] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isZh ? "查看" : "View"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => remove(it.reportKey)}
                        title={isZh ? "從清單移除" : "Remove from list"}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FFB6C112] text-[#8a8aad] transition-colors hover:border-rose-400/30 hover:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <p className="mt-4 flex flex-col items-center justify-center gap-1 text-[10px] leading-relaxed text-[#8a8aad]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-green-500/50" />
                  {isZh
                    ? "報告已同步至後台；清瀏覽器資料後仍可透過支付時的「回跳連結」找回。"
                    : "Backed up server-side; lost records can be restored via the original payment return link."}
                </span>
                <span className="text-[#8a8aad]/70">
                  {isZh
                    ? "若連結已失效，可聯絡客服並提供支付寶訂單號（以 R7 開頭）即可協助恢復。"
                    : "If the link is gone, contact support with the R7-prefixed Alipay order ID to restore."}
                </span>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

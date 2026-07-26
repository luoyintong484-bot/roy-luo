import { useState, useMemo } from "react";
import { Copy, Crown, Download, HeartHandshake, Sparkles, Target, Clock, Calendar, CalendarDays } from "lucide-react";
import type { ZiweiChart, ZiweiSynastry } from "@/lib/ziwei-doushu";
import { BRANCHES, PALACE_NAMES } from "@/lib/ziwei-doushu";

function starText(items: string[]) {
  return items.length ? items.join(" · ") : "空宫";
}

const SQUARE_BRANCH_LAYOUT = [
  ["巳", "午", "未", "申"],
  ["辰", "center", "center", "酉"],
  ["卯", "center", "center", "戌"],
  ["寅", "丑", "子", "亥"],
];

const FOUR_COLORS: Record<string, string> = {
  化禄: "bg-[#e56b6f]/15 text-[#c0392b] border-[#e56b6f]/30",
  化权: "bg-[#f59e0b]/15 text-[#b45309] border-[#f59e0b]/30",
  化科: "bg-[#60a5fa]/15 text-[#1d4ed8] border-[#60a5fa]/30",
  化忌: "bg-[#6b7280]/20 text-[#4b5563] border-[#9ca3af]/30",
};

// 大限四化用不同的颜色样式（带 "限" 前缀区分）
const DECADE_FOUR_COLORS: Record<string, string> = {
  化禄: "bg-[#e56b6f]/25 text-[#c0392b] border-[#e56b6f]/50",
  化权: "bg-[#f59e0b]/25 text-[#b45309] border-[#f59e0b]/50",
  化科: "bg-[#60a5fa]/25 text-[#1d4ed8] border-[#60a5fa]/50",
  化忌: "bg-[#6b7280]/30 text-[#4b5563] border-[#9ca3af]/40",
};

function fourClass(item: string) {
  const key = Object.keys(FOUR_COLORS).find((name) => item.includes(name));
  return key ? FOUR_COLORS[key] : "bg-[#e56b6f12] text-[#c0392b] border-[#e56b6f22]";
}

function decadeFourClass(item: string) {
  const key = Object.keys(DECADE_FOUR_COLORS).find((name) => item.includes(name));
  return key ? DECADE_FOUR_COLORS[key] : "bg-[#e56b6f12] text-[#c0392b] border-[#e56b6f22]";
}

type PalaceCellProps = {
  palace: ZiweiChart["palaces"][number];
  decadeHighlight?: boolean;
  decadeName?: string;
  decadeFour?: string[];
};

function PalaceCell({ palace, decadeHighlight, decadeName, decadeFour }: PalaceCellProps) {
  const mainStars = palace.stars.length ? palace.stars : ["借对宫星曜"];
  return (
    <div
      className={`group relative flex min-h-[150px] flex-col border bg-[#fffaf0] p-2.5 text-[#332719] transition-all hover:bg-[#fff4d8] ${
        decadeHighlight
          ? "border-[#d4a853] border-2 ring-2 ring-[#d4a853]/30 shadow-[0_0_16px_rgba(212,168,83,0.35)]"
          : "border border-[#b8924d55]"
      }`}
    >
      <div className="flex items-start justify-between gap-2 border-b border-[#d8bd7b55] pb-1.5">
        <div>
          <p className="text-[12px] font-bold text-[#8a5a16]">{palace.name}</p>
          {decadeName && decadeName !== palace.name && (
            <p className="text-[9px] font-bold text-[#d4a853]">限·{decadeName}</p>
          )}
          <p className="text-[10px] text-[#7a6b55]">{palace.stem}{palace.branch} · {palace.changsheng}</p>
        </div>
        <span className="rounded-full bg-[#2b2118] px-1.5 py-0.5 text-[9px] font-bold text-[#f7dca1]">{palace.branch}</span>
      </div>

      <div className="mt-2 min-h-[42px] space-y-1">
        {mainStars.map((star) => (
          <div key={star} className="flex items-center gap-1.5">
            <span className="text-[14px] font-black leading-tight text-[#2d241d]">{star}</span>
            {palace.brightness[star] && (
              <span className="rounded border border-[#b8924d44] px-1 text-[9px] font-bold text-[#9b6a1f]">
                {palace.brightness[star]}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-1 text-[10px] leading-relaxed text-[#6f6470]">{starText(palace.assistants)}</p>
      <p className="mt-1 text-[9px] leading-relaxed text-[#8a8071]">{starText(palace.misc)}</p>

      {/* 本命四化 */}
      {palace.four.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1 pt-2">
          {palace.four.map((item) => (
            <span key={item} className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${fourClass(item)}`}>
              {item}
            </span>
          ))}
        </div>
      )}

      {/* 大限四化叠加 */}
      {decadeFour && decadeFour.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {decadeFour.map((item) => (
            <span key={`d-${item}`} className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold ${decadeFourClass(item)}`}>
              限·{item}
            </span>
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-2 bottom-full z-20 mb-2 hidden rounded-lg border border-[#d4a85333] bg-[#fffaf0] p-2 text-[10px] leading-relaxed text-[#2f261d] shadow-xl group-hover:block">
        {palace.focus}
      </div>
    </div>
  );
}

export function ZiweiDoushuPanel({ chart, compact = false }: { chart: ZiweiChart; compact?: boolean }) {
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null);
  const [selectedView, setSelectedView] = useState<"natal" | "decade" | "yearly" | "monthly">("natal");
  const palaceByBranch = Object.fromEntries(chart.palaces.map((palace) => [palace.branch, palace]));
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const activeDecade = selectedDecade !== null && chart.decades ? chart.decades[selectedDecade] : null;
  const currentDecade = useMemo(() => {
    if (!chart.decades?.length) return null;
    return chart.decades.find((item) => item.isCurrent) || chart.decades[0];
  }, [chart.decades]);

  // 计算大限方向（顺行/逆行）
  const decadeDirection = useMemo(() => {
    if (!chart.decades || chart.decades.length < 2) return 1; // 默认顺行
    const b0 = BRANCHES.indexOf(chart.decades[0].palaceBranch);
    const b1 = BRANCHES.indexOf(chart.decades[1].palaceBranch);
    return ((b1 - b0 + 12) % 12 === 1) ? 1 : -1; // 1=顺行, -1=逆行
  }, [chart.decades]);

  // 计算每个宫位的大限名称映射
  const decadeNameMap = useMemo(() => {
    if (!activeDecade) return {} as Record<string, string>;
    const decadeBranchIdx = BRANCHES.indexOf(activeDecade.palaceBranch);
    const map: Record<string, string> = {};
    chart.palaces.forEach((palace) => {
      const palaceBranchIdx = BRANCHES.indexOf(palace.branch);
      const offset = decadeDirection === 1
        ? (palaceBranchIdx - decadeBranchIdx + 12) % 12
        : (decadeBranchIdx - palaceBranchIdx + 12) % 12;
      map[palace.branch] = PALACE_NAMES[offset];
    });
    return map;
  }, [activeDecade, chart.palaces, decadeDirection]);

  // 计算大限四化落在哪些宫位
  const decadeFourMap = useMemo(() => {
    if (!activeDecade) return {} as Record<string, string[]>;
    const map: Record<string, string[]> = {};
    activeDecade.fourTransformations.forEach((four) => {
      const starName = four.replace(/化禄|化权|化科|化忌/, "");
      chart.palaces.forEach((p) => {
        if (p.stars.includes(starName) || p.assistants.includes(starName) || p.misc.includes(starName)) {
          if (!map[p.branch]) map[p.branch] = [];
          map[p.branch].push(four);
        }
      });
    });
    return map;
  }, [activeDecade, chart.palaces]);

  const yearlyTransit = useMemo(() => {
    const branch = BRANCHES[((currentYear - 4) % 12 + 12) % 12];
    const palace = palaceByBranch[branch] || chart.palaces[0];
    return {
      branch,
      palace,
      title: `${currentYear} 流年焦点`,
      subtitle: `今年先看 ${palace.name} · ${palace.focus}`,
      note: `以 ${branch} 支引动当年宫位焦点，适合先观察 ${palace.name} 对应的人生议题如何被推到台前。`,
    };
  }, [chart.palaces, currentYear, palaceByBranch]);

  const monthlyTransit = useMemo(() => {
    const branch = BRANCHES[(currentMonth - 1 + 12) % 12];
    const palace = palaceByBranch[branch] || chart.palaces[0];
    return {
      branch,
      palace,
      title: `${currentMonth} 月流月提醒`,
      subtitle: `本月更容易牵动 ${palace.name}`,
      note: `流月适合拿来做短节奏提醒：这个月更适合先顾 ${palace.focus}，把主线收回来，不要被枝节打散。`,
    };
  }, [chart.palaces, currentMonth, palaceByBranch]);

  const activeBranch =
    selectedView === "decade"
      ? activeDecade?.palaceBranch
      : selectedView === "yearly"
        ? yearlyTransit.branch
        : selectedView === "monthly"
          ? monthlyTransit.branch
          : undefined;

  const activeTransitPalace =
    selectedView === "yearly"
      ? yearlyTransit.palace
      : selectedView === "monthly"
        ? monthlyTransit.palace
        : null;

  const transitBanners = compact ? [] : [
    {
      key: "decade" as const,
      title: currentDecade ? `当前大运 · ${currentDecade.ageStart}-${currentDecade.ageEnd}岁` : "当前大运",
      subtitle: currentDecade ? `${currentDecade.palaceName} · ${currentDecade.decadeName}` : "查看十年主轴",
      note: currentDecade
        ? `这一轮十年主线先看 ${currentDecade.palaceName}，适合把长期发力点、事业节奏和财富累积方式放在一起看。`
        : "先看当前十年运势重心。",
      icon: Clock,
    },
    {
      key: "yearly" as const,
      title: yearlyTransit.title,
      subtitle: yearlyTransit.subtitle,
      note: yearlyTransit.note,
      icon: Calendar,
    },
    {
      key: "monthly" as const,
      title: monthlyTransit.title,
      subtitle: monthlyTransit.subtitle,
      note: monthlyTransit.note,
      icon: CalendarDays,
    },
  ];

  const copyParams = () => {
    const text = [
      `姓名：${chart.name}`,
      `生辰：${chart.birthLabel}`,
      `真太阳时：${chart.trueSolarTime}`,
      `年柱：${chart.yearPillar}`,
      `日柱：${chart.dayPillar}`,
      `命宫：${chart.mingPalace}`,
      `身宫：${chart.shenPalace}`,
      `五行局：${chart.elementBureau}`,
      `格局：${chart.patterns.join("、") || "待综合判定"}`,
    ].join("\n");
    navigator.clipboard?.writeText(text).catch(() => undefined);
  };
  const downloadPng = () => {
    const canvas = document.createElement("canvas");
    const size = 1600;
    const cell = size / 4;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = "#fbf3df";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "#b8924d";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, size - 20, size - 20);

    const drawText = (text: string, x: number, y: number, sizePx: number, color = "#2f261d", weight = "500") => {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${sizePx}px serif`;
      ctx.fillText(text, x, y);
    };

    chart.palaces.forEach((palace) => {
      const row = SQUARE_BRANCH_LAYOUT.findIndex((r) => r.includes(palace.branch));
      const col = SQUARE_BRANCH_LAYOUT[row]?.indexOf(palace.branch) ?? 0;
      const x = col * cell;
      const y = row * cell;
      ctx.strokeStyle = "#d8bd7b";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cell, cell);
      drawText(`${palace.name} ${palace.stem}${palace.branch}`, x + 28, y + 52, 30, "#8a5a16", "700");
      drawText(starText(palace.stars), x + 28, y + 108, 34, "#2d241d", "800");
      drawText(starText(palace.assistants), x + 28, y + 158, 22, "#6f6470");
      drawText(starText(palace.misc), x + 28, y + 198, 18, "#8a8071");
      drawText(palace.four.join("  "), x + 28, y + 248, 20, "#b45309", "700");
    });

    ctx.fillStyle = "#fffaf0";
    ctx.fillRect(cell, cell, cell * 2, cell * 2);
    ctx.strokeStyle = "#b8924d";
    ctx.strokeRect(cell, cell, cell * 2, cell * 2);
    drawText("R7 FORTUNE ZIWEI CHART", cell + 80, cell + 130, 30, "#9b6a1f", "800");
    drawText(chart.name, cell + 80, cell + 210, 58, "#2f261d", "900");
    drawText(chart.birthLabel, cell + 80, cell + 280, 26, "#6f6470");
    drawText(`真太阳时 ${chart.trueSolarTime} · ${chart.elementBureau}`, cell + 80, cell + 330, 26, "#6f6470");
    drawText(`命宫 ${chart.mingPalace}  身宫 ${chart.shenPalace}`, cell + 80, cell + 410, 28, "#2f261d", "700");
    drawText(`格局 ${chart.patterns.join("、") || "待综合判定"}`, cell + 80, cell + 470, 26, "#8a5a16", "700");
    drawText("本内容为传统文化研究参考，不构成人生决策唯一依据。", cell + 80, cell + 620, 20, "#8a8071");

    const link = document.createElement("a");
    link.download = `r7-ziwei-chart-${chart.name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <section className="rounded-2xl p-4 sm:p-5 border border-[#d4a85325] bg-white/80 shadow-[0_4px_24px_rgba(212,168,83,0.06)]">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a85340] bg-[#faf3e0] px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-[#8a5a16]">
            <Crown className="h-3.5 w-3.5 text-[#b8860b]" />
            东方传统性格分析 · 免费命盘
          </div>
          <h2 className="font-display mt-3 text-2xl sm:text-3xl font-bold text-[#2f261d]">
            {chart.name} · 紫微十二宫盘
          </h2>
          <p className="mt-1 text-xs text-[#6f6470]">{chart.birthLabel} · 真太阳时 {chart.trueSolarTime} · {chart.yearPillar}年 · {chart.dayPillar}日</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["命宫", chart.mingPalace],
            ["身宫", chart.shenPalace],
            ["五行局", chart.elementBureau],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#d4a85325] bg-[#faf3e0] px-3 py-2">
              <p className="text-[10px] text-[#8a5a16]/70">{label}</p>
              <p className="mt-1 text-xs font-bold text-[#8a5a16]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 大运选择栏 — 参考文墨天机 */}
      {!compact && chart.decades && chart.decades.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-3.5 w-3.5 text-[#b8860b]" />
            <span className="text-[11px] font-bold text-[#2f261d]">大限（十年运）</span>
            <span className="text-[9px] text-[#8a8071]">
              {chart.gender === "female" ? "女命" : "男命"} · {decadeDirection === 1 ? "顺行" : "逆行"} · 起运 {chart.decades[0]?.ageStart}岁
            </span>
            {selectedDecade !== null && (
              <button
                onClick={() => setSelectedDecade(null)}
                className="ml-auto rounded-full border border-[#d4a85340] px-2 py-0.5 text-[9px] text-[#8a5a16] hover:text-[#5c3d0e] hover:border-[#d4a85380] transition-colors"
              >
                返回本命盘
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {/* 本命盘按钮 */}
            <button
              onClick={() => {
                setSelectedDecade(null);
                setSelectedView("natal");
              }}
              className={`flex-shrink-0 rounded-lg px-3 py-2 text-center transition-all ${
                selectedView === "natal"
                  ? "bg-[#d4a853] text-white border border-[#d4a853] shadow-[0_2px_8px_rgba(212,168,83,0.35)]"
                  : "bg-[#faf3e0] text-[#8a5a16] border border-[#d4a85325] hover:border-[#d4a85350] hover:bg-[#f5ebd5]"
              }`}
            >
              <p className="text-[10px] font-bold">本命盘</p>
              <p className="text-[8px] opacity-60">先天</p>
            </button>
            {/* 大限按钮 */}
            {chart.decades.map((decade) => (
              <button
                key={decade.index}
                onClick={() => {
                  setSelectedDecade(decade.index);
                  setSelectedView("decade");
                }}
                className={`flex-shrink-0 rounded-lg px-3 py-2 text-center transition-all ${
                  selectedView === "decade" && selectedDecade === decade.index
                    ? "bg-[#d4a853] text-white border border-[#d4a853] shadow-[0_2px_8px_rgba(212,168,83,0.35)]"
                    : decade.isCurrent
                    ? "bg-[#fef3c7] text-[#8a5a16] border border-[#f59e0b] animate-pulse"
                    : "bg-[#faf3e0] text-[#8a5a16] border border-[#d4a85325] hover:border-[#d4a85350] hover:bg-[#f5ebd5]"
                }`}
              >
                <p className="text-[10px] font-bold">{decade.ageStart}-{decade.ageEnd}岁</p>
                <p className="text-[8px] opacity-60">{decade.palaceBranch}宫 · {decade.decadeName}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[#d4a85330] bg-[#faf5eb] p-2 sm:p-3">
        <div id="ziwei-chart-board" className="mx-auto grid min-w-[760px] max-w-[980px] grid-cols-4 overflow-hidden rounded-xl border-2 border-[#b8924d] bg-[#b8924d]">
          {SQUARE_BRANCH_LAYOUT.flatMap((row, rowIndex) =>
            row.map((branch, colIndex) => {
              if (branch === "center") {
                if (rowIndex === 1 && colIndex === 1) {
                  return (
                    <div key="center" className="col-span-2 row-span-2 flex min-h-[304px] flex-col justify-center border border-[#b8924d55] bg-[#fbf3df] p-5 text-center text-[#2f261d]">
                      {selectedView === "decade" && activeDecade ? (
                        <>
                          <p className="text-[10px] font-bold tracking-[0.22em] text-[#d4a853]">大限·{activeDecade.decadeName}</p>
                          <h3 className="mt-2 font-display text-xl font-black text-[#2f261d]">{activeDecade.ageStart}-{activeDecade.ageEnd}岁</h3>
                          <p className="mt-1 text-xs text-[#6f6470]">{activeDecade.stem}{activeDecade.palaceBranch}宫 · {activeDecade.palaceName}</p>
                          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                            {activeDecade.fourTransformations.map((four) => (
                              <span key={four} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${decadeFourClass(four)}`}>
                                {four}
                              </span>
                            ))}
                          </div>
                          <p className="mt-3 text-[9px] text-[#8a8071] leading-relaxed">
                            大限天干{activeDecade.stem}引动四化，叠加在本命星盘上，影响这十年的运势重心。
                          </p>
                        </>
                      ) : selectedView === "yearly" && activeTransitPalace ? (
                        <>
                          <p className="text-[10px] font-bold tracking-[0.22em] text-[#d4a853]">流年焦点</p>
                          <h3 className="mt-2 font-display text-xl font-black text-[#2f261d]">{currentYear} 年</h3>
                          <p className="mt-1 text-xs text-[#6f6470]">{activeTransitPalace.name} · {activeTransitPalace.stem}{activeTransitPalace.branch}</p>
                          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                            {(activeTransitPalace.four.length ? activeTransitPalace.four : ["先看本命主宫"]).map((item) => (
                              <span key={item} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${fourClass(item)}`}>
                                {item}
                              </span>
                            ))}
                          </div>
                          <p className="mt-3 text-[9px] leading-relaxed text-[#8a8071]">
                            {yearlyTransit.note}
                          </p>
                        </>
                      ) : selectedView === "monthly" && activeTransitPalace ? (
                        <>
                          <p className="text-[10px] font-bold tracking-[0.22em] text-[#d4a853]">流月提醒</p>
                          <h3 className="mt-2 font-display text-xl font-black text-[#2f261d]">{currentMonth} 月</h3>
                          <p className="mt-1 text-xs text-[#6f6470]">{activeTransitPalace.name} · {activeTransitPalace.stem}{activeTransitPalace.branch}</p>
                          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                            {(activeTransitPalace.four.length ? activeTransitPalace.four : ["短节奏观察"]).map((item) => (
                              <span key={item} className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${fourClass(item)}`}>
                                {item}
                              </span>
                            ))}
                          </div>
                          <p className="mt-3 text-[9px] leading-relaxed text-[#8a8071]">
                            {monthlyTransit.note}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] font-bold tracking-[0.22em] text-[#9b6a1f]">R7 FORTUNE ZIWEI PANEL</p>
                          <h3 className="mt-3 font-display text-2xl font-black">{chart.name}</h3>
                          <p className="mt-2 text-xs text-[#6f6470]">{chart.birthLabel}</p>
                          <p className="mt-1 text-xs text-[#6f6470]">真太阳时 {chart.trueSolarTime} · {chart.elementBureau}</p>
                          <div className="mt-4 grid grid-cols-2 gap-2 text-left text-[11px]">
                            <span className="rounded-lg border border-[#d8bd7b88] bg-white/50 px-2 py-1">命宫：{chart.mingPalace}</span>
                            <span className="rounded-lg border border-[#d8bd7b88] bg-white/50 px-2 py-1">身宫：{chart.shenPalace}</span>
                            <span className="rounded-lg border border-[#d8bd7b88] bg-white/50 px-2 py-1">年柱：{chart.yearPillar}</span>
                            <span className="rounded-lg border border-[#d8bd7b88] bg-white/50 px-2 py-1">日柱：{chart.dayPillar}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                            {(chart.patterns.length ? chart.patterns : ["格局待综合判定"]).map((pattern) => (
                              <span key={pattern} className="rounded-full bg-[#2b2118] px-2 py-1 text-[10px] font-bold text-[#f7dca1]">{pattern}</span>
                            ))}
                          </div>
                          <p className="mt-3 text-[9px] leading-relaxed text-[#8a8071]">
                            下方可切换查看当前大运、流年焦点与流月提醒，盘面高亮会跟着同步变化。
                          </p>
                        </>
                      )}
                      {!compact && (
                        <div className="mt-4 flex justify-center gap-2">
                          <button onClick={copyParams} className="inline-flex items-center gap-1 rounded-full border border-[#b8924d55] bg-[#fffaf0] px-3 py-1.5 text-[11px] font-bold text-[#7a5219] hover:bg-[#f5ebd5] transition-colors">
                            <Copy className="h-3.5 w-3.5" /> 复制参数
                          </button>
                          <button onClick={downloadPng} className="inline-flex items-center gap-1 rounded-full border border-[#b8924d55] bg-[#fffaf0] px-3 py-1.5 text-[11px] font-bold text-[#7a5219] hover:bg-[#f5ebd5] transition-colors">
                            <Download className="h-3.5 w-3.5" /> 导出PNG
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
                return [];
              }
              const palace = palaceByBranch[branch];
              if (!palace) return null;
              return (
                <PalaceCell
                  key={branch}
                  palace={palace}
                  decadeHighlight={activeBranch === branch}
                  decadeName={selectedView === "decade" ? decadeNameMap[branch] : undefined}
                  decadeFour={selectedView === "decade" ? decadeFourMap[branch] : undefined}
                />
              );
            })
          )}
        </div>
      </div>

      {!compact && (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {transitBanners.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === selectedView || (item.key === "decade" && selectedView === "decade");
            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.key === "decade" && currentDecade) {
                    setSelectedDecade(currentDecade.index);
                  } else if (item.key !== "decade") {
                    setSelectedDecade(null);
                  }
                  setSelectedView(item.key);
                }}
                className={`group rounded-2xl border p-4 text-left transition-all ${
                  isActive
                    ? "border-[#d4a853] bg-gradient-to-br from-[#fff7e8] to-[#f9edd2] shadow-[0_12px_30px_rgba(212,168,83,0.18)]"
                    : "border-[#d4a85325] bg-[#faf3e0] hover:border-[#d4a85355] hover:shadow-[0_10px_24px_rgba(212,168,83,0.08)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border ${
                    isActive ? "border-[#d4a85355] bg-[#d4a85314]" : "border-[#d4a85322] bg-white/60"
                  }`}>
                    <Icon className="h-4 w-4 text-[#b8860b]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#b8860b]/80">
                      {item.key === "decade" ? "Fortune Cycle" : item.key === "yearly" ? "Annual Focus" : "Monthly Focus"}
                      </p>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        isActive
                          ? "bg-[#2b2118] text-[#f7dca1]"
                          : "border border-[#d4a85328] bg-white/60 text-[#8a5a16]"
                      }`}>
                        {isActive ? "查看中" : "点击切换"}
                      </span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-[#2f261d] sm:text-[15px]">{item.title}</h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#6f6470]">{item.subtitle}</p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-[#7a6b55]">{item.note}</p>
              </button>
            );
          })}
        </div>
      )}

      {!compact && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: "命盘核心", body: chart.summary },
            { icon: Target, title: "参数追溯", body: chart.timeTrace.join("；") },
            { icon: HeartHandshake, title: "合规说明", body: "本工具为东方传统性格分析与人生规划参考，不构成人生决策唯一依据。" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-[#d4a85325] bg-[#faf3e0] p-3">
              <item.icon className="h-4 w-4 text-[#b8860b]" />
              <h3 className="mt-2 text-xs font-bold text-[#2f261d]">{item.title}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#6f6470]">{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function ZiweiSynastryPanel({ chartA, chartB, result }: { chartA: ZiweiChart; chartB: ZiweiChart; result: ZiweiSynastry }) {
  return (
    <section className="rounded-2xl p-4 sm:p-5 border border-[#e56b6f25] bg-white/80 shadow-[0_4px_24px_rgba(229,107,111,0.06)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e56b6f30] bg-[#fef2f2] px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-[#c0392b]">
            <HeartHandshake className="h-3.5 w-3.5" />
            紫微斗数双人合盘
          </div>
          <h2 className="font-display mt-3 text-2xl font-bold text-[#2f261d]">
            {chartA.name} × {chartB.name}
          </h2>
          <p className="mt-1 text-xs text-[#6f6470]">{chartA.mainStar}坐命 × {chartB.mainStar}坐命 · {result.label}</p>
        </div>
        <div className="rounded-2xl border border-[#e56b6f20] bg-[#fff5f5] px-5 py-4 text-center">
          <p className="text-[10px] tracking-[0.16em] text-[#b91c1c]/60">合盘指数</p>
          <p className="font-display text-4xl font-bold text-[#b8860b]">{result.score}</p>
          <p className="text-[10px] text-[#b91c1c]/50">/100</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ZiweiDoushuPanel chart={chartA} compact />
        <ZiweiDoushuPanel chart={chartB} compact />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ["吸引力", result.chemistry],
          ["磨合点", result.risk],
          ["行动建议", result.advice],
        ].map(([title, body]) => (
          <div key={title} className="rounded-xl border border-[#d4a85320] bg-[#faf3e0] p-3">
            <h3 className="text-xs font-bold text-[#b8860b]">{title}</h3>
            <p className="mt-2 text-[11px] leading-relaxed text-[#6f6470]">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

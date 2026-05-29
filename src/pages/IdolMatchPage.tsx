import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { ALL_ARTISTS, getArtistById, ZODIAC_EMOJIS } from "@/data/artists";
import { calculateCompatibility, generateCosmicAnswer, RELATION_CONFIG } from "@/lib/compatibility-algo";
import type { CompatibilityCalcResult } from "@/lib/compatibility-algo";
import ConnectionMap from "@/components/ConnectionMap";
import type { ConnectionNode } from "@/components/ConnectionMap";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "@/components/CustomerService";
import { Sparkles, Heart, Loader2, Search, Star, ChevronRight, Users, X, ArrowLeft } from "lucide-react";

const MANSION_OPTIONS = ["角宿","亢宿","氐宿","房宿","心宿","尾宿","箕宿","斗宿","牛宿","女宿","虚宿","危宿","室宿","壁宿","奎宿","娄宿","胃宿","昴宿","毕宿","觜宿","参宿","井宿","鬼宿","柳宿","星宿","张宿","翼宿","轸宿"];

type Step = "input" | "loading" | "results";

export default function IdolMatchPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupParam = searchParams.get("group") || "";

  const [step, setStep] = useState<Step>("input");
  const [dayPillar, setDayPillar] = useState("");
  const [starMansion, setStarMansion] = useState("角宿");
  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    if (groupParam) {
      return ALL_ARTISTS.filter(a => a.groupName === groupParam).map(a => a.id);
    }
    return [];
  });
  const [results, setResults] = useState<Array<{ artistId: number; calc: CompatibilityCalcResult }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<ConnectionNode | null>(null);
  const [userName] = useState(() => localStorage.getItem("r7_profile") ? JSON.parse(localStorage.getItem("r7_profile")!).name || "You" : "You");

  // Filter artists for selection
  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return ALL_ARTISTS.slice(0, 50);
    const q = searchQuery.toLowerCase();
    return ALL_ARTISTS.filter(a =>
      a.stageName.toLowerCase().includes(q) ||
      a.name.includes(q) ||
      a.groupName.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [searchQuery]);

  const toggleArtist = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleMatch = () => {
    if (!dayPillar || selectedIds.length === 0) return;
    setStep("loading");

    setTimeout(() => {
      const calcResults = selectedIds.map(id => {
        const artist = getArtistById(id);
        if (!artist) return null;
        const calc = calculateCompatibility(
          "2000-01-01", // placeholder — real impl uses actual user birth
          artist.birthDate,
          undefined,
          dayPillar,
          artist.baziDayPillar,
          starMansion,
          artist.starMansion,
        );
        return { artistId: id, calc };
      }).filter(Boolean) as Array<{ artistId: number; calc: CompatibilityCalcResult }>;

      calcResults.sort((a, b) => b.calc.overallScore - a.calc.overallScore);
      setResults(calcResults);
      setStep("results");
    }, 1500);
  };

  // Build connection nodes from results
  const connectionNodes: ConnectionNode[] = useMemo(() => results.map(r => {
    const artist = getArtistById(r.artistId);
    return {
      id: r.artistId,
      name: artist?.name || "",
      stageName: artist?.stageName || "",
      groupName: artist?.groupName || "",
      zodiacSign: artist?.zodiacSign || "",
      mbti: artist?.mbti || "",
      element: artist?.element || "",
      relationTag: r.calc.overallTag.tag,
      score: r.calc.overallScore,
    };
  }), [results]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFB6C110] border border-[#FFB6C120] rounded-full mb-4">
              <Heart className="w-3 h-3 text-[#FFB6C1]" />
              <span className="text-[10px] text-[#FFB6C1] uppercase tracking-wider">{locale === "zh" ? "偶像配对合盘" : "Idol Match"}</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-[#f0e6d3]">
              {locale === "zh" ? "宇宙连线 · 缘分匹配" : "Cosmic Connection"}
            </h1>
            <p className="mt-2 text-sm text-[#8a8aad]">
              {locale === "zh" ? "输入你的四柱信息，选择爱豆，探索宇宙级缘分" : "Enter your Saju info, pick your idols, discover cosmic bonds"}
            </p>
          </div>

          {/* Step 1: Input */}
          {step === "input" && (
            <div className="space-y-6 animate-fade-in">
              {/* User info form */}
              <div className="glass rounded-xl p-5 border border-[#d4a85315]">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4a853]" />
                  {locale === "zh" ? "你的出生信息" : "Your Birth Info"}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#8a8aad] mb-1">{locale === "zh" ? "八字日柱" : "Bazi Day Pillar"} *</label>
                    <input type="text" value={dayPillar} onChange={e => setDayPillar(e.target.value)}
                      placeholder={locale === "zh" ? "如：甲子" : "e.g. 甲子"}
                      className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85366]" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8a8aad] mb-1">{locale === "zh" ? "本命星宿" : "Star Mansion"} *</label>
                    <select value={starMansion} onChange={e => setStarMansion(e.target.value)}
                      className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366] appearance-none cursor-pointer">
                      {MANSION_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Artist selection */}
              <div className="glass rounded-xl p-5 border border-[#d4a85315]">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#d4a853]" />
                  {locale === "zh" ? `选择爱豆 (已选 ${selectedIds.length})` : `Select Idols (${selectedIds.length} selected)`}
                </h3>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8aad44]" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder={locale === "zh" ? "搜索艺人姓名..." : "Search artist name..."}
                    className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85366]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {filteredArtists.map(a => {
                    const sel = selectedIds.includes(a.id);
                    return (
                      <button key={a.id} onClick={() => toggleArtist(a.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs border transition-all ${
                          sel ? "border-[#FFB6C1] bg-[#FFB6C108]" : "border-[#d4a85306] hover:border-[#d4a85315]"
                        }`}>
                        <span className="text-sm">{ZODIAC_EMOJIS[a.zodiacSign] || "✨"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#f0e6d3] truncate">{a.stageName}</p>
                          <p className="text-[9px] text-[#8a8aad44] truncate">{a.groupName}</p>
                        </div>
                        {sel && <span className="text-[#FFB6C1] text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button onClick={handleMatch} disabled={!dayPillar || selectedIds.length === 0}
                className="w-full py-4 bg-gradient-to-r from-[#FFB6C1] to-[#FF8FA8] text-[#0a0a0f] rounded-xl text-sm font-bold hover:from-[#FFC4CF] hover:to-[#FFA0B5] transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                {locale === "zh" ? `开始合盘测算 (${selectedIds.length} 位爱豆)` : `Start Matching (${selectedIds.length} idols)`}
              </button>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="relative">
                <Heart className="w-16 h-16 text-[#FFB6C1] animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#f0e6d3] animate-spin" />
                </div>
              </div>
              <p className="mt-6 text-sm text-[#f0e6d3] font-medium">
                {locale === "zh" ? "正在计算星盘合盘中..." : "Calculating cosmic compatibility..."}
              </p>
              <p className="mt-1 text-xs text-[#8a8aad44]">
                {locale === "zh" ? "四柱五行 × 星宿关系 × 西式星盘" : "Saju × Star Mansions × Western Synastry"}
              </p>
            </div>
          )}

          {/* Step 3: Results */}
          {step === "results" && (
            <div className="space-y-6 animate-fade-in">
              <button onClick={() => { setStep("input"); setResults([]); }}
                className="flex items-center gap-1 text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                {locale === "zh" ? "返回重选" : "Back to selection"}
              </button>

              {/* Connection Map */}
              <div className="glass rounded-2xl p-4 border border-[#d4a85315]">
                <h3 className="text-sm font-semibold text-[#f0e6d3] mb-4 text-center">
                  {locale === "zh" ? "缘分关系图谱" : "Connection Map"}
                </h3>
                <ConnectionMap
                  userName={userName}
                  userElement={dayPillar ? dayPillar[0] : "?"}
                  userZodiac={starMansion}
                  nodes={connectionNodes}
                  onNodeClick={setSelectedNode}
                />
              </div>

              {/* Results list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map(r => {
                  const artist = getArtistById(r.artistId);
                  if (!artist) return null;
                  const cfg = RELATION_CONFIG[r.calc.overallTag.tag];
                  const cosmicAnswer = generateCosmicAnswer(
                    userName, artist.stageName,
                    dayPillar?.[0] || "?", artist.element,
                    starMansion, artist.starMansion,
                    r.calc.overallTag.tag, r.calc.starMansionRelation,
                    locale as "zh" | "en"
                  );

                  return (
                    <div key={r.artistId}
                      className="glass rounded-xl p-4 border hover:border-[#d4a85320] transition-all cursor-pointer"
                      onClick={() => setSelectedNode(connectionNodes.find(n => n.id === r.artistId) || null)}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{ZODIAC_EMOJIS[artist.zodiacSign] || "✨"}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#f0e6d3]">{artist.stageName}</p>
                          <p className="text-[9px] text-[#8a8aad44]">{artist.groupName} · {artist.zodiacSign} · {artist.mbti}</p>
                        </div>
                        <div className="text-right">
                          <span style={{ color: cfg?.color }} className="text-lg">{cfg?.emoji}</span>
                          <p className="text-lg font-bold" style={{ color: cfg?.color }}>{r.calc.overallScore}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${r.calc.overallScore}%`, background: cfg?.color }} />
                        </div>
                        <span className="text-[10px] font-medium" style={{ color: cfg?.color }}>{cfg?.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Node detail modal */}
              {selectedNode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedNode(null)}>
                  <div className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm" />
                  <div className="relative glass rounded-2xl p-6 max-w-md w-full border border-[#d4a85320] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 text-[#8a8aad] hover:text-[#f0e6d3]">
                      <X className="w-4 h-4" />
                    </button>
                    {(() => {
                      const r = results.find(r => r.artistId === selectedNode.id);
                      const artist = getArtistById(selectedNode.id);
                      if (!r || !artist) return null;
                      const cfg = RELATION_CONFIG[r.calc.overallTag.tag];
                      const cosmicAnswer = generateCosmicAnswer(
                        userName, artist.stageName,
                        dayPillar?.[0] || "?", artist.element,
                        starMansion, artist.starMansion,
                        r.calc.overallTag.tag, r.calc.starMansionRelation,
                        locale as "zh" | "en"
                      );
                      return (
                        <div className="space-y-4">
                          <div className="text-center">
                            <span className="text-4xl">{ZODIAC_EMOJIS[artist.zodiacSign] || "✨"}</span>
                            <h3 className="text-lg font-display font-bold text-[#f0e6d3] mt-2">{artist.stageName}</h3>
                            <p className="text-xs text-[#8a8aad]">{artist.groupName}</p>
                          </div>
                          <div className="text-center">
                            <span className="text-3xl">{cfg?.emoji}</span>
                            <p className="text-2xl font-bold mt-1" style={{ color: cfg?.color }}>{r.calc.overallScore}</p>
                            <p className="text-sm font-semibold" style={{ color: cfg?.color }}>{cfg?.label}</p>
                          </div>
                          <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#d4a85306]">
                            <p className="text-xs text-[#8a8aad] leading-relaxed">
                              <span className="text-[#d4a853] font-semibold">{locale === "zh" ? "宇宙答案" : "Cosmic Answer"}: </span>
                              {cosmicAnswer}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-[#0a0a0f] rounded-lg p-2">
                              <p className="text-[8px] text-[#8a8aad44]">{locale === "zh" ? "星盘" : "Synastry"}</p>
                              <p className="text-sm font-bold text-[#f0e6d3]">{r.calc.synastry.score}</p>
                            </div>
                            <div className="bg-[#0a0a0f] rounded-lg p-2">
                              <p className="text-[8px] text-[#8a8aad44]">{locale === "zh" ? "五行" : "Bazi"}</p>
                              <p className="text-sm font-bold text-[#f0e6d3]">{r.calc.bazi.score}</p>
                            </div>
                            <div className="bg-[#0a0a0f] rounded-lg p-2">
                              <p className="text-[8px] text-[#8a8aad44]">{locale === "zh" ? "星宿" : "Mansion"}</p>
                              <p className="text-xs font-bold text-[#d4a853]">{r.calc.starMansionRelation}</p>
                            </div>
                          </div>
                          <button onClick={() => navigate(`/artist/${artist.id}`)}
                            className="w-full py-2.5 glass rounded-lg text-xs text-[#d4a853] border border-[#d4a85315] hover:border-[#d4a85340] transition-colors flex items-center justify-center gap-1">
                            {locale === "zh" ? "查看完整档案" : "View Full Profile"}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

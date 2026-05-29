import { useState } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "@/components/CustomerService";
import {
  Heart, Sparkles, Search, Crown,
  Star, Users,
  ChevronRight, Lock
} from "lucide-react";

const RELATION_TAGS = [
  { key: "all", label: "全部", color: "text-[#d4a853] bg-[#d4a85308] border-[#d4a85315]" },
  { key: "soulmate", label: "Soulmate", color: "text-pink-400 bg-pink-400/8 border-pink-400/20" },
  { key: "deep_trust", label: "Deep Trust", color: "text-blue-400 bg-blue-400/8 border-blue-400/20" },
  { key: "good_vibes", label: "Good Vibes", color: "text-green-400 bg-green-400/8 border-green-400/20" },
  { key: "best_friends", label: "Best Friends", color: "text-amber-400 bg-amber-400/8 border-amber-400/20" },
  { key: "tension", label: "Tension", color: "text-orange-400 bg-orange-400/8 border-orange-400/20" },
  { key: "rivals", label: "Rivals", color: "text-red-400 bg-red-400/8 border-red-400/20" },
];

export default function IdolCompatibilityPage() {
  const { t: _t } = useI18n();
  const navigate = useNavigate();

  // User birth info
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [dayPillar, setDayPillar] = useState("");
  const [starMansion, setStarMansion] = useState("角宿");
  const [step, setStep] = useState<"input" | "loading" | "results">("input");
  const [activeTag, setActiveTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showZiweiModal, setShowZiweiModal] = useState(false);

  // Batch calculate mutation
  const batchCalc = trpc.idolCompatibility.batchCalculate.useMutation({
    onSuccess: () => setStep("results"),
  });

  // Idol list (pre-load for crawler data)
  trpc.idolCompatibility.listIdols.useQuery({ limit: 200 });

  const handleGenerate = () => {
    if (!birthDate || !dayPillar) return;
    setStep("loading");
    batchCalc.mutate({
      userBirthDate: birthDate,
      userBirthTime: birthTime || undefined,
      userBirthPlace: birthPlace || undefined,
      userDayPillar: dayPillar,
      userStarMansion: starMansion,
    });
  };

  const results = batchCalc.data?.results || [];
  const filteredResults = activeTag === "all"
    ? results
    : results.filter(r => r.relationTag === activeTag);

  const searchedResults = searchQuery
    ? filteredResults.filter(r =>
        r.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.artistGroup || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredResults;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#d4a85310] border border-[#d4a85320] rounded-full mb-4">
              <Heart className="w-3 h-3 text-[#d4a853]" />
              <span className="text-[10px] text-[#d4a853] uppercase tracking-wider">Idol Compatibility</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#f0e6d3]">
              爱豆合盘专区
            </h1>
            <p className="mt-2 text-sm text-[#8a8aad]">
              输入你的生日，探索与数百位爱豆的星盘缘分
            </p>
          </div>

          {/* Ziwei Premium Entry */}
          <button
            onClick={() => setShowZiweiModal(true)}
            className="w-full mb-6 p-4 glass rounded-xl border border-[#d4a85315] hover:border-[#d4a85330] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a85320] to-[#1a1a2e] flex items-center justify-center border border-[#d4a85315]">
                <Crown className="w-5 h-5 text-[#d4a853]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#f0e6d3] group-hover:text-[#d4a853] transition-colors">
                  紫微斗数深度合盘
                </div>
                <div className="text-[10px] text-[#8a8aad]">Premium · 付费功能 · 更精准的四化飞星分析</div>
              </div>
            </div>
            <Lock className="w-4 h-4 text-[#d4a85355]" />
          </button>

          {/* Step 1: Input Form */}
          {step === "input" && (
            <div className="glass rounded-2xl p-6 sm:p-8 border border-[#d4a85308] max-w-lg mx-auto">
              <h2 className="text-lg font-semibold text-[#f0e6d3] mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d4a853]" />
                你的出生信息
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#8a8aad] mb-1.5">出生日期 <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[#d4a85333] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85388]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8a8aad] mb-1.5">出生时间（选填，默认12:00）</label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[#d4a85333] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85388]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8a8aad] mb-1.5">出生地（选填）</label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="如：北京市"
                    className="w-full bg-[#0a0a0f] border border-[#d4a85333] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad55] focus:outline-none focus:border-[#d4a85388]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8a8aad] mb-1.5">八字日柱 <span className="text-red-400">*</span> <span className="text-[#8a8aad44]">（如：甲子）</span></label>
                  <input
                    type="text"
                    value={dayPillar}
                    onChange={(e) => setDayPillar(e.target.value)}
                    placeholder="输入你的八字日柱"
                    className="w-full bg-[#0a0a0f] border border-[#d4a85333] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad55] focus:outline-none focus:border-[#d4a85388]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8a8aad] mb-1.5">本命星宿</label>
                  <select
                    value={starMansion}
                    onChange={(e) => setStarMansion(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[#d4a85333] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85388]"
                  >
                    {["角","亢","氐","房","心","尾","箕","斗","牛","女","虚","危","室","壁","奎","娄","胃","昴","毕","觜","参","井","鬼","柳","星","张","翼","轸"].map(m => (
                      <option key={m} value={`${m}宿`}>{m}宿</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!birthDate || !dayPillar}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] rounded-lg text-sm font-bold hover:from-[#e0b860] hover:to-[#d4a853] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  生成爱豆合盘
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-[#d4a85322] border-t-[#d4a853] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[#d4a853] animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-[#d4a853] font-medium">正在计算星盘合盘中...</p>
              <p className="text-xs text-[#8a8aad] mt-1">西方星盘 × 四柱五行 × 星宿关系</p>
            </div>
          )}

          {/* Step 3: Results */}
          {step === "results" && (
            <div>
              {/* User info summary */}
              <div className="glass rounded-xl p-4 mb-6 border border-[#d4a85308] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#d4a85310] flex items-center justify-center border border-[#d4a85315]">
                    <Users className="w-5 h-5 text-[#d4a853]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8a8aad]">你的日柱：{dayPillar} · 星宿：{starMansion}</p>
                    <p className="text-[10px] text-[#8a8aad44]">{birthDate} {birthTime || "12:00"} {birthPlace}</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep("input")}
                  className="text-xs text-[#d4a853] hover:text-[#e0b860] transition-colors"
                >
                  修改
                </button>
              </div>

              {/* Search + Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8aad33]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索爱豆或团体..."
                    className="w-full bg-[#0a0a0f] border border-[#d4a85322] rounded-lg pl-10 pr-4 py-2 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#d4a85355]"
                  />
                </div>
              </div>

              {/* Relation Tag Filters */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {RELATION_TAGS.map(tag => (
                  <button
                    key={tag.key}
                    onClick={() => setActiveTag(tag.key)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all ${
                      activeTag === tag.key ? tag.color + " ring-1 ring-current" : "text-[#8a8aad55] bg-[#0a0a0f] border-[#d4a85308] hover:border-[#d4a85315]"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* Results Count */}
              <p className="text-xs text-[#8a8aad] mb-4">
                共 {searchedResults.length} 位匹配结果
                {activeTag !== "all" && ` · 已筛选 "${RELATION_TAGS.find(t => t.key === activeTag)?.label}"`}
              </p>

              {/* Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchedResults.map((result) => (
                  <button
                    key={result.artistId}
                    onClick={() => navigate(`/idol-compatibility/${result.artistId}`, {
                      state: { userBirth: birthDate, userTime: birthTime, userPlace: birthPlace, userPillar: dayPillar, userMansion: starMansion, result }
                    })}
                    className="glass rounded-xl p-4 border border-[#d4a85306] hover:border-[#d4a85320] transition-all text-left group"
                  >
                    {/* Top: Avatar + Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4a85320] to-[#1a1a2e] flex items-center justify-center text-lg border border-[#d4a85315] flex-shrink-0 overflow-hidden">
                        {result.artistAvatar ? (
                          <img src={result.artistAvatar} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <Star className="w-5 h-5 text-[#d4a853]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#f0e6d3] truncate group-hover:text-[#d4a853] transition-colors">
                          {result.artistName}
                        </p>
                        <p className="text-[10px] text-[#8a8aad44]">{result.artistGroup}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8a8aad11] group-hover:text-[#d4a853] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>

                    {/* Score Bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#8a8aad]">缘分指数</span>
                        <span className="text-xs font-bold text-[#d4a853]">{result.overallScore}</span>
                      </div>
                      <div className="h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${result.overallScore}%`,
                            background: result.overallScore >= 70
                              ? "linear-gradient(90deg, #d4a853, #e8c866)"
                              : result.overallScore >= 45
                              ? "linear-gradient(90deg, #8a8aad, #d4a853)"
                              : "linear-gradient(90deg, #8a8aad44, #8a8aad)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Tags Row */}
                    <div className="flex flex-wrap gap-1">
                      {/* Relation Tag */}
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                        RELATION_TAGS.find(t => t.key === result.relationTag)?.color || "text-[#8a8aad55]"
                      }`}>
                        {result.relationLabel}
                      </span>
                      {/* Star Mansion */}
                      <span className="px-1.5 py-0.5 rounded text-[9px] text-[#d4a85355] bg-[#d4a85306] border border-[#d4a85310]">
                        {result.starMansionRelation}
                      </span>
                      {/* Element */}
                      <span className="px-1.5 py-0.5 rounded text-[9px] text-[#8a8aad33] bg-[#0a0a0f] border border-[#d4a85306]">
                        {result.artistElement}
                      </span>
                      {/* Synastry Score */}
                      <span className="px-1.5 py-0.5 rounded text-[9px] text-[#8a8aad33]">
                        星盘 {result.synastryScore}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {searchedResults.length === 0 && (
                <div className="text-center py-16">
                  <Heart className="w-8 h-8 mx-auto mb-3 text-[#8a8aad11]" />
                  <p className="text-sm text-[#8a8aad]">该筛选条件下无匹配结果</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CustomerService />

      {/* Ziwei Modal */}
      {showZiweiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/80 backdrop-blur-sm p-4" onClick={() => setShowZiweiModal(false)}>
          <div className="glass rounded-2xl p-6 max-w-sm w-full border border-[#d4a85322]" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#d4a85310] flex items-center justify-center mx-auto mb-4 border border-[#d4a85315]">
                <Crown className="w-7 h-7 text-[#d4a853]" />
              </div>
              <h3 className="text-lg font-semibold text-[#f0e6d3] mb-2">紫微斗数深度合盘</h3>
              <p className="text-sm text-[#8a8aad] mb-1">Premium 付费功能</p>
              <p className="text-xs text-[#8a8aad44] mb-6">
                四化飞星 · 命宫对宫 · 大限流年 · 精准合盘分析
              </p>
              <div className="p-3 bg-[#d4a85306] rounded-lg border border-[#d4a85310] mb-4">
                <p className="text-xs text-[#d4a853]">即将上线，敬请期待</p>
              </div>
              <button
                onClick={() => setShowZiweiModal(false)}
                className="w-full py-2.5 bg-[#d4a853] text-[#0a0a0f] rounded-lg text-sm font-bold hover:bg-[#e0b860] transition-colors"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

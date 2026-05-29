import { useParams, useLocation, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "@/components/CustomerService";
import {
  Heart, Star, ArrowLeft, Sparkles, Lock, Crown,
  Flame, Droplets, Mountain, Wind, Loader2
} from "lucide-react";

const ELEMENT_CONFIG: Record<string, { icon: typeof Flame; color: string; label: string }> = {
  "火": { icon: Flame, color: "text-red-400", label: "火" },
  "水": { icon: Droplets, color: "text-blue-400", label: "水" },
  "木": { icon: Wind, color: "text-green-400", label: "木" },
  "金": { icon: Star, color: "text-yellow-400", label: "金" },
  "土": { icon: Mountain, color: "text-amber-600", label: "土" },
};

const MANSION_RELATIONS: Record<string, { label: string; desc: string; color: string }> = {
  "安坏": { label: "安坏", desc: "一方安稳一方破坏，激情与冲突并存", color: "text-red-400" },
  "荣亲": { label: "荣亲", desc: "荣耀与亲密，彼此滋养的荣贵关系", color: "text-pink-400" },
  "友衰": { label: "友衰", desc: "朋友般轻松，也有疏离之感", color: "text-blue-400" },
  "危成": { label: "危成", desc: "危险与成就，带有宿命的牵引", color: "text-purple-400" },
  "业胎": { label: "业胎", desc: "业力纠缠，前世今生的深刻羁绊", color: "text-indigo-400" },
  "命之星": { label: "命之星", desc: "命运之星，灵魂深处的共鸣", color: "text-[#d4a853]" },
};

const RELATION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "soulmate": { label: "Soulmate", color: "text-pink-400", bg: "bg-pink-400/8" },
  "deep_trust": { label: "Deep Trust", color: "text-blue-400", bg: "bg-blue-400/8" },
  "good_vibes": { label: "Good Vibes", color: "text-green-400", bg: "bg-green-400/8" },
  "best_friends": { label: "Best Friends", color: "text-amber-400", bg: "bg-amber-400/8" },
  "tension": { label: "Tension", color: "text-orange-400", bg: "bg-orange-400/8" },
  "rivals": { label: "Rivals", color: "text-red-400", bg: "bg-red-400/8" },
};

export default function IdolCompatibilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const artistId = parseInt(id || "0");
  const state = location.state as any;

  const { data: artist, isLoading } = trpc.artist.getById.useQuery({ id: artistId });

  // Use pre-calculated result from navigation state or show placeholder
  const result = state?.result;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#d4a853] animate-spin" />
      </div>
    );
  }

  if (!artist || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Heart className="w-8 h-8 text-[#8a8aad22]" />
        <p className="text-[#8a8aad]">请先前往合盘专区生成匹配结果</p>
        <button onClick={() => navigate("/idol-compatibility")} className="text-[#d4a853] text-sm">
          前往合盘专区
        </button>
      </div>
    );
  }

  const userElement = result.elementComplement?.split("生")[0]?.replace(/[克与].*/, "") || "?";
  const artistEl = result.artistElement || "?";
  const relConfig = MANSION_RELATIONS[result.starMansionRelation] || MANSION_RELATIONS["友衰"];
  const tagConfig = RELATION_LABELS[result.relationTag] || RELATION_LABELS["good_vibes"];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Back */}
          <button
            onClick={() => navigate("/idol-compatibility")}
            className="flex items-center gap-1 text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            返回合盘列表
          </button>

          {/* Header: User + Artist */}
          <div className="glass rounded-2xl p-6 border border-[#d4a85310] mb-6">
            <div className="flex items-center justify-center gap-6">
              {/* User */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#d4a85310] flex items-center justify-center border-2 border-[#d4a85322] mx-auto mb-2">
                  <Star className="w-6 h-6 text-[#d4a853]" />
                </div>
                <p className="text-xs text-[#f0e6d3] font-medium">你</p>
                <p className="text-[10px] text-[#8a8aad44]">{state.userPillar}</p>
              </div>

              {/* Score */}
              <div className="text-center px-4">
                <div className="text-3xl font-display font-bold text-[#d4a853]">{result.overallScore}</div>
                <div className="h-0.5 w-12 bg-[#d4a85322] mx-auto my-1.5" />
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tagConfig.bg} ${tagConfig.color} border border-current border-opacity-20`}>
                  {tagConfig.label}
                </span>
              </div>

              {/* Artist */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4a85320] to-[#1a1a2e] flex items-center justify-center border-2 border-[#d4a85322] mx-auto mb-2 overflow-hidden">
                  {result.artistAvatar ? (
                    <img src={result.artistAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Heart className="w-6 h-6 text-[#d4a853]" />
                  )}
                </div>
                <p className="text-xs text-[#f0e6d3] font-medium truncate max-w-[80px]">{result.artistName}</p>
                <p className="text-[10px] text-[#8a8aad44]">{artistEl}命</p>
              </div>
            </div>
          </div>

          {/* 1. Western Synastry */}
          <SectionCard
            icon={<Sparkles className="w-4 h-4" />}
            title="西方星盘合盘"
            subtitle={result.synastryScore >= 70 ? "高度契合" : result.synastryScore >= 45 ? "潜力发展" : "磨合成长"}
          >
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#8a8aad]">星盘契合度</span>
                <span className="text-sm font-bold text-[#d4a853]">{result.synastryScore}</span>
              </div>
              <div className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#d4a85355] to-[#d4a853]" style={{ width: `${result.synastryScore}%` }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.keywords?.map((k: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-[#d4a85306] text-[#d4a85355] text-[10px] rounded border border-[#d4a85308]">
                  {k}
                </span>
              ))}
            </div>
            {!state.userTime && (
              <p className="text-[10px] text-[#8a8aad33] mt-2">* Time estimated · 未提供出生时间，结果为估算</p>
            )}
          </SectionCard>

          {/* 2. Bazi Five Elements */}
          <SectionCard
            icon={<Flame className="w-4 h-4" />}
            title="四柱五行合盘"
            subtitle={result.elementComplement || "五行分析"}
          >
            {/* Element comparison */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <ElementBadge element={userElement} label="你" />
              <div className="text-center">
                <div className="text-lg text-[#8a8aad22]">vs</div>
                <div className="text-[10px] text-[#8a8aad33]">五行对比</div>
              </div>
              <ElementBadge element={artistEl} label={result.artistName} />
            </div>

            {/* Element Score */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#8a8aad]">五行契合度</span>
                <span className="text-sm font-bold text-[#d4a853]">{result.baziScore}</span>
              </div>
              <div className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#d4a85355] to-[#d4a853]" style={{ width: `${result.baziScore}%` }} />
              </div>
            </div>

            <p className="text-xs text-[#8a8aad] leading-relaxed bg-[#0a0a0f] rounded-lg p-3">
              {result.elementComplement}
            </p>
          </SectionCard>

          {/* 3. Star Mansion Relation */}
          <SectionCard
            icon={<Star className="w-4 h-4" />}
            title="星宿关系"
            subtitle={relConfig.label}
          >
            <div className="text-center mb-3">
              <span className={`text-2xl font-display font-bold ${relConfig.color}`}>
                {result.starMansionRelation}
              </span>
            </div>
            <p className="text-xs text-[#8a8aad] text-center leading-relaxed bg-[#0a0a0f] rounded-lg p-3">
              {relConfig.desc}
            </p>
          </SectionCard>

          {/* 4. Overall Summary */}
          <SectionCard
            icon={<Heart className="w-4 h-4" />}
            title="合盘总结"
            subtitle={tagConfig.label}
          >
            <p className="text-sm text-[#f0e6d3] leading-relaxed mb-4">
              {result.summary}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.keywords?.map((k: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-[#d4a85306] text-[#d4a853] text-[10px] rounded-full border border-[#d4a85315]">
                  {k}
                </span>
              ))}
            </div>
          </SectionCard>

          {/* Ziwei Premium CTA */}
          <button
            onClick={() => {}}
            className="w-full mt-4 p-4 glass rounded-xl border border-[#d4a85315] hover:border-[#d4a85330] transition-all flex items-center justify-between group opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a85320] to-[#1a1a2e] flex items-center justify-center border border-[#d4a85315]">
                <Crown className="w-5 h-5 text-[#d4a853]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#f0e6d3]">紫微斗数深度合盘</div>
                <div className="text-[10px] text-[#8a8aad]">四化飞星 · 命宫对宫 · 更精准</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#d4a85355]" />
              <span className="text-[10px] text-[#d4a853]">Premium</span>
            </div>
          </button>
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

function SectionCard({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-5 border border-[#d4a85306] mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#d4a85310] flex items-center justify-center text-[#d4a853]">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#f0e6d3]">{title}</h3>
          <p className="text-[10px] text-[#8a8aad44]">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ElementBadge({ element, label }: { element: string; label: string }) {
  const cfg = ELEMENT_CONFIG[element] || ELEMENT_CONFIG["土"];
  const Icon = cfg.icon;
  return (
    <div className="text-center">
      <div className={`w-12 h-12 rounded-full bg-[#0a0a0f] flex items-center justify-center border border-[#d4a85308] mx-auto mb-1`}>
        <Icon className={`w-5 h-5 ${cfg.color}`} />
      </div>
      <p className="text-[10px] text-[#8a8aad]">{label}</p>
      <p className={`text-xs font-medium ${cfg.color}`}>{element}</p>
    </div>
  );
}

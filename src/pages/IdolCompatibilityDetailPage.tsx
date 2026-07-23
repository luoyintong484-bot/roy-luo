import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/providers/trpc";
import ShareModal from "@/components/ShareModal";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "@/components/CustomerService";
import {
  Heart, Star, ArrowLeft, Sparkles, Share2, Download, Crown,
  Flame, Droplets, Mountain, Wind, Loader2, Trophy
} from "lucide-react";

const ELEMENT_CONFIG: Record<string, { icon: typeof Flame; color: string; label: string }> = {
  "火": { icon: Flame, color: "text-red-400", label: "Fire" },
  "水": { icon: Droplets, color: "text-blue-400", label: "Water" },
  "木": { icon: Wind, color: "text-green-400", label: "Wood" },
  "金": { icon: Star, color: "text-yellow-400", label: "Metal" },
  "土": { icon: Mountain, color: "text-amber-600", label: "Earth" },
};

const MANSION_RELATIONS: Record<string, { label: string; desc: string; color: string }> = {
  "安坏": { label: "安坏", desc: "一方安稳一方破坏，激情与冲突并存。这是最极致的宿命牵引——注定相遇，注定纠缠，注定在彼此的命运里留下不可磨灭的印记。", color: "text-red-400" },
  "荣亲": { label: "荣亲", desc: "荣耀与亲密，彼此滋养的荣贵关系。如同星辰与月光——相互映照，却从不争夺光芒。这是最温柔的守护，不需言语便能心领神会。", color: "text-pink-400" },
  "友衰": { label: "友衰", desc: "朋友般的轻松惬意，也存在若即若离的疏离感。如同四季交替——有相聚的温暖，也有各自前行的空隙。关键在于：即使走远，也能回头。", color: "text-blue-400" },
  "危成": { label: "危成", desc: "危险与成就并存，带有浓厚宿命色彩的牵引。两颗行星在危险的距离上共舞——稍有不慎便坠入深渊，但恰恰是这种危机感让双方迸发出最强的生命张力。", color: "text-purple-400" },
  "业胎": { label: "业胎", desc: "业力纠缠，前世今生的深刻羁绊。你们曾在某个时空许下约定，今生注定要来完成一场修行。所有的相遇都不是偶然——是宇宙在还愿，也是宇宙在考验。", color: "text-indigo-400" },
  "命之星": { label: "命之星", desc: "命运之星，灵魂深处最纯粹的共鸣。在茫茫宇宙中，找到与自己同频共振的另一颗星——这不是概率，是奇迹。你们是同一种灵魂材质的不同折射。", color: "text-[#d4a853]" },
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
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const artistId = parseInt(id || "0");
  const state = location.state as any;
  const result = state?.result;
  const { data: artist, isLoading } = trpc.artist.getById.useQuery(
    { id: artistId },
    { enabled: Boolean(result && artistId) }
  );

  if (!result) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16 px-4">
          <div className="mx-auto max-w-md rounded-3xl border border-[#d4a85320] bg-[#10101b]/90 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            <Heart className="w-10 h-10 text-[#d4a853] mx-auto mb-3" />
            <h1 className="font-display text-xl font-bold text-[#f0e6d3]">
              {locale === "zh-TW" ? "需要先生成合盤結果" : "Generate a report first"}
            </h1>
            <p className="mt-2 text-sm leading-7 text-[#8a8aad]">
              {locale === "zh-TW"
                ? "此頁需要從愛豆合盤列表帶入你的出生資料與匹配結果。請返回列表重新生成，不會出現空白頁。"
                : "This page needs birth data and match results from the compatibility flow. Please return to the list and generate it again."}
            </p>
            <button
              onClick={() => navigate("/idol-compatibility")}
              className="mt-5 rounded-xl bg-[#d4a853] px-5 py-3 text-sm font-bold text-[#0a0a0f] hover:bg-[#e0b860] transition-colors"
            >
              {locale === "zh-TW" ? "返回合盤列表" : "Go to Compatibility Zone"}
            </button>
          </div>
        </main>
        <Footer />
        <CustomerService />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
          <Loader2 className="w-8 h-8 text-[#d4a853] animate-spin" />
          <p className="text-sm text-[#f0e6d3]">
            {locale === "zh-TW" ? "正在載入合盤資料..." : "Loading compatibility report..."}
          </p>
          <p className="text-xs text-[#8a8aad]">
            {locale === "zh-TW" ? "若等待過久，可返回合盤列表重新生成。" : "If this takes too long, return and generate a fresh report."}
          </p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16 px-4">
          <div className="mx-auto max-w-md rounded-3xl border border-[#d4a85320] bg-[#10101b]/90 p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            <Heart className="w-10 h-10 text-[#d4a853] mx-auto mb-3" />
            <h1 className="font-display text-xl font-bold text-[#f0e6d3]">
              {locale === "zh-TW" ? "未找到愛豆資料" : "Artist not found"}
            </h1>
            <p className="mt-2 text-sm leading-7 text-[#8a8aad]">
              {locale === "zh-TW"
                ? "此愛豆資料可能已更新或不存在，請返回合盤列表重新選擇。"
                : "This artist may have been updated or removed. Please return to the list and choose again."}
            </p>
            <button
              onClick={() => navigate("/idol-compatibility")}
              className="mt-5 rounded-xl bg-[#d4a853] px-5 py-3 text-sm font-bold text-[#0a0a0f] hover:bg-[#e0b860] transition-colors"
            >
              {locale === "zh-TW" ? "返回合盤列表" : "Go to Compatibility Zone"}
            </button>
          </div>
        </main>
        <Footer />
        <CustomerService />
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
      <main className="pt-16 sm:pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate("/idol-compatibility")}
            className="flex items-center gap-1 text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> {locale === "zh-TW" ? "返回合盤列表" : "Back to Compatibility List"}
          </button>

          {/* Header Score Card */}
          <div className="relative overflow-hidden glass rounded-3xl p-6 border border-[#c99aa624] mb-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#c99aa610] blur-3xl" />
            <div className="relative text-center mb-5">
              <div className="inline-flex items-center gap-1 rounded-full border border-[#b99a6220] bg-[#b99a620c] px-2.5 py-1 text-[10px] font-bold text-[#cdbb98]">
                <Trophy className="w-3 h-3" /> IDOL MATCH REPORT
              </div>
            </div>
            <div className="relative flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#c99aa610] flex items-center justify-center border-2 border-[#c99aa62c] mx-auto mb-2">
                  <Star className="w-8 h-8 sm:w-10 sm:h-10 text-[#d8b8c0]" />
                </div>
                <p className="text-sm text-[#f0e6d3] font-medium">You</p>
                <p className="text-xs text-[#8a8aad44]">{state.userPillar}</p>
              </div>
              <div className="text-center px-4">
                <div className="text-4xl sm:text-5xl font-display font-bold text-[#d8b8c0]">{result.overallScore}</div>
                <div className="h-0.5 w-12 bg-[#c99aa633] mx-auto my-1.5" />
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagConfig.bg} ${tagConfig.color} border border-current border-opacity-20`}>
                  {tagConfig.label}
                </span>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#c99aa620] to-[#1a1a2e] flex items-center justify-center border-2 border-[#c99aa62c] mx-auto mb-2 overflow-hidden">
                  {result.artistAvatar ? <img src={result.artistAvatar} alt="" className="w-full h-full object-cover" /> : <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-[#d8b8c0]" />}
                </div>
                <p className="text-sm text-[#f0e6d3] font-medium truncate max-w-[120px]">{result.artistName}</p>
                <p className="text-xs text-[#8a8aad44]">{artistEl}</p>
              </div>
            </div>
            <p className="relative mt-5 text-center text-xs text-[#8a8aad] leading-relaxed">
              这份报告综合西方星盘、四柱五行与二十八星宿，重点看你们之间的吸引力、互动舒适度和关系张力。
            </p>
          </div>

          {/* 1. Western Synastry — expanded */}
          <SectionCard icon={<Sparkles className="w-4 h-4" />} title="Western Synastry"
            subtitle={result.synastryScore >= 70 ? "High Compatibility" : result.synastryScore >= 45 ? "Growth Potential" : "Needs Understanding"}>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#8a8aad]">Synastry Score</span>
                <span className="text-sm font-bold text-[#d4a853]">{result.synastryScore}</span>
              </div>
              <div className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#d4a85355] to-[#d4a853]" style={{ width: `${result.synastryScore}%` }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {result.keywords?.map((k: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-[#d4a85306] text-[#d4a85355] text-[10px] rounded border border-[#d4a85308]">{k}</span>
              ))}
            </div>
            <p className="text-xs text-[#8a8aad] leading-relaxed bg-[#0a0a0f] rounded-lg p-3">
              {result.synastryScore >= 70
                ? "Your Western zodiac signs form a harmonious trine aspect — the rarest and most effortless of cosmic alignments. Like two instruments tuned to the same key, your energies blend without friction. This is the kind of synastry that astrologers dream of discovering in composite charts."
                : result.synastryScore >= 45
                ? "Your signs sit at a sextile angle — close enough to understand each other, different enough to keep things interesting. There's a natural curiosity here, a willingness to bridge gaps. With conscious effort, this alignment can grow into something profoundly beautiful."
                : "Your zodiac configurations create a square or opposition — challenging but far from hopeless. The tension between your signs is the universe's way of pushing you both to evolve. Some of the most legendary relationships in history were forged in this very crucible of cosmic friction."}
            </p>
            {!state.userTime && (
              <p className="text-[10px] text-[#8a8aad33] mt-2">* Time estimated — birth time not provided, results are approximate</p>
            )}
          </SectionCard>

          {/* 2. Bazi Five Elements — expanded */}
          <SectionCard icon={<Flame className="w-4 h-4" />} title="Bazi Five Elements"
            subtitle={result.elementComplement || "Element Analysis"}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <ElementBadge element={userElement} label="You" />
              <div className="text-center">
                <div className="text-lg text-[#8a8aad22]">×</div>
                <div className="text-[10px] text-[#8a8aad33]">Element Match</div>
              </div>
              <ElementBadge element={artistEl} label={result.artistName} />
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#8a8aad]">Element Compatibility</span>
                <span className="text-sm font-bold text-[#d4a853]">{result.baziScore}</span>
              </div>
              <div className="h-2 bg-[#0a0a0f] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#d4a85355] to-[#d4a853]" style={{ width: `${result.baziScore}%` }} />
              </div>
            </div>
            <p className="text-xs text-[#8a8aad] leading-relaxed bg-[#0a0a0f] rounded-lg p-3">
              {result.elementComplement}
            </p>
            <p className="text-[10px] text-[#8a8aad44] mt-2 leading-relaxed">
              In the Five Elements cycle, some combinations generate abundance (Wood → Fire → Earth → Metal → Water), while others control excess (Wood restrains Earth, Fire tempers Metal). Your Bazi day pillars reveal how your elemental natures interact at the deepest level — not just personality compatibility, but energetic destiny alignment.
            </p>
          </SectionCard>

          {/* 3. Star Mansion — expanded */}
          <SectionCard icon={<Star className="w-4 h-4" />} title="Star Mansion Relation"
            subtitle={relConfig.label}>
            <div className="text-center mb-3">
              <span className={`text-2xl font-display font-bold ${relConfig.color}`}>{result.starMansionRelation}</span>
            </div>
            <p className="text-xs text-[#8a8aad] text-center leading-relaxed bg-[#0a0a0f] rounded-lg p-3">
              {relConfig.desc}
            </p>
            <p className="text-[10px] text-[#8a8aad44] mt-2 text-center leading-relaxed">
              The 28 Star Mansions form an ancient lunar calendar system used for over 2,000 years. Each mansion carries its own spiritual signature — when two souls share a mansion connection, it speaks to recognition beyond this lifetime. These six relationship archetypes (安坏·荣亲·友衰·危成·业胎·命之星) represent the full spectrum of karmic entanglement.
            </p>
          </SectionCard>

          {/* 4. Overall Summary — expanded */}
          <SectionCard icon={<Heart className="w-4 h-4" />} title="Compatibility Summary"
            subtitle={tagConfig.label}>
            <p className="text-sm text-[#f0e6d3] leading-relaxed mb-4">{result.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {result.keywords?.map((k: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-[#d4a85306] text-[#d4a853] text-[10px] rounded-full border border-[#d4a85315]">{k}</span>
              ))}
            </div>
            <p className="text-[10px] text-[#8a8aad44] mt-3 leading-relaxed">
              This reading synthesizes Western synastry, Chinese Bazi Five Elements, and the 28 Star Mansion system — three ancient traditions spanning continents and millennia, all pointing toward the same cosmic truth: every connection carries meaning, every encounter holds a lesson, and every soul that touches yours leaves a trace in the stardust.
            </p>
          </SectionCard>

          {/* ===== SOCIAL SHARE ROW ===== */}
          <div className="glass rounded-xl p-4 border border-[#d4a85310] mt-4">
            <p className="text-[10px] text-[#8a8aad] text-center mb-3 uppercase tracking-wider">Share This Reading</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {[
                { name: "Xiaohongshu", icon: "📕", color: "hover:bg-red-400/20 hover:text-red-400" },
                { name: "TikTok", icon: "🎵", color: "hover:bg-gray-300/20 hover:text-gray-300" },
                { name: "Instagram", icon: "📷", color: "hover:bg-pink-500/20 hover:text-pink-400" },
                { name: "Facebook", icon: "📘", color: "hover:bg-blue-500/20 hover:text-blue-400" },
                { name: "Twitter / X", icon: "🐦", color: "hover:bg-sky-400/20 hover:text-sky-400" },
              ].map(p => (
                <button key={p.name} onClick={async () => {
                  const text = `🔮 Compatibility: ${result.artistName} | Score: ${result.overallScore} · ${tagConfig.label}\n` +
                    `Synastry: ${result.synastryScore} | Bazi: ${result.baziScore} | Mansion: ${result.starMansionRelation}\n#R7Fortune #IdolCompatibility #DestinyReading`;
                  try { await navigator.clipboard.writeText(text); } catch {}
                }}
                  className={`flex flex-col items-center gap-1 px-3 py-2 glass rounded-xl border border-[#d4a85310] ${p.color} transition-all text-[#8a8aad] hover:scale-105`}>
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-[8px]">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ===== SHARE POSTER PLACEHOLDER ===== */}
          <div className="glass rounded-xl p-3 border border-[#d4a85306] mt-3 opacity-40">
            <p className="text-[9px] text-[#8a8aad44] text-center">
              📸 Share Poster · Coming Soon — dynamic personalized poster with your unique compatibility data
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-[9px] text-[#8a8aad33] text-center leading-relaxed mt-4">
            * This compatibility reading is for entertainment and fan community recreational purposes only. All content is algorithmically generated and should not be interpreted as factual relationship analysis. Enjoy responsibly.
          </p>

          {/* Floating share button */}
          <button onClick={() => setShowShare(true)}
            className="fixed bottom-20 right-4 z-40 w-12 h-12 bg-[#d4a853] text-[#0a0a0f] rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform shadow-[#d4a85330]">
            <Share2 className="w-5 h-5" />
          </button>

          <ShareModal
            open={showShare}
            onClose={() => setShowShare(false)}
            title={`${result.artistName} Compatibility`}
            score={String(result.overallScore)}
            tag={tagConfig.label}
            subtitle={`Synastry: ${result.synastryScore} · Bazi: ${result.baziScore}`}
          />
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
        <div className="w-8 h-8 rounded-lg bg-[#d4a85310] flex items-center justify-center text-[#d4a853]">{icon}</div>
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
      <div className="w-12 h-12 rounded-full bg-[#0a0a0f] flex items-center justify-center border border-[#d4a85308] mx-auto mb-1">
        <Icon className={`w-5 h-5 ${cfg.color}`} />
      </div>
      <p className="text-[10px] text-[#8a8aad]">{label}</p>
      <p className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</p>
    </div>
  );
}

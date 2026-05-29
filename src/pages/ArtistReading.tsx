import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useI18n } from "@/contexts/I18nContext";
import { getArtistById } from "@/data/artists";
import type { ArtistStatic } from "@/data/artists";
import { Sparkles, ArrowLeft, Star, Heart, Briefcase, Users, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import CustomerService from "@/components/CustomerService";

const zodiacEmojis: Record<string, string> = {
  "Aries": "\u2648", "Taurus": "\u2649", "Gemini": "\u264A",
  "Cancer": "\u264B", "Leo": "\u264C", "Virgo": "\u264D",
  "Libra": "\u264E", "Scorpio": "\u264F", "Sagittarius": "\u2650",
  "Capricorn": "\u2651", "Aquarius": "\u2652", "Pisces": "\u2653",
};

export default function ArtistReading() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const artistId = parseInt(id ?? "0");

  // Try server data first, fall back to static data
  const { data: serverArtist, isLoading } = trpc.artist.getById.useQuery({ id: artistId });
  const staticArtist = getArtistById(artistId);
  const artist: ArtistStatic | undefined = serverArtist || staticArtist;

  if (isLoading && !staticArtist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#d4a853] animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[#8a8aad]">Artist not found</p>
        <button onClick={() => navigate("/idol")} className="text-[#d4a853] text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Idol Library
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/artist/${artistId}`)}
            className="flex items-center gap-1 text-sm text-[#8a8aad] hover:text-[#d4a853] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </button>

          {/* Hero Card */}
          <div className="glass rounded-2xl p-6 sm:p-8 mb-8 border border-[#d4a85315]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#d4a85330] to-[#1a1a2e] flex items-center justify-center text-2xl sm:text-3xl border-2 border-[#d4a85344]">
                {zodiacEmojis[artist.zodiacSign || ""] || "\u2728"}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#f0e6d3]">
                  {artist.stageName || artist.name}
                </h1>
                <p className="text-sm text-[#8a8aad] mt-1">
                  {artist.groupName} · {artist.zodiacSign} · {artist.baziDayPillar}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#d4a85310] border border-[#d4a85320] rounded-full">
              <Sparkles className="w-3 h-3 text-[#d4a853]" />
              <span className="text-[10px] text-[#d4a853] uppercase tracking-wider">
                {t("artist.readingTitle")}
              </span>
            </div>
          </div>

          {/* Analysis Sections */}
          <div className="space-y-6">
            {/* Personality Analysis */}
            <AnalysisCard
              icon={<Star className="w-5 h-5" />}
              title={t("artist.personalityAnalysis")}
              content={`${artist.stageName || artist.name}'s Bazi Day Pillar is ${artist.baziDayPillar}, belonging to the ${artist.element || "unknown"} element. ${artist.starMansion ? `Their star mansion is ${artist.starMansion}, indicating unique personal charm and talent. ` : ""}Their ${artist.zodiacSign} zodiac traits give them a distinctive character. In Chinese metaphysics, those with this destiny pattern often possess keen intuition and strong personal magnetism, best suited for expressing themselves among others.`}
              highlights={[artist.baziDayPillar || "", artist.starMansion || "", artist.zodiacSign || ""]}
            />

            {/* Career Fortune */}
            <AnalysisCard
              icon={<Briefcase className="w-5 h-5" />}
              title={t("artist.careerFortune")}
              content={`From a career perspective, ${artist.stageName || artist.name}'s destiny pattern shows strong development potential in entertainment. ${artist.element === "Metal" ? "Metal element individuals possess natural leadership qualities, ideal for anchoring a team." : artist.element === "Wood" ? "Wood element individuals are creative and growth-oriented, suited for diverse development." : artist.element === "Water" ? "Water element individuals excel at communication and expression, ideal for entertainment and hosting." : artist.element === "Fire" ? "Fire element individuals are passionate and expressive, with powerful stage presence." : artist.element === "Earth" ? "Earth element individuals are steady and reliable, suited for long-term planning." : ""} ${artist.debutDate ? `Debuted in ${artist.debutDate}, during a rising career cycle.` : ""}`}
              highlights={[artist.element || "", "Career rising"]}
            />

            {/* Love Fortune */}
            <AnalysisCard
              icon={<Heart className="w-5 h-5" />}
              title={t("artist.loveFortune")}
              content={`In matters of romance, ${artist.zodiacSign} traits make them ${["Aries", "Leo", "Sagittarius"].includes(artist.zodiacSign || "") ? "passionate and direct, taking initiative in pursuit" : ["Taurus", "Virgo", "Capricorn"].includes(artist.zodiacSign || "") ? "steady and cautious, valuing long-term stability" : ["Gemini", "Libra", "Aquarius"].includes(artist.zodiacSign || "") ? "focused on spiritual connection, needing soul resonance" : "sensitive and delicate, valuing emotional connection"} in relationships. ${artist.starMansion ? `Those with ${artist.starMansion} are usually loyal in love, fully committing once they decide.` : ""}`}
              highlights={[artist.zodiacSign || ""]}
            />

            {/* Fan Compatibility */}
            <AnalysisCard
              icon={<Users className="w-5 h-5" />}
              title={t("artist.compatibilityWithFan")}
              content={`From a star mansion perspective, fans of ${artist.starMansion || "this destiny pattern"} share a special karmic connection with the idol. Fan support brings positive energy to ${artist.stageName || artist.name}, creating a virtuous cycle. Fans are advised to show extra support during ${["昴宿", "毕宿", "觜宿", "参宿"].includes(artist.starMansion || "") ? "White Tiger Mansions" : ["角宿", "亢宿", "氐宿", "房宿", "心宿", "尾宿", "箕宿"].includes(artist.starMansion || "") ? "Azure Dragon Mansions" : ["斗宿", "牛宿", "女宿", "虚宿", "危宿", "室宿", "壁宿"].includes(artist.starMansion || "") ? "Black Tortoise Mansions" : "Vermilion Bird Mansions"} period for the best energy alignment.`}
              highlights={[artist.starMansion || ""]}
            />
          </div>
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

function AnalysisCard({ icon, title, content, highlights }: {
  icon: React.ReactNode; title: string; content: string; highlights: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const shortContent = content.slice(0, 80) + "...";

  return (
    <div className="glass rounded-xl p-5 sm:p-6 border border-[#d4a85308] hover:border-[#d4a85315] transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-[#d4a85310] flex items-center justify-center text-[#d4a853]">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-[#f0e6d3]">{title}</h3>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {highlights.filter(Boolean).map((h, i) => (
          <span key={i} className="px-2 py-0.5 bg-[#d4a85308] border border-[#d4a85315] rounded text-[10px] text-[#d4a853]">
            {h}
          </span>
        ))}
      </div>

      <p className="text-sm text-[#8a8aad] leading-relaxed">
        {expanded ? content : shortContent}
      </p>

      {content.length > 80 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-[#d4a853] hover:text-[#e0b860] transition-colors"
        >
          {expanded ? "Collapse" : "Expand Full Reading"}
        </button>
      )}
    </div>
  );
}


import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import InnerPageLayout from "@/components/InnerPageLayout";
import { getArtistById, ZODIAC_EMOJIS } from "@/data/artists";
import { useI18n } from "@/contexts/I18nContext";
import {
  ArrowLeft, Calendar, MapPin, Sparkles, Heart, Star,
  Lock, Crown, ChevronRight,
  Flame, User, Sunrise, Shield, Gem
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ELEMENT_CONFIG: Record<string, { color: string; icon: typeof Flame }> = {
  "Fire": { color: "text-red-400", icon: Flame },
  "Water": { color: "text-blue-400", icon: Star },
  "Wood": { color: "text-green-400", icon: Star },
  "Metal": { color: "text-yellow-400", icon: Star },
  "Earth": { color: "text-amber-600", icon: Star },
};

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const artistId = parseInt(id || "0");

  const [showZiweiModal, setShowZiweiModal] = useState(false);

  const artist = getArtistById(artistId);

  if (!artist) {
    return (
      <InnerPageLayout>
        <div className="flex flex-col items-center justify-center" style={{ minHeight: "70vh" }}>
          <Star className="w-8 h-8 text-[#8a8aad11] mb-3" />
          <p className="text-[#8a8aad]">{t("artist.notFound")}</p>
          <Link to="/idol" className="text-[#d4a853] text-sm mt-4 inline-block hover:underline">
            {t("artist.backToLibrary")}
          </Link>
        </div>
      </InnerPageLayout>
    );
  }

  // 8 profile tags
  const profileTags = [
    { label: t("artist.sunSign"), value: `${artist.zodiacSign} ${ZODIAC_EMOJIS[artist.zodiacSign] || ""}`, icon: <Sunrise className="w-3 h-3" />, detail: `${t("artist.moonSign")}: ${artist.zodiacMoon}` },
    { label: t("artist.baziDayPillar"), value: artist.baziDayPillar, icon: <Gem className="w-3 h-3" />, detail: `${artist.element} · ${artist.chineseZodiac}` },
    { label: t("artist.starMansion"), value: artist.starMansion, icon: <Star className="w-3 h-3" />, detail: "" },
    { label: t("artist.mbti"), value: artist.mbti, icon: <Shield className="w-3 h-3" />, detail: "" },
    { label: t("artist.chineseZodiac"), value: artist.chineseZodiac, icon: <Sparkles className="w-3 h-3" />, detail: "" },
    { label: t("artist.element"), value: artist.element, icon: <Flame className="w-3 h-3" />, detail: "" },
    { label: t("artist.debut"), value: artist.debutDate, icon: <Calendar className="w-3 h-3" />, detail: artist.agency },
    { label: t("artist.group"), value: artist.groupName, icon: <User className="w-3 h-3" />, detail: artist.position },
  ];

  const elConfig = ELEMENT_CONFIG[artist.element];

  return (
    <InnerPageLayout>
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back */}
          <div className="mb-6">
            <Link to="/idol" className="inline-flex items-center gap-1.5 text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              {t("artist.backToLibrary")}
            </Link>
          </div>

          {/* Profile Hero */}
          <div className="glass rounded-2xl p-6 sm:p-8 border border-[#d4a85310] mb-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#d4a85325] via-[#1a1a2e] to-[#0a0a0f] flex items-center justify-center text-5xl border border-[#d4a85320] flex-shrink-0 mx-auto sm:mx-0">
                <span className="text-[#d4a853]">
                  {ZODIAC_EMOJIS[artist.zodiacSign] || artist.stageName[0]}
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#f0e6d3]">{artist.stageName}</h1>
                  <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                    <span className="px-2.5 py-0.5 bg-[#d4a85310] text-[#d4a853] text-[10px] rounded-full border border-[#d4a85315]">{artist.groupName}</span>
                    <span className="px-2.5 py-0.5 bg-[#d4a85308] text-[#8a8aad66] text-[10px] rounded-full border border-[#d4a85306]">{artist.region === "korea" ? t("artist.regionKpop") : t("artist.regionCpop")}</span>
                    <span className={`px-2.5 py-0.5 bg-[#d4a85308] ${elConfig?.color || "text-[#8a8aad66]"} text-[10px] rounded-full border border-[#d4a85306]`}>
                      Element: {artist.element}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-[#8a8aad]">{artist.name}</p>
                <p className="text-[10px] text-[#8a8aad33] mt-1">{artist.agency} · {artist.position}</p>

                <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                  {[
                    `${artist.zodiacSign} ${ZODIAC_EMOJIS[artist.zodiacSign] || ""}`,
                    artist.mbti,
                    artist.element,
                    artist.baziDayPillar,
                    artist.starMansion,
                  ].filter(Boolean).map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#d4a85306] text-[#d4a85366] text-[10px] rounded-full border border-[#d4a85308]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full Profile Tags */}
          <div className="glass rounded-2xl p-5 sm:p-6 border border-[#d4a85308] mb-6">
            <h2 className="text-sm font-semibold text-[#f0e6d3] mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#d4a853]" />
              {t("artist.basicProfile")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {profileTags.map((tag) => (
                <div key={tag.label} className="bg-[#0a0a0f] rounded-lg p-3 border border-[#d4a85304] hover:border-[#d4a85310] transition-colors">
                  <div className="text-[9px] text-[#8a8aad33] uppercase tracking-wider flex items-center gap-1">
                    {tag.icon}
                    {tag.label}
                  </div>
                  <div className="text-[12px] text-[#f0e6d3] mt-1 font-medium">{tag.value}</div>
                  {tag.detail && <div className="text-[9px] text-[#d4a85344] mt-0.5">{tag.detail}</div>}
                </div>
              ))}
            </div>

            {/* Birth info highlight */}
            <div className="mt-3 bg-[#0a0a0f] rounded-lg p-3 border border-[#d4a85304]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#d4a85333]" />
                  <span className="text-[10px] text-[#8a8aad33]">{t("artist.solar")}</span>
                  <span className="text-xs text-[#f0e6d3]">{artist.birthDate}</span>
                  {artist.birthTime !== "00:00" && (
                    <span className="text-[10px] text-[#d4a85344]">{artist.birthTime}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#d4a85333]" />
                  <span className="text-[10px] text-[#8a8aad33]">{t("artist.birthplace")}</span>
                  <span className="text-xs text-[#d4a85366]">{artist.birthPlace}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <button
              onClick={() => navigate(`/artist/${artistId}/compatibility`)}
              className="glass rounded-xl p-4 border border-[#d4a85315] hover:border-[#d4a85335] transition-all text-left group flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4a85320] to-[#d4a85305] flex items-center justify-center border border-[#d4a85315] flex-shrink-0">
                <Heart className="w-5 h-5 text-[#d4a853] group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f0e6d3] group-hover:text-[#d4a853] transition-colors">
                  {t("artist.compatibilityWith").replace("{name}", artist.stageName)}
                </p>
                <p className="text-[10px] text-[#8a8aad44] mt-0.5">
                  Western Synastry · Five Elements · Star Mansions
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8a8aad11] group-hover:text-[#d4a853] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </button>

            <button
              onClick={() => setShowZiweiModal(true)}
              className="glass rounded-xl p-4 border border-[#d4a85308] hover:border-[#d4a85320] transition-all text-left group flex items-center gap-4 opacity-60"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4a85310] to-[#1a1a2e] flex items-center justify-center border border-[#d4a85308] flex-shrink-0">
                <Crown className="w-5 h-5 text-[#d4a85355]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f0e6d3]">Ziwei Depth Compatibility</p>
                <p className="text-[10px] text-[#8a8aad33] mt-0.5">Premium · Coming Soon</p>
              </div>
              <Lock className="w-4 h-4 text-[#d4a85333] flex-shrink-0" />
            </button>
          </div>
        </div>
      </main>

      {/* Ziwei Modal */}
      <Dialog open={showZiweiModal} onOpenChange={setShowZiweiModal}>
        <DialogContent className="bg-[#0e0e14] border-[#d4a85315] text-[#f0e6d3] max-w-sm">
          <div className="text-center py-4">
            <Crown className="w-10 h-10 mx-auto text-[#d4a85333] mb-3" />
            <h3 className="text-base font-semibold text-[#f0e6d3]">Ziwei Depth Compatibility</h3>
            <p className="text-xs text-[#8a8aad] mt-1">Premium Feature</p>
            <p className="text-[10px] text-[#8a8aad33]">Four Transformations · Palace Alignments · Annual Cycles</p>
            <div className="mt-4 p-2.5 bg-[#d4a85306] rounded-lg border border-[#d4a85310]">
              <p className="text-xs text-[#d4a853]">Coming Soon</p>
            </div>
            <Button onClick={() => setShowZiweiModal(false)} className="mt-4 w-full bg-[#d4a853] text-[#0a0a0f] text-xs">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </InnerPageLayout>
  );
}

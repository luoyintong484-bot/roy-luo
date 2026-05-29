import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { useI18n } from "@/contexts/I18nContext"
import {
  Search, Calendar, ChevronRight, ChevronDown,
  Sparkles, X, Star, Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ALL_ARTISTS, getGroupedArtists, GROUP_META,
  ZODIAC_EMOJIS, ELEMENT_COLORS,
} from "@/data/artists"

const HOT_BADGE = (
  <span className="ml-1.5 px-1 py-0.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[7px] font-bold rounded-full shadow-lg shadow-pink-500/20">
    HOT
  </span>
)

export default function IdolSection() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQ = searchParams.get("q") || ""

  const [searchInput, setSearchInput] = useState(urlQ)
  const [searchQuery, setSearchQuery] = useState(urlQ)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [regionFilter, setRegionFilter] = useState<string>("all")

  // Sync with URL
  useEffect(() => {
    setSearchInput(urlQ)
    setSearchQuery(urlQ)
  }, [urlQ])

  // Get grouped data from static JSON
  const grouped = getGroupedArtists(
    regionFilter === "all" ? undefined : regionFilter,
    searchQuery
  )

  // Auto-expand first group on initial load
  useEffect(() => {
    if (grouped.length > 0 && !expandedGroup && !searchQuery) {
      setExpandedGroup(grouped[0][0])
    }
  }, [grouped.length])

  const handleSearch = () => {
    if (!searchInput.trim()) {
      setSearchParams({})
      setSearchQuery("")
      return
    }
    setSearchParams({ q: searchInput.trim() })
    setSearchQuery(searchInput.trim())
  }

  const handleClear = () => {
    setSearchInput("")
    setSearchQuery("")
    setSearchParams({})
  }

  // If search returns exactly 1 artist, auto-navigate
  useEffect(() => {
    if (searchQuery && grouped.length === 1) {
      const members = grouped[0][1]
      if (members.length === 1) {
        const timer = setTimeout(() => {
          navigate(`/artist/${members[0].id}`)
        }, 300)
        return () => clearTimeout(timer)
      }
    }
  }, [searchQuery, grouped.length])

  return (
    <section id="idol" className="py-24 relative">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#d4a85310] border border-[#d4a85320] rounded-full mb-4">
              <Sparkles className="w-3 h-3 text-[#d4a853]" />
              <span className="text-[10px] text-[#d4a853] uppercase tracking-wider">Idol Fortune</span>
              {HOT_BADGE}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#f0e6d3]">{t("idol.title")}</h2>
            <p className="mt-2 text-sm text-[#8a8aad]">{t("idol.subtitle")}</p>
          </div>

          {/* Search + Filter */}
          <div className="max-w-lg mx-auto mb-6 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8aad44]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={t("idol.search")}
                  className="w-full glass rounded-lg pl-10 pr-10 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#d4a85344] transition-all"
                />
                {searchInput && (
                  <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8aad44] hover:text-[#8a8aad]">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] hover:from-[#e0b860] hover:to-[#d4a853] font-bold px-5"
              >
                <Search className="w-4 h-4 mr-1" />
                {t("idol.searchBtn")}
              </Button>
            </div>

            {/* Idol Match Entry */}
            <button onClick={() => navigate("/idol-match")}
              className="w-full glass rounded-xl p-3 border border-[#FFB6C115] hover:border-[#FFB6C140] transition-all text-left group flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFB6C120] to-[#FFB6C105] flex items-center justify-center border border-[#FFB6C115] flex-shrink-0">
                <Heart className="w-5 h-5 text-[#FFB6C1] group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#f0e6d3] group-hover:text-[#FFB6C1] transition-colors">
                  {locale === "zh" ? "偶像配对合盘 · Idol Match" : "Idol Match · Cosmic Connection"}
                </p>
                <p className="text-[9px] text-[#8a8aad33] mt-0.5">
                  {locale === "zh" ? "输入四柱信息 → 选择爱豆 → 解锁宇宙缘分图谱" : "Enter Saju → Pick Idols → Unlock Cosmic Connection Map"}
                </p>
              </div>
              <span className="px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[7px] font-bold rounded-full">NEW</span>
            </button>

            {/* Category filter tabs */}
            <div className="flex gap-1.5 justify-center">
              {[
                { key: "all", label: locale === "zh" ? "全部" : locale === "zh-TW" ? "全部" : "All" },
                { key: "korea", label: "K-Pop" },
                { key: "tf", label: locale === "zh" ? "时代峰峻" : locale === "zh-TW" ? "時代峰峻" : "TF Ent." },
                { key: "other", label: locale === "zh" ? "其他" : locale === "zh-TW" ? "其他" : "Other" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setRegionFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
                    regionFilter === tab.key
                      ? "bg-[#d4a85315] text-[#d4a853] border-[#d4a85330]"
                      : "bg-transparent text-[#8a8aad55] border-[#d4a85308] hover:border-[#d4a85315]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Artist Count */}
          <p className="text-center text-[10px] text-[#8a8aad33] mb-4">
            {ALL_ARTISTS.length} artists · {grouped.length} groups
          </p>

          {/* Groups */}
          <div className="space-y-3">
            {grouped.map(([groupName, members]) => {
              const meta = GROUP_META[groupName]
              const isExpanded = expandedGroup === groupName
              const isHOT = ["BLACKPINK", "aespa", "IVE", "NewJeans", "LE SSERAFIM"].includes(groupName)
              const region = members[0]?.region

              return (
                <div key={groupName} className="glass rounded-xl overflow-hidden border border-[#d4a85308] hover:border-[#d4a85315] transition-all">
                  {/* Group Header */}
                  <button
                    onClick={() => setExpandedGroup(isExpanded ? null : groupName)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[#d4a85304] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a85320] to-[#14142a] flex items-center justify-center text-lg border border-[#d4a85315]">
                        {ZODIAC_EMOJIS[members[0]?.zodiacSign || ""] || "✨"}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-[#f0e6d3]">{groupName}</span>
                          {isHOT && HOT_BADGE}
                          {region && (
                            <span className="ml-1.5 text-[8px] text-[#8a8aad33] bg-[#d4a85304] px-1.5 py-0.5 rounded border border-[#d4a85306]">
                              {region === "korea" ? "KR" : "CN"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#8a8aad44] flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            Debut {meta?.debut || "-"}
                          </span>
                          {meta && meta.element !== "-" && (
                            <span className={`text-[10px] ${ELEMENT_COLORS[meta.elementLabel]} bg-[#d4a85306] px-1.5 py-0.5 rounded border border-[#d4a85308]`}>
                              Element: {meta.element}
                            </span>
                          )}
                          <span className="text-[10px] text-[#8a8aad33]">{members.length} members</span>
                          {meta?.company && (
                            <span className="text-[9px] text-[#8a8aad22]">{meta.company}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-[#8a8aad]" /> : <ChevronRight className="w-4 h-4 text-[#8a8aad]" />}
                  </button>

                  {/* Members Grid */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="border-t border-[#d4a85306] pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {members.map((artist) => (
                            <button
                              key={artist.id}
                              onClick={() => navigate(`/artist/${artist.id}`)}
                              className="group flex items-center gap-3 p-3 rounded-lg hover:bg-[#d4a85306] transition-all border border-transparent hover:border-[#d4a85310] text-left"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4a85315] to-[#14142a] flex items-center justify-center text-sm border border-[#d4a85310] flex-shrink-0 overflow-hidden">
                                <span className="text-[#d4a853]">
                                  {ZODIAC_EMOJIS[artist.zodiacSign] || "★"}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-medium text-[#f0e6d3] group-hover:text-[#d4a853] transition-colors truncate">
                                    {artist.stageName || artist.name}
                                  </span>
                                  <span className="text-[8px] text-[#8a8aad22]">{artist.mbti}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className="text-[9px] text-[#8a8aad44]">{artist.birthDate}</span>
                                  {artist.zodiacSign && (
                                    <span className="text-[8px] text-[#d4a85355] bg-[#d4a85306] px-1 rounded">{artist.zodiacSign}</span>
                                  )}
                                  {artist.baziDayPillar && (
                                    <span className="text-[8px] text-[#d4a85355] bg-[#d4a85306] px-1 rounded">{artist.baziDayPillar}</span>
                                  )}
                                  {artist.starMansion && (
                                    <span className="text-[8px] text-[#d4a85355] bg-[#d4a85306] px-1 rounded">{artist.starMansion}</span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#8a8aad22] group-hover:text-[#d4a853] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Idol Destiny Pack Banner */}
          <div className="mt-12">
            <div className="glass rounded-2xl p-6 border border-[#d4a85320] bg-gradient-to-r from-[#d4a85308] to-transparent">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4a85330] to-[#d4a85305] flex items-center justify-center border border-[#d4a85320] flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-[#d4a853]" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-display font-bold text-[#f0e6d3]">
                    {locale === "zh" ? "Idol Destiny Pack · 爱豆命理包" : "Idol Destiny Pack"}
                  </h3>
                  <p className="text-xs text-[#8a8aad] mt-1">
                    {locale === "zh"
                      ? "解锁爱豆公开生辰对应的星盘、八字与专属运势解读包 — 一键跳转塔罗占卜 & 命理合盘"
                      : "Unlock star charts, bazi readings & exclusive fortune packs based on idol public birth data — instant access to Tarot & Destiny"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    <button onClick={() => navigate("/tarot")}
                      className="px-4 py-2 bg-[#d4a853] text-[#0a0a0f] rounded-full text-xs font-bold hover:bg-[#e0b860] transition-colors flex items-center gap-1">
                      ✨ {locale === "zh" ? "塔罗占卜" : "Tarot Reading"}
                    </button>
                    <button onClick={() => navigate("/destiny")}
                      className="px-4 py-2 glass rounded-full text-xs font-semibold text-[#d4a853] border border-[#d4a85330] hover:border-[#d4a85360] transition-colors flex items-center gap-1">
                      🔮 {locale === "zh" ? "命理合盘" : "Destiny Compatibility"}
                    </button>
                    <button onClick={() => navigate("/idol-compatibility")}
                      className="px-4 py-2 glass rounded-full text-xs font-semibold text-[#d4a853] border border-[#d4a85330] hover:border-[#d4a85360] transition-colors flex items-center gap-1">
                      💫 {locale === "zh" ? "爱豆合盘" : "Idol Compatibility"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {grouped.length === 0 && (
            <div className="text-center py-16">
              <Star className="w-8 h-8 mx-auto mb-3 text-[#8a8aad11]" />
              <p className="text-sm text-[#8a8aad]">No artists found</p>
              <p className="text-[10px] text-[#8a8aad33] mt-1">Try different keywords</p>
            </div>
          )}
        </div>
      </section>
  )
}

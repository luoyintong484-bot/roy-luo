import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { useI18n } from "@/contexts/I18nContext"
import {
  Search, Calendar, ChevronRight, ChevronDown,
  Sparkles, X, Star, Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ALL_ARTISTS, getArtistDisplayName, getGroupedArtists, GROUP_META,
  ZODIAC_EMOJIS, ELEMENT_COLORS,
} from "@/data/artists"
import type { ArtistStatic } from "@/data/artists"

const HOT_BADGE = (
  <span className="ml-1.5 px-1 py-0.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[7px] font-bold rounded-full shadow-lg shadow-pink-500/20">
    HOT
  </span>
)

function dedupeArtistsForDisplay(members: ArtistStatic[]) {
  const seen = new Set<string>()
  return members.filter((artist) => {
    const key = `${artist.groupName}:${(artist.stageName || artist.name).toLowerCase()}:${artist.birthDate}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

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
      const members = dedupeArtistsForDisplay(grouped[0][1])
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
              <span className="text-[10px] text-[#d4a853] uppercase tracking-wider">{locale === "zh-TW" ? "愛豆玄學" : "Idol Fortune"}</span>
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
              <button
                type="button"
                onClick={handleSearch}
                className="bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] hover:from-[#e0b860] hover:to-[#d4a853] font-bold px-5 rounded-lg flex items-center"
              >
                <Search className="w-4 h-4 mr-1" />
                {t("idol.searchBtn")}
              </button>
            </div>

            {/* Idol Match Entry */}
            <button onClick={() => navigate("/idol-match")}
              className="relative w-full overflow-hidden rounded-[28px] p-5 sm:p-6 border border-[#ffb6d94a] bg-gradient-to-br from-[#fff0f518] via-[#2a172d]/95 to-[#0a0a0f]/95 hover:border-[#ff9fc8] transition-all text-left group flex items-center gap-4 mb-3 shadow-[0_24px_80px_rgba(255,143,189,0.14)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ffd1e4] to-transparent" />
              <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-[#ff8fbd1e] blur-3xl" />
              <div className="absolute right-6 bottom-4 hidden text-5xl opacity-15 sm:block">✨</div>
              <div className="relative w-16 h-16 rounded-[24px] bg-gradient-to-br from-[#ff8fbd2a] to-[#d8c7ff18] flex items-center justify-center border border-[#ffb6d955] flex-shrink-0 shadow-[0_14px_42px_rgba(255,143,189,0.16)]">
                <Heart className="w-7 h-7 text-[#ffd9e9] group-hover:scale-110 transition-transform" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-[#ffd1e433] bg-[#fff7fb10] px-2.5 py-1 text-[9px] font-black tracking-[0.14em] text-[#ffd9e9]">
                  HOT TEST
                </div>
                <p className="text-lg sm:text-xl font-black text-[#fff7ef] group-hover:text-[#ffd9e9] transition-colors">
                  {locale === "zh-TW" ? "生日追星推荐 · Idol Match" : "Idol Match · Cosmic Connection"}
                </p>
                <p className="text-xs sm:text-sm text-[#d7cbe6] mt-1 leading-relaxed">
                  {locale === "zh-TW" ? "输入生日，系统从隐藏艺人库里揭晓最适合你追的爱豆" : "Enter your birthday and reveal your best idol matches from the hidden library"}
                </p>
                <div className="mt-2 flex gap-1.5">
                  {["Birthday", "Hidden Library", "Reveal"].map((tag) => (
                    <span key={tag} className="rounded-full border border-[#ffd1e424] bg-[#fff7fb0d] px-2.5 py-1 text-[9px] font-semibold text-[#ffd9e9]">{tag}</span>
                  ))}
                </div>
              </div>
              <span className="relative hidden sm:inline-flex px-4 py-2 bg-gradient-to-r from-[#ff9fc8] via-[#ffd1e4] to-[#d8c7ff] text-[#211427] text-xs font-black rounded-full shadow-[0_14px_34px_rgba(255,143,189,0.22)] group-hover:brightness-110">
                START
              </span>
            </button>

            {/* Category filter tabs */}
            <div className="flex gap-1.5 justify-center">
              {[
                { key: "all", label: locale === "zh-TW" ? "全部" : "All" },
                { key: "korea", label: "K-Pop" },
                { key: "tf", label: locale === "zh-TW" ? "內娛" : "C-Ent" },
                { key: "other", label: locale === "zh-TW" ? "其他" : locale === "zh-TW" ? "其他" : "Other" },
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
              const displayMembers = dedupeArtistsForDisplay(members)
              const meta = GROUP_META[groupName]
              const isExpanded = expandedGroup === groupName
              const isHOT = ["BLACKPINK", "aespa", "IVE", "NewJeans", "LE SSERAFIM"].includes(groupName)
              const region = displayMembers[0]?.region

              return (
                <div key={groupName} className="glass rounded-xl overflow-hidden border border-[#d4a85308] hover:border-[#d4a85315] transition-all">
                  {/* Group Header */}
                  <button
                    onClick={() => setExpandedGroup(isExpanded ? null : groupName)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-[#d4a85304] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a85320] to-[#14142a] flex items-center justify-center text-lg border border-[#d4a85315]">
                        {ZODIAC_EMOJIS[displayMembers[0]?.zodiacSign || ""] || "✨"}
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
                          <span className="text-[10px] text-[#8a8aad33]">{displayMembers.length} members</span>
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
                          {displayMembers.map((artist) => (
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
                                    {getArtistDisplayName(artist, locale)}
                                  </span>
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

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router"
import { useI18n } from "@/contexts/I18nContext"
import { useAuth } from "@/hooks/useAuth"
import {
  Search, User, LogIn, LogOut, Globe, Sparkles, Menu, X, LayoutGrid
} from "lucide-react"
import { Button } from "@/components/ui/button"

const HOT_BADGE = (
  <span className="absolute -top-1.5 -right-6 px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[8px] font-bold rounded-full shadow-lg shadow-pink-500/30 animate-pulse">
    HOT
  </span>
)

export default function Navbar() {
  const { locale, setLocale, t } = useI18n()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isActive = (path: string) => location.pathname === path

  const navTo = (path: string) => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
    navigate(path)
  }

  const navItems = [
    { key: "tarot", path: "/tarot" },
    { key: "destiny", path: "/destiny" },
    { key: "idol", path: "/idol", hot: true },
  ]

  // Smart keyword-based search routing
  const handleSearch = () => {
    const q = searchQuery.trim()
    if (!q) return
    const lower = q.toLowerCase()

    // Tarot keywords
    if (/tarot|card|reading|塔罗|牌阵|cards|draw|spread/i.test(lower)) {
      navigate("/tarot")
    }
    // Destiny/compatibility keywords
    else if (/destiny|fortune|match|compatibility|命理|合盘|星盘|synastry|natal|chart|birth|zodiac/i.test(lower)) {
      navigate("/destiny")
    }
    // Idol keywords (default for names and idol-specific terms)
    else {
      navigate(`/idol?q=${encodeURIComponent(q)}`)
    }
    setSearchOpen(false)
    setSearchQuery("")
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#d4a85322]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => navTo("/")}>
            <Sparkles className="w-5 h-5 text-[#d4a853] group-hover:animate-spin" />
            <span className="font-display text-lg font-bold text-[#f0e6d3] tracking-wide">
              R7 Fortune
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => navTo(item.path)}
                className={`relative text-xs uppercase tracking-[0.2em] transition-colors font-medium ${
                  isActive(item.path)
                    ? "text-[#d4a853]"
                    : "text-[#8a8aad] hover:text-[#f0e6d3]"
                }`}
              >
                {t(`nav.${item.key}`)}
                {item.hot && HOT_BADGE}
              </button>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-[#d4a853]">{t("free.count")}</span>

            {/* Language */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 text-[#8a8aad] hover:text-[#d4a853] transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs">{locale === "zh" ? "简中" : locale === "zh-TW" ? "繁體" : "EN"}</span>
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 bg-[#14142a] border border-[#d4a85333] rounded-lg shadow-xl overflow-hidden z-50">
                  <button
                    onClick={() => { setLocale("zh"); setLangDropdownOpen(false) }}
                    className={`block w-full text-left px-4 py-2 text-xs hover:bg-[#d4a85322] transition-colors ${
                      locale === "zh" ? "text-[#d4a853]" : "text-[#8a8aad]"
                    }`}
                  >
                    简体中文
                  </button>
                  <button
                    onClick={() => { setLocale("zh-TW"); setLangDropdownOpen(false) }}
                    className={`block w-full text-left px-4 py-2 text-xs hover:bg-[#d4a85322] transition-colors ${
                      locale === "zh-TW" ? "text-[#d4a853]" : "text-[#8a8aad]"
                    }`}
                  >
                    繁體中文
                  </button>
                  <button
                    onClick={() => { setLocale("en"); setLangDropdownOpen(false) }}
                    className={`block w-full text-left px-4 py-2 text-xs hover:bg-[#d4a85322] transition-colors ${
                      locale === "en" ? "text-[#d4a853]" : "text-[#8a8aad]"
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-[#8a8aad] hover:text-[#d4a853] transition-colors">
              <Search className="w-4 h-4" />
            </button>

            {/* Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 text-[#8a8aad] hover:text-[#d4a853] transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-7 h-7 rounded-full border border-[#d4a85344]" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </Link>
                <button onClick={logout} className="text-[#8a8aad] hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="ghost" className="text-[#d4a853] hover:text-[#f0e6d3] hover:bg-[#d4a85322]">
                  <LogIn className="w-4 h-4 mr-1" />
                  <span className="text-xs">{t("login")}</span>
                </Button>
              </Link>
            )}

            <button className="text-[#8a8aad] hover:text-[#d4a853] transition-colors p-1" title="Menu">
              <LayoutGrid className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-[#8a8aad]">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Dropdown */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#14142a]/95 backdrop-blur-xl border-b border-[#d4a85322] p-4">
          <div className="max-w-xl mx-auto flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("idol.search")}
              className="flex-1 bg-[#0a0a0f] border border-[#d4a85333] rounded-lg px-4 py-3 text-sm text-[#f0e6d3] placeholder-[#8a8aad66] focus:outline-none focus:border-[#d4a85388]"
              autoFocus
            />
            <Button
              onClick={handleSearch}
              className="bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] hover:from-[#e0b860] hover:to-[#d4a853] font-bold px-4"
            >
              <Search className="w-4 h-4 mr-1" />
              {t("idol.searchBtn")}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-[#d4a85322] p-4 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => navTo(item.path)}
              className={`relative block w-full text-left text-sm py-2 ${
                isActive(item.path) ? "text-[#d4a853]" : "text-[#8a8aad]"
              }`}
            >
              {t(`nav.${item.key}`)}
              {item.hot && <span className="ml-2 px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[8px] font-bold rounded-full">HOT</span>}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}

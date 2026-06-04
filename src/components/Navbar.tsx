import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Search, User, LogIn, LogOut, Globe, Sparkles, Menu, X,
  UserCircle, Settings,
} from "lucide-react";

/* ============================================================
   R7 Fortune — Restructured Navbar
   Left:  Logo + 首页 · TAROT · IDOL · 命理
   Right: 搜索框 → 语言 → 注册 → 登录 → 功能菜单
   ============================================================ */

export default function Navbar() {
  const { locale, setLocale, t } = useI18n();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [merchOpen, setMerchOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ---- scroll ----
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---- click-outside ----
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const tgt = e.target as Node;
      if (langRef.current && !langRef.current.contains(tgt)) setLangOpen(false);
      if (menuRef.current && !menuRef.current.contains(tgt)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ---- helpers ----
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navTo = useCallback((path: string) => {
    setMobileOpen(false);
    setLangOpen(false);
    setMenuOpen(false);
    navigate(path);
  }, [navigate]);

  // ---- search ----
  const handleSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (!q) return;
    const lower = q.toLowerCase();
    if (/tarot|card|reading|塔罗|牌阵|cards|draw|spread/i.test(lower)) {
      navTo("/tarot");
    } else if (/destiny|fortune|match|compatibility|命理|合盘|星盘|synastry|natal|chart|birth|zodiac/i.test(lower)) {
      navTo("/destiny");
    } else {
      navTo(`/idol?q=${encodeURIComponent(q)}`);
    }
    setSearchQuery("");
  }, [searchQuery, navTo]);

  const handleLogout = useCallback(() => {
    setMenuOpen(false);
    setMobileOpen(false);
    logout();
  }, [logout]);

  // ================================================================
  //  LEFT: 4 main tabs — 首页 · TAROT · IDOL · 命理
  // ================================================================
  const mainNavItems = [
    { key: "home",    path: "/" },
    { key: "tarot",   path: "/tarot" },
    { key: "idol",    path: "/idol", hot: true },
    { key: "destiny", path: "/destiny" },
    { key: "merch",  path: "#merch", badge: true },
  ];

  // ================================================================
  //  FUNCTION MENU (dropdown) items — when logged in
  // ================================================================
  const menuItems = [
    { key: "profile",  path: "/profile",             icon: UserCircle },
    { key: "settings", path: "/profile?tab=settings", icon: Settings },
  ];

  // ---- language ----
  const langOptions = [
    { value: "zh-TW" as const, label: "繁體" },
    { value: "en" as const,    label: "EN" },
  ];
  const currentLang = langOptions.find(o => o.value === locale) || langOptions[2];

  // ======================== RENDER ========================
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0f]/92 backdrop-blur-xl border-b border-[#d4a85315] shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[95rem] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center h-14 sm:h-16">

          {/* ================================================ */}
          {/*  LEFT SECTION: Logo + 4 Core Tabs                 */}
          {/* ================================================ */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            {/* Logo */}
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-1.5 sm:gap-2 group mr-1 sm:mr-2"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#d4a85310] border border-[#d4a85322] flex items-center justify-center group-hover:border-[#d4a85344] transition-colors">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4a853] group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-display text-base sm:text-lg font-bold text-[#f0e6d3] tracking-wide hidden sm:inline">
                R7 Fortune
              </span>
            </Link>

            {/* 4 Main Nav Tabs */}
            <div className="hidden md:flex items-center gap-0.5 sm:gap-1">
              {mainNavItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.key}
                    onClick={() => item.key === "merch" ? setMerchOpen(true) : navTo(item.path)}
                    className={`relative px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      active && item.key !== "merch"
                        ? "text-[#d4a853] bg-[#d4a85308]"
                        : "text-[#8a8aad] hover:text-[#f0e6d3] hover:bg-[#d4a85306]"
                    }`}
                  >
                    {t(`nav.${item.key}`)}
                    {item.hot && (
                      <span className="absolute -top-1 -right-1 px-1 sm:px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[7px] sm:text-[8px] font-bold rounded-full leading-none">
                        HOT
                      </span>
                    )}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 px-1 sm:px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[7px] sm:text-[8px] font-bold rounded-full leading-none">
                        NEW
                      </span>
                    )}
                    {active && item.key !== "merch" && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 sm:w-6 h-0.5 rounded-full bg-[#d4a853]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================================================ */}
          {/*  SPACER — pushes right section to the edge        */}
          {/* ================================================ */}
          <div className="flex-1" />

          {/* ================================================ */}
          {/*  RIGHT SECTION: 登录 → 注册 → 搜索框 → 语言 → 菜单 */}
          {/* ================================================ */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

            {/* ---- 1. 登录 (Login) ---- */}
            {!isAuthenticated ? (
              <button
                onClick={() => navTo("/login")}
                className="hidden sm:flex h-8 px-3 rounded-lg text-xs font-medium text-[#8a8aad] hover:text-[#f0e6d3] hover:bg-[#d4a85308] transition-all items-center gap-1 flex-shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t("login")}
              </button>
            ) : null}

            {/* ---- 2. 注册 (Register) ---- */}
            {!isAuthenticated ? (
              <button
                onClick={() => navTo("/login")}
                className="hidden sm:flex h-8 px-3 rounded-lg text-xs font-medium bg-[#d4a853] text-[#0a0a0f] hover:bg-[#e0b860] transition-all items-center flex-shrink-0"
              >
                {t("nav.register")}
              </button>
            ) : null}

            {/* ---- 3. 搜索框 (Search Box) ---- */}
            <div className="hidden sm:flex items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={t("search.placeholder")}
                  className="w-36 lg:w-48 h-8 bg-[#0a0a0f] border border-[#d4a85315] rounded-lg pl-8 pr-3 text-xs text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#d4a85344] transition-colors"
                />
              </div>
            </div>
            {/* Mobile search icon */}
            <button
              onClick={() => {
                const input = document.getElementById("mobile-search-input") as HTMLInputElement;
                if (input) { input.focus(); }
              }}
              className="sm:hidden w-7 h-7 rounded-lg flex items-center justify-center text-[#8a8aad66] hover:text-[#f0e6d3] hover:bg-[#d4a85308] transition-all flex-shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* ---- 4. 语言切换 (Language Switch) ---- */}
            <div ref={langRef} className="relative flex-shrink-0">
              <button
                onClick={() => { setLangOpen(!langOpen); setMenuOpen(false); }}
                className={`flex items-center gap-1 h-8 px-2 rounded-lg text-xs font-medium transition-all ${
                  langOpen ? "bg-[#d4a85315] text-[#d4a853]" : "text-[#8a8aad66] hover:text-[#f0e6d3] hover:bg-[#d4a85308]"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{currentLang.label}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-[#14142a] border border-[#d4a85322] rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 min-w-[110px]">
                  {langOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setLocale(opt.value); setLangOpen(false); }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors ${
                        locale === opt.value
                          ? "text-[#d4a853] bg-[#d4a85310]"
                          : "text-[#8a8aad] hover:text-[#f0e6d3] hover:bg-[#d4a85308]"
                      }`}
                    >
                      {opt.value === "zh-TW" ? "繁體中文" : "English"}
                      {locale === opt.value && <span className="ml-2 text-[#d4a853]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ---- 5. 汉堡菜单图标 (Hamburger Menu) ---- */}
            <div ref={menuRef} className="relative flex-shrink-0">
              <button
                onClick={() => { setMenuOpen(!menuOpen); setLangOpen(false); }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  menuOpen ? "bg-[#d4a85315] text-[#d4a853]" : "text-[#8a8aad] hover:text-[#f0e6d3] hover:bg-[#d4a85308]"
                }`}
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-[#14142a] border border-[#d4a85322] rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 min-w-[190px]">
                  {/* User info header (when logged in) */}
                  {isAuthenticated && (
                    <div className="px-4 py-3 border-b border-[#d4a85310]">
                      <p className="text-xs font-medium text-[#f0e6d3] truncate">
                        {user?.name || user?.email || "User"}
                      </p>
                      {user?.email && (
                        <p className="text-[10px] text-[#8a8aad44] truncate mt-0.5">{user.email}</p>
                      )}
                    </div>
                  )}

                  {/* Menu items */}
                  <div className="py-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.key}
                          onClick={() => navTo(item.path)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#8a8aad] hover:text-[#f0e6d3] hover:bg-[#d4a85308] transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 text-[#8a8aad44]" />
                          {t(`nav.${item.key}`)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Logout (when logged in) */}
                  {isAuthenticated && (
                    <div className="border-t border-[#d4a85310] py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-rose-400/80 hover:text-rose-400 hover:bg-rose-400/5 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ---- Mobile Hamburger ---- */}
            <button
              onClick={() => { setMobileOpen(!mobileOpen); setLangOpen(false); setMenuOpen(false); }}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[#8a8aad] hover:text-[#f0e6d3] hover:bg-[#d4a85308] transition-all"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ============ MOBILE SEARCH (hidden input, shown when icon clicked) ============ */}
      <div className="sm:hidden px-3 pb-2 bg-[#0a0a0f]/92">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44] pointer-events-none" />
          <input
            id="mobile-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t("search.placeholder")}
            className="w-full h-8 bg-[#0a0a0f] border border-[#d4a85315] rounded-lg pl-8 pr-3 text-xs text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#d4a85344] transition-colors"
          />
        </div>
      </div>

      {/* ============ MOBILE MENU ============ */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0f]/98 backdrop-blur-xl border-t border-[#d4a85310] shadow-2xl shadow-black/50">
          <div className="max-h-[75vh] overflow-y-auto px-4 py-4 space-y-1">
            {/* Main tabs */}
            {mainNavItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.key}
                  onClick={() => navTo(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "text-[#d4a853] bg-[#d4a85308] border border-[#d4a85315]"
                      : "text-[#8a8aad] hover:text-[#f0e6d3] hover:bg-[#d4a85306]"
                  }`}
                >
                  <Sparkles className={`w-4 h-4 ${active ? "text-[#d4a853]" : "text-[#8a8aad44]"}`} />
                  {t(`nav.${item.key}`)}
                  {item.hot && (
                    <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[9px] font-bold rounded-full">HOT</span>
                  )}
                </button>
              );
            })}

            <div className="border-t border-[#d4a85308] my-3" />

            {/* Auth or Menu items */}
            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#d4a85310] border border-[#d4a85322] flex items-center justify-center">
                    <User className="w-5 h-5 text-[#d4a853]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f0e6d3]">{user?.name || "User"}</p>
                    {user?.email && <p className="text-[10px] text-[#8a8aad44]">{user.email}</p>}
                  </div>
                </div>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => navTo(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#8a8aad] hover:text-[#f0e6d3] hover:bg-[#d4a85308] transition-all"
                    >
                      <Icon className="w-4 h-4 text-[#8a8aad44]" />
                      {t(`nav.${item.key}`)}
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-rose-400/80 hover:text-rose-400 hover:bg-rose-400/5 transition-all mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-4">
                <button
                  onClick={() => navTo("/login")}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#d4a853] text-[#0a0a0f] hover:bg-[#e0b860] transition-all"
                >
                  {t("nav.register")}
                </button>
                <button
                  onClick={() => navTo("/login")}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#8a8aad] border border-[#d4a85320] hover:text-[#f0e6d3] hover:border-[#d4a85344] transition-all flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  {t("login")}
                </button>
              </div>
            )}

            <div className="border-t border-[#d4a85308] my-3" />

            {/* Language */}
            <p className="px-4 text-[10px] text-[#8a8aad44] uppercase tracking-wider py-1">{t("settings.language")}</p>
            <div className="flex gap-2 px-4">
              {langOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setLocale(opt.value); setMobileOpen(false); }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    locale === opt.value
                      ? "bg-[#d4a853] text-[#0a0a0f]"
                      : "bg-[#14142a] text-[#8a8aad] border border-[#d4a85315]"
                  }`}
                >
                  {opt.value === "zh-TW" ? "繁體中文" : "English"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Merch popup */}
      {merchOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#000]/70 backdrop-blur-sm" onClick={() => setMerchOpen(false)} />
          <div className="relative glass rounded-2xl p-6 max-w-sm w-full border border-[#FFB6C115] shadow-2xl text-center animate-fade-in-up">
            <p className="text-4xl mb-3">🛍️</p>
            <h3 className="font-display text-lg font-bold text-[#f0e6d3] mb-2">
              {locale === "zh-TW" ? "周邊商城籌備中" : "Merch Store Coming Soon"}
            </h3>
            <p className="text-xs text-[#8a8aad] mb-4">
              {locale === "zh-TW" ? "敬請期待！精美周邊商品即將上線" : "Stay tuned! Exclusive merch dropping soon"}
            </p>
            <button onClick={() => setMerchOpen(false)}
              className="px-6 py-2.5 bg-[#FFB6C1] text-[#0a0a0f] rounded-lg text-sm font-medium hover:bg-[#f0a0b8] transition-colors">
              {locale === "zh-TW" ? "知道了" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

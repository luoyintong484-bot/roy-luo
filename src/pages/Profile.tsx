import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import {
  ArrowLeft, User, Wallet, Settings, Save, Edit3, Loader2,
  Calendar, MapPin, Clock, Globe, FileText, Check,
  Sparkles, Star, Bookmark, Heart, History, Home, LogOut,
  Eye, EyeOff, Shield, Bell, Palette, Search, Trash2, Share2, Copy,
  Filter, X, Crown, TrendingUp, Zap, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBirthProfile, computeDerivedFields } from "@/hooks/useBirthProfile";
import { getMembershipState, getPaymentOrders, setMembershipAutoRenew, type MembershipState } from "@/lib/payment";
import { PAYMENT_COMING_SOON } from "@/const";
import PrivacyNotice from "@/components/PrivacyNotice";

// ==================== TYPES ====================
type TabKey = "overview" | "myPage" | "history" | "favorites" | "settings" | "payments";

// ==================== CONSTANTS ====================
const ACCENT = "#FFB6C1";
const ACCENT_BG = "bg-[#FFB6C108]";
const ACCENT_BORDER = "border-[#FFB6C122]";
const ACCENT_TEXT = "text-[#FFB6C1]";
const ACCENT_BG_HOVER = "hover:bg-[#FFB6C110]";
const CARD = "bg-[#14142a]/60 border border-[#FFB6C115] rounded-2xl";
const INPUT = "w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#FFB6C144] transition-colors";

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: typeof Sparkles }) {
  return (
    <div className={`${CARD} p-4 text-center hover:-translate-y-0.5 transition-transform`}>
      <Icon className="w-4 h-4 text-[#FFB6C166] mx-auto mb-1.5" />
      <p className="text-xl font-display font-bold text-[#f0e6d3]">{value}</p>
      <p className="text-[10px] text-[#8a8aad66] mt-0.5">{label}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint }: { icon: typeof Sparkles; title: string; hint: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFB6C106] border border-[#FFB6C110] flex items-center justify-center">
        <Icon className="w-7 h-7 text-[#8a8aad33]" />
      </div>
      <p className="text-sm text-[#8a8aad]">{title}</p>
      <p className="text-[10px] text-[#8a8aad44] mt-1">{hint}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Sparkles; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-[#FFB6C108] flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-[#FFB6C1]" />
      </div>
      <h3 className="text-sm font-semibold text-[#f0e6d3]">{title}</h3>
    </div>
  );
}

// ==================== LOGOUT MODAL ====================
function LogoutModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl p-6 max-w-sm w-full border border-[#FFB6C120] shadow-2xl animate-fade-in-up">
        <h3 className="text-lg font-display font-bold text-[#f0e6d3] text-center mb-2">確定要退出登錄嗎？</h3>
        <p className="text-xs text-[#8a8aad] text-center mb-6">退出後將無法查看個人中心、收藏和歷史記錄</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#8a8aad] border border-[#FFB6C118] hover:text-[#f0e6d3] hover:border-[#FFB6C133] transition-all">
            取消
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#FFB6C1] text-[#0a0a0f] hover:bg-[#f0a0b8] transition-all">
            確定退出
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== PAYMENT HISTORY ====================
function PaymentHistory({ locale }: { locale: string }) {
  const isZh = locale === "zh-TW";
  const [orders] = useState(() => getPaymentOrders().slice().reverse());
  const [membership, setMembership] = useState<MembershipState>(() => getMembershipState());
  const membershipActive = Boolean(membership.vip && membership.expiresAt && new Date(membership.expiresAt).getTime() > Date.now());
  const autoRenewOn = Boolean(membershipActive && membership.autoRenew && !membership.cancelAtPeriodEnd);

  const formatDate = (date?: string) => {
    if (!date) return "--";
    return new Date(date).toLocaleString(isZh ? "zh-TW" : "en-US");
  };

  const toggleAutoRenew = () => {
    setMembership(setMembershipAutoRenew(!autoRenewOn));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#d4a85324] bg-gradient-to-br from-[#251928]/86 via-[#151520] to-[#0d0d17] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#d4a853]" />
              <p className="text-sm font-bold text-[#f0e6d3]">
                {isZh ? "會員與自動續費" : "Membership & Auto-renew"}
              </p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                membershipActive
                  ? "bg-green-400/10 text-green-300 border border-green-300/20"
                  : "bg-[#FFB6C108] text-[#8a8aad] border border-[#FFB6C115]"
              }`}>
                {membershipActive ? (isZh ? "已開通" : "Active") : (isZh ? "未開通" : "Free")}
              </span>
            </div>
            <p className="mt-2 text-xs leading-6 text-[#8a8aad]">
              {membershipActive
                ? (isZh
                    ? `月度會員有效至 ${formatDate(membership.expiresAt)}。${autoRenewOn ? "到期前系統會保留續費授權。" : "已取消自動續費，到期後不再續費。"}`
                    : `Monthly membership is valid until ${formatDate(membership.expiresAt)}. ${autoRenewOn ? "Renewal authorization is enabled." : "Auto-renew is cancelled and will stop at period end."}`)
                : (isZh
                    ? "開通會員後可在此查看週期、續費狀態和取消入口。"
                    : "After subscribing, your cycle, renewal status, and cancellation control appear here.")}
            </p>
            {membershipActive && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl border border-[#FFB6C110] bg-[#050509]/35 px-3 py-2">
                  <span className="text-[#8a8aad]">{isZh ? "下次週期" : "Next cycle"}</span>
                  <p className="mt-0.5 font-semibold text-[#f0e6d3]">{formatDate(membership.nextBillingAt || membership.expiresAt)}</p>
                </div>
                <div className="rounded-xl border border-[#FFB6C110] bg-[#050509]/35 px-3 py-2">
                  <span className="text-[#8a8aad]">{isZh ? "續費狀態" : "Renewal status"}</span>
                  <p className="mt-0.5 font-semibold text-[#f0e6d3]">
                    {autoRenewOn ? (isZh ? "自動續費已開啟" : "Auto-renew enabled") : (isZh ? "自動續費已關閉" : "Auto-renew off")}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:min-w-[180px]">
            {membershipActive ? (
              <>
                <button
                  onClick={toggleAutoRenew}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
                    autoRenewOn
                      ? "bg-[#FFB6C1] text-[#0a0a0f] hover:bg-[#f0a0b8]"
                      : "border border-[#FFB6C122] text-[#FFB6C1] hover:bg-[#FFB6C108]"
                  }`}
                >
                  {autoRenewOn ? (isZh ? "自動續費：開啟" : "Auto-renew: On") : (isZh ? "重新開啟自動續費" : "Enable auto-renew")}
                </button>
                {autoRenewOn && (
                  <button
                    onClick={toggleAutoRenew}
                    className="rounded-xl border border-rose-300/20 px-4 py-2.5 text-xs font-semibold text-rose-200 hover:bg-rose-400/8 transition-colors"
                  >
                    {isZh ? "取消自動續費" : "Cancel auto-renew"}
                  </button>
                )}
              </>
            ) : (
              PAYMENT_COMING_SOON ? (
                <button
                  type="button"
                  className="rounded-xl border border-[#d4a85330] bg-[#d4a85312] px-4 py-2.5 text-center text-xs font-bold text-[#d4a853]"
                >
                  {isZh ? "會員即將上線" : "Membership Coming Soon"}
                </button>
              ) : (
                false && (
                  <Link
                    to={`/payment?type=monthly&return=${encodeURIComponent("/profile?tab=payments")}`}
                    state={{
                      amount: 12.99,
                      label: "Monthly Member · VIP",
                      labelZh: "月度會員 · 無限次抽牌+完整解析",
                      productType: "membership",
                      reportType: "monthly",
                      reportKey: "vip_monthly",
                      returnPath: "/profile?tab=payments",
                    }}
                    className="rounded-xl bg-[#FFB6C1] px-4 py-2.5 text-center text-xs font-bold text-[#0a0a0f] hover:bg-[#f0a0b8] transition-colors"
                  >
                    {isZh ? "開通月度會員" : "Subscribe monthly"}
                  </Link>
                )
              )
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <Link
          to="/my-reports"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#FFB6C122] bg-[#FFB6C108] px-3.5 py-2 text-xs font-semibold text-[#ffd6e8] transition-colors hover:border-[#FFB6C144] hover:bg-[#FFB6C112]"
        >
          📚 {isZh ? "我的報告庫" : "My Reports"}
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={isZh ? "暫無付款記錄" : "No payment records"}
          hint={isZh ? "完成付費後記錄將顯示於此" : "Payment records will appear here"}
        />
      ) : (
        <div className="space-y-2">
          {orders.slice(0, 20).map((o, i) => (
            <div key={o.sessionId || i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#151520] rounded-xl px-4 py-3 border border-[#FFB6C108]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold text-[#f0e6d3]">{o.product || (isZh ? "塔羅解讀" : "Tarot Reading")}</p>
                  <span className="rounded-full bg-[#FFB6C108] px-2 py-0.5 text-[9px] text-[#FFB6C1] border border-[#FFB6C115]">
                    {o.type === "membership" ? (isZh ? "會員" : "Membership") : (isZh ? "單次報告" : "Report")}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-[#8a8aad66]">
                  {(isZh ? "訂單：" : "Order: ")}{o.orderId || o.sessionId || "--"}
                  {" · "}
                  {formatDate(o.date)}
                  {" · "}
                  {isZh ? "支付寶" : "Alipay"}
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-[#FFB6C1]">¥{o.amount?.toFixed(2) || "0.00"}</p>
                  <p className="text-[9px] text-green-400/70">{isZh ? "已完成" : "Completed"}</p>
                </div>
                {o.accessUrl && (
                  <Link to={o.accessUrl} className="rounded-lg border border-[#d4a85324] px-3 py-1.5 text-[10px] font-semibold text-[#d4a853] hover:text-[#f0e6d3] hover:bg-[#d4a85312] transition-colors">
                    {isZh ? "查看報告" : "View report"}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function ProfilePage() {
  const { t, locale, setLocale } = useI18n();
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { profile: birthProfile, updateProfile: updateBirthProfile, clearProfile: clearBirthProfile, hasProfile } = useBirthProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) || "overview";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const switchTab = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams(tab === "overview" ? {} : { tab }, { replace: true });
  }, [setSearchParams]);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | undefined>(undefined);
  const [nickname, setNickname] = useState("");

  // Birth profile form state (for settings tab)
  const [bpYear, setBpYear] = useState(birthProfile.birthYear || "");
  const [bpMonth, setBpMonth] = useState(birthProfile.birthMonth || "");
  const [bpDay, setBpDay] = useState(birthProfile.birthDay || "");
  const [bpHour, setBpHour] = useState(birthProfile.birthHour || "");
  const [bpMinute, setBpMinute] = useState(birthProfile.birthMinute || "");
  const [bpPlace, setBpPlace] = useState(birthProfile.birthPlace || "");

  const BP_YEARS = Array.from({ length: 76 }, (_, i) => String(1950 + i));
  const BP_MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const BP_HOURS = Array.from({ length: 24 }, (_, i) => String(i));
  const BP_MINUTES = ["00", "15", "30", "45"];
  const bpDays = new Date(parseInt(bpYear) || 2000, parseInt(bpMonth) || 1, 0).getDate();
  const BP_DAYS = Array.from({ length: bpDays }, (_, i) => i + 1);

  // Avatar
  const [avatar, setAvatar] = useState<string | null>(() => {
    try { return localStorage.getItem("r7_avatar"); } catch { return null; }
  });
  const [avatarMsg, setAvatarMsg] = useState("");

  // Settings section switcher
  const [settingsSection, setSettingsSection] = useState("profile");

  // Per-section save feedback
  const [profileSaved, setProfileSaved] = useState(false);
  const [birthSaved, setBirthSaved] = useState(false);
  const [privacySaved, setPrivacySaved] = useState(false);

  // Theme preference
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try { return (localStorage.getItem("r7_theme") as "dark" | "light") || "dark"; } catch { return "dark"; }
  });

  // Privacy toggles (loaded from localStorage)
  const [profilePublic, setProfilePublic] = useState(() => {
    try { return localStorage.getItem("r7_privacy_profile") !== "false"; } catch { return true; }
  });
  const [historyPublic, setHistoryPublic] = useState(() => {
    try { return localStorage.getItem("r7_privacy_history") === "true"; } catch { return false; }
  });
  const [favoritesPublic, setFavoritesPublic] = useState(() => {
    try { return localStorage.getItem("r7_privacy_favorites") === "true"; } catch { return false; }
  });

  // Auto-save privacy on toggle
  const togglePrivacy = useCallback((key: "profile" | "history" | "favorites") => {
    const setters = { profile: setProfilePublic, history: setHistoryPublic, favorites: setFavoritesPublic };
    const getters = { profile: profilePublic, history: historyPublic, favorites: favoritesPublic };
    setters[key](!getters[key]);
    setPrivacySaved(true);
    setTimeout(() => setPrivacySaved(false), 2000);
  }, [profilePublic, historyPublic, favoritesPublic]);

  // Persist privacy to localStorage on change
  useEffect(() => {
    localStorage.setItem("r7_privacy_profile", String(profilePublic));
    localStorage.setItem("r7_privacy_history", String(historyPublic));
    localStorage.setItem("r7_privacy_favorites", String(favoritesPublic));
  }, [profilePublic, historyPublic, favoritesPublic]);

  // History state
  const [historyFilter, setHistoryFilter] = useState("all");
  const [historySearch, setHistorySearch] = useState("");
  const [localReports, setLocalReports] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("r7_reports") || "[]"); } catch { return []; }
  });

  // Fetch API-stored readings (works with TEST_AUTH mock user)
  const { data: apiReadings } = trpc.reading.list.useQuery(
    { limit: 50 },
    { staleTime: 1000 * 30 }
  );

  // Merge API readings with local reports
  const allReports = (() => {
    const api = (apiReadings || []).map((r: any) => ({
      id: r.id,
      title: r.title || "",
      type: r.type || "synastry",
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("zh-CN") : "",
      preview: r.resultSummary || "",
      source: "api" as const,
      raw: r,
    }));
    // Deduplicate: prefer API records over localStorage ones
    const local = localReports.filter((lr: any) =>
      !api.some((ar: any) => ar.title === lr.title && ar.date === lr.date)
    );
    return [...api, ...local];
  })();

  // Favorites state
  const [favCategory, setFavCategory] = useState("all");

  // Content wall tab
  const [contentTab, setContentTab] = useState<"shares" | "comments" | "collections">("shares");

  useEffect(() => {
    try {
      const sp = JSON.parse(localStorage.getItem("r7_profile") || "{}");
      if (sp.birthDate) setBirthDate(sp.birthDate);
      if (sp.birthTime) setBirthTime(sp.birthTime);
      if (sp.birthPlace) setBirthPlace(sp.birthPlace);
      if (sp.gender) setGender(sp.gender);
      if (sp.nickname) setNickname(sp.nickname);
    } catch {}
  }, []);

  const { data: profileData } = trpc.user.getProfile.useQuery(undefined, { enabled: !!user });
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => { setSaved(true); setIsEditing(false); setTimeout(() => setSaved(false), 2000); },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FFB6C1] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFB6C108] border border-[#FFB6C115] flex items-center justify-center">
            <User className="w-7 h-7 text-[#8a8aad44]" />
          </div>
          <p className="text-[#8a8aad] mb-4">{t("profile.pleaseLogin")}</p>
          <Link to="/login" className="px-4 py-2 bg-[#FFB6C1] text-[#0a0a0f] rounded-lg text-sm font-medium hover:bg-[#f0a0b8] transition-colors">
            {t("profile.goToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    localStorage.setItem("r7_profile", JSON.stringify({ birthDate, birthTime, birthPlace, gender, nickname }));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
    updateProfile.mutate({ birthDate, birthTime: birthTime || undefined, birthPlace: birthPlace || undefined, gender });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMsg(locale === "zh-TW" ? "圖片不能超過5MB" : "Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatar(dataUrl);
      localStorage.setItem("r7_avatar", dataUrl);
      setAvatarMsg(locale === "zh-TW" ? "頭像上傳成功" : "Avatar uploaded");
      setTimeout(() => setAvatarMsg(""), 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    setLogoutOpen(false);
    logout();
    navigate("/");
  };

  const getLocalAccountStorageKeys = () => {
    const keys = new Set([
      "r7_auth_user",
      "r7_birth_profile",
      "r7_profile",
      "r7_reports",
      "r7_orders",
      "r7_sub_state",
      "r7_pending_report",
      "r7_pending_payment",
      "r7_unlocked_reports",
      "r7_ziwei_natal_report",
      "r7_ziwei_synastry_report",
      "r7_chart_archive",
      "r7_tarot_leads",
      "r7_share_points",
      "r7_share_uid",
      "r7_referrals",
      "r7_currency_override",
      "r7_exchange_rate",
      "r7-locale",
      "r7_theme",
      "r7_privacy_profile",
      "r7_privacy_history",
      "r7_privacy_favorites",
      "r7_avatar",
      "r7_operation_logs",
      "r7_registered_users",
    ]);

    const dynamicPrefixes = [
      "r7_unlock_sig_",
      "r7_ref_count_",
      "r7_ref_rewards_",
      "r7_ref_tracked_",
      "r7_quota_",
      "r7_guest_",
      "r7_destiny_free_",
      "r7_tarot_free_full_analysis_used_",
      "r7_cp_support_",
    ];

    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key && dynamicPrefixes.some((prefix) => key.startsWith(prefix))) keys.add(key);
      }
    } catch {}

    return Array.from(keys).sort();
  };

  const exportLocalUserData = () => {
    const keys = getLocalAccountStorageKeys();
    const data = keys.reduce<Record<string, unknown>>((acc, key) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          try { acc[key] = JSON.parse(raw); }
          catch { acc[key] = raw; }
        }
      } catch {}
      return acc;
    }, {});
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `r7fortune-user-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const clearLocalAccountData = () => {
    const confirmed = window.confirm(locale === "zh-TW"
      ? "確定清除本機保存的出生檔案、歷史、付款記錄與偏好嗎？此操作不會刪除服務器帳號。"
      : "Clear locally saved birth profile, history, payment records and preferences? This does not delete the server account.");
    if (!confirmed) return;
    getLocalAccountStorageKeys().forEach((key) => {
      try { localStorage.removeItem(key); } catch {}
    });
    clearBirthProfile();
    setLocalReports([]);
    setAvatar(null);
    setBpYear(""); setBpMonth(""); setBpDay(""); setBpHour(""); setBpMinute(""); setBpPlace("");
  };
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const tabs: { key: TabKey; label: string; icon: typeof Sparkles }[] = [
    { key: "overview", label: locale === "zh-TW" ? "總覽" : "Overview", icon: Home },
    { key: "myPage", label: t("nav.myPage"), icon: User },
    { key: "history", label: t("nav.history"), icon: History },
    { key: "favorites", label: t("nav.favorites"), icon: Heart },
    { key: "payments", label: locale === "zh-TW" ? "付款記錄" : "Payments", icon: CreditCard },
    { key: "settings", label: t("nav.settings"), icon: Settings },
  ];

  const profile = profileData?.profile;
  const stats = { readings: allReports.length, favorites: 0, following: 0, points: 0 };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16 sm:pt-20 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ---- Top Bar ---- */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-[#8a8aad] hover:text-[#FFB6C1] transition-colors">
              <ArrowLeft className="w-4 h-4" /> {locale === "zh-TW" ? "返回" : "Back"}
            </button>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[#f0e6d3] absolute left-1/2 -translate-x-1/2 hidden sm:block">
              {t("nav.profile")}
            </h1>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-[#8a8aad] hover:text-[#FFB6C1] transition-colors">
              <Home className="w-4 h-4" /> {locale === "zh-TW" ? "首頁" : "Home"}
            </Link>
          </div>

          {/* ---- Tab Bar ---- */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => switchTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    active
                      ? "bg-[#FFB6C1] text-[#0a0a0f]"
                      : "bg-[#14142a] text-[#8a8aad] border border-[#FFB6C110] hover:text-[#f0e6d3] hover:border-[#FFB6C122]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ============================================ */}
          {/*  TAB: OVERVIEW (總覽)                         */}
          {/* ============================================ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* User Card */}
              <div className={CARD + " p-5 sm:p-6"}>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#FFB6C130] to-[#14142a] flex items-center justify-center border-2 border-[#FFB6C133] flex-shrink-0">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFB6C1]" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold text-[#f0e6d3]">{user.name || nickname || "User"}</h2>
                      <span className="px-2 py-0.5 bg-[#FFB6C115] text-[#FFB6C1] text-[10px] rounded-full border border-[#FFB6C122]">
                        {user.membershipType === "none" ? "Free" : user.membershipType === "monthly" ? "Monthly" : "Yearly"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8a8aad] mt-0.5">
                      {locale === "zh-TW" ? "ID: " : "ID: "}{user.email || "---"}
                    </p>
                    <p className="text-[10px] text-[#8a8aad44] mt-0.5">
                      {locale === "zh-TW" ? "註冊時間：2026" : "Joined: 2026"}
                    </p>
                  </div>
                  <button
                    onClick={() => { switchTab("settings"); setIsEditing(true); }}
                    className="px-4 py-2 bg-[#FFB6C1] text-[#0a0a0f] rounded-lg text-xs font-medium hover:bg-[#f0a0b8] transition-colors flex-shrink-0"
                  >
                    {locale === "zh-TW" ? "編輯資料" : "Edit Profile"}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard value={`${stats.readings}次`} label={locale === "zh-TW" ? "占卜次數" : "Readings"} icon={Sparkles} />
                <StatCard value={`${stats.favorites}個`} label={locale === "zh-TW" ? "收藏數" : "Favorites"} icon={Heart} />
                <StatCard value={`${stats.following}位`} label={locale === "zh-TW" ? "關注數" : "Following"} icon={Star} />
                <StatCard value={`${stats.points}P`} label={locale === "zh-TW" ? "積分餘額" : "Points"} icon={Crown} />
              </div>

              {/* Quick Entry Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "history", icon: History, label: t("nav.history"), desc: locale === "zh-TW" ? "查看過往占卜" : "Past readings" },
                  { key: "favorites", icon: Heart, label: t("nav.favorites"), desc: locale === "zh-TW" ? "珍藏的內容" : "Saved items" },
                  { key: "myPage", icon: User, label: t("nav.myPage"), desc: locale === "zh-TW" ? "你的公開主頁" : "Public profile" },
                  { key: "settings", icon: Settings, label: t("nav.settings"), desc: locale === "zh-TW" ? "管理偏好設置" : "Preferences" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => switchTab(item.key as TabKey)}
                    className={`${CARD} p-4 text-left hover:-translate-y-1 hover:border-[#FFB6C133] transition-all group`}
                  >
                    <item.icon className="w-5 h-5 text-[#FFB6C166] group-hover:text-[#FFB6C1] transition-colors mb-2" />
                    <p className="text-sm font-medium text-[#f0e6d3] group-hover:text-[#FFB6C1] transition-colors">{item.label}</p>
                    <p className="text-[10px] text-[#8a8aad44] mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              {/* Recent Activity */}
              <div className={CARD + " p-5"}>
                <SectionHeader icon={TrendingUp} title={locale === "zh-TW" ? "最近動態" : "Recent Activity"} />
                {allReports.length > 0 ? (
                  <div className="space-y-2">
                    {allReports.slice(0, 5).map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-[#151520] rounded-lg px-4 py-3 hover:bg-[#0f0f1a] transition-colors cursor-pointer">
                        <span className="text-lg flex-shrink-0">{r.icon || "✨"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#f0e6d3] truncate">{r.title}</p>
                          <p className="text-[10px] text-[#8a8aad44]">{r.date}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-[#FFB6C108] text-[#FFB6C1] rounded-full border border-[#FFB6C115] flex-shrink-0">
                          {r.type || "Tarot"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Sparkles} title={locale === "zh-TW" ? "暫無動態" : "No activity yet"} hint={locale === "zh-TW" ? "完成占卜後記錄將顯示於此" : "Activity will appear here after readings"} />
                )}
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/*  TAB: MY PAGE (我的主頁)                       */}
          {/* ============================================ */}
          {activeTab === "myPage" && (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className={CARD + " p-5 sm:p-6"}>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#FFB6C130] to-[#14142a] flex items-center justify-center border-2 border-[#FFB6C133] flex-shrink-0">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFB6C1]" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl font-bold text-[#f0e6d3]">{user.name || nickname || "User"}</h2>
                    <p className="text-xs text-[#8a8aad] mt-1">
                      {locale === "zh-TW" ? "暫無簡介" : "No bio yet"}
                    </p>
                    <div className="flex items-center gap-4 justify-center sm:justify-start mt-2">
                      <button className="text-xs text-[#8a8aad] hover:text-[#FFB6C1] transition-colors">
                        <span className="text-[#f0e6d3] font-medium">{stats.following}</span> {locale === "zh-TW" ? "關注" : "Following"}
                      </button>
                      <button className="text-xs text-[#8a8aad] hover:text-[#FFB6C1] transition-colors">
                        <span className="text-[#f0e6d3] font-medium">0</span> {locale === "zh-TW" ? "粉絲" : "Followers"}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-[#8a8aad66]">{profilePublic ? (locale === "zh-TW" ? "公開" : "Public") : (locale === "zh-TW" ? "私密" : "Private")}</span>
                    <button
                      onClick={() => setProfilePublic(!profilePublic)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${profilePublic ? "bg-[#FFB6C1]" : "bg-[#333]"} after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform ${profilePublic ? "after:translate-x-5" : ""}`}
                    />
                  </div>
                </div>
              </div>

              {/* Content Wall Tabs */}
              <div className="flex gap-3 border-b border-[#FFB6C110] pb-2">
                {[
                  { key: "shares" as const, label: locale === "zh-TW" ? "公開占卜分享" : "Shared Readings" },
                  { key: "comments" as const, label: locale === "zh-TW" ? "我的評論" : "My Comments" },
                  { key: "collections" as const, label: locale === "zh-TW" ? "公開收藏" : "Public Favorites" },
                ].map((ct) => (
                  <button
                    key={ct.key}
                    onClick={() => setContentTab(ct.key)}
                    className={`relative pb-2 text-xs sm:text-sm font-medium transition-colors ${
                      contentTab === ct.key ? "text-[#FFB6C1]" : "text-[#8a8aad66] hover:text-[#8a8aad]"
                    }`}
                  >
                    {ct.label}
                    {contentTab === ct.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFB6C1] rounded-full" />}
                  </button>
                ))}
              </div>
              <EmptyState icon={FileText} title={locale === "zh-TW" ? "暫無內容" : "No content yet"} hint={locale === "zh-TW" ? "分享你的占卜結果到主頁" : "Share your readings to your page"} />
            </div>
          )}

          {/* ============================================ */}
          {/*  TAB: HISTORY (占卜歷史)                       */}
          {/* ============================================ */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {/* Filter Toolbar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  className="bg-[#151520] border border-[#FFB6C118] rounded-lg px-3 py-2 text-xs text-[#8a8aad] focus:outline-none focus:border-[#FFB6C144]"
                >
                  <option value="all">{locale === "zh-TW" ? "全部類型" : "All Types"}</option>
                  <option value="tarot">{locale === "zh-TW" ? "塔羅牌陣" : "Tarot"}</option>
                  <option value="destiny">{locale === "zh-TW" ? "命理報告" : "Destiny"}</option>
                  <option value="idol">{locale === "zh-TW" ? "愛豆/CP" : "Idol/CP"}</option>
                </select>
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44]" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder={locale === "zh-TW" ? "搜索歷史記錄..." : "Search history..."}
                    className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg pl-8 pr-3 py-2 text-xs text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#FFB6C144]"
                  />
                </div>
              </div>

              {/* History List */}
              {allReports.length > 0 ? (
                <div className="space-y-3">
                  {allReports.map((r: any, i: number) => (
                    <div key={i} className={`${CARD} p-4 hover:border-[#FFB6C133] transition-all`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-[#f0e6d3]">{r.title || (locale === "zh-TW" ? "塔羅占卜" : "Tarot Reading")}</p>
                          <p className="text-[10px] text-[#8a8aad44] mt-0.5">{r.date}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-[#FFB6C108] text-[#FFB6C1] rounded-full border border-[#FFB6C115] flex-shrink-0">
                          {r.type || "Tarot"}
                        </span>
                      </div>
                      <p className="text-xs text-[#8a8aad66] line-clamp-2 mb-3">
                        {r.preview || (locale === "zh-TW" ? "點擊查看完整解讀..." : "Click to view full reading...")}
                      </p>
                      <div className="flex gap-2">
                        {[
                          { icon: Eye, label: locale === "zh-TW" ? "詳情" : "Detail", action: () => {} },
                          { icon: Copy, label: locale === "zh-TW" ? "複製" : "Copy", action: () => navigator.clipboard.writeText(r.title || "") },
                          { icon: Share2, label: locale === "zh-TW" ? "分享" : "Share", action: () => {} },
                        ].map((btn, j) => (
                          <button key={j} onClick={btn.action} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] text-[#8a8aad66] hover:text-[#FFB6C1] hover:bg-[#FFB6C108] transition-all">
                            <btn.icon className="w-3 h-3" /> {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={History} title={locale === "zh-TW" ? "暫無歷史記錄" : "No history yet"} hint={locale === "zh-TW" ? "完成占卜後記錄將自動保存至此" : "Readings will be saved here automatically"} />
              )}

              {allReports.length > 3 && (
                <div className="text-center">
                  <button className="px-6 py-2.5 rounded-lg text-xs font-medium text-[#FFB6C1] border border-[#FFB6C122] hover:bg-[#FFB6C108] transition-all">
                    {locale === "zh-TW" ? "載入更多" : "Load More"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================ */}
          {/*  TAB: FAVORITES (我的收藏)                     */}
          {/* ============================================ */}
          {activeTab === "favorites" && (
            <div className="space-y-4">
              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {["all", "tarot", "destiny", "idol", "other"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFavCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      favCategory === cat
                        ? "bg-[#FFB6C1] text-[#0a0a0f]"
                        : "bg-[#151520] text-[#8a8aad66] border border-[#FFB6C110] hover:text-[#FFB6C1] hover:border-[#FFB6C122]"
                    }`}
                  >
                    {cat === "all" ? (locale === "zh-TW" ? "全部" : "All") :
                     cat === "tarot" ? (locale === "zh-TW" ? "塔羅牌陣" : "Tarot") :
                     cat === "destiny" ? (locale === "zh-TW" ? "命理報告" : "Destiny") :
                     cat === "idol" ? (locale === "zh-TW" ? "愛豆/CP" : "Idol/CP") :
                     (locale === "zh-TW" ? "其他收藏" : "Other")}
                  </button>
                ))}
              </div>

              {/* Favorites Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className={`${CARD} overflow-hidden group hover:-translate-y-1 hover:border-[#FFB6C133] transition-all cursor-pointer`}>
                    <div className="aspect-[4/3] bg-gradient-to-br from-[#FFB6C108] to-[#0a0a0f] flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-[#FFB6C122] group-hover:text-[#FFB6C155] transition-colors" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-[#f0e6d3] group-hover:text-[#FFB6C1] transition-colors truncate">
                        {locale === "zh-TW" ? "收藏示例" : "Sample Favorite"}
                      </p>
                      <p className="text-[9px] text-[#8a8aad44] mt-1">{locale === "zh-TW" ? "收藏於 2026/05" : "Saved 2026/05"}</p>
                    </div>
                    <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#151520]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3 text-rose-400" />
                    </button>
                  </div>
                ))}
              </div>

              <EmptyState icon={Heart} title={locale === "zh-TW" ? "暫無收藏" : "No favorites yet"} hint={locale === "zh-TW" ? "收藏的內容將顯示在這裡" : "Favorited content will appear here"} />
            </div>
          )}

          {/* ============================================ */}
          {/*  TAB: PAYMENTS (付款記錄)                      */}
          {/* ============================================ */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className={CARD + " p-5"}>
                <SectionHeader icon={CreditCard} title={locale === "zh-TW" ? "付款記錄" : "Payment History"} />
                <PaymentHistory locale={locale} />
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/*  TAB: SETTINGS (系統設置)                      */}
          {/* ============================================ */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4 sm:gap-6">
              {/* Side Menu */}
              <div className={`${CARD} p-2 sm:p-3 h-fit space-y-0.5`}>
                {[
                  { key: "profile", icon: User, label: locale === "zh-TW" ? "個人資料" : "Profile" },
                  { key: "privacy", icon: Shield, label: locale === "zh-TW" ? "隱私設置" : "Privacy" },
                  { key: "security", icon: Shield, label: locale === "zh-TW" ? "帳號安全" : "Security" },
                  { key: "notifications", icon: Bell, label: locale === "zh-TW" ? "通知設置" : "Notifications" },
                  { key: "appearance", icon: Palette, label: locale === "zh-TW" ? "外觀設置" : "Appearance" },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = settingsSection === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSettingsSection(item.key)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                        active ? "text-[#FFB6C1] bg-[#FFB6C108]" : "text-[#8a8aad66] hover:text-[#f0e6d3] hover:bg-[#FFB6C105]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Content Area */}
              <div className={`${CARD} p-5 sm:p-6 space-y-6`}>
                {/* === Profile Edit === */}
                {(settingsSection === "profile" || settingsSection === "security") && (
                <div>
                  <SectionHeader icon={User} title={locale === "zh-TW" ? "個人資料" : "Profile"} />
                  <div className="space-y-4">
                    {/* Avatar upload */}
                    <div className="flex items-center gap-4">
                      {avatar ? (
                        <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#FFB6C133] flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFB6C130] to-[#14142a] flex items-center justify-center border-2 border-[#FFB6C133] flex-shrink-0">
                          <User className="w-6 h-6 text-[#FFB6C1]" />
                        </div>
                      )}
                      <div>
                        <label className="px-3 py-1.5 rounded-lg text-[10px] text-[#FFB6C1] border border-[#FFB6C122] hover:bg-[#FFB6C108] transition-all cursor-pointer inline-block">
                          {locale === "zh-TW" ? "上傳頭像" : "Upload Avatar"}
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        </label>
                        {avatarMsg && (
                          <p className={`text-[9px] mt-1 ${avatarMsg.includes("成功") || avatarMsg.includes("uploaded") ? "text-green-400" : "text-rose-400"}`}>
                            {avatarMsg}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Nickname + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#8a8aad66] mb-1">{locale === "zh-TW" ? "暱稱" : "Nickname"}</label>
                        <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Your nickname" className={INPUT} />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#8a8aad66] mb-1">{locale === "zh-TW" ? "郵箱" : "Email"}</label>
                        <input type="text" value={user.email || ""} disabled className={INPUT + " opacity-50"} />
                      </div>
                    </div>
                    {/* Save button */}
                    <button onClick={handleSaveProfile} disabled={updateProfile.isPending} className="px-5 py-2.5 bg-[#FFB6C1] text-[#0a0a0f] rounded-lg text-xs font-medium hover:bg-[#f0a0b8] transition-colors flex items-center gap-1.5">
                      {updateProfile.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : profileSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                      {profileSaved ? (locale === "zh-TW" ? "已儲存" : "Saved") : (locale === "zh-TW" ? "保存修改" : "Save Changes")}
                    </button>
                  </div>
                </div>
                )}

                {/* Birth Profile (我的個人檔案) — shown in profile section */}
                {settingsSection === "profile" && (
                <div className="border-t border-[#FFB6C110] pt-6">
                  <SectionHeader icon={Calendar} title={locale === "zh-TW" ? "我的個人檔案" : "My Birth Profile"} />
                  <p className="text-[10px] text-[#8a8aad44] mb-4">
                    {locale === "zh-TW" ? "出生資訊將自動填入所有占卜表單，修改後即時同步" : "Birth info auto-fills all reading forms — changes sync instantly"}
                  </p>
                  <div className="space-y-4">
                    {/* Date of Birth */}
                    <div>
                      <label className="block text-[10px] text-[#8a8aad66] mb-1.5">{locale === "zh-TW" ? "出生日期" : "Date of Birth"} *</label>
                      <div className="grid grid-cols-3 gap-2">
                        <select value={bpYear} onChange={(e) => { setBpYear(e.target.value); setBpDay(""); }}
                          className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-2 py-2.5 text-xs text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer">
                          <option value="">{locale === "zh-TW" ? "年" : "Year"}</option>
                          {BP_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select value={bpMonth} onChange={(e) => { setBpMonth(e.target.value); setBpDay(""); }}
                          className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-2 py-2.5 text-xs text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer">
                          <option value="">{locale === "zh-TW" ? "月" : "Month"}</option>
                          {BP_MONTHS.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                        </select>
                        <select value={bpDay} onChange={(e) => setBpDay(e.target.value)} disabled={!bpYear || !bpMonth}
                          className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-2 py-2.5 text-xs text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer disabled:opacity-30">
                          <option value="">{locale === "zh-TW" ? "日" : "Day"}</option>
                          {BP_DAYS.map((d) => <option key={d} value={d}>{String(d).padStart(2, "0")}</option>)}
                        </select>
                      </div>
                      {bpYear && bpMonth && bpDay && (() => {
                        const d = computeDerivedFields(bpYear, bpMonth, bpDay);
                        return d.baziDayPillar ? (
                          <p className="text-[9px] text-[#FFB6C1] mt-1.5">
                            {locale === "zh-TW" ? "日柱" : "Day Pillar"}: {d.baziDayPillar} · {locale === "zh-TW" ? "星宿" : "Mansion"}: {d.starMansion} · {d.zodiacSign}
                          </p>
                        ) : null;
                      })()}
                    </div>

                    {/* Birth Time */}
                    <div>
                      <label className="block text-[10px] text-[#8a8aad66] mb-1.5">{locale === "zh-TW" ? "出生時間（可選）" : "Birth Time (optional)"}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select value={bpHour} onChange={(e) => setBpHour(e.target.value)}
                          className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-2 py-2.5 text-xs text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer">
                          <option value="">{locale === "zh-TW" ? "時" : "Hour"}</option>
                          {BP_HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
                        </select>
                        <select value={bpMinute} onChange={(e) => setBpMinute(e.target.value)}
                          className="w-full bg-[#151520] border border-[#FFB6C118] rounded-lg px-2 py-2.5 text-xs text-[#f0e6d3] focus:outline-none focus:border-[#FFB6C144] appearance-none cursor-pointer">
                          <option value="">{locale === "zh-TW" ? "分" : "Minute"}</option>
                          {BP_MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Birth Place */}
                    <div>
                      <label className="block text-[10px] text-[#8a8aad66] mb-1.5">{locale === "zh-TW" ? "出生地點（可選）" : "Birth Place (optional)"}</label>
                      <input type="text" value={bpPlace} onChange={(e) => setBpPlace(e.target.value)}
                        placeholder={locale === "zh-TW" ? "如：北京市" : "e.g. Beijing"}
                        className={INPUT} />
                    </div>

                    {/* Save / Clear buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          updateBirthProfile({ birthYear: bpYear, birthMonth: bpMonth, birthDay: bpDay, birthHour: bpHour, birthMinute: bpMinute, birthPlace: bpPlace });
                          setBirthSaved(true);
                          setTimeout(() => setBirthSaved(false), 2000);
                        }}
                        className="px-5 py-2.5 bg-[#FFB6C1] text-[#0a0a0f] rounded-lg text-xs font-medium hover:bg-[#f0a0b8] transition-colors flex items-center gap-1.5"
                      >
                        {birthSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                        {birthSaved ? (locale === "zh-TW" ? "已儲存" : "Saved") : (locale === "zh-TW" ? "儲存修改" : "Save Changes")}
                      </button>
                      {hasProfile && (
                        <button
                          onClick={() => {
                            clearBirthProfile();
                            setBpYear(""); setBpMonth(""); setBpDay(""); setBpHour(""); setBpMinute(""); setBpPlace("");
                          }}
                          className="px-4 py-2.5 rounded-lg text-xs font-medium text-[#8a8aad66] border border-[#FFB6C110] hover:text-rose-400 hover:border-rose-400/20 transition-all"
                        >
                          {locale === "zh-TW" ? "清除檔案" : "Clear Profile"}
                        </button>
                      )}
                    </div>
                    <PrivacyNotice compact />
                  </div>
                </div>
                )}

                {/* Privacy — shown in privacy section */}
                {settingsSection === "privacy" && (
                <div className="border-t border-[#FFB6C110] pt-6">
                  <SectionHeader icon={Shield} title={locale === "zh-TW" ? "隱私設置" : "Privacy"} />
                  <div className="space-y-3">
                    {[
                      { label: locale === "zh-TW" ? "主頁可見" : "Profile Visible", state: profilePublic, key: "profile" as const },
                      { label: locale === "zh-TW" ? "歷史可見" : "History Visible", state: historyPublic, key: "history" as const },
                      { label: locale === "zh-TW" ? "收藏可見" : "Favorites Visible", state: favoritesPublic, key: "favorites" as const },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#151520] rounded-lg px-4 py-3">
                        <span className="text-xs text-[#8a8aad]">{item.label}</span>
                        <button
                          onClick={() => togglePrivacy(item.key)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${item.state ? "bg-[#FFB6C1]" : "bg-[#333]"} after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform ${item.state ? "after:translate-x-5" : ""}`}
                        />
                      </div>
                    ))}
                    {privacySaved && (
                      <p className="text-[10px] text-green-400 text-center">
                        {locale === "zh-TW" ? "隱私設置已儲存" : "Privacy settings saved"}
                      </p>
                    )}
                    <div className="rounded-2xl border border-[#FFB6C115] bg-[#151520] p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-[#f0e6d3]">
                            {locale === "zh-TW" ? "資料管理" : "Data Management"}
                          </p>
                          <p className="mt-1 text-[10px] leading-5 text-[#8a8aad66]">
                            {locale === "zh-TW"
                              ? "可導出或清除本機保存的出生檔案、歷史與付款記錄。正式服務器刪號接口上線後會接入此處。"
                              : "Export or clear locally saved birth profiles, history, and payment records. Server-side account deletion will be connected here when available."}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={exportLocalUserData}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d4a85324] px-4 py-2.5 text-xs font-semibold text-[#d4a853] hover:bg-[#d4a85310] transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {locale === "zh-TW" ? "導出我的資料" : "Export my data"}
                        </button>
                        <button
                          type="button"
                          onClick={clearLocalAccountData}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-300/20 px-4 py-2.5 text-xs font-semibold text-rose-200 hover:bg-rose-400/8 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {locale === "zh-TW" ? "清除本機資料" : "Clear local data"}
                        </button>
                      </div>
                    </div>
                    <Link to="/privacy-policy" className="block text-center text-[10px] text-[#d4a853] hover:underline">
                      {locale === "zh-TW" ? "查看完整隱私政策" : "View full privacy policy"}
                    </Link>
                  </div>
                </div>
                )}

                {/* === Notifications === */}
                {settingsSection === "notifications" && (
                <div>
                  <SectionHeader icon={Bell} title={locale === "zh-TW" ? "通知設置" : "Notifications"} />
                  <p className="text-[10px] text-[#8a8aad44] mb-4">
                    {locale === "zh-TW" ? "管理你的通知偏好設定" : "Manage your notification preferences"}
                  </p>
                  <div className="space-y-3">
                    {[
                      { label: locale === "zh-TW" ? "占卜結果通知" : "Reading Results", key: "reading", on: true },
                      { label: locale === "zh-TW" ? "系統更新通知" : "System Updates", key: "system", on: true },
                      { label: locale === "zh-TW" ? "愛豆動態提醒" : "Idol Updates", key: "idol", on: false },
                      { label: locale === "zh-TW" ? "會員優惠通知" : "Promotions", key: "promo", on: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#151520] rounded-lg px-4 py-3">
                        <span className="text-xs text-[#8a8aad]">{item.label}</span>
                        <button className={`w-10 h-5 rounded-full transition-colors relative ${item.on ? "bg-[#FFB6C1]" : "bg-[#333]"} after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform ${item.on ? "after:translate-x-5" : ""}`} />
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {/* === Appearance === */}
                {settingsSection === "appearance" && (
                <div>
                  <SectionHeader icon={Palette} title={locale === "zh-TW" ? "外觀設置" : "Appearance"} />
                  <p className="text-[10px] text-[#8a8aad44] mb-4">
                    {locale === "zh-TW" ? "選擇你偏好的外觀主題" : "Choose your preferred appearance theme"}
                  </p>
                  <div className="space-y-3">
                    {[
                      { key: "dark" as const, label: locale === "zh-TW" ? "深色模式" : "Dark Mode", desc: locale === "zh-TW" ? "深邃星空背景" : "Deep space background" },
                      { key: "light" as const, label: locale === "zh-TW" ? "淺色模式" : "Light Mode", desc: locale === "zh-TW" ? "清新簡潔風格" : "Clean and bright style" },
                    ].map((item, i) => {
                      const active = theme === item.key;
                      return (
                      <button key={i}
                        onClick={() => { setTheme(item.key); localStorage.setItem("r7_theme", item.key); }}
                        className={`w-full flex items-center justify-between bg-[#151520] rounded-lg px-4 py-3 transition-all ${
                          active ? "border border-[#FFB6C133]" : "border border-transparent hover:border-[#FFB6C115]"
                        }`}
                      >
                        <div className="text-left">
                          <span className={`text-xs ${active ? "text-[#FFB6C1]" : "text-[#8a8aad]"}`}>{item.label}</span>
                          <p className="text-[9px] text-[#8a8aad44] mt-0.5">{item.desc}</p>
                        </div>
                        {active && <Check className="w-4 h-4 text-[#FFB6C1]" />}
                      </button>
                      );
                    })}
                  </div>
                </div>
                )}

                {/* Language */}
                <div className="border-t border-[#FFB6C110] pt-6">
                  <SectionHeader icon={Globe} title={t("settings.language")} />
                  <div className="flex gap-2">
                    {(["zh", "zh-TW", "en"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLocale(l)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                          locale === l ? "bg-[#FFB6C1] text-[#0a0a0f]" : "bg-[#151520] text-[#8a8aad66] border border-[#FFB6C110] hover:text-[#FFB6C1] hover:border-[#FFB6C122]"
                        }`}
                      >
                        {l === "zh" ? "简体中文" : l === "zh-TW" ? "繁體中文" : "English"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logout */}
                <div className="border-t border-[#FFB6C110] pt-6">
                  <button
                    onClick={() => setLogoutOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium text-rose-400/70 border border-rose-400/20 hover:bg-rose-400/5 hover:text-rose-400 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t("logout")}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
      <CustomerService />

      <LogoutModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}

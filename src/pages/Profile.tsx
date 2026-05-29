import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";
import Footer from "@/sections/Footer";
import {
  ArrowLeft, User, Wallet, Settings, Save, Edit3, Loader2,
  Calendar, MapPin, Clock, Globe, DollarSign, FileText, Check,
  Sparkles, Star, Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";


type Tab = "profile" | "reports" | "wallet" | "settings";

export default function ProfilePage() {
  const { t, locale, setLocale } = useI18n();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [localReports, setLocalReports] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("r7_reports") || "[]"); } catch { return []; }
  });

  // Auto-load saved profile from localStorage
  useEffect(() => {
    try {
      const sp = JSON.parse(localStorage.getItem("r7_profile") || "{}");
      if (sp.birthDate) setBirthDate(sp.birthDate);
      if (sp.birthTime) setBirthTime(sp.birthTime);
      if (sp.birthPlace) setBirthPlace(sp.birthPlace);
      if (sp.gender) setGender(sp.gender);
    } catch {}
  }, []);

  const { data: profileData, refetch } = trpc.user.getProfile.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: walletData } = trpc.user.getWallet.useQuery(
    undefined,
    { enabled: !!user && activeTab === "wallet" }
  );

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => { setSaved(true); setIsEditing(false); refetch(); setTimeout(() => setSaved(false), 2000); },
  });
  const updateSettings = trpc.user.updateSettings.useMutation({
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#d4a853] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8a8aad] mb-4">Please login first</p>
          <Link to="/login" className="text-[#d4a853] hover:underline text-sm">Go to Login</Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    if (!birthDate) return;
    // Save to localStorage as fallback
    localStorage.setItem("r7_profile", JSON.stringify({ birthDate, birthTime, birthPlace, gender }));
    updateProfile.mutate({ birthDate, birthTime: birthTime || undefined, birthPlace: birthPlace || undefined, gender });
  };

  const handleSaveSettings = () => {
    updateSettings.mutate({ language: locale });
  };

  const tabs = [
    { key: "profile" as Tab, label: t("profile.myProfile"), icon: User },
    { key: "reports" as Tab, label: t("profile.myReports"), icon: FileText },
    { key: "wallet" as Tab, label: t("profile.wallet"), icon: Wallet },
    { key: "settings" as Tab, label: t("profile.settings"), icon: Settings },
  ];

  const profile = profileData?.profile;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/" className="text-[#8a8aad] hover:text-[#d4a853] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#f0e6d3]">{t("nav.profile")}</h1>
              <p className="text-xs text-[#8a8aad]">Manage your personal info and settings</p>
            </div>
          </div>

          {/* User Card */}
          <div className="bg-[#14142a]/60 border border-[#d4a85322] rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-16 h-16 rounded-full border-2 border-[#d4a85344]" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4a85344] to-[#14142a] flex items-center justify-center border-2 border-[#d4a85344]">
                  <User className="w-6 h-6 text-[#d4a853]" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-[#f0e6d3]">{user.name || "User"}</h2>
                <p className="text-xs text-[#8a8aad]">{user.email || ""}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 bg-[#d4a85315] text-[#d4a853] rounded-full border border-[#d4a85322]">
                    {user.freeReadings} free credits
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#d4a85315] text-[#d4a853] rounded-full border border-[#d4a85322]">
                    {user.membershipType === "none" ? "Free" : user.membershipType === "monthly" ? "Monthly" : "Yearly"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-[#d4a853] text-[#0a0a0f]"
                    : "bg-[#14142a] text-[#8a8aad] hover:text-[#f0e6d3]"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-[#14142a]/60 border border-[#d4a85322] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-[#f0e6d3] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#d4a853]" />
                  {t("profile.birthInfo")}
                </h3>
                {!isEditing ? (
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="text-[#d4a853] hover:bg-[#d4a85322]">
                    <Edit3 className="w-4 h-4 mr-1" />
                    {t("profile.edit")}
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={handleSaveProfile} disabled={updateProfile.isPending} className="text-green-400 hover:bg-green-400/10">
                    {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : saved ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    {t("profile.save")}
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#8a8aad] mb-1.5">Birth Date *</label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full bg-[#0a0a0f] border border-[#d4a85333] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85388]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8a8aad] mb-1.5">Birth Time (optional)</label>
                      <input
                        type="time"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="w-full bg-[#0a0a0f] border border-[#d4a85333] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85388]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8a8aad] mb-1.5">Birth Place (optional)</label>
                      <input
                        type="text"
                        value={birthPlace}
                        onChange={(e) => setBirthPlace(e.target.value)}
                        placeholder="e.g. Beijing"
                        className="w-full bg-[#0a0a0f] border border-[#d4a85333] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] placeholder-[#8a8aad55] focus:outline-none focus:border-[#d4a85388]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8a8aad] mb-1.5">Gender (optional)</label>
                      <select
                        value={gender || ""}
                        onChange={(e) => setGender(e.target.value as any || undefined)}
                        className="w-full bg-[#0a0a0f] border border-[#d4a85333] rounded-lg px-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85388]"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile ? (
                    <>
                      <div className="flex items-center justify-between bg-[#0a0a0f] rounded-lg px-4 py-3">
                        <span className="text-xs text-[#8a8aad] flex items-center gap-1"><Calendar className="w-3 h-3" />Birth Date</span>
                        <span className="text-sm text-[#f0e6d3]">{profile.birthDate ? new Date(profile.birthDate).toLocaleDateString("zh-CN") : "-"}</span>
                      </div>
                      <div className="flex items-center justify-between bg-[#0a0a0f] rounded-lg px-4 py-3">
                        <span className="text-xs text-[#8a8aad] flex items-center gap-1"><Clock className="w-3 h-3" />Birth Time</span>
                        <span className="text-sm text-[#f0e6d3]">{profile.birthTime || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between bg-[#0a0a0f] rounded-lg px-4 py-3">
                        <span className="text-xs text-[#8a8aad] flex items-center gap-1"><MapPin className="w-3 h-3" />Birth Place</span>
                        <span className="text-sm text-[#f0e6d3]">{profile.birthPlace || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between bg-[#0a0a0f] rounded-lg px-4 py-3">
                        <span className="text-xs text-[#8a8aad] flex items-center gap-1"><User className="w-3 h-3" />Gender</span>
                        <span className="text-sm text-[#f0e6d3]">{profile.gender === "male" ? "Male" : profile.gender === "female" ? "Female" : profile.gender === "other" ? "Other" : "-"}</span>
                      </div>
                      {profile.zodiacSign && (
                        <div className="flex items-center justify-between bg-[#0a0a0f] rounded-lg px-4 py-3">
                          <span className="text-xs text-[#8a8aad]">Zodiac Sign</span>
                          <span className="text-sm text-[#d4a853]">{profile.zodiacSign}</span>
                        </div>
                      )}
                      {profile.baziDayPillar && (
                        <div className="flex items-center justify-between bg-[#0a0a0f] rounded-lg px-4 py-3">
                          <span className="text-xs text-[#8a8aad]">Bazi Day Pillar</span>
                          <span className="text-sm text-[#d4a853]">{profile.baziDayPillar}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-[#8a8aad]">
                      <p className="text-sm">Birth info not set</p>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="mt-2 text-[#d4a853]">
                        Set Now
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="bg-[#14142a]/60 border border-[#d4a85322] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[#f0e6d3] flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[#d4a853]" />
                  {t("profile.savedReports")}
                </h3>
                {localReports.length > 0 ? (
                  <div className="space-y-2">
                    {localReports.map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-[#0a0a0f] rounded-lg px-4 py-3 hover:bg-[#0f0f1a] transition-colors cursor-pointer">
                        <span className="text-lg">{r.icon || "✨"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-[#f0e6d3] truncate">{r.title}</div>
                          <div className="text-[10px] text-[#8a8aad]">{r.date}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-[#d4a85308] text-[#d4a853] rounded border border-[#d4a85315]">{r.type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#8a8aad] text-sm">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[#8a8aad33]" />
                    <p>No reports yet</p>
                    <p className="text-[10px] mt-1">Reports will be saved here after completing readings</p>
                  </div>
                )}
              </div>
              <div className="bg-[#14142a]/60 border border-[#d4a85322] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[#f0e6d3] flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-[#d4a853]" />
                  {t("profile.favorites")}
                </h3>
                <div className="text-center py-6 text-[#8a8aad] text-sm">
                  <Bookmark className="w-8 h-8 mx-auto mb-2 text-[#8a8aad33]" />
                  <p>No favorites yet</p>
                  <p className="text-[10px] mt-1">Saved charts and artists will appear here</p>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <div className="space-y-4">
              <div className="bg-[#14142a]/60 border border-[#d4a85322] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[#f0e6d3] flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-[#d4a853]" />
                  {t("wallet.balance")}
                </h3>
                <div className="text-3xl font-display font-bold text-[#d4a853]">
                  ${walletData?.totalSpent?.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-[#8a8aad] mt-1">{walletData?.paymentCount || 0} transactions</p>
              </div>

              <div className="bg-[#14142a]/60 border border-[#d4a85322] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[#f0e6d3] flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-[#d4a853]" />
                  {t("wallet.paymentHistory")}
                </h3>
                {walletData?.payments && walletData.payments.length > 0 ? (
                  <div className="space-y-2">
                    {walletData.payments.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between bg-[#0a0a0f] rounded-lg px-4 py-3">
                        <div>
                          <div className="text-xs text-[#f0e6d3]">{p.description || p.type}</div>
                          <div className="text-[10px] text-[#8a8aad]">{new Date(p.createdAt).toLocaleDateString("zh-CN")}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#f0e6d3]">${parseFloat(String(p.amount)).toFixed(2)}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            p.status === "completed" ? "text-green-400 bg-green-400/10" :
                            p.status === "pending" ? "text-[#d4a853] bg-[#d4a853]/10" :
                            "text-red-400 bg-red-400/10"
                          }`}>
                            {p.status === "completed" ? "Completed" : p.status === "pending" ? "Pending" : "Failed"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#8a8aad] text-sm">No payment records</div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-[#14142a]/60 border border-[#d4a85322] rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[#f0e6d3] flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-[#d4a853]" />
                  {t("settings.language")}
                </h3>
                <div className="flex gap-2">
                  {(["zh", "en"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLocale(l)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        locale === l
                          ? "bg-[#d4a853] text-[#0a0a0f] font-medium"
                          : "bg-[#0a0a0f] text-[#8a8aad] hover:text-[#f0e6d3] border border-[#d4a85322]"
                      }`}
                    >
                      {l === "zh" ? "CH" : "EN"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#d4a85322]">
                <Button
                  onClick={handleSaveSettings}
                  disabled={updateSettings.isPending}
                  className="bg-[#d4a853] text-[#0a0a0f] hover:bg-[#e0b860]"
                >
                  {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {t("settings.save")}
                </Button>
              </div>

              <div className="pt-4 border-t border-[#d4a85322]">
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-red-400/30 text-red-400 hover:bg-red-400/10 hover:text-red-400"
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

function ReportItem({ icon, title, date, type }: { icon: string; title: string; date: string; type: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#0a0a0f] rounded-lg px-4 py-3 hover:bg-[#0f0f1a] transition-colors cursor-pointer">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[#f0e6d3] truncate">{title}</div>
        <div className="text-[10px] text-[#8a8aad]">{date}</div>
      </div>
      <span className="text-[10px] px-2 py-0.5 bg-[#d4a85308] text-[#d4a853] rounded border border-[#d4a85315]">
        {type}
      </span>
    </div>
  );
}

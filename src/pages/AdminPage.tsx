import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import Navbar from "@/components/Navbar";
import { User, Database, Clock, Trash2, RefreshCw, Shield, LogIn, Lock, Key, Search, Filter, Heart, Star, Crown, Layers2 } from "lucide-react";
import { ZIWEI_CARDS, ZIWEI_TAROT_PRICE } from "@/data/ziweiTarot";

type Tab = "memory" | "logs" | "profiles" | "system" | "test" | "ziwei";

// ---- Super admin credentials (change after first login) ----
const ADMIN_USER = "ad123456";
const ADMIN_PASS = "lyt199834";

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem("r7_admin_auth", "true");
      onLogin();
    } else {
      setError(isZh ? "帳號或密碼錯誤" : "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 max-w-sm w-full border border-[#d4a85320] space-y-4">
        <div className="text-center">
          <Shield className="w-10 h-10 text-[#d4a853] mx-auto mb-2" />
          <h2 className="font-display text-lg font-bold text-[#f0e6d3]">{isZh ? "後台管理登入" : "Admin Login"}</h2>
        </div>
        <div>
          <label className="block text-[10px] text-[#8a8aad66] mb-1">{isZh ? "帳號" : "Username"}</label>
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44]" />
            <input type="text" value={user} onChange={e => setUser(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg pl-8 pr-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366]" />
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-[#8a8aad66] mb-1">{isZh ? "密碼" : "Password"}</label>
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8a8aad44]" />
            <input type="password" value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg pl-8 pr-3 py-2.5 text-sm text-[#f0e6d3] focus:outline-none focus:border-[#d4a85366]" />
          </div>
        </div>
        {error && <p className="text-[10px] text-rose-400 text-center">{error}</p>}
        <button onClick={handleLogin}
          className="w-full py-2.5 bg-[#d4a853] text-[#0a0a0f] rounded-lg text-sm font-bold hover:bg-[#e0b860] transition-colors flex items-center justify-center gap-1.5">
          <LogIn className="w-4 h-4" /> {isZh ? "登入後台" : "Login"}
        </button>
      </div>
    </div>
  );
}

// ---- User Overview helpers ----
function getUserVIPStatus(userData: any): "vip" | "expired" | "free" {
  try {
    const sub = JSON.parse(localStorage.getItem("r7_sub_state") || "{}");
    if (sub.vip && sub.expiresAt) {
      return new Date(sub.expiresAt) > new Date() ? "vip" : "expired";
    }
  } catch {}
  return "free";
}

function getUserFreeReadings(): number {
  try {
    const used = parseInt(localStorage.getItem("tarot_free_used") || "0");
    return Math.max(0, 3 - used);
  } catch { return 3; }
}

function getUserInviteCount(uid: string): number {
  return parseInt(localStorage.getItem(`r7_ref_count_${uid}`) || "0");
}

function AdminTestTools({ isZh, onRefresh }: { isZh: boolean; onRefresh: () => void }) {
  const [uid, setUid] = useState("");
  const [msg, setMsg] = useState("");

  const tools = [
    { label: isZh ? "添加 VIP 30 天" : "Add VIP 30 Days", action: () => {
      const sub = JSON.parse(localStorage.getItem("r7_sub_state") || "{}");
      sub.plan = "monthly"; sub.vip = true; sub.vipSince = new Date().toISOString();
      sub.expiresAt = new Date(Date.now() + 30*24*60*60*1000).toISOString();
      localStorage.setItem("r7_sub_state", JSON.stringify(sub));
      setMsg(isZh ? "✅ VIP 已開通 30 天" : "✅ VIP activated for 30 days");
    }},
    { label: isZh ? "移除 VIP（立即過期）" : "Expire VIP Now", action: () => {
      const sub = JSON.parse(localStorage.getItem("r7_sub_state") || "{}");
      sub.expiresAt = new Date(Date.now() - 1000).toISOString();
      localStorage.setItem("r7_sub_state", JSON.stringify(sub));
      setMsg(isZh ? "⚠️ VIP 已設為過期" : "⚠️ VIP set to expired");
    }},
    { label: isZh ? "添加 5 次免費占卜" : "Add 5 Free Readings", action: () => {
      localStorage.setItem("tarot_free_used", "0");
      const refs = parseInt(localStorage.getItem(`r7_ref_rewards_${uid || "test"}`) || "0") + 5;
      localStorage.setItem(`r7_ref_rewards_${uid || "test"}`, String(refs));
      setMsg(isZh ? "✅ 已添加 5 次免費占卜" : "✅ 5 free readings added");
    }},
    { label: isZh ? "模擬 3 人邀請成功" : "Simulate 3 Invites", action: () => {
      const id = uid || "test";
      localStorage.setItem(`r7_ref_count_${id}`, "3");
      const refs = parseInt(localStorage.getItem(`r7_ref_rewards_${id}`) || "0") + 1;
      localStorage.setItem(`r7_ref_rewards_${id}`, String(refs));
      const referrals = JSON.parse(localStorage.getItem("r7_referrals") || "[]");
      for (let i = 0; i < 3; i++) referrals.push({ ref: id, date: new Date().toISOString() });
      localStorage.setItem("r7_referrals", JSON.stringify(referrals));
      setMsg(isZh ? "✅ 已模擬 3 人邀請，獎勵 1 次免費占卜" : "✅ 3 invites simulated, 1 free reward granted");
    }},
    { label: isZh ? "重置所有數據" : "Reset All Data", action: () => {
      if (confirm(isZh ? "確定要清除所有測試數據？" : "Confirm reset all test data?")) {
        localStorage.removeItem("r7_sub_state"); localStorage.removeItem("tarot_free_used");
        localStorage.removeItem("r7_ref_count_test"); localStorage.removeItem("r7_ref_rewards_test");
        setMsg(isZh ? "🔄 所有測試數據已重置" : "🔄 All test data reset");
        onRefresh();
      }
    }},
  ];

  return (
    <div className="glass rounded-xl p-5 border border-[#d4a85315] space-y-3">
      <h3 className="text-sm font-semibold text-[#f0e6d3]">{isZh ? "測試工具（無需真實支付）" : "Test Tools (No Real Payment)"}</h3>
      <input type="text" value={uid} onChange={e => setUid(e.target.value)}
        placeholder={isZh ? "用戶 ID（可選）" : "User ID (optional)"}
        className="w-full bg-[#151520] border border-[#d4a85322] rounded-lg px-3 py-2 text-xs text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#d4a85366]" />
      <div className="grid grid-cols-2 gap-2">
        {tools.map((t, i) => (
          <button key={i} onClick={() => { t.action(); onRefresh(); }}
            className="bg-[#151520] border border-[#d4a85315] rounded-lg px-3 py-2.5 text-[10px] text-[#f0e6d3] hover:border-[#d4a85344] transition-colors text-left">
            {t.label}
          </button>
        ))}
      </div>
      {msg && <p className="text-[10px] text-[#FFB6C1] text-center">{msg}</p>}
    </div>
  );
}

// ---- Init test user on first load ----
function initTestUser() {
  const users = JSON.parse(localStorage.getItem("r7_registered_users") || "[]");
  if (!users.find((u: any) => u.email === "test001")) {
    users.push({ email: "test001", name: isZh ? "測試用戶" : "Test User", registered: new Date().toISOString(), status: "active" });
    localStorage.setItem("r7_registered_users", JSON.stringify(users));
  }
}

export default function AdminPage() {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("r7_admin_auth") === "true");
  const [tab, setTab] = useState<Tab>("memory");
  const [userMemory, setUserMemory] = useState<any>({});
  const [operationLogs, setOperationLogs] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [vipFilter, setVipFilter] = useState<string>("all");

  useEffect(() => { if (authed) loadAll(); }, [authed]);

  const loadAll = () => {
    try { setUserMemory(JSON.parse(localStorage.getItem("r7_birth_profile") || "{}")); } catch {}
    try { setOperationLogs(JSON.parse(localStorage.getItem("r7_operation_logs") || "[]")); } catch {}
    try { setUserProfiles(JSON.parse(localStorage.getItem("r7_registered_users") || "[]")); } catch {}
  };

  const clearMemory = (key: string) => { localStorage.removeItem(key); loadAll(); };
  const clearLogs = () => { localStorage.setItem("r7_operation_logs", "[]"); setOperationLogs([]); };
  const handleLogout = () => { sessionStorage.removeItem("r7_admin_auth"); setAuthed(false); };

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#d4a853]" />
              <h1 className="font-display text-2xl font-bold text-[#f0e6d3]">{isZh ? "後台管理" : "Admin Panel"}</h1>
            </div>
            <button onClick={handleLogout} className="px-3 py-1.5 text-[10px] text-rose-400 border border-rose-400/20 rounded-lg hover:bg-rose-400/10 transition-colors">
              {isZh ? "退出登入" : "Logout"}
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            {[
              { key: "memory" as Tab, icon: Database, label: isZh ? "用戶記憶" : "Memory" },
              { key: "logs" as Tab, icon: Clock, label: isZh ? "操作日誌" : "Logs" },
              { key: "profiles" as Tab, icon: User, label: isZh ? "用戶總覽" : "Users" },
              { key: "ziwei" as Tab, icon: Layers2, label: isZh ? "紫微雙牌" : "Ziwei Dual" },
              { key: "system" as Tab, icon: Shield, label: isZh ? "系統維護" : "System" },
            { key: "test" as Tab, icon: Database, label: isZh ? "測試工具" : "Test Tools" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t.key ? "bg-[#d4a853] text-[#0a0a0f]" : "bg-[#14142a] text-[#8a8aad]"
                }`}><t.icon className="w-4 h-4" /> {t.label}</button>
            ))}
            <button onClick={loadAll} className="ml-auto px-3 py-2 rounded-lg text-xs text-[#8a8aad] border border-[#d4a85315] hover:text-[#d4a853] transition-colors flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> {isZh ? "刷新" : "Refresh"}
            </button>
          </div>

          {/* Memory Tab */}
          {tab === "memory" && (
            <div className="glass rounded-xl p-5 border border-[#d4a85315] space-y-3">
              <h3 className="text-sm font-semibold text-[#f0e6d3]">{isZh ? "使用者記憶緩存" : "User Memory Cache"}</h3>
              {Object.keys(userMemory).length === 0 ? (
                <p className="text-xs text-[#8a8aad44]">{isZh ? "暫無緩存數據" : "No cached data"}</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(userMemory).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between bg-[#151520] rounded-lg px-4 py-3">
                      <div><p className="text-xs font-medium text-[#f0e6d3]">{key}</p><p className="text-[10px] text-[#8a8aad44]">{JSON.stringify(val).slice(0, 80)}</p></div>
                      <button onClick={() => clearMemory(key)} className="px-2 py-1 text-[10px] text-rose-400 border border-rose-400/20 rounded hover:bg-rose-400/10"><Trash2 className="w-3 h-3 inline mr-1" />{isZh ? "清除" : "Clear"}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {tab === "logs" && (
            <div className="glass rounded-xl p-5 border border-[#d4a85315] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#f0e6d3]">{isZh ? "操作日誌" : "Operation Logs"}</h3>
                <button onClick={clearLogs} className="px-3 py-1.5 text-[10px] text-rose-400 border border-rose-400/20 rounded-lg hover:bg-rose-400/10">{isZh ? "清空日誌" : "Clear"}</button>
              </div>
              {operationLogs.length === 0 ? <p className="text-xs text-[#8a8aad44]">{isZh ? "暫無日誌" : "No logs"}</p> : (
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {operationLogs.slice().reverse().map((log: any, i) => (
                    <div key={i} className="bg-[#151520] rounded-lg px-4 py-2 text-[10px] text-[#8a8aad] flex justify-between"><span>{log.action}</span><span className="text-[#8a8aad44]">{log.time}</span></div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== USER OVERVIEW with VIP/Readings/Invites ===== */}
          {tab === "profiles" && (
            <div className="space-y-4">
              {/* VIP Filter */}
              <div className="flex gap-2 items-center">
                <Filter className="w-3.5 h-3.5 text-[#8a8aad44]" />
                <span className="text-[10px] text-[#8a8aad44]">{isZh ? "會員狀態：" : "Status:"}</span>
                {["all", "vip", "free", "expired"].map(f => (
                  <button key={f} onClick={() => setVipFilter(f)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                      vipFilter === f ? "bg-[#d4a853] text-[#0a0a0f]" : "bg-[#151520] text-[#8a8aad66] border border-[#FFB6C108]"
                    }`}>
                    {f === "all" ? (isZh ? "全部" : "All") : f === "vip" ? "VIP" : f === "free" ? (isZh ? "普通" : "Free") : (isZh ? "過期" : "Expired")}
                  </button>
                ))}
              </div>

              {/* User list */}
              <div className="glass rounded-xl p-5 border border-[#d4a85315] space-y-3">
                <h3 className="text-sm font-semibold text-[#f0e6d3]">{isZh ? "用戶總覽" : "User Overview"}</h3>
                {userProfiles.length === 0 ? (
                  <p className="text-xs text-[#8a8aad44]">{isZh ? "暫無註冊用戶" : "No registered users"}</p>
                ) : (
                  <div className="space-y-2">
                    {userProfiles.filter((p: any) => {
                      if (vipFilter === "all") return true;
                      const s = getUserVIPStatus(p);
                      return s === vipFilter;
                    }).map((p: any, i) => {
                      const vip = getUserVIPStatus(p);
                      const readings = getUserFreeReadings();
                      const invites = getUserInviteCount(p.id || p.email || "");
                      return (
                        <details key={i} className="bg-[#151520] rounded-lg border border-[#FFB6C108]">
                          <summary className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#1a1a2a] transition-colors">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${vip === "vip" ? "bg-[#FFB6C1]" : vip === "expired" ? "bg-amber-400" : "bg-[#8a8aad44]"}`} />
                              <span className="text-xs font-medium text-[#f0e6d3]">{p.name || p.email || `User ${i + 1}`}</span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px]">
                              <span className={`px-2 py-0.5 rounded-full ${vip === "vip" ? "text-[#FFB6C1] bg-[#FFB6C110]" : vip === "expired" ? "text-amber-400 bg-amber-400/10" : "text-[#8a8aad44] bg-[#8a8aad10]"}`}>
                                {vip === "vip" ? "VIP" : vip === "expired" ? (isZh ? "過期" : "Expired") : (isZh ? "普通" : "Free")}
                              </span>
                              <span>🔮 {readings}</span>
                              <span>👥 {invites}</span>
                            </div>
                          </summary>
                          {/* Expanded detail */}
                          <div className="px-4 py-3 border-t border-[#FFB6C108] space-y-3">
                            <UserProfileDetail isZh={isZh} userId={p.id || p.email || ""} />
                          </div>
                        </details>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Tools Tab */}
          {tab === "test" && <AdminTestTools isZh={isZh} onRefresh={loadAll} />}

          {/* Ziwei Dual Tarot Tab */}
          {tab === "ziwei" && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-5 border border-[#d4a85315]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#f0e6d3]">{isZh ? "紫微塔羅雙牌配置" : "Ziwei Tarot Dual Config"}</h3>
                    <p className="mt-1 text-xs text-[#8a8aad]">
                      {isZh ? "獨立新增模組；紫微定體，塔羅定用；不修改原韋特塔羅牌庫與抽牌邏輯。" : "Independent module; Ziwei as body, Tarot as action; original Waite Tarot remains untouched."}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="rounded-lg border border-[#d4a85318] bg-[#151520] px-3 py-2">
                      <p className="text-[#8a8aad66]">{isZh ? "新人" : "First"}</p>
                      <p className="font-bold text-[#d4a853]">¥{ZIWEI_TAROT_PRICE.first}</p>
                    </div>
                    <div className="rounded-lg border border-[#d4a85340] bg-[#d4a85310] px-3 py-2">
                      <p className="text-[#8a8aad66]">{isZh ? "標準" : "Standard"}</p>
                      <p className="font-bold text-[#d4a853]">¥{ZIWEI_TAROT_PRICE.standard}</p>
                    </div>
                    <div className="rounded-lg border border-[#d4a85318] bg-[#151520] px-3 py-2">
                      <p className="text-[#8a8aad66]">{isZh ? "專項" : "Focus"}</p>
                      <p className="font-bold text-[#d4a853]">¥{ZIWEI_TAROT_PRICE.focused}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-5 border border-[#d4a85315]">
                <h3 className="mb-3 text-sm font-semibold text-[#f0e6d3]">{isZh ? "紫微 25 張牌庫" : "25 Ziwei Cards"}</h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ZIWEI_CARDS.map((card) => (
                    <div key={card.id} className="flex items-center gap-3 rounded-lg border border-[#d4a85310] bg-[#151520] p-3">
                      <img src={card.image} alt={card.name} className="h-14 w-11 rounded-md object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#f0e6d3]">{card.name}</p>
                        <p className="text-[10px] text-[#d4a853]">{card.category === "main" ? (isZh ? "主星" : "Main") : (isZh ? "輔星" : "Assistant")} · {card.luck}</p>
                        <p className="truncate text-[10px] text-[#8a8aad66]">{card.traits.join(" · ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-xl p-5 border border-[#d4a85315]">
                <h3 className="mb-3 text-sm font-semibold text-[#f0e6d3]">{isZh ? "固定判斷矩陣" : "Judgment Matrix"}</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    ["紫微吉 + 塔羅吉", "整體大吉，內外順遂，結果明確向好"],
                    ["紫微吉 + 塔羅凶", "根基向好，過程波折，短期不利但仍有轉機"],
                    ["紫微凶 + 塔羅吉", "表面風光但根基不穩，短期利好長期有隱患"],
                    ["紫微凶 + 塔羅凶", "整體偏凶，內外阻力均大，需謹慎規避"],
                  ].map(([title, desc]) => (
                    <div key={title} className="rounded-lg border border-[#d4a85310] bg-[#151520] p-3">
                      <p className="text-xs font-bold text-[#d4a853]">{title}</p>
                      <p className="mt-1 text-[10px] leading-5 text-[#8a8aad]">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {tab === "system" && (
            <div className="glass rounded-xl p-5 border border-[#d4a85315] space-y-3">
              <h3 className="text-sm font-semibold text-[#f0e6d3]">{isZh ? "系統維護與自動修復" : "Auto Maintenance & Repair"}</h3>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                {[
                  { label: isZh ? "安全補丁更新" : "Security Patches", value: isZh ? "每日 03:00 自動" : "Daily 3AM" },
                  { label: isZh ? "服務監控" : "Service Monitor", value: isZh ? "每 5 分鐘巡檢" : "Every 5 min" },
                  { label: isZh ? "崩潰自動修復" : "Crash Auto-Restart", value: isZh ? "自動重啟" : "Auto" },
                  { label: isZh ? "備份策略" : "Backup", value: isZh ? "更新前全量備份" : "Pre-update full" },
                  { label: isZh ? "日誌保留" : "Log Retention", value: "30 " + (isZh ? "天" : "days") },
                  { label: isZh ? "後台帳號" : "Admin Account", value: "1 " + (isZh ? "個" : "account") },
                ].map((item, i) => (
                  <div key={i} className="bg-[#151520] rounded-lg p-3 border border-[#FFB6C108]">
                    <p className="text-[#8a8aad66]">{item.label}</p>
                    <p className="text-[#f0e6d3] font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#151520] rounded-lg p-4 border border-[#d4a85310] mt-2">
                <p className="text-[10px] text-[#d4a853] font-medium mb-2">⚙️ {isZh ? "自動維護規則" : "Auto-Maintenance Rules"}</p>
                <ul className="text-[10px] text-[#8a8aad] space-y-1">
                  <li>✅ {isZh ? "僅更新系統安全補丁、運行環境" : "Security patches & runtime only"}</li>
                  <li>✅ {isZh ? "進程崩潰自動重啟" : "Auto-restart crashed services"}</li>
                  <li>❌ {isZh ? "不修改業務代碼、數據庫、定價" : "Never touch business code, DB, pricing"}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ---- User Profile Detail (expanded) ----
function UserProfileDetail({ isZh, userId }: { isZh: boolean; userId: string }) {
  const orders = JSON.parse(localStorage.getItem("r7_orders") || "[]").filter((o: any) => true);
  const reports = JSON.parse(localStorage.getItem("r7_reports") || "[]");
  const refs = JSON.parse(localStorage.getItem("r7_referrals") || "[]");

  return (
    <div className="space-y-2">
      {/* Payment orders */}
      <div>
        <p className="text-[10px] text-[#8a8aad66] mb-1">💳 {isZh ? "付費訂單" : "Payment Orders"} ({orders.length})</p>
        {orders.length === 0 ? <p className="text-[10px] text-[#8a8aad33]">{isZh ? "無記錄" : "None"}</p> : orders.slice(0, 8).map((o: any, i: number) => (
          <div key={o.sessionId || i} className="grid grid-cols-[1.3fr_0.7fr_0.8fr] gap-2 text-[10px] py-2 border-b border-[#FFB6C105]">
            <span className="text-[#f0e6d3] truncate">
              {o.product || "Tarot"}
              <span className="block text-[#8a8aad44]">{o.orderId || o.sessionId || "--"}</span>
            </span>
            <span className="text-[#FFB6C1]">
              ¥{o.amount?.toFixed(2) || "?"}
              <span className="block text-[#8a8aad44]">{o.paymentMethod || "alipay"}</span>
            </span>
            <span className="text-right text-[#8a8aad66]">
              {o.date?.slice(0, 10)}
              <span className={o.type === "membership" ? "block text-green-300/70" : "block text-[#8a8aad44]"}>
                {o.type === "membership"
                  ? (o.autoRenew ? (isZh ? "自動續費" : "Auto-renew") : (isZh ? "不續費" : "No renew"))
                  : (isZh ? "單次" : "Single")}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Tarot history */}
      <div>
        <p className="text-[10px] text-[#8a8aad66] mb-1">🔮 {isZh ? "抽牌歷史" : "Tarot History"} ({reports.length})</p>
        {reports.length === 0 ? <p className="text-[10px] text-[#8a8aad33]">{isZh ? "無記錄" : "None"}</p> : reports.slice(0, 5).map((r: any, i: number) => (
          <div key={i} className="text-[10px] text-[#8a8aad] py-0.5">{r.icon || "✨"} {r.title || (isZh ? "塔羅解讀" : "Tarot Reading")} <span className="text-[#8a8aad44]">{r.date}</span></div>
        ))}
      </div>

      {/* Invited friends */}
      <div>
        <p className="text-[10px] text-[#8a8aad66] mb-1">👥 {isZh ? "邀請好友" : "Invited Friends"} ({refs.length})</p>
        {refs.length === 0 ? <p className="text-[10px] text-[#8a8aad33]">{isZh ? "無記錄" : "None"}</p> : refs.slice(0, 5).map((r: any, i: number) => (
          <div key={i} className="text-[10px] text-[#8a8aad] py-0.5">🔗 {r.ref} <span className="text-[#8a8aad44]">{r.date?.slice(0, 10)}</span></div>
        ))}
      </div>
    </div>
  );
}

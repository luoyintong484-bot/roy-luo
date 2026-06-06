import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useI18n } from "@/contexts/I18nContext";
import { login, register } from "@/hooks/useAuth";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function Login() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === "register" && !name) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "register") {
        register(email, password, name);
      } else {
        login(email, password);
      }
      // Redirect back to payment flow if coming from paywall
      const returnPath = localStorage.getItem("r7_pay_return");
      if (returnPath) {
        localStorage.removeItem("r7_pay_return");
        navigate(returnPath);
      } else {
        navigate("/profile");
      }
    }, 500);
  };

  const labels = {
    title: locale === "zh" ? "欢迎回来" : locale === "zh-TW" ? "歡迎回來" : "Welcome Back",
    titleReg: locale === "zh" ? "创建账号" : locale === "zh-TW" ? "創建帳號" : "Create Account",
    subtitle: locale === "zh" ? "登录您的 R7 Fortune 账号" : locale === "zh-TW" ? "登錄您的 R7 Fortune 帳號" : "Sign in to your R7 Fortune account",
    subtitleReg: locale === "zh" ? "注册新账号，开启命运探索" : locale === "zh-TW" ? "註冊新帳號，開啟命運探索" : "Create an account to begin your journey",
    email: locale === "zh" ? "邮箱" : locale === "zh-TW" ? "郵箱" : "Email",
    emailPlaceholder: locale === "zh" ? "请输入邮箱地址" : locale === "zh-TW" ? "請輸入郵箱地址" : "Enter your email",
    password: locale === "zh" ? "密码" : locale === "zh-TW" ? "密碼" : "Password",
    passwordPlaceholder: locale === "zh" ? "请输入密码" : locale === "zh-TW" ? "請輸入密碼" : "Enter your password",
    name: locale === "zh" ? "昵称" : locale === "zh-TW" ? "暱稱" : "Nickname",
    namePlaceholder: locale === "zh" ? "请输入你的昵称" : locale === "zh-TW" ? "請輸入你的暱稱" : "Enter your nickname",
    loginBtn: locale === "zh" ? "登录" : locale === "zh-TW" ? "登錄" : "Sign In",
    registerBtn: locale === "zh" ? "注册" : locale === "zh-TW" ? "註冊" : "Sign Up",
    switchToReg: locale === "zh" ? "还没有账号？注册" : locale === "zh-TW" ? "還沒有帳號？註冊" : "Don't have an account? Sign up",
    switchToLogin: locale === "zh" ? "已有账号？登录" : locale === "zh-TW" ? "已有帳號？登錄" : "Already have an account? Sign in",
    back: locale === "zh" ? "返回首页" : locale === "zh-TW" ? "返回首頁" : "Back to Home",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Subtle pink bg is handled by global SubtlePinkBg */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-[#8a8aad] hover:text-[#FFB6C1] transition-colors z-20">
        <ArrowLeft className="w-4 h-4" /> {labels.back}
      </Link>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#FFB6C1]" />
            <span className="font-display text-lg font-bold text-[#f0e6d3] tracking-wide">R7 Fortune</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#f0e6d3]">
            {mode === "login" ? labels.title : labels.titleReg}
          </h2>
          <p className="text-xs text-[#8a8aad] mt-1.5">
            {mode === "login" ? labels.subtitle : labels.subtitleReg}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-[#FFB6C115] space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider">{labels.name}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8aad44]" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder={labels.namePlaceholder}
                  className="w-full bg-[#0a0a0f] border border-[#FFB6C122] rounded-lg pl-10 pr-4 py-3 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#FFB6C166] transition-colors" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider">{labels.email}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8aad44]" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={labels.emailPlaceholder}
                className="w-full bg-[#0a0a0f] border border-[#FFB6C122] rounded-lg pl-10 pr-4 py-3 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#FFB6C166] transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[#8a8aad] mb-1.5 uppercase tracking-wider">{labels.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8aad44]" />
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder={labels.passwordPlaceholder}
                className="w-full bg-[#0a0a0f] border border-[#FFB6C122] rounded-lg pl-10 pr-10 py-3 text-sm text-[#f0e6d3] placeholder-[#8a8aad33] focus:outline-none focus:border-[#FFB6C166] transition-colors" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8aad44] hover:text-[#8a8aad]">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading || !email || !password}
            className="w-full py-3.5 bg-gradient-to-r from-[#FFB6C1] to-[#c9953a] text-[#0a0a0f] rounded-lg text-sm font-bold hover:from-[#e0b860] hover:to-[#FFB6C1] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? (
              <span className="w-4 h-4 border-2 border-[#0a0a0f]/30 border-t-[#0a0a0f] rounded-full animate-spin" />
            ) : null}
            {mode === "login" ? labels.loginBtn : labels.registerBtn}
          </button>

          <div className="text-center">
            <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-xs text-[#FFB6C1] hover:text-[#e0b860] transition-colors">
              {mode === "login" ? labels.switchToReg : labels.switchToLogin}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useLocation, useNavigate, Link } from "react-router"
import { useI18n } from "@/contexts/I18nContext"
import { detectCurrency, formatPrice, PRODUCTS } from "@/lib/pricing"
import Navbar from "@/components/Navbar"
import CustomerService from "@/components/CustomerService"
import Footer from "@/sections/Footer"
import { ArrowLeft, CreditCard, Sparkles, ExternalLink } from "lucide-react"

export default function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { locale } = useI18n()
  const isZh = locale === "zh-TW"
  const currency = detectCurrency()
  const state = location.state as any
  const amount = state?.amount || 2.99
  const type = state?.type || "tarot"
  const label = isZh ? (state?.labelZh || "塔羅解讀") : (state?.label || "Tarot Reading")

  const allProducts = [
    { key: "singleDraw", ...PRODUCTS.singleDraw },
    { key: "monthlyMember", ...PRODUCTS.monthlyMember },
    { key: "aiDeepReading", ...PRODUCTS.aiDeepReading },
    { key: "cpReport", ...PRODUCTS.cpReport },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-1.5 text-xs text-[#8a8aad] hover:text-[#FFB6C1] transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" />
            {isZh ? "返回首頁" : "Back to Home"}
          </Link>

          <div className="glass rounded-2xl p-6 border border-[#FFB6C115] text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FFB6C108] flex items-center justify-center mx-auto border border-[#FFB6C115]">
              <CreditCard className="w-6 h-6 text-[#FFB6C1]" />
            </div>
            <h2 className="font-display text-xl font-bold text-[#f0e6d3]">
              {isZh ? "付款頁面" : "Payment"}
            </h2>
            <p className="text-xs text-[#8a8aad]">
              {isZh ? `${label} · ${formatPrice(amount)}` : `${label} · ${formatPrice(amount)}`}
            </p>
            <p className="text-sm text-[#FFB6C1] font-medium">
              {isZh ? "🔧 支付功能即將上線，敬請期待" : "🔧 Payment coming soon"}
            </p>
            <p className="text-[10px] text-[#8a8aad44]">
              {isZh ? "當前為測試環境，支付接口配置完成後自動啟用" : "Test environment — payment API will be enabled after configuration"}
            </p>
          </div>

          {/* All pricing options */}
          <div className="mt-6 space-y-2">
            <p className="text-[10px] text-[#8a8aad44] text-center uppercase tracking-wider">
              {isZh ? "價格總覽" : "Pricing Overview"}
            </p>
            {allProducts.map(p => (
              <div key={p.key} className="flex items-center justify-between bg-[#151520] rounded-lg px-4 py-3 border border-[#FFB6C108]">
                <span className="text-xs text-[#f0e6d3]">{isZh ? p.nameZh : p.name}</span>
                <span className="text-xs font-bold text-[#FFB6C1]">{formatPrice(p.usd)}</span>
              </div>
            ))}
          </div>

          <p className="text-[9px] text-[#8a8aad33] text-center mt-4">
            {currency === "CNY" ? "微信支付 · 支付寶 · 銀聯" : "PayPal · Credit Card"}
            {" · "}{isZh ? "價格已含 3% 手續費" : "3% fee included"}
          </p>
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  );
}

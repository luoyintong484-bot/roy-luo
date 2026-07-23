import { useLocation, useNavigate, Link } from "react-router"
import { useMemo, useState } from "react"
import { useI18n } from "@/contexts/I18nContext"
import { detectCurrency, formatPrice, PRODUCTS } from "@/lib/pricing"
import Navbar from "@/components/Navbar"
import CustomerService from "@/components/CustomerService"
import Footer from "@/sections/Footer"
import {
  MANUAL_PAYMENT_ALIPAY_QR_SRC,
  MANUAL_PAYMENT_PREVIEW,
  MANUAL_PAYMENT_QR_SRC,
  MANUAL_PAYMENT_WECHAT_QR_SRC,
  PAYMENT_COMING_SOON,
} from "@/const"
import { ArrowLeft, CheckCircle2, Clock3, Copy, MessageCircle, QrCode, ShieldCheck, Sparkles, X, ZoomIn } from "lucide-react"

function safeReturnPath(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

export default function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { locale } = useI18n()
  const isZh = locale === "zh-TW"
  const currency = detectCurrency()
  const state = location.state as any
  const query = new URLSearchParams(location.search)
  const queryType = query.get("type") || ""
  const isMembershipCheckout =
    state?.productType === "membership"
    || queryType === "monthly"
    || queryType === "membership"
    || queryType === "vip"
  const amount = state?.amount || (isMembershipCheckout ? PRODUCTS.monthlyMember.usd : 2.99)
  const label = isZh
    ? (state?.labelZh || (isMembershipCheckout ? PRODUCTS.monthlyMember.nameZh : "塔羅解讀"))
    : (state?.label || (isMembershipCheckout ? PRODUCTS.monthlyMember.name : "Tarot Reading"))
  const cancelled = query.get("cancelled") === "1"
  const returnPath = safeReturnPath(
    query.get("return")
    || state?.returnPath
    || localStorage.getItem("r7_pay_return")
    || localStorage.getItem("r7_blocked_from")
  )

  const allProducts = [
    { key: "singleDraw", ...PRODUCTS.singleDraw },
    { key: "monthlyMember", ...PRODUCTS.monthlyMember },
    { key: "aiDeepReading", ...PRODUCTS.aiDeepReading },
    { key: "cpReport", ...PRODUCTS.cpReport },
  ]
  const reportKey = state?.reportKey || query.get("report") || `manual_${label.replace(/\s+/g, "_").toLowerCase()}`
  const orderNo = useMemo(() => {
    const saved = sessionStorage.getItem("r7_manual_order_no")
    if (saved) return saved
    const next = `R7${Date.now().toString(36).toUpperCase().slice(-6)}`
    sessionStorage.setItem("r7_manual_order_no", next)
    return next
  }, [])
  const sessionId = useMemo(() => `manual_${orderNo.toLowerCase()}`, [orderNo])
  const payNote = `${orderNo}｜${label}`
  const [copied, setCopied] = useState<string>("")
  const paymentMethods = [
    {
      id: "wechat",
      label: isZh ? "微信支付" : "WeChat Pay",
      color: "from-[#16d66b] to-[#08b95c]",
      qr: MANUAL_PAYMENT_WECHAT_QR_SRC || MANUAL_PAYMENT_QR_SRC,
      note: isZh ? "推薦使用微信支付，付款時請備註訂單號。" : "Recommended. Add the order ID as payment note.",
    },
    {
      id: "alipay",
      label: isZh ? "支付寶" : "Alipay",
      color: "from-[#2888ff] to-[#1267df]",
      qr: MANUAL_PAYMENT_ALIPAY_QR_SRC,
      note: isZh ? "支付寶付款同樣可用，請保留截圖。" : "Alipay is also supported. Keep your payment screenshot.",
    },
  ]
  const [activePayMethod, setActivePayMethod] = useState(paymentMethods[0].id)
  const [qrPreviewOpen, setQrPreviewOpen] = useState(false)
  const currentPayMethod = paymentMethods.find((method) => method.id === activePayMethod) || paymentMethods[0]

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      window.setTimeout(() => setCopied(""), 1600)
    } catch {
      setCopied("")
    }
  }

  const confirmManualPayment = () => {
    if (PAYMENT_COMING_SOON) return

    const pendingReport = {
      reportKey,
      reportType: state?.reportType || queryType || "manual",
      sessionId,
      amount,
      accessUrl: returnPath,
      productName: label,
      productNameZh: label,
      metadata: {
        orderNo,
        paymentMethod: activePayMethod,
        productType: isMembershipCheckout ? "membership" : "report",
        autoRenew: isMembershipCheckout ? "true" : "false",
      },
    }
    const pendingPayment = {
      amount,
      productName: label,
      productNameZh: label,
      sessionId,
      returnPath,
      metadata: {
        reportKey,
        orderNo,
        paymentMethod: activePayMethod,
        productType: isMembershipCheckout ? "membership" : "report",
        reportType: state?.reportType || queryType || "manual",
        autoRenew: isMembershipCheckout ? "true" : "false",
      },
    }
    const manualOrder = {
      orderNo,
      sessionId,
      amount,
      label,
      returnPath,
      reportKey,
      paymentMethod: activePayMethod,
      productType: isMembershipCheckout ? "membership" : "report",
      autoRenew: isMembershipCheckout,
      status: "manual_submitted",
      submittedAt: new Date().toISOString(),
    }
    localStorage.setItem("r7_pending_report", JSON.stringify(pendingReport))
    localStorage.setItem("r7_pending_payment", JSON.stringify(pendingPayment))
    localStorage.setItem("r7_manual_payment_order", JSON.stringify(manualOrder))
    navigate(`/payment-success?manual=1&session=${encodeURIComponent(sessionId)}&order=${encodeURIComponent(orderNo)}&return=${encodeURIComponent(returnPath)}`)
  }

  if (PAYMENT_COMING_SOON) {
    return (
      <div className="min-h-screen payment-mobile-polish">
        <Navbar />
        <main className="pt-18 sm:pt-20 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <button
              onClick={() => navigate(returnPath)}
              className="flex items-center gap-1.5 text-xs text-[#c9b7d8] hover:text-[#FFB6C1] transition-colors mb-5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {isZh ? "返回原頁面" : "Back to Previous Page"}
            </button>

            <section className="relative overflow-hidden rounded-[2rem] border border-[#d4a85335] bg-[#120c18]/90 p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.45)] sm:p-8">
              <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#ff8fbd20] blur-3xl" />
              <div className="absolute -left-20 bottom-10 h-52 w-52 rounded-full bg-[#d4a85318] blur-3xl" />
              <div className="relative">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#d4a85335] bg-[#d4a85312]">
                  <Clock3 className="h-8 w-8 text-[#d4a853]" />
                </div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#d4a853]">
                  Coming Soon
                </p>
                <h1 className="font-display text-2xl font-black text-[#fff3df] sm:text-3xl">
                  {isZh ? "完整版報告功能即將開放" : "Full Reports Coming Soon"}
                </h1>
                <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#c9bdd8]">
                  {isZh
                    ? "目前付費通道已暫時關閉，不會生成訂單，也不會進入任何收款流程。免費排盤與公開內容仍可正常使用。"
                    : "Paid checkout is temporarily locked. No orders, checkout pages, or payment callbacks will be created. Free public features remain available."}
                </p>
                <button
                  onClick={() => navigate(returnPath)}
                  className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#d4a853] to-[#c9953a] px-6 py-3 text-sm font-black text-[#120c18] transition-transform active:scale-[0.98]"
                >
                  {isZh ? "返回查看免費內容" : "Back to Free Content"}
                </button>
              </div>
            </section>
          </div>
        </main>
        <Footer />
        <CustomerService />
      </div>
    )
  }

  return (
    <div className="min-h-screen payment-mobile-polish">
      <Navbar />
      <main className="pt-18 sm:pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => navigate(returnPath)}
            className="flex items-center gap-1.5 text-xs text-[#c9b7d8] hover:text-[#FFB6C1] transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isZh ? "返回原頁面" : "Back to Previous Page"}
          </button>

          <div className="relative overflow-hidden rounded-[2rem] border border-[#ffb6d93a] bg-[#120c18]/88 p-5 sm:p-7 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#ff8fbd24] blur-3xl" />
            <div className="absolute -left-20 bottom-10 h-52 w-52 rounded-full bg-[#d4a85316] blur-3xl" />
            <div className="relative grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ffb6d93a] bg-[#ff8fbd12] px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-[#ffd6e8]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isZh ? "收款碼過渡流程" : "Manual QR Checkout"}
                </div>
                <div>
                  <h1 className="font-display text-[2rem] leading-tight sm:text-3xl font-black text-[#fff3df]">
                    {isZh ? "付款後自動回到報告" : "Pay, then return to your report"}
                  </h1>
                  <p className="mt-2 text-sm leading-7 text-[#c9bdd8]">
                    {isZh
                      ? "在聚合收款碼正式接入前，先用訂單號備註完成收款。你點擊「我已付款」後，系統會保存訂單並跳轉回原報告頁。"
                      : "Before the payment gateway is connected, use the order note below. After payment, tap the confirmation button to save the order and return to the report."}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    isZh ? "掃碼付款" : "Scan",
                    isZh ? "備註訂單" : "Note",
                    isZh ? "返回報告" : "Return",
                  ].map((step, idx) => (
                    <div key={step} className="rounded-2xl border border-[#ffb6d91f] bg-white/[0.04] p-3 text-center">
                      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#ffd36a] text-xs font-black text-[#20120b]">
                        {idx + 1}
                      </div>
                      <p className="text-[11px] font-bold text-[#f7e8ff]">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-[#d4a85322] bg-[#050509]/58 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4a853]">
                        {isZh ? "訂單金額" : "Amount"}
                      </p>
                      <p className="mt-1 text-sm text-[#f0e6d3]">{label}</p>
                    </div>
                    <p className="font-display text-3xl font-black text-[#ffd36a]">{formatPrice(amount)}</p>
                  </div>
                  {isMembershipCheckout && (
                    <div className="mt-3 rounded-2xl border border-[#ffb6d924] bg-[#ffb6d90c] px-3 py-2 text-[11px] leading-5 text-[#d8c8e8]">
                      {isZh
                        ? "會員訂單付款成功後會自動開通 30 天權限，默認開啟自動續費；目前為手動收款過渡期，不會自動扣款，可在個人中心隨時取消。"
                        : "Membership unlocks 30 days after payment. Auto-renew is enabled by default; during this manual QR phase, no automatic charge is made and you can cancel anytime in Profile."}
                    </div>
                  )}
                  <div className="mt-4 grid gap-2">
                    <button
                      onClick={() => copyText(orderNo, "order")}
                      className="flex items-center justify-between rounded-2xl border border-[#ffb6d91f] bg-[#ffb6d90b] px-4 py-3 text-left"
                    >
                      <span>
                        <span className="block text-[11px] text-[#a99ab8]">{isZh ? "訂單號" : "Order ID"}</span>
                        <span className="text-sm font-bold tracking-wide text-[#fff3df]">{orderNo}</span>
                      </span>
                      {copied === "order" ? <CheckCircle2 className="h-4 w-4 text-green-300" /> : <Copy className="h-4 w-4 text-[#ffb6d9]" />}
                    </button>
                    <button
                      onClick={() => copyText(payNote, "note")}
                      className="flex items-center justify-between rounded-2xl border border-[#d4a85322] bg-[#d4a8530d] px-4 py-3 text-left"
                    >
                      <span>
                        <span className="block text-[11px] text-[#a99ab8]">{isZh ? "付款備註" : "Payment note"}</span>
                        <span className="text-sm font-bold text-[#fff3df]">{payNote}</span>
                      </span>
                      {copied === "note" ? <CheckCircle2 className="h-4 w-4 text-green-300" /> : <Copy className="h-4 w-4 text-[#d4a853]" />}
                    </button>
                  </div>
                </div>
              </section>

              <section className="relative rounded-[1.75rem] border border-[#ffb6d928] bg-[#0a0710]/72 p-4 text-center">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setActivePayMethod(method.id)}
                      className={`rounded-2xl px-3 py-2.5 text-xs font-black transition-all ${
                        activePayMethod === method.id
                          ? `bg-gradient-to-r ${method.color} text-white shadow-lg`
                          : "border border-[#ffb6d91f] bg-white/[0.04] text-[#c9bdd8]"
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => currentPayMethod.qr && setQrPreviewOpen(true)}
                  className="group mx-auto flex h-72 w-full max-w-[19rem] items-center justify-center overflow-hidden rounded-[2rem] border border-[#ffb6d954] bg-[#050509] p-0 shadow-[0_18px_48px_rgba(0,0,0,0.34)] sm:h-80 sm:max-w-[21rem]"
                  aria-label={isZh ? "點擊放大付款碼" : "Tap to enlarge payment QR"}
                >
                  {currentPayMethod.qr ? (
                    <span className="relative block h-full w-full">
                      <img
                        src={currentPayMethod.qr}
                        alt={currentPayMethod.label}
                        className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                          currentPayMethod.id === "wechat" ? "scale-[1.13]" : "scale-[1.1]"
                        }`}
                      />
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border border-black/10 bg-black/62 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                        <ZoomIn className="h-3 w-3" />
                        {isZh ? "放大掃碼" : "Zoom"}
                      </span>
                    </span>
                  ) : (
                    <div className="text-center">
                      <QrCode className="mx-auto h-14 w-14 text-[#ffb6d9]" />
                      <p className="mt-3 text-xs font-bold text-[#f7e8ff]">
                        {isZh ? "收款碼待放置" : "QR code slot"}
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-[#9f91ad]">
                        {isZh ? "收款碼下來後替換此處圖片" : "Replace this with your QR code"}
                      </p>
                    </div>
                  )}
                </button>
                <p className="mt-3 text-[11px] leading-5 text-[#c9bdd8]">
                  {currentPayMethod.note}
                </p>
                <p className="mt-1 text-[10px] leading-5 text-[#8a8aad]">
                  {isZh ? "海外用戶如無法使用微信/支付寶，請聯繫 Ins：r7_fortune 或郵箱人工處理。" : "Overseas users can contact Instagram r7_fortune or email if WeChat/Alipay is unavailable."}
                </p>
                <div className="mt-4 rounded-2xl border border-[#ffb6d91f] bg-[#ff8fbd0f] p-3 text-left">
                  <p className="flex items-center gap-2 text-xs font-bold text-[#ffd6e8]">
                    <MessageCircle className="h-4 w-4" />
                    {isZh ? "付款後若未返回" : "If redirect does not happen"}
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-[#c9bdd8]">
                    {isZh ? "保留付款截圖，聯繫客服並提供訂單號，即可人工補開。" : "Keep a payment screenshot and send the order ID to support for manual unlock."}
                  </p>
                </div>
                <button
                  onClick={confirmManualPayment}
                  disabled={!MANUAL_PAYMENT_PREVIEW}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffd36a] via-[#ffb6d9] to-[#d7b8ff] px-4 py-3.5 text-sm font-black text-[#120c18] shadow-[0_16px_38px_rgba(255,182,217,0.22)] transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {isZh ? "我已付款，返回查看報告" : "I paid, return to report"}
                </button>
              </section>
            </div>
            {cancelled && (
              <p className="relative mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/8 px-4 py-3 text-center text-xs text-rose-100">
                {isZh ? "上一次支付已取消，報告尚未解鎖。" : "The previous payment was cancelled. The report is not unlocked yet."}
              </p>
            )}
            <div className="relative mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate(returnPath)}
                className="py-3 rounded-2xl text-xs font-semibold border border-[#FFB6C128] text-[#f0e6d3] hover:border-[#FFB6C144] transition-colors"
              >
                {isZh ? "返回測算頁" : "Return"}
              </button>
              <Link
                to="/"
                className="py-3 rounded-2xl text-xs font-semibold bg-[#FFB6C1] text-[#0a0a0f] hover:bg-[#f0a0b8] transition-colors text-center"
              >
                {isZh ? "返回首頁" : "Home"}
              </Link>
            </div>
          </div>

          {/* All pricing options */}
          <div className="mt-6 space-y-2 rounded-[1.5rem] border border-[#ffb6d914] bg-[#07050b]/60 p-3">
            <p className="text-[10px] text-[#d7c9e6] text-center uppercase tracking-wider">
              {isZh ? "價格總覽" : "Pricing Overview"}
            </p>
            {allProducts.map(p => (
              <div key={p.key} className="flex items-center justify-between bg-[#151520]/90 rounded-2xl px-4 py-3 border border-[#FFB6C108]">
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
      {qrPreviewOpen && currentPayMethod.qr && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/88 p-4 backdrop-blur-md" onClick={() => setQrPreviewOpen(false)}>
          <div className="relative w-full max-w-[25rem]" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setQrPreviewOpen(false)}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md"
              aria-label={isZh ? "關閉付款碼預覽" : "Close QR preview"}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="overflow-hidden rounded-[2rem] border border-[#ffb6d94a] bg-[#050509] shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
              <div className="aspect-square w-full overflow-hidden bg-black">
                <img
                  src={currentPayMethod.qr}
                  alt={currentPayMethod.label}
                  className={`h-full w-full object-cover ${
                    currentPayMethod.id === "wechat" ? "scale-[1.12]" : "scale-[1.08]"
                  }`}
                />
              </div>
              <div className="border-t border-white/10 bg-[#100a14]/95 px-4 py-3 text-center">
                <p className="text-sm font-bold text-[#fff3df]">{currentPayMethod.label}</p>
                <p className="mt-1 text-[11px] text-[#c9bdd8]">
                  {isZh ? "長按或截圖保存後掃碼，付款時請備註訂單號。" : "Long-press or screenshot to scan. Add the order ID as payment note."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
      <CustomerService />
    </div>
  );
}

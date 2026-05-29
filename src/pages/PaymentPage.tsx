import { useState, useEffect } from "react"
import { useLocation, useNavigate, Link } from "react-router"
import Navbar from "@/components/Navbar"
import CustomerService from "@/components/CustomerService"
import Footer from "@/sections/Footer"
import { ArrowLeft, CreditCard, Check, Loader2, Sparkles, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as { type?: string; amount?: number; redirect?: string } | null
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  const amount = state?.amount || 2.99
  const redirect = state?.redirect || "/"
  const typeLabels: Record<string, string> = {
    destiny: "Destiny Reading",
    tarot: "Tarot Reading",
    synastry: "Compatibility",
  }
  const label = typeLabels[state?.type || "destiny"] || "Fortune Reading"

  const handlePay = () => { setPaying(true); setTimeout(() => { setPaying(false); setPaid(true) }, 1500) }

  useEffect(() => {
    if (paid) { const t = setTimeout(() => navigate(redirect, { replace: true }), 800); return () => clearTimeout(t) }
  }, [paid, navigate, redirect])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-md mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-[#8a8aad] hover:text-[#d4a853] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />Back
          </Link>
          <div className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #d4a853 0%, transparent 70%)" }} />
            {paid ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-4 border border-green-400/20"><Check className="w-8 h-8 text-green-400" /></div>
                <h2 className="font-display text-xl font-bold text-[#f0e6d3] mb-2">Payment Successful</h2>
                <p className="text-sm text-[#8a8aad]">Redirecting to reading...</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#d4a85310] flex items-center justify-center mx-auto mb-4 border border-[#d4a85320]"><Lock className="w-6 h-6 text-[#d4a853]" /></div>
                  <h2 className="font-display text-xl font-bold text-[#f0e6d3]">Unlock Full Reading</h2>
                  <p className="text-xs text-[#8a8aad] mt-1">{label} · Deep Analysis Report</p>
                </div>
                <div className="bg-[#0a0a0f] rounded-lg p-4 mb-6 border border-[#d4a85308]">
                  <div className="flex items-center justify-between mb-3"><span className="text-xs text-[#8a8aad]">Service Content</span><span className="text-xs text-[#f0e6d3]">{label} Full Version</span></div>
                  <div className="flex items-center justify-between mb-3"><span className="text-xs text-[#8a8aad]">Includes</span><span className="text-xs text-[#8a8aad55]">Deep Analysis + Interactive Advice + Time Guidance</span></div>
                  <div className="border-t border-[#d4a85306] pt-3 flex items-center justify-between"><span className="text-sm text-[#f0e6d3] font-medium">Total</span><span className="text-2xl font-display font-bold text-[#d4a853]">${amount.toFixed(2)}</span></div>
                </div>
                <div className="space-y-2 mb-6">
                  {["WeChat Pay", "Alipay"].map(m => (
                    <button key={m} className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#d4a85315] hover:border-[#d4a85340] transition-colors text-left">
                      <CreditCard className="w-4 h-4 text-[#d4a853]" /><span className="text-xs text-[#f0e6d3]">{m}</span>
                    </button>
                  ))}
                </div>
                <Button onClick={handlePay} disabled={paying}
                  className="w-full bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] hover:from-[#e0b860] hover:to-[#d4a853] font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {paying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Confirm Payment ${amount.toFixed(2)}
                </Button>
                <p className="text-center text-[10px] text-[#8a8aad33] mt-4">By paying you agree to Terms of Service</p>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <CustomerService />
    </div>
  )
}

import { useState, useCallback, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { useI18n } from "@/contexts/I18nContext"
import { Sparkles, Loader2, Eye, Unlock, Lock, Check, CreditCard, X, ShieldCheck, Share2, Music, MapPin, Heart } from "lucide-react"
import { TAROT_CARDS, FREE_READING_LIMIT, UNLOCK_PRICE } from "@/data/tarotCards"

const INTERPRETATIONS: Record<string, string> = {
  love: "In matters of love, this card suggests you need to pay closer attention to your true inner feelings. Their heart is moving toward you, but patience and sincerity are required. A new relationship or deeper connection is brewing.",
  career: "In your career, this card brings positive signals. Your efforts are about to be rewarded, but timing is key — don't rush. A mentor or helpful ally may appear soon to offer crucial support.",
  health: "For health, this card reminds you to find balance between body and mind. Proper rest and inner reflection will help restore your vitality. Maintain a regular routine and moderate exercise will bring noticeable improvement.",
  wealth: "Financially, positive energy is approaching. Stay open-minded — opportunities may come from unexpected places. This is a good time for steady investments; avoid impulsive spending.",
  spirit: "On a spiritual level, this card invites you to explore your inner world deeply. Meditation and self-reflection will bring important insights. Trust your intuition — it will guide you in the right direction.",
  relation: "In relationships, this card signals significant changes ahead. Honest and open communication will be key. An important person may soon enter or re-enter your life.",
}

function TarotPaymentModal({
  isOpen, onClose, onPaid, amount,
}: { isOpen: boolean; onClose: () => void; onPaid: () => void; amount: number }) {
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  const handlePay = () => {
    setPaying(true)
    setTimeout(() => { setPaying(false); setPaid(true); setTimeout(() => { onPaid(); setPaid(false); onClose() }, 600) }, 1500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-[#d4a85320] shadow-2xl animate-fade-in-up">
        {paid ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-4 border border-green-400/20"><Check className="w-8 h-8 text-green-400" /></div>
            <h3 className="font-display text-lg font-bold text-[#f0e6d3] mb-1">Unlock Successful</h3>
            <p className="text-xs text-[#8a8aad]">Full reading is now available</p>
          </div>
        ) : (
          <>
            <button onClick={onClose} className="absolute top-4 right-4 text-[#8a8aad] hover:text-[#f0e6d3] transition-colors"><X className="w-4 h-4" /></button>
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-[#d4a85310] flex items-center justify-center mx-auto mb-3 border border-[#d4a85320]"><Lock className="w-6 h-6 text-[#d4a853]" /></div>
              <h3 className="font-display text-lg font-bold text-[#f0e6d3]">Unlock Full Tarot Reading</h3>
              <p className="text-xs text-[#8a8aad] mt-1">Deep card analysis · Comprehensive guidance · Actionable advice</p>
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-4 mb-5 border border-[#d4a85308]">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-[#8a8aad]">Service Content</span><span className="text-xs text-[#f0e6d3]">Three-Card Deep Reading</span></div>
              <div className="flex items-center justify-between mb-3"><span className="text-xs text-[#8a8aad]">Includes</span><span className="text-xs text-[#8a8aad55]">Past · Present · Future with full analysis</span></div>
              <div className="border-t border-[#d4a85306] pt-3 flex items-center justify-between"><span className="text-sm text-[#f0e6d3] font-medium">Total</span><span className="text-2xl font-display font-bold text-[#d4a853]">${amount.toFixed(2)}</span></div>
            </div>
            <div className="space-y-2 mb-5">
              {["WeChat Pay", "Alipay"].map(m => (
                <button key={m} className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#d4a85315] hover:border-[#d4a85340] transition-colors text-left"><CreditCard className="w-4 h-4 text-[#d4a853]" /><span className="text-xs text-[#f0e6d3]">{m}</span></button>
              ))}
            </div>
            <button onClick={handlePay} disabled={paying} className="w-full py-3 bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] rounded-lg text-sm font-bold hover:from-[#e0b860] hover:to-[#d4a853] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Confirm Payment ${amount.toFixed(2)}
            </button>
            <p className="text-center text-[10px] text-[#8a8aad33] mt-3">Secure encrypted payment · Instant unlock</p>
          </>
        )}
      </div>
    </div>
  )
}

function ShuffleAnimation({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = 400; const h = 300
    canvas.width = w * 2; canvas.height = h * 2
    canvas.style.width = w + "px"; canvas.style.height = h + "px"
    ctx.scale(2, 2)

    const cardW = 60; const cardH = 90
    const cards: { x: number; y: number; rot: number; vx: number; vy: number; vr: number; phase: number }[] = []
    for (let i = 0; i < 30; i++) {
      cards.push({ x: w / 2 + (Math.random() - 0.5) * 300, y: h / 2 + (Math.random() - 0.5) * 200, rot: Math.random() * 360, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, vr: (Math.random() - 0.5) * 8, phase: Math.random() * Math.PI * 2 })
    }

    let frame = 0; const totalFrames = 140; let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const progress = frame / totalFrames
      const alpha = progress < 0.15 ? progress / 0.15 : progress > 0.85 ? (1 - progress) / 0.15 : 1

      for (const c of cards) {
        // Chaotic shuffling that gradually settles
        const settleFactor = progress < 0.7 ? 1 : Math.max(0, 1 - (progress - 0.7) / 0.3)
        c.x += c.vx * settleFactor + Math.sin(frame * 0.05 + c.phase) * 2
        c.y += c.vy * settleFactor + Math.cos(frame * 0.05 + c.phase) * 2
        c.rot += c.vr * settleFactor

        const grad = ctx.createLinearGradient(c.x - cardW / 2, c.y, c.x + cardW / 2, c.y)
        grad.addColorStop(0, `rgba(212, 168, 83, ${0.3 * alpha})`)
        grad.addColorStop(0.5, `rgba(20, 20, 42, ${0.7 * alpha})`)
        grad.addColorStop(1, `rgba(212, 168, 83, ${0.2 * alpha})`)

        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.rotate((c.rot * Math.PI) / 180)
        ctx.fillStyle = grad
        ctx.strokeStyle = `rgba(212, 168, 83, ${0.5 * alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 6)
        ctx.fill()
        ctx.stroke()
        // Card back pattern — simple cross
        ctx.strokeStyle = `rgba(212, 168, 83, ${0.3 * alpha})`
        ctx.lineWidth = 0.5
        ctx.beginPath(); ctx.moveTo(-cardW / 4, -cardH / 3); ctx.lineTo(cardW / 4, cardH / 3); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(cardW / 4, -cardH / 3); ctx.lineTo(-cardW / 4, cardH / 3); ctx.stroke()
        ctx.restore()
      }

      // Center text
      ctx.fillStyle = `rgba(240, 230, 211, ${alpha})`
      ctx.font = "14px 'Playfair Display', serif"
      ctx.textAlign = "center"
      ctx.fillText("Shuffling...", w / 2, h / 2 + 60)

      frame++
      if (frame < totalFrames) { raf = requestAnimationFrame(draw) } else { onComplete() }
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} className="mx-auto rounded-xl" style={{ width: 400, height: 300 }} />
}

export default function TarotSection() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [question, setQuestion] = useState("")
  const [isDrawing, setIsDrawing] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)
  const [drawnCards, setDrawnCards] = useState<Array<typeof TAROT_CARDS[0] & { reversed: boolean }>>([])
  const [showReading, setShowReading] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [tarotMode, setTarotMode] = useState<"classic" | "idol">("classic")
  const [idolCategory, setIdolCategory] = useState<string>("")
  const [freeUsed, setFreeUsed] = useState(() => {
    try { return parseInt(localStorage.getItem("tarot_free_used") || "0") } catch { return 0 }
  })

  const remainingFree = Math.max(0, FREE_READING_LIMIT - freeUsed)
  const IDOL_UNLOCK_PRICE = 5.99

  const idolCategories = [
    { key: "fansign", icon: Heart, label: "Fansign Fortune", labelZh: "签售运势", desc: "What energy surrounds your next fansign?", descZh: "下一次签售会，你的运势如何？" },
    { key: "concert", icon: MapPin, label: "Concert Support Direction", labelZh: "演唱会应援方位", desc: "Which direction brings the best concert luck?", descZh: "演唱会站在哪个方位最幸运？" },
    { key: "idol-draw", icon: Music, label: "Idol Exclusive Draw", labelZh: "爱豆专属抽牌", desc: "A personal message from the cards about your idol connection.", descZh: "塔罗牌为你揭示与爱豆的专属连接。" },
  ]

  const drawCards = useCallback(() => {
    if (tarotMode === "classic" && !question.trim()) return
    if (tarotMode === "idol" && !idolCategory) return

    setIsShuffling(true)
    setIsDrawing(true)
    setDrawnCards([])
    setShowReading(false)
    setIsUnlocked(false)

    if (remainingFree > 0) {
      const newUsed = freeUsed + 1
      setFreeUsed(newUsed)
      localStorage.setItem("tarot_free_used", String(newUsed))
    }
  }, [question, remainingFree, freeUsed, tarotMode, idolCategory])

  const handleShuffleComplete = useCallback(() => {
    setIsShuffling(false)
    // Draw 3 cards with random upright/reversed
    const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 3).map(card => ({ ...card, reversed: Math.random() > 0.5 }))
    setDrawnCards(selected)
    setIsDrawing(false)
    setTimeout(() => setShowReading(true), 800)
  }, [])

  return (
    <>
      <section id="tarot" className="py-24 relative">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#f0e6d3]">{t("tarot.title")}</h2>
            <p className="mt-2 text-sm text-[#8a8aad]">{t("tarot.subtitle")}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#d4a85308] border border-[#d4a85315] rounded-full">
              <Sparkles className="w-3 h-3 text-[#d4a853]" />
              <span className="text-[10px] text-[#d4a853]">
                {remainingFree > 0 ? `Remaining Free Credits: ${remainingFree}` : "Free credits exhausted"}
              </span>
            </div>
          </div>

          {/* Tab Switcher: Classic Tarot | Idol Tarot */}
          <div className="flex justify-center gap-3 mb-8">
            {[
              { key: "classic" as const, label: locale === "zh" ? "经典塔罗" : "Classic Tarot" },
              { key: "idol" as const, label: locale === "zh" ? "爱豆塔罗" : "Idol Tarot", hot: true },
            ].map(tab => (
              <button key={tab.key} onClick={() => { setTarotMode(tab.key); setIdolCategory(""); setQuestion(""); setDrawnCards([]); setShowReading(false) }}
                className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  tarotMode === tab.key ? "bg-[#d4a853] text-[#0a0a0f]" : "bg-[#14142a] text-[#8a8aad] hover:text-[#f0e6d3] border border-[#d4a85315]"
                }`}>
                {tab.label}
                {tab.hot && <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[8px] font-bold rounded-full">NEW</span>}
              </button>
            ))}
          </div>

          <div className="max-w-xl mx-auto mb-12">
            {tarotMode === "classic" ? (
              <>
                <label className="block text-xs text-[#8a8aad] mb-2 uppercase tracking-wider">{t("tarot.question")}</label>
                <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder={t("tarot.questionPlaceholder")} rows={3}
                  className="w-full glass rounded-lg px-4 py-3 text-sm text-[#f0e6d3] placeholder-[#8a8aad44] focus:outline-none focus:border-[#d4a85344] transition-all resize-none" />
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {idolCategories.map(cat => {
                  const Icon = cat.icon
                  const isSelected = idolCategory === cat.key
                  return (
                    <button key={cat.key} onClick={() => setIdolCategory(cat.key)}
                      className={`glass rounded-xl p-4 text-center border transition-all hover:-translate-y-1 ${
                        isSelected ? "border-[#d4a853] bg-[#d4a85310]" : "border-[#d4a85308] hover:border-[#d4a85320]"
                      }`}>
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? "text-[#d4a853]" : "text-[#8a8aad]"}`} />
                      <p className="text-xs font-semibold text-[#f0e6d3]">{locale === "zh" ? cat.labelZh : cat.label}</p>
                      <p className="text-[9px] text-[#8a8aad44] mt-1">{locale === "zh" ? cat.descZh : cat.desc}</p>
                    </button>
                  )
                })}
              </div>
            )}
            <button onClick={drawCards}
              disabled={isDrawing || (tarotMode === "classic" ? !question.trim() : !idolCategory)}
              className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] rounded-lg text-sm font-bold hover:from-[#e0b860] hover:to-[#d4a853] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
              {isShuffling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isShuffling ? (locale === "zh" ? "洗牌中..." : "Shuffling...") : t("tarot.draw")}
            </button>
          </div>

          {/* Shuffle Animation */}
          {isShuffling && (
            <div className="flex justify-center mb-12">
              <ShuffleAnimation onComplete={handleShuffleComplete} />
            </div>
          )}

          {/* Card Display */}
          {drawnCards.length > 0 && !isDrawing && (
            <div className="flex flex-wrap justify-center items-start gap-4 sm:gap-6 mb-12">
              {drawnCards.map((card, idx) => (
                <div key={card.id} className="group">
                  <div className="relative w-32 sm:w-40 aspect-[2/3] rounded-xl overflow-hidden border border-[#d4a85333] shadow-lg shadow-[#d4a85310]"
                    style={{ opacity: 0, animation: `cardDeal 0.6s ease-out ${idx * 0.3}s forwards` }}>
                    <img src={`/tarot/${card.id}.jpg`} alt={card.nameCn}
                      className={`w-full h-full object-cover ${card.reversed ? "rotate-180" : ""}`}
                      loading="eager"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-[10px] text-[#d4a853] uppercase tracking-wider">
                        {["Past", "Present", "Future"][idx]}
                        {card.reversed && <span className="ml-1 text-[8px] text-rose-400">(R)</span>}
                      </span>
                      <p className="text-xs font-semibold text-[#f0e6d3]">{card.nameCn}</p>
                      <p className="text-[9px] text-[#8a8aad]">{card.name}</p>
                    </div>
                    {card.suit !== "major" && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#d4a85322] rounded text-[8px] text-[#d4a853] capitalize">{card.suit}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reading Result */}
          {showReading && drawnCards.length > 0 && (
            <div className="max-w-2xl mx-auto glass rounded-xl p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-[#d4a853] mb-4 font-display flex items-center gap-2">
                <Eye className="w-5 h-5" /> Tarot Reading
                {remainingFree > 0 && !isUnlocked && (
                  <span className="ml-2 px-2 py-0.5 bg-green-400/10 text-green-400 text-[10px] rounded-full">FREE {freeUsed}/{FREE_READING_LIMIT}</span>
                )}
              </h3>

              <div className="space-y-3">
                {drawnCards.map((card, idx) => (
                  <div key={card.id} className="border-l-2 border-[#d4a85333] pl-4">
                    <p className="text-xs text-[#d4a853] mb-1">
                      {["Past", "Present", "Future"][idx]} · {card.nameCn} {card.reversed && <span className="text-rose-400 ml-0.5">(Reversed)</span>}
                      {card.suit !== "major" && <span className="text-[#8a8aad44] ml-1 capitalize">({card.suit})</span>}
                    </p>
                    <p className="text-sm text-[#8a8aad] leading-relaxed">
                      {card.reversed ? (card.meaningReversed || card.meaningUpright) : card.meaningUpright}
                    </p>
                  </div>
                ))}
              </div>

              {/* Comprehensive guidance */}
              {(remainingFree > 0 || isUnlocked) ? (
                <div className="mt-6 pt-4 border-t border-[#d4a85310]">
                  <h4 className="text-sm font-medium text-[#f0e6d3] mb-2">Comprehensive Guidance</h4>
                  <p className="text-sm text-[#8a8aad] leading-relaxed">
                    {(() => { const keys = Object.keys(INTERPRETATIONS); const hash = drawnCards.reduce((s, c) => s + c.id, 0); return INTERPRETATIONS[keys[hash % keys.length]] })()}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {drawnCards.map((card, idx) => (
                      <div key={idx} className="bg-[#0a0a0f] rounded-lg p-2 text-center border border-[#d4a85306]">
                        <p className="text-[9px] text-[#8a8aad44]">{["Past", "Present", "Future"][idx]}{card.reversed ? " (R)" : ""}</p>
                        <p className="text-[10px] text-[#d4a853] font-medium">{card.keywords.slice(0, 2).join(" · ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-4 border-t border-[#d4a85310]">
                  <div className="relative">
                    <div className="blur-sm select-none opacity-30 pointer-events-none">
                      <h4 className="text-sm font-medium text-[#f0e6d3] mb-2">Comprehensive Guidance</h4>
                      <p className="text-sm text-[#8a8aad] leading-relaxed">Comprehensive guidance requires payment to unlock. After payment, you will receive detailed comprehensive analysis, multi-dimensional interpretations, and personalized action advice.</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button onClick={() => setShowPaymentModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-[#d4a853] to-[#c9953a] text-[#0a0a0f] rounded-lg text-sm font-bold hover:from-[#e0b860] hover:to-[#d4a853] transition-all flex items-center gap-2 shadow-lg">
                        <Unlock className="w-4 h-4" /> Unlock Full Reading ${tarotMode === "idol" ? IDOL_UNLOCK_PRICE : UNLOCK_PRICE}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isUnlocked && (
                <div className="mt-4 p-3 bg-[#d4a85308] border border-[#d4a85315] rounded-lg">
                  <p className="text-xs text-[#d4a853] text-center flex items-center justify-center gap-1"><Check className="w-3 h-3" /> Full reading unlocked</p>
                </div>
              )}

              {/* Idol Tarot: Share buttons */}
              {tarotMode === "idol" && (
                <div className="mt-6 pt-4 border-t border-[#d4a85310]">
                  <p className="text-[10px] text-[#8a8aad] text-center mb-3 uppercase tracking-wider">Share Your Reading</p>
                  <div className="flex justify-center gap-3">
                    {[
                      { name: "Instagram", color: "hover:bg-pink-500/20 hover:text-pink-400", icon: "📷" },
                      { name: "TikTok", color: "hover:bg-gray-400/20 hover:text-gray-300", icon: "🎵" },
                      { name: "Xiaohongshu", color: "hover:bg-red-400/20 hover:text-red-400", icon: "📕" },
                    ].map(platform => (
                      <button key={platform.name} onClick={() => {
                        const text = `🔮 My Idol Tarot Reading on R7 Fortune!\n${drawnCards.map((c, i) => `${["Past","Present","Future"][i]}: ${c.nameCn} ${c.reversed ? "(Reversed)" : ""}`).join("\n")}\n#R7Fortune #IdolTarot #TarotReading`
                        navigator.clipboard.writeText(text).catch(() => {})
                      }}
                        className={`flex flex-col items-center gap-1 px-4 py-3 glass rounded-xl border border-[#d4a85310] ${platform.color} transition-all text-[#8a8aad] hover:scale-105`}>
                        <span className="text-lg">{platform.icon}</span>
                        <span className="text-[9px]">{platform.name}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[8px] text-[#8a8aad33] text-center mt-2">Click to copy reading & share on your favorite platform</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <TarotPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onPaid={() => setIsUnlocked(true)} amount={tarotMode === "idol" ? IDOL_UNLOCK_PRICE : UNLOCK_PRICE} />
    </>
  )
}

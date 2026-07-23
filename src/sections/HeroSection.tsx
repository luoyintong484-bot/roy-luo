import { useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router"
import { useI18n } from "@/contexts/I18nContext"
import { ChevronDown, Sparkles, Heart } from "lucide-react"

const HOT_BADGE = (
  <span className="home-hot-badge absolute -top-2 -right-5 px-1.5 py-0.5 border border-[#ffb6d950] bg-[#130b12]/75 text-[#ffd6e8] text-[8px] font-bold rounded-full shadow-[0_0_18px_rgba(255,182,217,0.14)]">
    HOT
  </span>
)

export default function HeroSection() {
  const navigate = useNavigate()
  const { t, locale } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const timeRef = useRef(0)

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = window.innerWidth
    let h = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + "px"
    canvas.style.height = h + "px"
    ctx.scale(dpr, dpr)

    const rings = [
      { radius: Math.min(w, h) * 0.22, tiltX: 0, tiltZ: 0, speed: 0.002, width: 1.5, opacity: 0.12 },
      { radius: Math.min(w, h) * 0.32, tiltX: Math.PI / 3, tiltZ: Math.PI / 5, speed: -0.0015, width: 1, opacity: 0.08 },
      { radius: Math.min(w, h) * 0.42, tiltX: -Math.PI / 3.5, tiltZ: -Math.PI / 4, speed: 0.001, width: 0.8, opacity: 0.06 },
    ]

    const glyphs = ["\u2648", "\u2649", "\u264A", "\u264B", "\u264C", "\u264D", "\u264E", "\u264F", "\u2650", "\u2651", "\u2652", "\u2653"]
    const glyphCount = 36

    interface Particle { angle: number; radius: number; speed: number; ringIdx: number; size: number; brightness: number }
    const particles: Particle[] = []
    for (let i = 0; i < 200; i++) {
      const ringIdx = i < 80 ? 0 : i < 140 ? 1 : 2
      const ring = rings[ringIdx]
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: ring.radius + (Math.random() - 0.5) * 40,
        speed: ring.speed * (0.3 + Math.random() * 0.7),
        ringIdx,
        size: ringIdx === 0 ? 1.2 + Math.random() * 0.8 : 0.6 + Math.random() * 0.6,
        brightness: 0.3 + Math.random() * 0.5,
      })
    }

    interface Glyph { angle: number; ringIdx: number; speed: number; char: string; phase: number }
    const glyphSprites: Glyph[] = []
    for (let i = 0; i < glyphCount; i++) {
      const ringIdx = i % 3
      glyphSprites.push({ angle: (i / glyphCount) * Math.PI * 2, ringIdx, speed: rings[ringIdx].speed * 1.5, char: glyphs[i % 12], phase: Math.random() * Math.PI * 2 })
    }

    function project3D(x: number, y: number, z: number, tiltX: number, tiltZ: number) {
      const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX)
      const cosZ = Math.cos(tiltZ), sinZ = Math.sin(tiltZ)
      const y1 = y * cosX - z * sinX, z1 = y * sinX + z * cosX
      const x2 = x * cosZ - y1 * sinZ, y2 = x * sinZ + y1 * cosZ
      const scale = 600 / (600 + z1 * 0.5)
      return { sx: w / 2 + x2 * scale + (mouseRef.current.x - w / 2) * 0.02 * scale, sy: h / 2 + y2 * scale + (mouseRef.current.y - h / 2) * 0.02 * scale, scale, z: z1 }
    }

    let raf: number
    function draw() {
      timeRef.current += 0.008
      const t = timeRef.current
      ctx!.fillStyle = "rgba(10, 10, 15, 0.25)"
      ctx!.fillRect(0, 0, w, h)

      for (const ring of rings) {
        ctx!.save()
        ctx!.globalAlpha = ring.opacity
        ctx!.strokeStyle = "#d4a853"
        ctx!.lineWidth = ring.width
        ctx!.beginPath()
        for (let i = 0; i <= 360; i++) {
          const a = (i / 360) * Math.PI * 2
          const p = project3D(Math.cos(a) * ring.radius, Math.sin(a) * ring.radius, 0, ring.tiltX + Math.sin(t * 0.3) * 0.05, ring.tiltZ)
          if (i === 0) ctx!.moveTo(p.sx, p.sy); else ctx!.lineTo(p.sx, p.sy)
        }
        ctx!.closePath(); ctx!.stroke(); ctx!.restore()
      }

      for (const p of particles) {
        const ring = rings[p.ringIdx]
        p.angle += p.speed
        const oscillation = Math.sin(t * 2 + p.angle * 3) * 15
        const px = Math.cos(p.angle) * (p.radius + oscillation * 0.3)
        const py = Math.sin(p.angle) * (p.radius + oscillation * 0.3)
        const pz = Math.sin(p.angle * 2 + t) * 25 + oscillation
        const proj = project3D(px, py, pz, ring.tiltX + Math.sin(t * 0.3) * 0.05, ring.tiltZ)
        const alpha = p.brightness * proj.scale * (0.6 + 0.4 * Math.sin(t * 3 + p.angle * 5))
        const glowSize = p.size * 3
        ctx!.save(); ctx!.globalAlpha = alpha * 0.3
        const grad = ctx!.createRadialGradient(proj.sx, proj.sy, 0, proj.sx, proj.sy, glowSize)
        grad.addColorStop(0, "rgba(212, 168, 83, 0.8)"); grad.addColorStop(0.5, "rgba(212, 168, 83, 0.2)"); grad.addColorStop(1, "rgba(212, 168, 83, 0)")
        ctx!.fillStyle = grad; ctx!.beginPath(); ctx!.arc(proj.sx, proj.sy, glowSize, 0, Math.PI * 2); ctx!.fill(); ctx!.restore()
        ctx!.save(); ctx!.globalAlpha = alpha; ctx!.fillStyle = "#f0e6d3"; ctx!.beginPath(); ctx!.arc(proj.sx, proj.sy, p.size * proj.scale, 0, Math.PI * 2); ctx!.fill(); ctx!.restore()
      }

      for (const g of glyphSprites) {
        const ring = rings[g.ringIdx]
        g.angle += g.speed
        const bob = Math.sin(t + g.phase) * 8
        const proj = project3D(Math.cos(g.angle) * (ring.radius + bob), Math.sin(g.angle) * (ring.radius + bob), Math.cos(g.angle * 2 + t) * 20, ring.tiltX + Math.sin(t * 0.3) * 0.05, ring.tiltZ)
        const glyphAlpha = 0.5 * proj.scale * (0.7 + 0.3 * Math.sin(t * 2 + g.phase))
        ctx!.save(); ctx!.globalAlpha = glyphAlpha; ctx!.font = `${14 * proj.scale}px serif`; ctx!.fillStyle = "#d4a853"
        ctx!.textAlign = "center"; ctx!.textBaseline = "middle"; ctx!.shadowColor = "#d4a853"; ctx!.shadowBlur = 10
        ctx!.fillText(g.char, proj.sx, proj.sy); ctx!.restore()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + "px"; canvas.style.height = h + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    const onMouseMove = (e: MouseEvent) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY }
    window.addEventListener("resize", onResize); window.addEventListener("mousemove", onMouseMove)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); window.removeEventListener("mousemove", onMouseMove) }
  }, [])

  useEffect(() => { const cleanup = initCanvas(); return cleanup }, [initCanvas])

  const buttons = [
    { key: "tarot", path: "/tarot", hot: false },
    { key: "destiny", path: "/destiny", hot: false },
    { key: "idol", path: "/idol", hot: true },
  ]

  return (
    <section id="hero" className="home-hero relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20 pb-12 sm:pt-0 sm:pb-0">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="home-hero-vignette absolute inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, transparent 0%, rgba(10,10,15,0.4) 100%)" }} />
      <div className="home-hero-glow absolute inset-x-4 top-24 z-[1] h-72 rounded-full bg-[radial-gradient(circle,rgba(255,182,217,0.20),rgba(212,168,83,0.10)_42%,transparent_72%)] blur-2xl sm:hidden" />

      <div className="home-hero-inner relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="home-hero-content max-w-2xl mx-auto text-center sm:mx-0 sm:text-left">
          <div className="home-kicker mb-4 inline-flex items-center gap-2 rounded-full border border-[#ffb6d92b] bg-[#ff8fbd12] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffd6e8] shadow-[0_0_35px_rgba(255,182,217,0.12)] sm:hidden">
            <Sparkles className="h-3.5 w-3.5" />
            R7 Fortune
          </div>
          <h1 className="home-hero-title font-display text-[3.45rem] sm:text-6xl lg:text-7xl font-black italic text-[#f0e6d3] leading-[0.94] sm:leading-[1.1] tracking-wide animate-fade-in-up"
            style={{ textShadow: "0 0 80px rgba(212,168,83,0.2), 0 4px 20px rgba(0,0,0,0.5)", animationDelay: "0.2s" }}>
            Meet Your
            <br />
            <span className="bg-gradient-to-r from-[#ffd36a] via-[#ffb6d9] to-[#d8c3ff] bg-clip-text text-transparent">Future</span>
          </h1>

          <p className="home-hero-desc mt-5 sm:mt-6 text-[15px] sm:text-lg font-light leading-7 max-w-lg mx-auto sm:mx-0 animate-fade-in-up rounded-2xl border border-[#ffb6d914] px-4 py-3 backdrop-blur-md"
            style={{ animationDelay: "0.4s", color: "#f0e6d3", backgroundColor: "rgba(8,5,12,0.68)", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
            {t("hero.desc")}
          </p>

          <div className="home-cta-grid mt-7 sm:mt-10 grid grid-cols-3 gap-2.5 sm:flex sm:items-center sm:gap-4 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            {buttons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => navigate(btn.path)}
                className="home-primary-btn relative px-3 sm:px-7 py-3.5 sm:py-3 bg-gradient-to-r from-[#d8b463] via-[#d1a251] to-[#bd8f35] text-[#0a0a0f] rounded-2xl sm:rounded-full text-xs sm:text-sm font-black hover:from-[#e0b860] hover:to-[#d4a853] hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-[#d4a85325]"
              >
                {t(`hero.btn.${btn.key}`)}
                {btn.hot && HOT_BADGE}
              </button>
            ))}
          </div>

          {/* Idol Zone Entry Banners */}
          <div className="home-feature-stack mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            <button
              onClick={() => navigate("/tarot?mode=idol")}
              className="home-feature-card flex-1 rounded-2xl sm:rounded-xl px-4 sm:px-5 py-4 sm:py-3.5 border border-[#ffb6d922] bg-[#100a14]/72 hover:border-[#d4a85330] transition-all text-left group flex items-center gap-3 shadow-[0_18px_45px_rgba(255,143,189,0.10)]"
            >
              <div className="home-feature-icon w-10 h-10 sm:w-9 sm:h-9 rounded-2xl sm:rounded-lg bg-gradient-to-br from-[#ffb6d91e] to-[#d4a8530a] flex items-center justify-center border border-[#ffb6d922] flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[#d4a853] group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#f0e6d3] group-hover:text-[#d4a853] transition-colors">{locale === "zh-TW" ? "Idol Destiny · 愛豆塔羅" : "Idol Destiny · Dual Tarot"}</p>
                <p className="text-[9px] text-[#8a8aad66] mt-0.5">{locale === "zh-TW" ? "紫微塔羅 × 韋特塔羅 · 免費抽牌" : "Zi Wei × Rider–Waite · Free draw"}</p>
              </div>
              <span className="home-card-badge px-1.5 py-0.5 border border-[#ffb6d94a] bg-[#1a0d16]/70 text-[#ffd6e8] text-[7px] font-bold rounded-full">HOT</span>
            </button>
          </div>

          {/* CP Fate Report Banner */}
          <div className="mt-3 animate-fade-in-up" style={{ animationDelay: "1.0s" }}>
            <button onClick={() => navigate("/cp-report")}
              className="home-feature-card w-full rounded-2xl sm:rounded-xl px-4 sm:px-5 py-4 sm:py-3.5 border border-[#FFB6C125] bg-[#100a14]/72 hover:border-[#FFB6C130] transition-all text-left group flex items-center gap-3 relative shadow-[0_18px_45px_rgba(255,182,193,0.10)]">
              <div className="home-feature-icon w-10 h-10 sm:w-9 sm:h-9 rounded-2xl sm:rounded-lg bg-gradient-to-br from-[#FFB6C120] to-[#FFB6C105] flex items-center justify-center border border-[#FFB6C120] flex-shrink-0">
                <Heart className="w-4 h-4 text-[#FFB6C1] group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#f0e6d3] group-hover:text-[#FFB6C1] transition-colors">{locale === "zh-TW" ? "CP 宿命合盤" : "CP Fate Report"}</p>
                <p className="text-[9px] text-[#8a8aad33] mt-0.5">{locale === "zh-TW" ? "宇宙雙人星盤 · 緣分解讀" : "Cosmic Pair Reading · Two-Idol Destiny Chart"}</p>
              </div>
              <span className="home-card-badge absolute -top-2 -right-2 px-1.5 py-0.5 border border-[#ffb6d94a] bg-[#1a0d16]/78 text-[#ffd6e8] text-[8px] font-bold rounded-full">HOT</span>
            </button>
          </div>
        </div>
      </div>

      <div className="home-scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[10px] text-[#8a8aad] uppercase tracking-[0.2em]">{t("hero.scroll")}</span>
        <div className="w-px h-8 bg-gradient-to-b from-[#d4a85366] to-transparent relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#d4a853] animate-scroll-dot" />
        </div>
        <ChevronDown className="w-4 h-4 text-[#d4a853] animate-bounce" />
      </div>
    </section>
  )
}

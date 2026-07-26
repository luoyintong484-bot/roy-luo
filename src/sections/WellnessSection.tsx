import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Sparkles, Heart } from "lucide-react";
import { WELLNESS_BRAND, WELLNESS_CTA } from "@/data/wellness-content";

/**
 * Wellness Hero Section
 * Psychology-framed version of HeroSection.
 * Replaces gold/cosmic aesthetic with teal/calming tones.
 * ZERO divination language.
 */

export default function WellnessSection() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  const locale = (() => {
    try {
      const stored = localStorage.getItem("r7-locale");
      if (stored === "zh-TW") return "zh-TW";
    } catch {}
    return "en";
  })();

  const brand = WELLNESS_BRAND[locale] || WELLNESS_BRAND["en"];
  const ctas = WELLNESS_CTA[locale] || WELLNESS_CTA["en"];
  const isZh = locale === "zh-TW";

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    // Subtle calming particle animation — teal tones instead of cosmic gold
    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; life: number; maxLife: number;
    }
    const particles: Particle[] = [];
    const maxParticles = 50;

    function spawnParticle() {
      if (particles.length >= maxParticles) return;
      particles.push({
        x: Math.random() * w,
        y: h + 10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.3 + Math.random() * 0.6),
        size: 1 + Math.random() * 2.5,
        opacity: 0.15 + Math.random() * 0.25,
        life: 0,
        maxLife: 300 + Math.random() * 400,
      });
    }

    let raf: number;
    function draw() {
      timeRef.current += 0.005;
      ctx!.fillStyle = "rgba(10, 14, 18, 0.18)";
      ctx!.fillRect(0, 0, w, h);

      // Spawn particles
      if (Math.random() < 0.15) spawnParticle();

      // Draw particles — teal/cyan calming colors
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }
        const fade = 1 - p.life / p.maxLife;
        p.x += p.vx;
        p.y += p.vy;
        const alpha = p.opacity * fade;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(94, 200, 178, ${alpha})`;
        ctx!.fill();
      }

      // Subtle center glow
      const glowGrad = ctx!.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.5);
      glowGrad.addColorStop(0, "rgba(94, 200, 178, 0.04)");
      glowGrad.addColorStop(1, "rgba(94, 200, 178, 0)");
      ctx!.fillStyle = glowGrad;
      ctx!.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    const onMouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onResize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const cleanup = initCanvas();
    return () => { cleanup?.(); };
  }, [initCanvas]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0e12]">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0e12]/40 via-transparent to-[#0a0e12]/90 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-4xl mx-auto pt-20 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#5ec8b220] bg-[#5ec8b208] mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#5ec8b2]" />
          <span className="text-[11px] font-medium text-[#5ec8b2] tracking-[0.15em] uppercase">
            {brand.name} · {brand.tagline}
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-[#f0e6d3] leading-tight mb-4">
          {brand.subtitle}
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-[#8a8aad] max-w-xl mb-10 leading-relaxed">
          {brand.desc}
        </p>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
          {ctas.map((cta) => (
            <button
              key={cta.key}
              onClick={() => navigate(cta.path)}
              className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl border border-[#5ec8b215] bg-[#0a0e12]/60 backdrop-blur-sm hover:border-[#5ec8b240] hover:bg-[#5ec8b206] transition-all duration-300 text-center"
            >
              <div className="w-11 h-11 rounded-xl bg-[#5ec8b210] border border-[#5ec8b215] flex items-center justify-center group-hover:bg-[#5ec8b218] transition-colors">
                {cta.key === "cards" && <Heart className="w-5 h-5 text-[#5ec8b2]" />}
                {cta.key === "blueprint" && <Sparkles className="w-5 h-5 text-[#5ec8b2]" />}
                {cta.key === "relationship" && (
                  <svg className="w-5 h-5 text-[#5ec8b2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                )}
              </div>
              <span className="font-display text-sm font-bold text-[#f0e6d3] group-hover:text-[#5ec8b2] transition-colors">
                {cta.label}
              </span>
              <span className="text-[11px] text-[#8a8aad66] leading-relaxed">
                {cta.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Privacy note */}
        <p className="text-[10px] text-[#8a8aad33] mt-4">
          {isZh
            ? "匿名 · 安全 · 無評判 · 你的資料不會被儲存"
            : "Anonymous · Safe · Judgment-free · Your data is never stored"}
        </p>
      </div>
    </section>
  );
}

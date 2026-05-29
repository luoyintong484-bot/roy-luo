import { useEffect, useRef } from "react";

/** Deep-blue starry background canvas for Idol/Tarot/Destiny section pages.
 *  CSS-free royalty-free — lightweight 2D Canvas with drifting stars and slow star trails. */
export default function SectionStarryBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    let w = parent?.offsetWidth || window.innerWidth;
    let h = parent?.offsetHeight || 1200;
    const dpr = 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    // Star data
    interface S { x: number; y: number; r: number; a: number; phase: number; driftX: number; driftY: number }
    const bgStars: S[] = [];
    for (let i = 0; i < 200; i++) {
      bgStars.push({ x: Math.random() * w, y: Math.random() * h, r: 0.15 + Math.random() * 0.4, a: 0.12 + Math.random() * 0.25, phase: Math.random() * Math.PI * 2, driftX: (Math.random() - 0.5) * 0.02, driftY: (Math.random() - 0.5) * 0.02 });
    }
    const brightStars: S[] = [];
    for (let i = 0; i < 18; i++) {
      brightStars.push({ x: Math.random() * w, y: Math.random() * h, r: 1.0 + Math.random() * 2.0, a: 0.45 + Math.random() * 0.45, phase: Math.random() * Math.PI * 2, driftX: (Math.random() - 0.5) * 0.015, driftY: (Math.random() - 0.5) * 0.015 });
    }

    let raf: number;
    const draw = () => {
      const t = Date.now() * 0.001;
      // Deep blue gradient base
      const grad = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h, w * 1.2);
      grad.addColorStop(0, "#101438");
      grad.addColorStop(0.4, "#0c102e");
      grad.addColorStop(0.8, "#080b20");
      grad.addColorStop(1, "#050714");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Tiny background stars
      for (const s of bgStars) {
        const f = 0.5 + 0.5 * Math.sin(t * 2 + s.phase);
        ctx.fillStyle = `rgba(180, 195, 240, ${s.a * f})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        s.x += s.driftX; s.y += s.driftY;
        if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
      }

      // Bright constellation stars with glow
      for (const s of brightStars) {
        const f = 0.5 + 0.5 * Math.sin(t * 1.3 + s.phase);
        const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3.5);
        halo.addColorStop(0, `rgba(160, 190, 250, ${0.18 * f})`);
        halo.addColorStop(0.5, `rgba(120, 155, 230, ${0.05 * f})`);
        halo.addColorStop(1, "rgba(80, 110, 200, 0)");
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(210, 225, 255, ${s.a * f})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 0.55, 0, Math.PI * 2); ctx.fill();
        s.x += s.driftX; s.y += s.driftY;
        if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h; if (s.y > h) s.y = 0;
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      w = parent?.offsetWidth || window.innerWidth;
      h = parent?.offsetHeight || 1200;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    };
    const ro = new ResizeObserver(onResize);
    if (parent) ro.observe(parent);
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}

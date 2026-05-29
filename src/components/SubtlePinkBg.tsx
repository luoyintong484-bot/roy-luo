import { useEffect, useRef } from "react";

/** Subtle pink shimmer background for all non-Home pages.
 *  Pure black base #000000 with sparse low-saturation pink sparkles.
 *  No orbits, no lines, no floating — only gentle twinkling. */
export default function SubtlePinkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    interface Spark { x: number; y: number; r: number; baseAlpha: number; phase: number }
    const sparks: Spark[] = [];
    // Sparse: ~80 particles total — fewer on mobile
    const count = w < 768 ? 50 : 80;
    for (let i = 0; i < count; i++) {
      sparks.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.2,
        baseAlpha: 0.08 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let raf: number;
    const draw = () => {
      const t = Date.now() * 0.001;
      // Pure black base
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      for (const s of sparks) {
        // Very subtle twinkling only — no drift, no orbit
        const twinkle = 0.3 + 0.7 * Math.sin(t * 1.2 + s.phase);
        const alpha = s.baseAlpha * twinkle;

        // Soft pink glow halo
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.5);
        grad.addColorStop(0, `rgba(255, 182, 193, ${alpha * 0.5})`);
        grad.addColorStop(0.5, `rgba(255, 160, 180, ${alpha * 0.1})`);
        grad.addColorStop(1, "rgba(255, 140, 160, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(255, 200, 210, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, background: "#000000" }}
    />
  );
}

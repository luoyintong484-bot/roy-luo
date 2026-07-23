import { useEffect, useRef } from "react";

/** Soft starry-sky background for all non-Home pages.
 *  Deep plum-black base with silver + soft pink sparkles.
 *  Gentle twinkle + slow drift — elegant, understated. */
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

    interface Star { x: number; y: number; r: number; baseAlpha: number; phase: number; isPink: boolean; driftX: number; driftY: number }
    const stars: Star[] = [];
    const count = w < 768 ? 200 : 300;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 2.2,
        baseAlpha: 0.12 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        isPink: Math.random() > 0.55,
        driftX: (Math.random() - 0.5) * 0.15,
        driftY: (Math.random() - 0.5) * 0.15,
      });
    }

    let raf: number;
    const draw = () => {
      const t = Date.now() * 0.001;
      const base = ctx.createRadialGradient(w * 0.48, h * 0.12, 0, w * 0.5, h * 0.8, Math.max(w, h) * 0.98);
      base.addColorStop(0, w < 768 ? "#15101f" : "#0c0a12");
      base.addColorStop(0.45, w < 768 ? "#0b0913" : "#05050a");
      base.addColorStop(1, "#020205");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        // Gentle twinkle
        const twinkle = 0.35 + 0.65 * Math.sin(t * 1.5 + s.phase);
        const alpha = s.baseAlpha * twinkle;

        // Very slow drift for depth
        const dx = Math.sin(t * 0.3 + s.phase) * s.driftX;
        const dy = Math.cos(t * 0.3 + s.phase) * s.driftY;

        if (s.isPink) {
          const grad = ctx.createRadialGradient(s.x + dx, s.y + dy, 0, s.x + dx, s.y + dy, s.r * 3.5);
          grad.addColorStop(0, `rgba(255, 182, 193, ${alpha * 0.7})`);
          grad.addColorStop(0.3, `rgba(255, 160, 180, ${alpha * 0.2})`);
          grad.addColorStop(1, "rgba(255, 140, 160, 0)");
          ctx.fillStyle = grad;
        } else {
          const grad = ctx.createRadialGradient(s.x + dx, s.y + dy, 0, s.x + dx, s.y + dy, s.r * 2.5);
          grad.addColorStop(0, `rgba(230, 230, 250, ${alpha * 0.65})`);
          grad.addColorStop(0.4, `rgba(190, 190, 220, ${alpha * 0.18})`);
          grad.addColorStop(1, "rgba(150, 150, 190, 0)");
          ctx.fillStyle = grad;
        }

        ctx.beginPath();
        ctx.arc(s.x + dx, s.y + dy, s.r * (s.isPink ? 3 : 2.2), 0, Math.PI * 2);
        ctx.fill();

        // Core spark — brighter
        ctx.fillStyle = s.isPink
          ? `rgba(255, 210, 225, ${Math.min(1, alpha * 1.3)})`
          : `rgba(245, 245, 255, ${Math.min(1, alpha * 1.1)})`;
        ctx.beginPath();
        ctx.arc(s.x + dx, s.y + dy, s.r * 0.5, 0, Math.PI * 2);
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
      style={{ zIndex: 0, background: "#07050b" }}
    />
  );
}

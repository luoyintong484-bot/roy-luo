import { useEffect, useRef } from "react";

/** Global background — hero-style particle field.
 *  Deep black/plum base with pink-white orbital star trails.
 *  3 tilted rings, 200 glow particles, 36 zodiac glyphs — matching HeroSection canvas 1:1. */
export default function BannerStyleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
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

    const rings = [
      { radius: Math.min(w, h) * 0.22, tiltX: 0, tiltZ: 0, speed: 0.002, width: 1.5, opacity: 0.12 },
      { radius: Math.min(w, h) * 0.32, tiltX: Math.PI / 3, tiltZ: Math.PI / 5, speed: -0.0015, width: 1, opacity: 0.08 },
      { radius: Math.min(w, h) * 0.42, tiltX: -Math.PI / 3.5, tiltZ: -Math.PI / 4, speed: 0.001, width: 0.8, opacity: 0.06 },
    ];

    const glyphs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
    const glyphCount = 36;

    interface Particle { angle: number; radius: number; speed: number; ringIdx: number; size: number; brightness: number }
    const particles: Particle[] = [];
    for (let i = 0; i < 200; i++) {
      const ringIdx = i < 80 ? 0 : i < 140 ? 1 : 2;
      const ring = rings[ringIdx];
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: ring.radius + (Math.random() - 0.5) * 40,
        speed: ring.speed * (0.3 + Math.random() * 0.7),
        ringIdx,
        size: ringIdx === 0 ? 1.2 + Math.random() * 0.8 : 0.6 + Math.random() * 0.6,
        brightness: 0.3 + Math.random() * 0.5,
      });
    }

    interface Glyph { angle: number; ringIdx: number; speed: number; char: string; phase: number }
    const glyphSprites: Glyph[] = [];
    for (let i = 0; i < glyphCount; i++) {
      const ringIdx = i % 3;
      glyphSprites.push({ angle: (i / glyphCount) * Math.PI * 2, ringIdx, speed: rings[ringIdx].speed * 1.5, char: glyphs[i % 12], phase: Math.random() * Math.PI * 2 });
    }

    function project3D(x: number, y: number, z: number, tiltX: number, tiltZ: number) {
      const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX);
      const cosZ = Math.cos(tiltZ), sinZ = Math.sin(tiltZ);
      const y1 = y * cosX - z * sinX, z1 = y * sinX + z * cosX;
      const x2 = x * cosZ - y1 * sinZ, y2 = x * sinZ + y1 * cosZ;
      const scale = 600 / (600 + z1 * 0.5);
      return { sx: w / 2 + x2 * scale + (mouseRef.current.x - w / 2) * 0.02 * scale, sy: h / 2 + y2 * scale + (mouseRef.current.y - h / 2) * 0.02 * scale, scale, z: z1 };
    }

    let raf: number;
    function draw() {
      timeRef.current += 0.008;
      const t = timeRef.current;
      if (w < 768) {
        const base = ctx!.createRadialGradient(w * 0.62, h * 0.18, 0, w * 0.52, h * 0.72, Math.max(w, h));
        base.addColorStop(0, "rgba(31, 20, 42, 0.44)");
        base.addColorStop(0.5, "rgba(8, 7, 13, 0.92)");
        base.addColorStop(1, "rgba(2, 2, 5, 1)");
        ctx!.fillStyle = base;
      } else {
        ctx!.fillStyle = "rgba(0, 0, 0, 0.25)";
      }
      ctx!.fillRect(0, 0, w, h);

      for (const ring of rings) {
        ctx!.save();
        ctx!.globalAlpha = ring.opacity;
        ctx!.strokeStyle = "#d4a853";
        ctx!.lineWidth = ring.width;
        ctx!.beginPath();
        for (let i = 0; i <= 360; i++) {
          const a = (i / 360) * Math.PI * 2;
          const p = project3D(Math.cos(a) * ring.radius, Math.sin(a) * ring.radius, 0, ring.tiltX + Math.sin(t * 0.3) * 0.05, ring.tiltZ);
          if (i === 0) ctx!.moveTo(p.sx, p.sy); else ctx!.lineTo(p.sx, p.sy);
        }
        ctx!.closePath(); ctx!.stroke(); ctx!.restore();
      }

      for (const p of particles) {
        const ring = rings[p.ringIdx];
        p.angle += p.speed;
        const oscillation = Math.sin(t * 2 + p.angle * 3) * 15;
        const px = Math.cos(p.angle) * (p.radius + oscillation * 0.3);
        const py = Math.sin(p.angle) * (p.radius + oscillation * 0.3);
        const pz = Math.sin(p.angle * 2 + t) * 25 + oscillation;
        const proj = project3D(px, py, pz, ring.tiltX + Math.sin(t * 0.3) * 0.05, ring.tiltZ);
        const alpha = p.brightness * proj.scale * (0.6 + 0.4 * Math.sin(t * 3 + p.angle * 5));
        const glowSize = p.size * 3;
        ctx!.save(); ctx!.globalAlpha = alpha * 0.3;
        const grad = ctx!.createRadialGradient(proj.sx, proj.sy, 0, proj.sx, proj.sy, glowSize);
        grad.addColorStop(0, "rgba(212, 168, 83, 0.8)"); grad.addColorStop(0.5, "rgba(212, 168, 83, 0.2)"); grad.addColorStop(1, "rgba(212, 168, 83, 0)");
        ctx!.fillStyle = grad; ctx!.beginPath(); ctx!.arc(proj.sx, proj.sy, glowSize, 0, Math.PI * 2); ctx!.fill(); ctx!.restore();
        ctx!.save(); ctx!.globalAlpha = alpha; ctx!.fillStyle = "#f0e6d3"; ctx!.beginPath(); ctx!.arc(proj.sx, proj.sy, p.size * proj.scale, 0, Math.PI * 2); ctx!.fill(); ctx!.restore();
      }

      for (const g of glyphSprites) {
        const ring = rings[g.ringIdx];
        g.angle += g.speed;
        const bob = Math.sin(t + g.phase) * 8;
        const proj = project3D(Math.cos(g.angle) * (ring.radius + bob), Math.sin(g.angle) * (ring.radius + bob), Math.cos(g.angle * 2 + t) * 20, ring.tiltX + Math.sin(t * 0.3) * 0.05, ring.tiltZ);
        const glyphAlpha = 0.5 * proj.scale * (0.7 + 0.3 * Math.sin(t * 2 + g.phase));
        ctx!.save(); ctx!.globalAlpha = glyphAlpha; ctx!.font = `${14 * proj.scale}px serif`; ctx!.fillStyle = "#d4a853";
        ctx!.textAlign = "center"; ctx!.textBaseline = "middle"; ctx!.shadowColor = "#d4a853"; ctx!.shadowBlur = 10;
        ctx!.fillText(g.char, proj.sx, proj.sy); ctx!.restore();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + "px"; canvas.style.height = h + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const onMouseMove = (e: MouseEvent) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY; };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); window.removeEventListener("mousemove", onMouseMove); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "#07050b" }} />;
}

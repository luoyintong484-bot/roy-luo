import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  hue: number;
  layer: number;
}

export default function StarryBackground({ variant = "full" }: { variant?: "full" | "subtle" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const stars: Star[] = [];
      const count = variant === "full" ? 300 : 120;
      for (let i = 0; i < count; i++) {
        const layer = Math.random();
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: layer < 0.1 ? Math.random() * 3 + 2 : layer < 0.4 ? Math.random() * 1.5 + 0.5 : Math.random() * 0.8 + 0.2,
          opacity: Math.random() * 0.8 + 0.2,
          speed: layer < 0.3 ? Math.random() * 0.3 + 0.1 : Math.random() * 0.1 + 0.02,
          hue: layer < 0.1 ? 320 + Math.random() * 40 : 40 + Math.random() * 20,
          layer,
        });
      }
      starsRef.current = stars;
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const stars = starsRef.current;
      for (const star of stars) {
        star.y -= star.speed;
        if (star.y < -10) {
          star.y = canvas.height + 10;
          star.x = Math.random() * canvas.width;
        }

        // Twinkle
        const twinkle = Math.sin(Date.now() * 0.001 * star.speed * 10 + star.x) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;

        // Glow for large stars
        if (star.size > 2) {
          const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
          gradient.addColorStop(0, `hsla(${star.hue}, 80%, 70%, ${alpha * 0.4})`);
          gradient.addColorStop(0.5, `hsla(${star.hue}, 60%, 50%, ${alpha * 0.15})`);
          gradient.addColorStop(1, `hsla(${star.hue}, 40%, 30%, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star core
        ctx.fillStyle = `hsla(${star.hue}, ${star.size > 1 ? 80 : 40}%, ${star.size > 1 ? 85 : 75}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross glow for medium stars
        if (star.size > 1 && star.size <= 2) {
          ctx.strokeStyle = `hsla(${star.hue}, 60%, 60%, ${alpha * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 2, star.y);
          ctx.lineTo(star.x + star.size * 2, star.y);
          ctx.moveTo(star.x, star.y - star.size * 2);
          ctx.lineTo(star.x, star.y + star.size * 2);
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

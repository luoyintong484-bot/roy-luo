import { useState, useEffect, useRef } from "react";
import { Sparkles, Sun, Moon, Star, RotateCcw, Heart } from "lucide-react";

const zodiacSigns = [
  { name: "Aries", date: "3.21-4.19", emoji: "♈" },
  { name: "Taurus", date: "4.20-5.20", emoji: "♉" },
  { name: "Gemini", date: "5.21-6.21", emoji: "♊" },
  { name: "Cancer", date: "6.22-7.22", emoji: "♋" },
  { name: "Leo", date: "7.23-8.22", emoji: "♌" },
  { name: "Virgo", date: "8.23-9.22", emoji: "♍" },
  { name: "Libra", date: "9.23-10.23", emoji: "♎" },
  { name: "Scorpio", date: "10.24-11.22", emoji: "♏" },
  { name: "Sagittarius", date: "11.23-12.21", emoji: "♐" },
  { name: "Capricorn", date: "12.22-1.19", emoji: "♑" },
  { name: "Aquarius", date: "1.20-2.18", emoji: "♒" },
  { name: "Pisces", date: "2.19-3.20", emoji: "♓" },
];

const fortuneTemplates = [
  { overall: "The universe is especially kind to you today", love: "Romance is in the air — express your feelings openly", career: "Peak productivity — make important decisions today", wealth: "Unexpected gains may come your way", health: "Full of energy — a great day for exercise" },
  { overall: "The Moon enters your sign, heightening emotional sensitivity", love: "Small frictions with your partner — practice patience", career: "Handle details carefully, avoid careless mistakes", wealth: "Be rational with spending, avoid large purchases", health: "Watch your emotions — meditation can help" },
  { overall: "Venus forms a harmonious aspect with Jupiter", love: "Strong social energy for singles — romance may bloom", career: "Team collaboration flows smoothly, benefactors appear", wealth: "Stable income, possible bonus coming", health: "Excellent physical and mental wellbeing" },
  { overall: "Mercury retrograde is ending, clarity returns", love: "Communication flows well — good for deep conversations", career: "Creative ideas burst forth — new proposals gain approval", wealth: "Sharp investment instincts — try small ventures", health: "Take care of your respiratory system, drink warm water" },
  { overall: "Mars brings drive and initiative — take action today", love: "Passionate energy, but know your limits", career: "Strong competition — show your true abilities", wealth: "Both regular and windfall income are favorable", health: "High vitality — don't overexert yourself" },
  { overall: "Saturn watches over you — steady progress ahead", love: "Relationships need nurturing — create small surprises", career: "Solid work will be rewarded", wealth: "Save wisely, small amounts add up", health: "Keep your joints warm and protected" },
  { overall: "Uranus brings unexpected surprises", love: "Unconventional approaches yield unexpected rewards", career: "Break the routine — innovative thinking is praised", wealth: "Possible unexpected financial news", health: "Stay flexible — do stretching exercises" },
];

const luckyItems = [
  ["Gold", "Amethyst", "3", "Southeast"],
  ["Blue", "Sapphire", "7", "North"],
  ["Red", "Ruby", "9", "South"],
  ["Green", "Jade", "5", "East"],
  ["Purple", "Ametrine", "2", "Southwest"],
  ["White", "Moonstone", "6", "Northwest"],
  ["Orange", "Amber", "1", "Northeast"],
];

export default function DailyFortune() {
  const [fortune, setFortune] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  const getDaySeed = () => today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const seededRandom = (seed: number) => { const x = Math.sin(seed * 9301 + 49297) % 233280; return x < 0 ? -x : x; };

  const generateFortune = (signName: string) => {
    const seed = getDaySeed() + signName.charCodeAt(0);
    const templateIdx = Math.floor(seededRandom(seed) * fortuneTemplates.length);
    const template = fortuneTemplates[templateIdx % fortuneTemplates.length];
    const luckyIdx = Math.floor(seededRandom(seed + 1) * luckyItems.length);
    const lucky = luckyItems[luckyIdx % luckyItems.length];
    const starLevel = 3 + Math.floor(seededRandom(seed + 2) * 3);
    setFortune({ ...template, lucky, starLevel, signName });
    setIsFlipped(true);
  };

  const reset = () => { setFortune(null); setIsFlipped(false); };

  // Layered starry particle background
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = bgCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let w = window.innerWidth, h = 400;
    canvas.width = w * 2; canvas.height = h * 2;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.scale(2, 2);
    const dust: { x: number; y: number; r: number; a: number; phase: number }[] = [];
    for (let i = 0; i < 200; i++) dust.push({ x: Math.random() * w, y: Math.random() * h, r: 0.3 + Math.random() * 0.7, a: 0.15 + Math.random() * 0.3, phase: Math.random() * Math.PI * 2 });
    const trails: { cx: number; cy: number; r: number; speed: number; a: number }[] = [];
    for (let i = 0; i < 3; i++) trails.push({ cx: w * (0.25 + i * 0.25), cy: h * 0.5, r: 80 + i * 30, speed: 0.0003 + i * 0.0002, a: Math.random() * Math.PI * 2 });
    const glows: { x: number; y: number; size: number; phase: number }[] = [];
    for (let i = 0; i < 12; i++) glows.push({ x: Math.random() * w, y: Math.random() * h, size: 2 + Math.random() * 4, phase: Math.random() * Math.PI * 2 });
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h); const t = Date.now() * 0.001;
      for (const d of dust) { const f = 0.5 + 0.5 * Math.sin(t * 3 + d.phase); ctx.fillStyle = `rgba(255, 255, 255, ${d.a * f})`; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }
      for (const tr of trails) { tr.a += tr.speed; ctx.save(); ctx.globalAlpha = 0.08; ctx.strokeStyle = "#d4a853"; ctx.lineWidth = 0.5; ctx.beginPath();
        for (let i = 0; i <= 360; i += 2) { const a = (i / 360) * Math.PI * 2 + tr.a; const r = tr.r + Math.sin(i * 0.1 + t) * 20; const x = tr.cx + Math.cos(a) * r; const y = tr.cy + Math.sin(a) * r * 0.4; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); ctx.restore(); }
      for (const g of glows) { const pulse = 0.6 + 0.4 * Math.sin(t * 2 + g.phase); const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.size * 3); grad.addColorStop(0, `rgba(255, 150, 180, ${0.25 * pulse})`); grad.addColorStop(0.5, `rgba(255, 120, 160, ${0.08 * pulse})`); grad.addColorStop(1, "rgba(255, 100, 150, 0)"); ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(g.x, g.y, g.size * 3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = `rgba(255, 200, 220, ${0.6 * pulse})`; ctx.beginPath(); ctx.arc(g.x, g.y, g.size * 0.5, 0, Math.PI * 2); ctx.fill(); }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#d4a85310] border border-[#d4a85320] rounded-full mb-4">
            <Sun className="w-3 h-3 text-[#d4a853]" />
            <span className="text-[10px] text-[#d4a853] uppercase tracking-wider">Daily Fortune · {dateStr}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#f0e6d3]">Daily Fortune</h2>
          <p className="mt-2 text-sm text-[#8a8aad]">Select your zodiac sign to reveal today's guidance</p>
        </div>

        {!isFlipped ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {zodiacSigns.map(sign => (
              <button key={sign.name} onClick={() => generateFortune(sign.name)}
                className="group glass rounded-xl p-3 text-center hover:border-[#d4a85333] transition-all duration-300 hover:-translate-y-1 active:scale-95">
                <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">{sign.emoji}</div>
                <div className="text-xs text-[#f0e6d3] font-medium group-hover:text-[#d4a853] transition-colors">{sign.name}</div>
                <div className="text-[9px] text-[#8a8aad44] mt-0.5">{sign.date}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="max-w-lg mx-auto animate-fade-in-up">
            <div className="glass rounded-2xl p-6 sm:p-8 border-[#d4a85315] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03]" style={{ background: "radial-gradient(circle, #d4a853 0%, transparent 70%)" }} />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{zodiacSigns.find(s => s.name === fortune?.signName)?.emoji}</span>
                  <div><h3 className="text-lg font-display font-bold text-[#f0e6d3]">{fortune?.signName}</h3><p className="text-[10px] text-[#8a8aad]">{dateStr} Fortune</p></div>
                </div>
                <button onClick={reset} className="text-[#8a8aad] hover:text-[#d4a853] transition-colors"><RotateCcw className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex gap-1">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < (fortune?.starLevel || 0) ? "text-[#d4a853] fill-[#d4a853]" : "text-[#8a8aad15]"}`} />)}</div>
                <span className="text-xs text-[#d4a853]">Overall {fortune?.starLevel}/5</span>
              </div>
              <div className="bg-[#d4a85308] rounded-lg p-3 mb-4 border border-[#d4a85310]"><p className="text-sm text-[#f0e6d3]/90 leading-relaxed">{fortune?.overall}</p></div>
              <div className="space-y-2.5 mb-5">
                {[{ icon: Heart, label: "Love", content: fortune?.love }, { icon: Sparkles, label: "Career", content: fortune?.career }, { icon: Sun, label: "Wealth", content: fortune?.wealth }, { icon: Moon, label: "Health", content: fortune?.health }].map(item => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#d4a85308] flex items-center justify-center border border-[#d4a85310]"><item.icon className="w-3.5 h-3.5 text-[#d4a853]" /></div>
                    <div><span className="text-[10px] text-[#8a8aad] uppercase tracking-wider">{item.label}</span><p className="text-xs text-[#f0e6d3]/80 leading-relaxed">{item.content}</p></div>
                  </div>
                ))}
              </div>
              <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#d4a85306]">
                <div className="text-[10px] text-[#8a8aad] uppercase tracking-wider mb-2">Today's Lucky</div>
                <div className="grid grid-cols-4 gap-2">
                  {[{ label: "Color", value: fortune?.lucky?.[0] }, { label: "Gem", value: fortune?.lucky?.[1] }, { label: "Number", value: fortune?.lucky?.[2] }, { label: "Direction", value: fortune?.lucky?.[3] }].map(item => (
                    <div key={item.label} className="text-center"><div className="text-[9px] text-[#8a8aad44]">{item.label}</div><div className="text-xs text-[#d4a853] font-medium">{item.value}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

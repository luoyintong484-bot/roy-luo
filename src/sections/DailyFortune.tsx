import { useState, useEffect, useRef } from "react";
import { Sparkles, Sun, Moon, Star, RotateCcw, Heart } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

const zodiacSigns = [
  { nameEn: "Aries", nameZh: "白羊座", date: "3.21-4.19", emoji: "♈" },
  { nameEn: "Taurus", nameZh: "金牛座", date: "4.20-5.20", emoji: "♉" },
  { nameEn: "Gemini", nameZh: "雙子座", date: "5.21-6.21", emoji: "♊" },
  { nameEn: "Cancer", nameZh: "巨蟹座", date: "6.22-7.22", emoji: "♋" },
  { nameEn: "Leo", nameZh: "獅子座", date: "7.23-8.22", emoji: "♌" },
  { nameEn: "Virgo", nameZh: "處女座", date: "8.23-9.22", emoji: "♍" },
  { nameEn: "Libra", nameZh: "天秤座", date: "9.23-10.23", emoji: "♎" },
  { nameEn: "Scorpio", nameZh: "天蠍座", date: "10.24-11.22", emoji: "♏" },
  { nameEn: "Sagittarius", nameZh: "射手座", date: "11.23-12.21", emoji: "♐" },
  { nameEn: "Capricorn", nameZh: "摩羯座", date: "12.22-1.19", emoji: "♑" },
  { nameEn: "Aquarius", nameZh: "水瓶座", date: "1.20-2.18", emoji: "♒" },
  { nameEn: "Pisces", nameZh: "雙魚座", date: "2.19-3.20", emoji: "♓" },
];

const fortuneTemplates = [
  { overallZh: "今天宇宙對你格外溫柔，做什麼都順風順水", overallEn: "The universe is especially kind to you today", loveZh: "戀愛運勢極佳——勇敢表達你的感受", loveEn: "Romance is in the air — express your feelings openly", careerZh: "工作效率巔峰——適合做出重要決定", careerEn: "Peak productivity — make important decisions today", wealthZh: "意外之財可能降臨，保持警覺", wealthEn: "Unexpected gains may come your way", healthZh: "精力充沛——適合運動的好日子", healthEn: "Full of energy — a great day for exercise" },
  { overallZh: "月亮進入你的星座，情感變得格外細膩敏感", overallEn: "The Moon enters your sign, heightening emotional sensitivity", loveZh: "與伴侶之間可能有些小摩擦——多一點耐心", loveEn: "Small frictions with your partner — practice patience", careerZh: "處理細節時要格外小心，避免粗心錯誤", careerEn: "Handle details carefully, avoid careless mistakes", wealthZh: "理性消費，避免大額支出", wealthEn: "Be rational with spending, avoid large purchases", healthZh: "注意情緒波動——冥想會有幫助", healthEn: "Watch your emotions — meditation can help" },
  { overallZh: "金星與木星形成和諧相位，好運加倍", overallEn: "Venus forms a harmonious aspect with Jupiter", loveZh: "單身者社交能量極強——桃花可能降臨", loveEn: "Strong social energy for singles — romance may bloom", careerZh: "團隊協作順暢，貴人出現相助", careerEn: "Team collaboration flows smoothly, benefactors appear", wealthZh: "收入穩定，可能有獎金進帳", wealthEn: "Stable income, possible bonus coming", healthZh: "身心狀態極佳，保持下去", healthEn: "Excellent physical and mental wellbeing" },
  { overallZh: "水逆即將結束，思緒逐漸清晰", overallEn: "Mercury retrograde is ending, clarity returns", loveZh: "溝通順暢——適合深入的內心對話", loveEn: "Communication flows well — good for deep conversations", careerZh: "創意靈感迸發——新提案容易獲得認可", careerEn: "Creative ideas burst forth — new proposals gain approval", wealthZh: "投資直覺敏銳——可嘗試小額理財", wealthEn: "Sharp investment instincts — try small ventures", healthZh: "注意呼吸道健康，多喝溫水", healthEn: "Take care of your respiratory system, drink warm water" },
  { overallZh: "火星帶來行動力與衝勁——今天就去付諸實行", overallEn: "Mars brings drive and initiative — take action today", loveZh: "熱情高漲，但注意分寸與界限", loveEn: "Passionate energy, but know your limits", careerZh: "競爭激烈——展現你真正的實力", careerEn: "Strong competition — show your true abilities", wealthZh: "正財偏財皆有利，把握機會", wealthEn: "Both regular and windfall income are favorable", healthZh: "活力充沛——但不要過度消耗", healthEn: "High vitality — don't overexert yourself" },
  { overallZh: "土星守護著你——穩步前進就是最好的速度", overallEn: "Saturn watches over you — steady progress ahead", loveZh: "感情需要細心呵護——製造一些小驚喜", loveEn: "Relationships need nurturing — create small surprises", careerZh: "踏實的工作終將獲得回報", careerEn: "Solid work will be rewarded", wealthZh: "積少成多，理性儲蓄是王道", wealthEn: "Save wisely, small amounts add up", healthZh: "注意關節保暖，保護好身體", healthEn: "Keep your joints warm and protected" },
  { overallZh: "天王星帶來意想不到的驚喜轉折", overallEn: "Uranus brings unexpected surprises", loveZh: "打破常規的相處方式反而收穫意外甜蜜", loveEn: "Unconventional approaches yield unexpected rewards", careerZh: "跳脫框架思考——創新思維備受讚賞", careerEn: "Break the routine — innovative thinking is praised", wealthZh: "可能有突如其來的財務消息", wealthEn: "Possible unexpected financial news", healthZh: "保持身體靈活——多做伸展運動", healthEn: "Stay flexible — do stretching exercises" },
];

const luckyItemsZh = [
  ["金色", "紫水晶", "3", "東南方"],
  ["藍色", "藍寶石", "7", "北方"],
  ["紅色", "紅寶石", "9", "南方"],
  ["綠色", "翡翠", "5", "東方"],
  ["紫色", "紫黃晶", "2", "西南方"],
  ["白色", "月光石", "6", "西北方"],
  ["橙色", "琥珀", "1", "東北方"],
];
const luckyItemsEn = [
  ["Gold", "Amethyst", "3", "Southeast"],
  ["Blue", "Sapphire", "7", "North"],
  ["Red", "Ruby", "9", "South"],
  ["Green", "Jade", "5", "East"],
  ["Purple", "Ametrine", "2", "Southwest"],
  ["White", "Moonstone", "6", "Northwest"],
  ["Orange", "Amber", "1", "Northeast"],
];

export default function DailyFortune() {
  const { locale } = useI18n();
  const isZh = locale === "zh-TW";
  const [fortune, setFortune] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  const getDaySeed = () => today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const seededRandom = (seed: number) => { const x = Math.sin(seed * 9301 + 49297) % 233280; return x < 0 ? -x : x; };

  const generateFortune = (signNameEn: string) => {
    const seed = getDaySeed() + signNameEn.charCodeAt(0);
    const templateIdx = Math.floor(seededRandom(seed) * fortuneTemplates.length);
    const template = fortuneTemplates[templateIdx % fortuneTemplates.length];
    const luckyIdx = Math.floor(seededRandom(seed + 1) * (isZh ? luckyItemsZh : luckyItemsEn).length);
    const lucky = (isZh ? luckyItemsZh : luckyItemsEn)[luckyIdx % (isZh ? luckyItemsZh : luckyItemsEn).length];
    const starLevel = 3 + Math.floor(seededRandom(seed + 2) * 3);
    setFortune({ ...template, lucky, starLevel, signName: signNameEn });
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
            <span className="text-[10px] text-[#d4a853] uppercase tracking-wider">{isZh ? "每日運勢" : "Daily Fortune"} · {dateStr}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#f0e6d3]">{isZh ? "每日運勢" : "Daily Fortune"}</h2>
          <p className="mt-2 text-sm text-[#8a8aad]">{isZh ? "選擇你的星座，揭曉今日運勢指引" : "Select your zodiac sign to reveal today's guidance"}</p>
        </div>

        {!isFlipped ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {zodiacSigns.map(sign => (
              <button key={sign.nameEn} onClick={() => generateFortune(sign.nameEn)}
                className="group glass rounded-xl p-3 text-center hover:border-[#d4a85333] transition-all duration-300 hover:-translate-y-1 active:scale-95">
                <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">{sign.emoji}</div>
                <div className="text-xs text-[#f0e6d3] font-medium group-hover:text-[#d4a853] transition-colors">{isZh ? sign.nameZh : sign.nameEn}</div>
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
                  <span className="text-3xl">{zodiacSigns.find(s => s.nameEn === fortune?.signName)?.emoji}</span>
                  <div><h3 className="text-lg font-display font-bold text-[#f0e6d3]">{isZh ? zodiacSigns.find(s => s.nameEn === fortune?.signName)?.nameZh : fortune?.signName}</h3><p className="text-[10px] text-[#8a8aad]">{dateStr} {isZh ? "運勢" : "Fortune"}</p></div>
                </div>
                <button onClick={reset} className="text-[#8a8aad] hover:text-[#d4a853] transition-colors"><RotateCcw className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex gap-1">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < (fortune?.starLevel || 0) ? "text-[#d4a853] fill-[#d4a853]" : "text-[#8a8aad15]"}`} />)}</div>
                <span className="text-xs text-[#d4a853]">{isZh ? "綜合運勢" : "Overall"} {fortune?.starLevel}/5</span>
              </div>
              <div className="bg-[#d4a85308] rounded-lg p-3 mb-4 border border-[#d4a85310]"><p className="text-sm text-[#f0e6d3]/90 leading-relaxed">{isZh ? fortune?.overallZh : fortune?.overallEn}</p></div>
              <div className="space-y-2.5 mb-5">
                {[{ icon: Heart, labelEn: "Love", labelZh: "戀愛", contentEn: fortune?.loveEn, contentZh: fortune?.loveZh }, { icon: Sparkles, labelEn: "Career", labelZh: "事業", contentEn: fortune?.careerEn, contentZh: fortune?.careerZh }, { icon: Sun, labelEn: "Wealth", labelZh: "財運", contentEn: fortune?.wealthEn, contentZh: fortune?.wealthZh }, { icon: Moon, labelEn: "Health", labelZh: "健康", contentEn: fortune?.healthEn, contentZh: fortune?.healthZh }].map(item => (
                  <div key={item.labelEn} className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#d4a85308] flex items-center justify-center border border-[#d4a85310]"><item.icon className="w-3.5 h-3.5 text-[#d4a853]" /></div>
                    <div><span className="text-[10px] text-[#8a8aad] uppercase tracking-wider">{isZh ? item.labelZh : item.labelEn}</span><p className="text-xs text-[#f0e6d3]/80 leading-relaxed">{isZh ? item.contentZh : item.contentEn}</p></div>
                  </div>
                ))}
              </div>
              <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#d4a85306]">
                <div className="text-[10px] text-[#8a8aad] uppercase tracking-wider mb-2">{isZh ? "今日幸運" : "Today's Lucky"}</div>
                <div className="grid grid-cols-4 gap-2">
                  {[{ labelEn: "Color", labelZh: "顏色", value: fortune?.lucky?.[0] }, { labelEn: "Gem", labelZh: "寶石", value: fortune?.lucky?.[1] }, { labelEn: "Number", labelZh: "數字", value: fortune?.lucky?.[2] }, { labelEn: "Direction", labelZh: "方位", value: fortune?.lucky?.[3] }].map(item => (
                    <div key={item.labelEn} className="text-center"><div className="text-[9px] text-[#8a8aad44]">{isZh ? item.labelZh : item.labelEn}</div><div className="text-xs text-[#d4a853] font-medium">{item.value}</div></div>
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
